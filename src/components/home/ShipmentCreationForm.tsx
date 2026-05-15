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
  ChevronLeft,
  X,
} from "lucide-react";

const countries = [
  "United States", "United Kingdom", "Germany", "France", "China", 
  "Japan", "Australia", "Canada", "Nigeria", "UAE", "Singapore", "India",
  "Brazil", "Mexico", "South Korea", "Italy", "Spain", "Netherlands"
];

const serviceTypes = [
  { id: "air-express", name: "Air Express", icon: Plane, description: "1-3 days", tag: "Fastest" },
  { id: "air-standard", name: "Air Standard", icon: Plane, description: "5-7 days", tag: "Popular" },
  { id: "ocean-fcl", name: "Ocean FCL", icon: Ship, description: "20-30 days", tag: "" },
  { id: "ocean-lcl", name: "Ocean LCL", icon: Ship, description: "25-35 days", tag: "" },
  { id: "road-freight", name: "Road Freight", icon: Truck, description: "3-10 days", tag: "" },
];

const exportWarehouses = [
  { id: "usa_warehouse", name: "USA Warehouse", country: "United States", city: "Richmond, TX", code: "us" },
  { id: "uk_warehouse", name: "UK Warehouse", country: "United Kingdom", city: "London", code: "gb" },
  { id: "china_warehouse", name: "China Warehouse", country: "China", city: "Guangzhou", code: "cn" },
];

const importWarehouses = [
  { id: "nigeria_warehouse", name: "Nigeria Warehouse", country: "Nigeria", city: "Lagos", code: "ng" },
];

const warehouseLocations = [
  ...exportWarehouses,
  ...importWarehouses,
];

const warehouseAddresses = [
  {
    name: "USA Warehouse",
    flag: "🇺🇸",
    lines: ["13107 Orchard Mill Drive", "Richmond, Texas 77407"],
    phone: "12815919189",
  },
  {
    name: "UK Warehouse",
    flag: "🇬🇧",
    lines: ["Unit 1, Loughborough Centre", "105 Angell Road", "Brixton, London, SW9 7PD"],
    phone: null,
  },
  {
    name: "China Warehouse",
    flag: "🇨🇳",
    lines: ["Guangzhou Baiyun District", "Shijing Town Shitan West Road 12", "Jieli Logistics Park C08-B"],
    phone: null,
  },
];

