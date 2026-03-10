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

const warehouseLocations = [
  { id: "usa_warehouse", name: "USA Warehouse" },
  { id: "uk_warehouse", name: "UK Warehouse" },
  { id: "china_warehouse", name: "China Warehouse" },
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

  const inputClass = "h-12 bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary transition-colors";

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
            className={`relative max-w-4xl mx-auto rounded-2xl overflow-hidden transition-all duration-500 ${
              isFocused ? "shadow-2xl" : "shadow-xl"
            }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <div className="relative bg-card rounded-2xl border border-border/50">
              {/* Progress Steps */}
              <div className="bg-muted/80 border-b border-border/50 p-5 sm:p-8">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  {progressSteps.map((s, i) => {
                    const isActive = step >= s.num;
                    const isCurrent = step === s.num;
                    const isComplete = step > s.num;
                    const StepIcon = s.icon;

                    return (
                      <div key={s.num} className="flex items-center gap-2 sm:gap-4">
                        <div className="flex flex-col items-center gap-1.5">
                          <div 
                            className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? "bg-primary text-primary-foreground shadow-lg" 
                                : "bg-background border-2 border-border text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                            
                            {isCurrent && (
                              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                            )}
                          </div>
                          
                          <span className={`text-xs sm:text-sm font-semibold transition-colors ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {s.label}
                          </span>
                        </div>

                        {i < progressSteps.length - 1 && (
                          <div className="relative w-12 sm:w-20 h-1 rounded-full bg-border overflow-hidden mx-1 sm:mx-2">
                            <div 
                              className={`absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ${
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
              <div className="p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Route & Contacts */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      {/* Origin & Destination */}
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Origin Card */}
                        <div className="group relative p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
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
                        <div className="group relative p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
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
                      <div className="flex items-center justify-center gap-3 py-4">
                        <div className="text-center">
                          <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground">{formData.origin_city || "Origin"}</span>
                        </div>
                        <div className="flex-1 max-w-32 h-0.5 bg-primary/30 rounded-full" />
                        <Plane className="w-5 h-5 text-primary -rotate-45" />
                        <div className="flex-1 max-w-32 h-0.5 bg-primary/30 rounded-full" />
                        <div className="text-center">
                          <div className="w-3 h-3 rounded-full bg-accent mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground">{formData.destination_city || "Destination"}</span>
                        </div>
                      </div>

                      {/* Sender Information */}
                      <div className="group relative p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
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
                      <div className="group relative p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-md">
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

                      <div className="flex justify-end pt-4">
                        <button 
                          type="button" 
                          disabled={!isStep1Complete}
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full shadow-md transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Package Details */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="group p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                        <div className="group p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                        <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 transition-all duration-300">
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
                              <div className="mt-3 p-4 rounded-lg border border-border bg-card">
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
                      <div className="group p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold">Item Description</span>
                        </Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe the contents of your shipment"
                          rows={3}
                          className="resize-none bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary transition-colors"
                        />
                      </div>

                      {/* Declared Value & Special Instructions */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="group p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                        <div className="group p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                          <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      <div className="group p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      <div className="group p-5 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all duration-300">
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-dashed border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Files
                        </button>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border text-sm">
                                <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{file.name}</span>
                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:text-destructive/80 text-xs font-semibold ml-2 shrink-0">Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-4">
                        <button 
                          type="button" 
                          onClick={() => setStep(1)}
                          className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full transition-all duration-200 bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                        >
                          Back
                        </button>
                        <button 
                          type="button" 
                          disabled={!isStep2Complete}
                          onClick={() => setStep(3)}
                          className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full shadow-md transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
                        >
                          Review
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="relative p-6 rounded-xl bg-muted/80 border border-border/50 overflow-hidden">
                        <h3 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          Shipment Summary
                        </h3>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> From
                            </p>
                            <p className="font-bold text-foreground">{formData.origin_city}, {formData.origin_country}</p>
                          </div>
                          <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> To
                            </p>
                            <p className="font-bold text-foreground">{formData.destination_city}, {formData.destination_country}</p>
                          </div>
                        </div>

                        {/* Sender & Receiver Summary */}
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                          <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <User className="w-3 h-3" /> Sender
                            </p>
                            <p className="font-bold text-foreground">{formData.sender_name}</p>
                            <p className="text-sm text-muted-foreground">{formData.sender_phone}</p>
                            {formData.sender_email && <p className="text-sm text-muted-foreground">{formData.sender_email}</p>}
                          </div>
                          <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <MapPinned className="w-3 h-3" /> Receiver
                            </p>
                            <p className="font-bold text-foreground">{formData.receiver_name}</p>
                            <p className="text-sm text-muted-foreground">{formData.receiver_phone}</p>
                            {formData.receiver_address && <p className="text-sm text-muted-foreground">{formData.receiver_address}{formData.receiver_city ? `, ${formData.receiver_city}` : ""}</p>}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                          <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <Scale className="w-3 h-3" /> Weight
                            </p>
                            <p className="font-bold text-foreground">{formData.weight} KG</p>
                          </div>
                          <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Service
                            </p>
                            <p className="font-bold text-foreground capitalize">{formData.service_type.replace("-", " ")}</p>
                          </div>
                        </div>

                        {estimatedCost !== null && (
                          <div className="mt-4 group bg-primary/10 rounded-xl p-4 border border-primary/30">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Shipping Cost
                            </p>
                            <p className="font-bold text-primary text-lg">{formatUsd(estimatedCost)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formData.weight} KG × {formatUsd(matchedRate || 0)}/KG</p>
                            {prepayPickup && (
                              <div className="mt-3 pt-3 border-t border-primary/20 space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Pickup / Delivery Fee</span>
                                  <span>{formatUsd(pickupFee)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-foreground">
                                  <span>Total Payment</span>
                                  <span className="text-primary">{formatUsd(totalPrice || 0)}</span>
                                </div>
                              </div>
                            )}
                            {!prepayPickup && (
                              <p className="text-xs text-muted-foreground mt-2 italic">Pickup fee will be paid on collection.</p>
                            )}
                          </div>
                        )}

                        {formData.warehouse_location && (
                          <div className="mt-4 group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <Warehouse className="w-3 h-3" /> Warehouse
                            </p>
                            <p className="font-bold text-foreground capitalize">{warehouseLocations.find(w => w.id === formData.warehouse_location)?.name}</p>
                          </div>
                        )}

                        {formData.declared_value && (
                          <div className="mt-4 group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Declared Value
                            </p>
                            <p className="font-bold text-foreground">${parseFloat(formData.declared_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                          </div>
                        )}

                        {formData.description && (
                          <div className="mt-4 group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Description
                            </p>
                            <p className="text-foreground">{formData.description}</p>
                          </div>
                        )}

                        {formData.special_instructions && (
                          <div className="mt-4 group bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Special Instructions
                            </p>
                            <p className="text-foreground">{formData.special_instructions}</p>
                          </div>
                        )}

                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 group bg-card rounded-xl p-4 border border-border/50">
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Uploaded Documents ({uploadedFiles.length})
                            </p>
                            <ul className="space-y-1">
                              {uploadedFiles.map((f, i) => (
                                <li key={i} className="text-sm text-foreground">• {f.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By submitting, you agree to our shipping terms. Your shipment will be created and you can proceed to payment from your dashboard.
                        </p>
                      </div>

                      <div className="flex justify-between pt-4">
                        <button 
                          type="button" 
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full transition-all duration-200 bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full shadow-md transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
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
