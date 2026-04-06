import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateShipmentPrice, savePendingShipment } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import ShippingTypeSelector, { type ShippingType } from "@/components/shipments/ShippingTypeSelector";
import {
  Package,
  MapPin,
  Truck,
  Plane,
  Ship,
  ArrowRight,
  Scale,
  FileText,
  CheckCircle2,
  Warehouse,
  DollarSign,
  User,
  Mail,
  Phone,
  Upload,
  ClipboardList,
  Globe,
  MapPinned,
  MessageSquare,
  Building2,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

const countries = [
  "United States", "United Kingdom", "Germany", "France", "China", 
  "Japan", "Australia", "Canada", "Nigeria", "UAE", "Singapore", "India",
  "Brazil", "Mexico", "South Korea", "Italy", "Spain", "Netherlands"
];

const serviceTypes = [
  { id: "air-express", name: "Air Express", icon: Plane, description: "1-3 days" },
  { id: "air-standard", name: "Air Standard", icon: Plane, description: "5-7 days" },
  { id: "ocean-fcl", name: "Ocean FCL", icon: Ship, description: "20-30 days" },
  { id: "ocean-lcl", name: "Ocean LCL", icon: Ship, description: "25-35 days" },
  { id: "road-freight", name: "Road Freight", icon: Truck, description: "3-10 days" },
];

const exportWarehouses = [
  { id: "usa_warehouse", name: "USA Warehouse" },
  { id: "uk_warehouse", name: "UK Warehouse" },
  { id: "china_warehouse", name: "China Warehouse" },
];

const importWarehouses = [
  { id: "nigeria_warehouse", name: "Nigeria Warehouse (Lagos)" },
];

const warehouseLocations = [
  ...exportWarehouses,
  ...importWarehouses,
];

const warehouseAddresses = [
  {
    name: "USA Warehouse",
    lines: ["13107 Orchard Mill Drive", "Richmond, Texas 77407"],
    phone: "12815919189",
    icon: Building2,
  },
  {
    name: "UK Warehouse",
    lines: ["Unit 1, Loughborough Centre", "105 Angell Road", "Brixton, London", "SW9 7PD"],
    phone: null,
    icon: Building2,
  },
  {
    name: "China Warehouse",
    lines: ["Guangzhou Baiyun District", "Shijing Town Shitan West Road 12", "Jieli Logistics Park C08-B Warehouse"],
    phone: null,
    icon: Building2,
  },
];

const shippingSteps = [
  { num: 1, title: "Create your shipment online", icon: ClipboardList },
  { num: 2, title: "Send your package to our warehouse", icon: Package },
  { num: 3, title: "Our team processes and ships your package", icon: Truck },
  { num: 4, title: "Track your shipment from your dashboard", icon: Globe },
  { num: 5, title: "Receive delivery or pick up at our office", icon: CheckCircle2 },
];

interface RoutePrice {
  origin_country: string;
  destination_country: string;
  price_per_kg: number;
}

const ShipmentCreationForm = () => {
  const { user } = useAuth();
  const { formatUsd } = useCurrency();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [shippingType, setShippingType] = useState<ShippingType>(null);
  const [showTypeError, setShowTypeError] = useState(false);
  const [routePrices, setRoutePrices] = useState<RoutePrice[]>([]);
  const [prepayPickup, setPrepayPickup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    origin_country: "",
    origin_city: "",
    destination_country: "",
    destination_city: "",
    weight: "",
    service_type: "",
    description: "",
    warehouse_location: "",
    sender_name: "",
    sender_email: "",
    sender_phone: "",
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    receiver_city: "",
    receiver_country: "",
    declared_value: "",
    special_instructions: "",
  });

  // Fetch shipping routes from database
  useEffect(() => {
    const fetchRoutes = async () => {
      const { data } = await supabase
        .from("shipping_routes")
        .select("origin_country, destination_country, price_per_kg")
        .eq("is_active", true);
      if (data) setRoutePrices(data);
    };
    fetchRoutes();
  }, []);

  // Pre-fill sender info from profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setFormData((prev) => ({
          ...prev,
          sender_name: data.full_name || prev.sender_name,
          sender_email: data.email || prev.sender_email,
          sender_phone: data.phone || prev.sender_phone,
        }));
      }
    };
    fetchProfile();
  }, [user]);

  // Handle shipping type change — auto-set countries and warehouse
  const handleShippingTypeChange = (type: ShippingType) => {
    setShippingType(type);
    setShowTypeError(false);
    if (type === "import") {
      setFormData((prev) => ({
        ...prev,
        destination_country: "Nigeria",
        warehouse_location: "nigeria_warehouse",
      }));
    } else if (type === "export") {
      setFormData((prev) => ({
        ...prev,
        origin_country: "Nigeria",
        warehouse_location: "",
      }));
    }
  };

  // Warehouses filtered by shipping type
  const availableWarehouses = useMemo(() => {
    if (shippingType === "import") return importWarehouses;
    if (shippingType === "export") return exportWarehouses;
    return warehouseLocations;
  }, [shippingType]);

  // Calculate estimated shipping cost dynamically
  const estimatedCost = useMemo(() => {
    const weightNum = parseFloat(formData.weight);
    if (!formData.origin_country || !formData.destination_country || !weightNum || weightNum <= 0) {
      return null;
    }
    const route = routePrices.find(
      (r) => r.origin_country === formData.origin_country && r.destination_country === formData.destination_country
    );
    if (!route) return null;
    return Number(route.price_per_kg) * weightNum;
  }, [formData.origin_country, formData.destination_country, formData.weight, routePrices]);

  const matchedRate = useMemo(() => {
    if (!formData.origin_country || !formData.destination_country) return null;
    const route = routePrices.find(
      (r) => r.origin_country === formData.origin_country && r.destination_country === formData.destination_country
    );
    return route ? Number(route.price_per_kg) : null;
  }, [formData.origin_country, formData.destination_country, routePrices]);

  // Calculate pickup fee based on weight
  const pickupFee = useMemo(() => {
    const weightNum = parseFloat(formData.weight);
    if (!weightNum || weightNum <= 0) return 0;
    if (weightNum <= 4) return 70;
    const weightLbs = weightNum * 2.20462;
    return Math.round(weightLbs * 6 * 100) / 100;
  }, [formData.weight]);

  // Total price including optional pickup
  const totalPrice = useMemo(() => {
    if (estimatedCost === null) return null;
    return prepayPickup ? estimatedCost + pickupFee : estimatedCost;
  }, [estimatedCost, prepayPickup, pickupFee]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      savePendingShipment(formData);
      toast({
        title: "Login Required",
        description: "Please log in to complete your shipment. Your data has been saved.",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    const estimatedDays = formData.service_type.includes("express") ? 3 : 
                          formData.service_type.includes("ocean") ? 25 : 7;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

    const shippingOnly = estimatedCost ?? await calculateShipmentPrice(
      formData.service_type,
      parseFloat(formData.weight)
    );
    const finalPrice = shippingOnly !== null && prepayPickup ? shippingOnly + pickupFee : shippingOnly;

    // Build description with all extra info
    const descParts = [formData.description];
    if (formData.sender_name) descParts.push(`Sender: ${formData.sender_name}`);
    if (formData.sender_email) descParts.push(`Sender Email: ${formData.sender_email}`);
    if (formData.sender_phone) descParts.push(`Sender Phone: ${formData.sender_phone}`);
    if (formData.receiver_name) descParts.push(`Receiver: ${formData.receiver_name}`);
    if (formData.receiver_phone) descParts.push(`Receiver Phone: ${formData.receiver_phone}`);
    if (formData.receiver_address) descParts.push(`Receiver Address: ${formData.receiver_address}, ${formData.receiver_city}, ${formData.receiver_country}`);
    if (formData.declared_value) descParts.push(`Declared Value: $${formData.declared_value}`);
    if (formData.special_instructions) descParts.push(`Instructions: ${formData.special_instructions}`);
    const fullDescription = descParts.filter(Boolean).join(" | ");

    const { error } = await supabase.from("shipments").insert({
      user_id: user.id,
      origin_country: formData.origin_country,
      origin_city: formData.origin_city,
      destination_country: formData.destination_country,
      destination_city: formData.destination_city,
      weight: parseFloat(formData.weight),
      service_type: formData.service_type,
      description: fullDescription || null,
      warehouse_location: formData.warehouse_location || null,
      pickup_prepaid: prepayPickup,
      status: "shipment_created",
      estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
      tracking_number: "",
      price: finalPrice,
    } as any);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Shipment Created!",
        description: "Your shipment has been created successfully. Proceed to payment.",
      });
      setFormData({
        origin_country: "", origin_city: "", destination_country: "", destination_city: "",
        weight: "", service_type: "", description: "", warehouse_location: "",
        sender_name: "", sender_email: "", sender_phone: "",
        receiver_name: "", receiver_phone: "", receiver_address: "", receiver_city: "", receiver_country: "",
        declared_value: "", special_instructions: "",
      });
      setStep(1);
      setPrepayPickup(false);
      setUploadedFiles([]);
      navigate("/dashboard/shipments");
    }

    setIsSubmitting(false);
  };

  const isStep1Complete = formData.origin_country && formData.origin_city && formData.destination_country && formData.destination_city && formData.sender_name && formData.sender_phone && formData.receiver_name && formData.receiver_phone;
  const isStep2Complete = formData.weight && formData.service_type;

  const progressSteps = [
    { num: 1, label: "Route & Contacts", icon: MapPin },
    { num: 2, label: "Package Details", icon: Scale },
    { num: 3, label: "Review", icon: CheckCircle2 },
  ];

  const inputClass = "h-11 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-200 ease-in-out hover:border-primary/25 focus:border-primary/35 focus:ring-2 focus:ring-primary/10";
  const textAreaClass = "min-h-[104px] resize-none rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-200 ease-in-out hover:border-primary/25 focus:border-primary/35 focus:ring-2 focus:ring-primary/10";
  const stepPanelClass = "space-y-5 sm:space-y-6 animate-in fade-in-0 slide-in-from-right-2 duration-200";
  const sectionCardClass = "group relative rounded-xl bg-muted/[0.22] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-border/50 transition-colors duration-200 ease-in-out sm:p-5 hover:bg-muted/[0.3]";
  const actionBarClass = "flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between";

  return (
    <>
      <section className="section-padding bg-muted relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="section-container relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground shadow-sm">
              <Package className="w-4 h-4" />
              Quick Shipping
            </span>
            <h2 className="text-foreground mb-4">
              Create Your <span className="text-primary">Shipment</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Create your shipment by entering the package and destination details below. The system will automatically calculate the shipping cost.
            </p>
          </div>

          {/* Card Container */}
          <div 
            className={`relative max-w-4xl mx-auto overflow-hidden rounded-[20px] transition-all duration-200 ease-in-out ${
              isFocused ? "shadow-[0_28px_60px_rgba(15,23,42,0.14)]" : "shadow-[0_20px_44px_rgba(15,23,42,0.1)]"
            }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <div className="relative rounded-[20px] bg-white/95 backdrop-blur-sm">
              {/* Progress Steps */}
              <div className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.95))] p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Quick shipment flow</p>
                    <p className="text-xs text-muted-foreground">Step {step} of {progressSteps.length}</p>
                  </div>
                  <div className="rounded-full border border-primary/10 bg-primary/[0.05] px-3 py-1 text-xs font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    {Math.round((step / progressSteps.length) * 100)}% complete
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  {progressSteps.map((s, i) => {
                    const isActive = step >= s.num;
                    const isCurrent = step === s.num;
                    const isComplete = step > s.num;
                    const StepIcon = s.icon;

                    return (
                      <div key={s.num} className="flex flex-1 items-start gap-2 sm:gap-3">
                        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                          <div 
                            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ease-in-out sm:h-12 sm:w-12 ${
                              isComplete
                                ? "border-primary bg-primary text-primary-foreground shadow-[0_14px_28px_rgba(6,16,67,0.18)]"
                                : isCurrent
                                  ? "border-primary/20 bg-primary/[0.08] text-primary ring-4 ring-primary/10 shadow-[0_12px_24px_rgba(6,16,67,0.12)]"
                                  : isActive
                                    ? "border-primary/15 bg-primary/[0.05] text-primary"
                                    : "border-border/70 bg-white text-muted-foreground"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          
                          <span className={`text-[10px] sm:text-sm font-semibold leading-4 transition-colors ${
                            isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {s.label}
                          </span>
                        </div>

                        {i < progressSteps.length - 1 && (
                          <div className="mt-5 hidden h-1 flex-1 rounded-full bg-border/80 sm:block">
                            <div 
                              className={`h-full rounded-full bg-primary transition-all duration-200 ease-in-out ${
                                step > s.num ? "w-full" : "w-0"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Route & Contacts */}
                  {step === 1 && (
                    <div className={stepPanelClass}>
                      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-[0_12px_24px_rgba(6,16,67,0.16)]">
                          <MapPin className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Route & contact details</h3>
                          <p className="text-sm text-muted-foreground">Set the shipping path and the key contact information.</p>
                        </div>
                      </div>
                      {/* Origin & Destination */}
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Origin Card */}
                        <div className={sectionCardClass}>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md transition-transform duration-200 group-hover:scale-105">
                              <MapPin className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg text-foreground">Origin</span>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm font-medium">Country *</Label>
                              <Select
                                value={formData.origin_country}
                                onValueChange={(value) => setFormData({ ...formData, origin_country: value })}
                              >
                                <SelectTrigger className={`${inputClass}`}>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  {countries.map((country) => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm font-medium">City *</Label>
                              <Input
                                value={formData.origin_city}
                                onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                                placeholder="Enter city"
                                className={inputClass}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Destination Card */}
                        <div className={sectionCardClass}>
                          <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-md transition-transform duration-200 group-hover:scale-105">
                              <MapPin className="w-5 h-5 text-accent-foreground" />
                            </div>
                            <span className="font-bold text-lg text-foreground">Destination</span>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm font-medium">Country *</Label>
                              <Select
                                value={formData.destination_country}
                                onValueChange={(value) => setFormData({ ...formData, destination_country: value })}
                              >
                                <SelectTrigger className={`${inputClass}`}>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  {countries.map((country) => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm font-medium">City *</Label>
                              <Input
                                value={formData.destination_city}
                                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                                placeholder="Enter city"
                                className={inputClass}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Route Visualization */}
                      <div className="rounded-xl bg-muted/[0.22] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-border/50 sm:p-5">
                        <div className="flex items-center justify-center gap-2 py-1 sm:gap-3">
                          <div className="min-w-0 text-center">
                            <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-1" />
                            <span className="block max-w-[88px] truncate text-xs text-muted-foreground sm:max-w-none">{formData.origin_city || "Origin"}</span>
                          </div>
                          <div className="flex-1 max-w-32 h-0.5 bg-primary/30 rounded-full" />
                          <Plane className="w-5 h-5 text-primary -rotate-45" />
                          <div className="flex-1 max-w-32 h-0.5 bg-primary/30 rounded-full" />
                          <div className="min-w-0 text-center">
                            <div className="w-3 h-3 rounded-full bg-accent mx-auto mb-1" />
                            <span className="block max-w-[88px] truncate text-xs text-muted-foreground sm:max-w-none">{formData.destination_city || "Destination"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sender Information */}
                      <div className={sectionCardClass}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
                            <User className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <span className="font-bold text-lg text-foreground">Sender Information</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> Name *</Label>
                            <Input value={formData.sender_name} onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })} placeholder="Full name" className={inputClass} required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                            <Input type="email" value={formData.sender_email} onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })} placeholder="Email address" className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Phone *</Label>
                            <Input type="tel" value={formData.sender_phone} onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })} placeholder="Phone number" className={inputClass} required />
                          </div>
                        </div>
                      </div>

                      {/* Receiver Information */}
                      <div className={sectionCardClass}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-md">
                            <MapPinned className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <span className="font-bold text-lg text-foreground">Receiver Information</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> Name *</Label>
                            <Input value={formData.receiver_name} onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })} placeholder="Receiver full name" className={inputClass} required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Phone *</Label>
                            <Input type="tel" value={formData.receiver_phone} onChange={(e) => setFormData({ ...formData, receiver_phone: e.target.value })} placeholder="Receiver phone" className={inputClass} required />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</Label>
                            <Input value={formData.receiver_address} onChange={(e) => setFormData({ ...formData, receiver_address: e.target.value })} placeholder="Street address" className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">City</Label>
                            <Input value={formData.receiver_city} onChange={(e) => setFormData({ ...formData, receiver_city: e.target.value })} placeholder="City" className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">Country</Label>
                            <Select value={formData.receiver_country} onValueChange={(value) => setFormData({ ...formData, receiver_country: value })}>
                              <SelectTrigger className={inputClass}><SelectValue placeholder="Select country" /></SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className={actionBarClass}>
                        <p className="text-sm text-muted-foreground">Complete the route and contact details to continue.</p>
                        <button 
                          type="button" 
                          disabled={!isStep1Complete}
                          onClick={() => setStep(2)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-md transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Package Details */}
                  {step === 2 && (
                    <div className={stepPanelClass}>
                      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-[0_12px_24px_rgba(223,81,1,0.16)]">
                          <Scale className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Package details</h3>
                          <p className="text-sm text-muted-foreground">Add shipment details, warehouse selection, and optional documents.</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className={sectionCardClass}>
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-200 group-hover:scale-105">
                              <Scale className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-semibold">Weight (KG) *</span>
                          </Label>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            placeholder="Enter package weight"
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className={sectionCardClass}>
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent transition-transform duration-200 group-hover:scale-105">
                              <Truck className="w-4 h-4 text-accent-foreground" />
                            </div>
                            <span className="font-semibold">Service Type *</span>
                          </Label>
                          <Select
                            value={formData.service_type}
                            onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                          >
                            <SelectTrigger className={inputClass}>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {serviceTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="w-4 h-4 text-primary" />
                                    <span>{type.name}</span>
                                    <span className="text-muted-foreground text-xs">({type.description})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Estimated Shipping Cost */}
                      {formData.weight && parseFloat(formData.weight) > 0 && (
                        <div className="rounded-xl bg-[linear-gradient(180deg,rgba(6,16,67,0.05),rgba(255,255,255,0.92))] p-4 ring-1 ring-primary/10 transition-all duration-200 ease-in-out sm:p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                              <DollarSign className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg text-foreground">Estimated Shipping Cost</span>
                          </div>
                          {estimatedCost !== null ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Shipping ({formData.weight} KG × {formatUsd(matchedRate || 0)}/KG)</span>
                                  <span>{formatUsd(estimatedCost)}</span>
                                </div>
                                {prepayPickup && (
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Pickup / Delivery Fee</span>
                                    <span>{formatUsd(pickupFee)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                                <span className="font-bold text-foreground">Total Payment</span>
                                <span className="text-3xl font-bold text-primary">
                                  {formatUsd(totalPrice || 0)}
                                </span>
                              </div>

                              {/* Prepay Pickup Checkbox */}
                              <div className="mt-3 rounded-xl border border-border/70 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="prepay-pickup"
                                    checked={prepayPickup}
                                    onCheckedChange={(checked) => setPrepayPickup(checked === true)}
                                    className="mt-0.5"
                                  />
                                  <div className="space-y-1">
                                    <label htmlFor="prepay-pickup" className="text-sm font-semibold text-foreground cursor-pointer">
                                      Prepay Pickup / Delivery Fee
                                    </label>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      If you pay this now, you will not pay any pickup fee when collecting your shipment.
                                      {parseFloat(formData.weight) <= 4
                                        ? ` (Flat fee: ${formatUsd(70)} for shipments ≤ 4 KG)`
                                        : ` (${formatUsd(6)}/lb — ${(parseFloat(formData.weight) * 2.20462).toFixed(1)} lbs = ${formatUsd(pickupFee)})`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No route pricing found for {formData.origin_country || "origin"} → {formData.destination_country || "destination"}. Price will be set by admin.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Item Description */}
                      <div className={sectionCardClass}>
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold">Item Description</span>
                        </Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe the contents of your shipment"
                          rows={3}
                          className={textAreaClass}
                        />
                      </div>

                      {/* Declared Value & Special Instructions */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className={sectionCardClass}>
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                              <DollarSign className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold">Declared Value (USD)</span>
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.declared_value}
                            onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })}
                            placeholder="e.g. 500"
                            className={inputClass}
                          />
                        </div>
                        <div className={sectionCardClass}>
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 transition-transform duration-200 group-hover:scale-105">
                              <MessageSquare className="w-4 h-4 text-accent-foreground" />
                            </div>
                            <span className="font-semibold">Special Instructions</span>
                          </Label>
                          <Input
                            value={formData.special_instructions}
                            onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                            placeholder="e.g. Fragile, handle with care"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {/* Warehouse */}
                      <div className={sectionCardClass}>
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent transition-transform duration-200 group-hover:scale-105">
                            <Warehouse className="w-4 h-4 text-accent-foreground" />
                          </div>
                          <span className="font-semibold">Warehouse Location</span>
                        </Label>
                        <Select
                          value={formData.warehouse_location}
                          onValueChange={(value) => setFormData({ ...formData, warehouse_location: value })}
                        >
                          <SelectTrigger className={inputClass}>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {warehouseLocations.map((wh) => (
                              <SelectItem key={wh.id} value={wh.id}>
                                <div className="flex items-center gap-2">
                                  <Warehouse className="w-4 h-4 text-primary" />
                                  <span>{wh.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Upload Documents */}
                      <div className={sectionCardClass}>
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                            <Upload className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold">Upload Documents (Optional)</span>
                        </Label>
                        <p className="text-xs text-muted-foreground mb-3">
                          Attach purchase receipts, package photos, or invoice documents for verification. Max 5 files.
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-primary/10"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Files
                        </button>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-xl border border-border/70 bg-white px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{file.name}</span>
                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:text-destructive/80 text-xs font-semibold ml-2 shrink-0">Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={actionBarClass}>
                        <button 
                          type="button" 
                          onClick={() => setStep(1)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-transparent px-6 py-3 text-sm font-bold text-primary transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                        >
                          Back
                        </button>
                        <button 
                          type="button" 
                          disabled={!isStep2Complete}
                          onClick={() => setStep(3)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-md transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
                        >
                          Review
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className={stepPanelClass}>
                      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-[0_12px_24px_rgba(6,16,67,0.16)]">
                          <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Review your shipment</h3>
                          <p className="text-sm text-muted-foreground">A final, polished overview before the shipment is created.</p>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_300px]">
                        <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(6,16,67,0.05),rgba(223,81,1,0.035))] p-5 ring-1 ring-primary/10 sm:p-6">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <span className="inline-flex items-center rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Ready for submission</span>
                              <p className="mt-3 break-words text-base font-bold text-foreground sm:text-lg">{formData.origin_city}, {formData.origin_country} → {formData.destination_city}, {formData.destination_country}</p>
                              <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">{formData.receiver_name} is receiving this shipment via {formData.service_type.replace("-", " ")}.</p>
                            </div>
                            <div className="rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-primary/10 sm:min-w-[190px]">
                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Estimated payment</p>
                              <p className="mt-1 whitespace-nowrap text-2xl font-bold text-primary sm:text-3xl">{formatUsd(totalPrice ?? estimatedCost ?? 0)}</p>
                              <p className="text-xs text-muted-foreground">Includes pickup only when prepaid</p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {[
                              { label: "Weight", value: `${formData.weight} KG` },
                              { label: "Service", value: formData.service_type.replace("-", " ") },
                              { label: "Warehouse", value: warehouseLocations.find(w => w.id === formData.warehouse_location)?.name || "Not selected" },
                            ].map((item) => (
                              <div key={item.label} className="rounded-xl bg-white/80 p-4 ring-1 ring-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                                <p className="mt-1 break-words text-sm font-semibold capitalize text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-muted/[0.18] p-5 ring-1 ring-border/50">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Review checklist</p>
                          <div className="mt-4 space-y-3 text-sm">
                            {[
                              "Route and warehouse details added",
                              "Sender and receiver details captured",
                              prepayPickup ? "Pickup fee prepaid with order" : "Pickup fee payable on collection",
                              uploadedFiles.length > 0 ? `${uploadedFiles.length} supporting document(s) attached` : "No supporting documents attached",
                            ].map((item) => (
                              <div key={item} className="flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-border/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-muted-foreground">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className={sectionCardClass}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Sender</p>
                          <p className="mt-2 text-base font-bold text-foreground">{formData.sender_name}</p>
                          <p className="break-words text-sm text-muted-foreground">{formData.sender_phone}</p>
                          {formData.sender_email && <p className="break-words text-sm text-muted-foreground">{formData.sender_email}</p>}
                        </div>
                        <div className={sectionCardClass}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Receiver</p>
                          <p className="mt-2 text-base font-bold text-foreground">{formData.receiver_name}</p>
                          <p className="break-words text-sm text-muted-foreground">{formData.receiver_phone}</p>
                          {formData.receiver_address && <p className="break-words text-sm leading-relaxed text-muted-foreground">{formData.receiver_address}{formData.receiver_city ? `, ${formData.receiver_city}` : ""}</p>}
                        </div>
                      </div>

                      <div className={sectionCardClass}>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Shipment details</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {[
                            { label: "Origin", value: `${formData.origin_city}, ${formData.origin_country}` },
                            { label: "Destination", value: `${formData.destination_city}, ${formData.destination_country}` },
                            { label: "Service", value: formData.service_type.replace("-", " ") },
                            { label: "Weight", value: `${formData.weight} KG` },
                            { label: "Declared Value", value: formData.declared_value ? `$${parseFloat(formData.declared_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—" },
                            { label: "Warehouse", value: warehouseLocations.find(w => w.id === formData.warehouse_location)?.name || "—" },
                          ].map((item) => (
                            <div key={item.label} className="rounded-xl bg-white/80 p-3 ring-1 ring-border/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                              <p className="mt-1 break-words text-sm font-semibold capitalize text-foreground">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(formData.description || formData.special_instructions || uploadedFiles.length > 0 || estimatedCost !== null) && (
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                          <div className="space-y-4">
                            {formData.description && (
                              <div className={sectionCardClass}>
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Description</p>
                                <p className="mt-2 break-words text-sm leading-relaxed text-foreground">{formData.description}</p>
                              </div>
                            )}
                            {formData.special_instructions && (
                              <div className={sectionCardClass}>
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Special instructions</p>
                                <p className="mt-2 break-words text-sm leading-relaxed text-foreground">{formData.special_instructions}</p>
                              </div>
                            )}
                            {uploadedFiles.length > 0 && (
                              <div className={sectionCardClass}>
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Uploaded documents</p>
                                <ul className="mt-3 space-y-2">
                                  {uploadedFiles.map((f, i) => (
                                    <li key={i} className="break-all rounded-xl bg-white/80 px-3 py-2 text-sm text-foreground ring-1 ring-border/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">{f.name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {estimatedCost !== null && (
                            <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(6,16,67,0.05),rgba(223,81,1,0.035))] p-5 ring-1 ring-primary/10">
                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Pricing summary</p>
                              <div className="mt-4 space-y-3">
                                <div className="flex items-start justify-between gap-3 text-sm text-muted-foreground">
                                  <span>Shipping cost</span>
                                  <span className="whitespace-nowrap">{formatUsd(estimatedCost)}</span>
                                </div>
                                <div className="flex items-start justify-between gap-3 text-sm text-muted-foreground">
                                  <span>Rate applied</span>
                                  <span className="whitespace-nowrap">{formatUsd(matchedRate || 0)}/KG</span>
                                </div>
                                {prepayPickup ? (
                                  <div className="flex items-start justify-between gap-3 text-sm text-muted-foreground">
                                    <span>Pickup / Delivery fee</span>
                                    <span className="whitespace-nowrap">{formatUsd(pickupFee)}</span>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">Pickup fee will be paid on collection.</p>
                                )}
                                <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-bold text-foreground">Total payment</span>
                                    <span className="whitespace-nowrap text-xl font-bold text-primary sm:text-2xl">{formatUsd(totalPrice ?? estimatedCost)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-start gap-3 rounded-xl bg-muted/[0.18] p-4 ring-1 ring-border/50">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By submitting, you agree to our shipping terms. Your shipment will be created and you can proceed to payment from your dashboard.
                        </p>
                      </div>

                      <div className={actionBarClass}>
                        <button 
                          type="button" 
                          onClick={() => setStep(2)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary bg-transparent px-6 py-3 text-sm font-bold text-primary transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-primary hover:text-primary-foreground active:scale-[0.98] sm:w-auto"
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-md transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98] sm:w-auto"
                        >
                          {isSubmitting ? "Creating..." : "Create Shipment"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warehouse Locations Section */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground shadow-sm">
              <Warehouse className="w-4 h-4" />
              Warehouses
            </span>
            <h2 className="text-foreground mb-4">
              Our <span className="text-primary">Warehouse Locations</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Ship your packages to any of our warehouse locations worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {warehouseAddresses.map((wh) => (
              <div key={wh.name} className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <wh.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-3">{wh.name}</h3>
                <div className="space-y-1">
                  {wh.lines.map((line, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{line}</p>
                  ))}
                  {wh.phone && (
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {wh.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Shipping Works Section */}
      <section className="section-padding bg-muted">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground shadow-sm">
              <Truck className="w-4 h-4" />
              Process
            </span>
            <h2 className="text-foreground mb-4">
              How <span className="text-primary">Shipping Works</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              From booking to delivery in five simple steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {shippingSteps.map((s) => {
              const StepIcon = s.icon;
              return (
                <div key={s.num} className="group relative flex flex-col items-center text-center p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <StepIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold text-primary mb-2">Step {s.num}</span>
                  <p className="text-sm font-semibold text-foreground leading-snug">{s.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShipmentCreationForm;