const shippingSteps = [
  { num: 1, title: "Create your shipment online", description: "Fill in the shipping form with your details", icon: ClipboardList },
  { num: 2, title: "Send to our warehouse", description: "Drop off or ship to the nearest warehouse", icon: Package },
  { num: 3, title: "We process & ship", description: "Our team handles customs and logistics", icon: Truck },
  { num: 4, title: "Track your shipment", description: "Monitor progress from your dashboard", icon: Globe },
  { num: 5, title: "Receive delivery", description: "Collect at our office or get it delivered", icon: CheckCircle2 },
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

  const availableWarehouses = useMemo(() => {
    if (shippingType === "import") return importWarehouses;
    if (shippingType === "export") return exportWarehouses;
    return warehouseLocations;
  }, [shippingType]);

  const estimatedCost = useMemo(() => {
    const weightNum = parseFloat(formData.weight);
    if (!formData.origin_country || !formData.destination_country || !weightNum || weightNum <= 0) return null;
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

  const pickupFee = useMemo(() => {
    const weightNum = parseFloat(formData.weight);
    if (!weightNum || weightNum <= 0) return 0;
    if (weightNum <= 4) return 70;
    const weightLbs = weightNum * 2.20462;
    return Math.round(weightLbs * 6 * 100) / 100;
  }, [formData.weight]);

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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Shipment Created!", description: "Your shipment has been created successfully." });
      setFormData({
        origin_country: "", origin_city: "", destination_country: "", destination_city: "",
        weight: "", service_type: "", description: "", warehouse_location: "",
        sender_name: "", sender_email: "", sender_phone: "",
        receiver_name: "", receiver_phone: "", receiver_address: "", receiver_city: "", receiver_country: "",
        declared_value: "", special_instructions: "",
      });
      setStep(1);
      setPrepayPickup(false);
      setShippingType(null);
      setUploadedFiles([]);
      navigate("/dashboard/shipments");
    }

    setIsSubmitting(false);
  };

  const isStep1Complete = formData.origin_country && formData.origin_city && formData.destination_country && formData.destination_city && formData.sender_name && formData.sender_phone && formData.receiver_name && formData.receiver_phone;
  const isStep2Complete = formData.weight && formData.service_type;

  const progressSteps = [
    { num: 1, label: "Route & Contacts", icon: MapPin },
    { num: 2, label: "Package & Shipping", icon: Package },
    { num: 3, label: "Review & Submit", icon: CheckCircle2 },
  ];

  // --- Shared Styles ---
  const inputBase = "h-12 rounded-xl border border-border/80 bg-white px-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:shadow-sm";
  const labelBase = "text-sm font-semibold text-foreground flex items-center gap-2";
  const sectionCard = "rounded-2xl border border-border/50 bg-white p-5 sm:p-6 space-y-5 transition-all duration-200 hover:shadow-sm";
  const sectionHeader = "flex items-center gap-3 pb-4 border-b border-border/40";
  const iconBox = (bg: string) => `flex h-10 w-10 items-center justify-center rounded-xl ${bg} shadow-sm`;

  return (
    <>
      <section className="section-padding bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="section-container relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5 bg-primary/10 text-primary">
              <Package className="w-4 h-4" />
              Ship with RAC
            </div>
            <h2 className="text-foreground mb-3">
              Create Your <span className="text-primary">Shipment</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Fill in the details below and we'll handle the rest. Fast, reliable, and transparent.
            </p>
          </div>

          {/* Main Card */}
          <div className="max-w-4xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6 px-2">
              {progressSteps.map((s, i) => {
                const isActive = step >= s.num;
                const isCurrent = step === s.num;
                const isComplete = step > s.num;
                const StepIcon = s.icon;

                return (
                  <div key={s.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isComplete) setStep(s.num);
                        }}
                        disabled={!isComplete}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          isComplete
                            ? "border-primary bg-primary text-white cursor-pointer hover:shadow-md"
                            : isCurrent
                              ? "border-primary bg-white text-primary shadow-lg shadow-primary/20"
                              : "border-border bg-white text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{s.num}</span>
                        )}
                      </button>
                      <span className={`text-xs font-semibold text-center leading-tight hidden sm:block ${
                        isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className="flex-1 mx-3 mt-[-20px] sm:mt-[-24px]">
                        <div className="h-0.5 rounded-full bg-border">
                          <div className={`h-full rounded-full bg-primary transition-all duration-500 ${
                            step > s.num ? "w-full" : "w-0"
                          }`} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Card */}
            <div className="rounded-2xl bg-white border border-border/50 shadow-xl shadow-black/[0.04] overflow-hidden">
              <div className="p-5 sm:p-8">
                <form onSubmit={handleSubmit}>

                  {/* ===== STEP 1: Route & Contacts ===== */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in-0 duration-300">
                      {/* Step header */}
                      <div className={sectionHeader}>
                        <div className={iconBox("bg-primary text-white")}>
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Route & Contacts</h3>
                          <p className="text-sm text-muted-foreground">Select direction, set route, and add contact details</p>
                        </div>
                      </div>

                      {/* Shipping Type */}
                      <ShippingTypeSelector
                        value={shippingType}
                        onChange={handleShippingTypeChange}
                        showError={showTypeError}
                      />

                      {/* Origin & Destination */}
                      <div className="grid md:grid-cols-2 gap-5">
                        {/* Origin */}
                        <div className={sectionCard}>
                          <div className="flex items-center gap-3">
                            <div className={iconBox("bg-primary/10 text-primary")}>
                              <ArrowUpFromLine className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">Origin</p>
                              <p className="text-xs text-muted-foreground">Where is the package coming from?</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className={labelBase}>Country <span className="text-destructive">*</span></Label>
                              <Select
                                value={formData.origin_country}
                                onValueChange={(v) => setFormData({ ...formData, origin_country: v })}
                                disabled={shippingType === "export"}
                              >
                                <SelectTrigger className={`${inputBase} ${shippingType === "export" ? "opacity-60 cursor-not-allowed bg-muted/30" : ""}`}>
                                  <SelectValue placeholder="Select origin country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-border">
                                  {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              {shippingType === "export" && (
                                <p className="text-xs text-primary/70 flex items-center gap-1 mt-1">
                                  <ArrowUpFromLine className="w-3 h-3" /> Locked to Nigeria for export
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className={labelBase}>City <span className="text-destructive">*</span></Label>
                              <Input
                                value={formData.origin_city}
                                onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                                placeholder="Enter origin city"
                                className={inputBase}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Destination */}
                        <div className={sectionCard}>
                          <div className="flex items-center gap-3">
                            <div className={iconBox("bg-accent/10 text-accent")}>
                              <ArrowDownToLine className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">Destination</p>
                              <p className="text-xs text-muted-foreground">Where should we deliver?</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className={labelBase}>Country <span className="text-destructive">*</span></Label>
                              <Select
                                value={formData.destination_country}
                                onValueChange={(v) => setFormData({ ...formData, destination_country: v })}
                                disabled={shippingType === "import"}
                              >
                                <SelectTrigger className={`${inputBase} ${shippingType === "import" ? "opacity-60 cursor-not-allowed bg-muted/30" : ""}`}>
                                  <SelectValue placeholder="Select destination country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-border">
                                  {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              {shippingType === "import" && (
                                <p className="text-xs text-primary/70 flex items-center gap-1 mt-1">
                                  <ArrowDownToLine className="w-3 h-3" /> Locked to Nigeria for import
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className={labelBase}>City <span className="text-destructive">*</span></Label>
                              <Input
                                value={formData.destination_city}
                                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                                placeholder="Enter destination city"
                                className={inputBase}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Route Preview */}
                      {(formData.origin_city || formData.destination_city) && (
                        <div className="rounded-xl bg-gradient-to-r from-primary/[0.04] to-accent/[0.04] border border-primary/10 p-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="text-center">
                              <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-1.5" />
                              <p className="text-xs font-semibold text-foreground">{formData.origin_city || "Origin"}</p>
                              <p className="text-[10px] text-muted-foreground">{formData.origin_country}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                              <div className="flex-1 h-px bg-primary/30" />
                              <Plane className="w-4 h-4 text-primary -rotate-45 shrink-0" />
                              <div className="flex-1 h-px bg-accent/30" />
                            </div>
                            <div className="text-center">
                              <div className="w-3 h-3 rounded-full bg-accent mx-auto mb-1.5" />
                              <p className="text-xs font-semibold text-foreground">{formData.destination_city || "Destination"}</p>
                              <p className="text-[10px] text-muted-foreground">{formData.destination_country}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sender */}
                      <div className={sectionCard}>
                        <div className="flex items-center gap-3">
                          <div className={iconBox("bg-primary/10 text-primary")}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">Sender Details</p>
                            <p className="text-xs text-muted-foreground">Who is sending this package?</p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className={labelBase}><User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name <span className="text-destructive">*</span></Label>
                            <Input value={formData.sender_name} onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })} placeholder="Enter full name" className={inputBase} required />
                          </div>
                          <div className="space-y-2">
                            <Label className={labelBase}><Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email</Label>
                            <Input type="email" value={formData.sender_email} onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })} placeholder="Email address" className={inputBase} />
                          </div>
                          <div className="space-y-2">
                            <Label className={labelBase}><Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone <span className="text-destructive">*</span></Label>
                            <Input type="tel" value={formData.sender_phone} onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })} placeholder="Phone number" className={inputBase} required />
                          </div>
                        </div>
                      </div>

                      {/* Receiver */}
                      <div className={sectionCard}>
                        <div className="flex items-center gap-3">
                          <div className={iconBox("bg-accent/10 text-accent")}>
                            <MapPinned className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">Receiver Details</p>
                            <p className="text-xs text-muted-foreground">Who will receive this package?</p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={labelBase}><User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name <span className="text-destructive">*</span></Label>
                            <Input value={formData.receiver_name} onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })} placeholder="Receiver's full name" className={inputBase} required />
                          </div>
                          <div className="space-y-2">
                            <Label className={labelBase}><Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone <span className="text-destructive">*</span></Label>
                            <Input type="tel" value={formData.receiver_phone} onChange={(e) => setFormData({ ...formData, receiver_phone: e.target.value })} placeholder="Receiver's phone" className={inputBase} required />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <Label className={labelBase}><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Street Address</Label>
                            <Input value={formData.receiver_address} onChange={(e) => setFormData({ ...formData, receiver_address: e.target.value })} placeholder="Enter street address" className={inputBase} />
                          </div>
                          <div className="space-y-2">
                            <Label className={labelBase}>City</Label>
                            <Input value={formData.receiver_city} onChange={(e) => setFormData({ ...formData, receiver_city: e.target.value })} placeholder="City" className={inputBase} />
                          </div>
                          <div className="space-y-2">
                            <Label className={labelBase}>Country</Label>
                            <Select value={formData.receiver_country} onValueChange={(v) => setFormData({ ...formData, receiver_country: v })}>
                              <SelectTrigger className={inputBase}><SelectValue placeholder="Select country" /></SelectTrigger>
                              <SelectContent className="bg-white border-border">
                                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                          {!shippingType ? "Select a shipping direction to continue." : "Fill in the required fields to proceed."}
                        </p>
                        <button 
                          type="button" 
                          disabled={!isStep1Complete || !shippingType}
                          onClick={() => {
                            if (!shippingType) { setShowTypeError(true); return; }
                            setStep(2);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 active:scale-[0.98]"
                        >
                          Continue to Package Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ===== STEP 2: Package Details ===== */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in-0 duration-300">
                      <div className={sectionHeader}>
                        <div className={iconBox("bg-accent text-white")}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Package & Shipping</h3>
                          <p className="text-sm text-muted-foreground">Add weight, service type, warehouse, and optional details</p>
                        </div>
                      </div>

                      {/* Weight & Service Type */}
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className={sectionCard}>
                          <div className="flex items-center gap-3">
                            <div className={iconBox("bg-primary/10 text-primary")}>
                              <Scale className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">Package Weight</p>
                              <p className="text-xs text-muted-foreground">Weight in kilograms</p>
                            </div>
                          </div>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            placeholder="e.g. 5.0"
                            className={`${inputBase} text-lg font-semibold`}
                            required
                          />
                          {formData.weight && parseFloat(formData.weight) > 0 && (
                            <p className="text-xs text-muted-foreground">
                              ≈ {(parseFloat(formData.weight) * 2.20462).toFixed(1)} lbs
                            </p>
                          )}
                        </div>

                        <div className={sectionCard}>
                          <div className="flex items-center gap-3">
                            <div className={iconBox("bg-accent/10 text-accent")}>
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">Service Type</p>
                              <p className="text-xs text-muted-foreground">Choose shipping speed</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {serviceTypes.map((type) => {
                              const isSelected = formData.service_type === type.id;
                              const ServiceIcon = type.icon;
                              return (
                                <button
                                  key={type.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, service_type: type.id })}
                                  className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${
                                    isSelected
                                      ? "border-primary bg-primary/[0.04] shadow-sm"
                                      : "border-border/50 bg-white hover:border-primary/20"
                                  }`}
                                >
                                  <ServiceIcon className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{type.name}</p>
                                    <p className="text-xs text-muted-foreground">{type.description}</p>
                                  </div>
                                  {type.tag && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">{type.tag}</span>
                                  )}
                                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? "border-primary bg-primary" : "border-border"
                                  }`}>
                                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Estimated Cost */}
                      {formData.weight && parseFloat(formData.weight) > 0 && (
                        <div className="rounded-2xl bg-gradient-to-br from-primary/[0.04] to-accent/[0.02] border border-primary/10 p-5 sm:p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={iconBox("bg-primary text-white")}>
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-lg text-foreground">Estimated Cost</p>
                          </div>
                          {estimatedCost !== null ? (
                            <div className="space-y-4">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Shipping ({formData.weight} KG × {formatUsd(matchedRate || 0)}/KG)</span>
                                  <span className="font-medium">{formatUsd(estimatedCost)}</span>
                                </div>
                                {prepayPickup && (
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>Pickup / Delivery Fee</span>
                                    <span className="font-medium">{formatUsd(pickupFee)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="border-t border-primary/15 pt-3 flex justify-between items-center">
                                <span className="font-bold text-foreground">Total</span>
                                <span className="text-2xl sm:text-3xl font-bold text-primary">{formatUsd(totalPrice || 0)}</span>
                              </div>

                              {/* Pickup checkbox */}
                              <div className="rounded-xl border border-border/60 bg-white p-4">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="prepay-pickup"
                                    checked={prepayPickup}
                                    onCheckedChange={(checked) => setPrepayPickup(checked === true)}
                                    className="mt-0.5"
                                  />
                                  <div>
                                    <label htmlFor="prepay-pickup" className="text-sm font-semibold text-foreground cursor-pointer">
                                      Prepay Pickup / Delivery Fee
                                    </label>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                      Pay now to skip the pickup fee on collection.
                                      {parseFloat(formData.weight) <= 4
                                        ? ` (Flat: ${formatUsd(70)} for ≤ 4 KG)`
                                        : ` (${formatUsd(6)}/lb — ${(parseFloat(formData.weight) * 2.20462).toFixed(1)} lbs = ${formatUsd(pickupFee)})`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No route pricing available for {formData.origin_country || "origin"} → {formData.destination_country || "destination"}. Price will be set by admin.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Description & Value */}
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className={labelBase}><FileText className="w-3.5 h-3.5 text-muted-foreground" /> Item Description</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the contents of your shipment"
                            rows={3}
                            className="min-h-[100px] resize-none rounded-xl border border-border/80 bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/60 transition-all duration-200 hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                        </div>
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <Label className={labelBase}><DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> Declared Value (USD)</Label>
                            <Input
                              type="number" min="0" step="0.01"
                              value={formData.declared_value}
                              onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })}
                              placeholder="e.g. 500"
                              className={inputBase}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={labelBase}><MessageSquare className="w-3.5 h-3.5 text-muted-foreground" /> Special Instructions</Label>
                            <Input
                              value={formData.special_instructions}
                              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                              placeholder="e.g. Fragile, handle with care"
                              className={inputBase}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Warehouse Selection */}
                      <div className={sectionCard}>
                        <div className="flex items-center gap-3">
                          <div className={iconBox("bg-accent/10 text-accent")}>
                            <Warehouse className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">Warehouse</p>
                            <p className="text-xs text-muted-foreground">
                              {shippingType === "import" ? "Auto-selected for import" : "Select your preferred warehouse"}
                            </p>
                          </div>
                        </div>
                        {shippingType === "import" ? (
                          <div className="flex items-center gap-3 rounded-xl bg-primary/[0.04] border border-primary/10 px-4 py-3">
                            <span className="text-xl">🇳🇬</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Nigeria Warehouse (Lagos)</p>
                              <p className="text-xs text-muted-foreground">Auto-selected for import shipments</p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-3 gap-3">
                            {availableWarehouses.map((wh) => {
                              const isSelected = formData.warehouse_location === wh.id;
                              return (
                                <button
                                  key={wh.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, warehouse_location: wh.id })}
                                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                                    isSelected
                                      ? "border-primary bg-primary/[0.04] shadow-sm"
                                      : "border-border/50 bg-white hover:border-primary/20"
                                  }`}
                                >
                                  <span className="text-2xl">{wh.flag}</span>
                                  <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{wh.name}</p>
                                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? "border-primary bg-primary" : "border-border"
                                  }`}>
                                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Upload Documents */}
                      <div className={sectionCard}>
                        <div className="flex items-center gap-3">
                          <div className={iconBox("bg-primary/10 text-primary")}>
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">Documents (Optional)</p>
                            <p className="text-xs text-muted-foreground">Attach receipts, photos, or invoices. Max 5 files.</p>
                          </div>
                        </div>
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
                          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.02] px-5 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-px hover:bg-primary/[0.06] hover:border-primary/50"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Files
                        </button>
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-2.5 text-sm">
                                <span className="text-foreground truncate max-w-[220px] sm:max-w-none">{file.name}</span>
                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:text-destructive/80 ml-2 shrink-0">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <button 
                          type="button" 
                          onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary active:scale-[0.98]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Back
                        </button>
                        <button 
                          type="button" 
                          disabled={!isStep2Complete}
                          onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:hover:translate-y-0 active:scale-[0.98]"
                        >
                          Review Shipment
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ===== STEP 3: Review ===== */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in-0 duration-300">
                      <div className={sectionHeader}>
                        <div className={iconBox("bg-primary text-white")}>
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Review & Submit</h3>
                          <p className="text-sm text-muted-foreground">Double-check everything before creating your shipment</p>
                        </div>
                      </div>

                      {/* Route Summary */}
                      <div className="rounded-2xl bg-gradient-to-br from-primary/[0.05] to-accent/[0.03] border border-primary/10 p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <span className="inline-flex items-center rounded-full bg-white/80 border border-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                              Ready to Submit
                            </span>
                            <p className="mt-3 text-lg font-bold text-foreground">
                              {formData.origin_city}, {formData.origin_country} → {formData.destination_city}, {formData.destination_country}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formData.receiver_name} • {formData.service_type.replace("-", " ")} • {formData.weight} KG
                            </p>
                          </div>
                          <div className="rounded-xl bg-white/90 border border-primary/10 px-5 py-3 text-center sm:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p>
                            <p className="text-2xl sm:text-3xl font-bold text-primary mt-0.5">
                              {formatUsd(totalPrice ?? estimatedCost ?? 0)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Detail Cards */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className={sectionCard}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Sender</p>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-foreground">{formData.sender_name}</p>
                            <p className="text-sm text-muted-foreground">{formData.sender_phone}</p>
                            {formData.sender_email && <p className="text-sm text-muted-foreground">{formData.sender_email}</p>}
                          </div>
                        </div>
                        <div className={sectionCard}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Receiver</p>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-foreground">{formData.receiver_name}</p>
                            <p className="text-sm text-muted-foreground">{formData.receiver_phone}</p>
                            {formData.receiver_address && (
                              <p className="text-sm text-muted-foreground">
                                {formData.receiver_address}{formData.receiver_city ? `, ${formData.receiver_city}` : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipment Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "Origin", value: `${formData.origin_city}, ${formData.origin_country}` },
                          { label: "Destination", value: `${formData.destination_city}, ${formData.destination_country}` },
                          { label: "Service", value: formData.service_type.replace("-", " ") },
                          { label: "Weight", value: `${formData.weight} KG` },
                          { label: "Declared Value", value: formData.declared_value ? `$${parseFloat(formData.declared_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—" },
                          { label: "Warehouse", value: warehouseLocations.find(w => w.id === formData.warehouse_location)?.name || "—" },
                        ].map((item) => (
                          <div key={item.label} className="rounded-xl bg-muted/30 border border-border/40 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                            <p className="mt-1 text-sm font-semibold capitalize text-foreground">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Summary */}
                      {estimatedCost !== null && (
                        <div className="rounded-xl bg-muted/20 border border-border/40 p-4 space-y-2 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Shipping cost</span>
                            <span>{formatUsd(estimatedCost)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Rate</span>
                            <span>{formatUsd(matchedRate || 0)}/KG</span>
                          </div>
                          {prepayPickup && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Pickup fee</span>
                              <span>{formatUsd(pickupFee)}</span>
                            </div>
                          )}
                          <div className="border-t border-border/40 pt-2 flex justify-between items-center">
                            <span className="font-bold text-foreground">Total</span>
                            <span className="text-xl font-bold text-primary">{formatUsd(totalPrice ?? estimatedCost)}</span>
                          </div>
                        </div>
                      )}

                      {/* Terms */}
                      <div className="flex items-start gap-3 rounded-xl bg-primary/[0.03] border border-primary/10 p-4">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          By submitting, you agree to our shipping terms. Your shipment will be created and you can proceed to payment from your dashboard.
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <button 
                          type="button" 
                          onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-white px-6 py-3 text-sm font-bold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary active:scale-[0.98] sm:w-auto"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Back
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 active:scale-[0.98] sm:w-auto"
                        >
                          {isSubmitting ? "Creating Shipment..." : "Create Shipment"}
                          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
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

      {/* Warehouse Locations */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5 bg-primary/10 text-primary">
              <Warehouse className="w-4 h-4" />
              Warehouses
            </div>
            <h2 className="text-foreground mb-3">
              Our <span className="text-primary">Warehouse Locations</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Ship your packages to any of our warehouse locations worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {warehouseAddresses.map((wh) => (
              <div key={wh.name} className="group p-6 rounded-2xl bg-white border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{wh.flag}</span>
                  <h3 className="font-bold text-lg text-foreground">{wh.name}</h3>
                </div>
                <div className="space-y-1">
                  {wh.lines.map((line, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{line}</p>
                  ))}
                  {wh.phone && (
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {wh.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Shipping Works */}
      <section className="section-padding bg-muted/50">
        <div className="section-container">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5 bg-accent/10 text-accent">
              <Truck className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-foreground mb-3">
              Simple <span className="text-primary">5-Step Process</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              From booking to delivery — here's how it works.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
            {shippingSteps.map((s) => {
              const StepIcon = s.icon;
              return (
                <div key={s.num} className="group relative flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                      <StepIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm">
                      {s.num}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
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
