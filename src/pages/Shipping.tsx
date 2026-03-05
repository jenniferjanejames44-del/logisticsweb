import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateShipmentPrice, savePendingShipment } from "@/lib/pricing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Package, MapPin, Truck, Plane, Ship, ArrowRight, ArrowLeft, Scale, FileText,
  CheckCircle2, Warehouse, DollarSign, User, Mail, Phone, Upload,
  ClipboardList, Globe, MapPinned, MessageSquare, Building2,
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

const warehouseAddresses: Record<string, { name: string; lines: string[]; phone: string | null }> = {
  usa_warehouse: {
    name: "USA Warehouse",
    lines: ["13107 Orchard Mill Drive", "Richmond, Texas 77407"],
    phone: "12815919189",
  },
  uk_warehouse: {
    name: "UK Warehouse",
    lines: ["Unit 1, Loughborough Centre", "105 Angell Road", "Brixton, London", "SW9 7PD"],
    phone: null,
  },
  china_warehouse: {
    name: "China Warehouse",
    lines: ["Guangzhou Baiyun District", "Shijing Town Shitan West Road 12", "Jieli Logistics Park C08-B Warehouse"],
    phone: null,
  },
};

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

const TOTAL_STEPS = 6;

const Shipping = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
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

  // Pre-fill from URL params (coming from homepage)
  useEffect(() => {
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const weight = searchParams.get("weight");
    if (origin || destination || weight) {
      setFormData((prev) => ({
        ...prev,
        origin_country: origin || prev.origin_country,
        destination_country: destination || prev.destination_country,
        weight: weight || prev.weight,
      }));
    }
  }, [searchParams]);

  // Fetch shipping routes
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

  const handleSubmit = async () => {
    if (!user) {
      savePendingShipment(formData as any);
      toast({ title: "Login Required", description: "Please log in to complete your shipment. Your data has been saved." });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    const estimatedDays = formData.service_type.includes("express") ? 3 :
      formData.service_type.includes("ocean") ? 25 : 7;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

    const shippingOnly = estimatedCost ?? await calculateShipmentPrice(formData.service_type, parseFloat(formData.weight));
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
      origin_city: formData.origin_city || formData.origin_country,
      destination_country: formData.destination_country,
      destination_city: formData.destination_city || formData.destination_country,
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
      toast({ title: "Shipment Created!", description: "Your shipment has been created successfully. Proceed to payment." });
      navigate("/dashboard/shipments");
    }

    setIsSubmitting(false);
  };

  // Step validation
  const isStep1Complete = formData.origin_country && formData.destination_country && formData.warehouse_location;
  const isStep2Complete = formData.sender_name && formData.sender_phone;
  const isStep3Complete = formData.receiver_name && formData.receiver_phone;
  const isStep4Complete = formData.weight && parseFloat(formData.weight) > 0 && formData.service_type;

  const canProceed = (s: number) => {
    if (s === 1) return !!isStep1Complete;
    if (s === 2) return !!isStep2Complete;
    if (s === 3) return !!isStep3Complete;
    if (s === 4) return !!isStep4Complete;
    return true;
  };

  const progressSteps = [
    { num: 1, label: "Route", icon: MapPin },
    { num: 2, label: "Sender", icon: User },
    { num: 3, label: "Receiver", icon: MapPinned },
    { num: 4, label: "Package", icon: Scale },
    { num: 5, label: "Pricing", icon: DollarSign },
    { num: 6, label: "Review", icon: CheckCircle2 },
  ];

  const inputClass = "h-12 bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary transition-colors";

  const selectedWarehouse = formData.warehouse_location ? warehouseAddresses[formData.warehouse_location] : null;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-primary pt-28 pb-12 sm:pt-32 sm:pb-16">
          <div className="section-container text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Create a Shipment
            </h1>
            <p className="text-primary-foreground/85 text-lg max-w-2xl mx-auto leading-relaxed">
              Create your shipment by entering the package and destination details below. The system will automatically calculate the shipping cost.
            </p>
          </div>
        </section>

        {/* Wizard */}
        <section className="section-padding bg-muted relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="section-container relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Progress Bar */}
              <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
                <div className="bg-muted/80 border-b border-border/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {progressSteps.map((s, i) => {
                      const isActive = step >= s.num;
                      const isCurrent = step === s.num;
                      const isComplete = step > s.num;
                      const StepIcon = s.icon;
                      return (
                        <div key={s.num} className="flex items-center gap-1 sm:gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isActive ? "bg-primary text-primary-foreground shadow-lg" : "bg-background border-2 border-border text-muted-foreground"
                              } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                            >
                              {isComplete ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold transition-colors hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                              {s.label}
                            </span>
                          </div>
                          {i < progressSteps.length - 1 && (
                            <div className="w-4 sm:w-8 lg:w-12 h-0.5 rounded-full bg-border overflow-hidden mx-0.5">
                              <div className={`h-full bg-primary rounded-full transition-all duration-500 ${step > s.num ? "w-full" : "w-0"}`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Step 1: Shipment Route */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                          <MapPin className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">Shipment Route</h3>
                          <p className="text-sm text-muted-foreground">Where is your package going?</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Origin Country *</Label>
                          <Select value={formData.origin_country} onValueChange={(v) => setFormData({ ...formData, origin_country: v })}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select origin" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Destination Country *</Label>
                          <Select value={formData.destination_country} onValueChange={(v) => setFormData({ ...formData, destination_country: v })}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select destination" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Warehouse Selection */}
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5" /> Warehouse Location *
                        </Label>
                        <Select value={formData.warehouse_location} onValueChange={(v) => setFormData({ ...formData, warehouse_location: v })}>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {warehouseLocations.map((wh) => (
                              <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Warehouse Address Display */}
                      {selectedWarehouse && (
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">{selectedWarehouse.name}</span>
                          </div>
                          <div className="space-y-0.5">
                            {selectedWarehouse.lines.map((line, i) => (
                              <p key={i} className="text-sm text-muted-foreground">{line}</p>
                            ))}
                            {selectedWarehouse.phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" /> {selectedWarehouse.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Sender Information */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">Sender Information</h3>
                          <p className="text-sm text-muted-foreground">Who is sending this package?</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> Sender Name *</Label>
                          <Input value={formData.sender_name} onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })} placeholder="Full name" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                          <Input type="email" value={formData.sender_email} onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })} placeholder="Email address" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number *</Label>
                          <Input type="tel" value={formData.sender_phone} onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })} placeholder="Phone number" className={inputClass} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Receiver Information */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-md">
                          <MapPinned className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">Receiver Information</h3>
                          <p className="text-sm text-muted-foreground">Who will receive this package?</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">Receiver Name *</Label>
                            <Input value={formData.receiver_name} onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })} placeholder="Full name" className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">Phone Number *</Label>
                            <Input type="tel" value={formData.receiver_phone} onChange={(e) => setFormData({ ...formData, receiver_phone: e.target.value })} placeholder="Phone number" className={inputClass} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Delivery Address</Label>
                          <Input value={formData.receiver_address} onChange={(e) => setFormData({ ...formData, receiver_address: e.target.value })} placeholder="Street address" className={inputClass} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">City</Label>
                            <Input value={formData.receiver_city} onChange={(e) => setFormData({ ...formData, receiver_city: e.target.value })} placeholder="City" className={inputClass} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">Country</Label>
                            <Select value={formData.receiver_country} onValueChange={(v) => setFormData({ ...formData, receiver_country: v })}>
                              <SelectTrigger className={inputClass}><SelectValue placeholder="Select country" /></SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Package Details */}
                  {step === 4 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                          <Package className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">Package Details</h3>
                          <p className="text-sm text-muted-foreground">Tell us about your package</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Weight (KG) *</Label>
                          <Input type="number" min="0.1" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g. 5" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Service Type *</Label>
                          <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v })}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select service" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {serviceTypes.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  <span>{t.name} ({t.description})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm font-medium">Item Description</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the contents of your shipment" rows={3} className="resize-none bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary transition-colors" />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Declared Value (USD)</Label>
                          <Input type="number" min="0" step="0.01" value={formData.declared_value} onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })} placeholder="e.g. 500" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Special Instructions</Label>
                          <Input value={formData.special_instructions} onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })} placeholder="e.g. Fragile" className={inputClass} />
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm font-medium">Upload Documents (Optional)</Label>
                        <p className="text-xs text-muted-foreground">Attach receipts, photos, or invoices. Max 5 files.</p>
                        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-dashed border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                          <Upload className="w-4 h-4" /> Choose Files
                        </button>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border text-sm">
                                <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{file.name}</span>
                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:text-destructive/80 text-xs font-semibold ml-2 shrink-0">Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Price Calculation */}
                  {step === 5 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-md">
                          <DollarSign className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">Price Calculation</h3>
                          <p className="text-sm text-muted-foreground">Review your shipping costs</p>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
                        {estimatedCost !== null ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Shipping ({formData.weight} KG × ${matchedRate?.toFixed(2)}/KG)</span>
                                <span className="font-semibold text-foreground">${estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              {prepayPickup && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Pickup / Delivery Fee</span>
                                  <span className="font-semibold text-foreground">${pickupFee.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t border-primary/20 pt-3 flex justify-between items-center">
                              <span className="font-bold text-foreground text-lg">Total Payment</span>
                              <span className="text-3xl font-bold text-primary">
                                ${totalPrice?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Prepay Pickup */}
                            <div className="p-4 rounded-lg border border-border bg-card">
                              <div className="flex items-start gap-3">
                                <Checkbox id="prepay-pickup" checked={prepayPickup} onCheckedChange={(checked) => setPrepayPickup(checked === true)} className="mt-0.5" />
                                <div className="space-y-1">
                                  <label htmlFor="prepay-pickup" className="text-sm font-semibold text-foreground cursor-pointer">
                                    Prepay Pickup / Delivery Fee
                                  </label>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    If you pay this now, you will not pay any pickup fee when collecting your shipment.
                                    {parseFloat(formData.weight) <= 4
                                      ? ` (Flat fee: $70 for shipments ≤ 4 KG)`
                                      : ` ($6/lb — ${(parseFloat(formData.weight) * 2.20462).toFixed(1)} lbs = $${pickupFee.toFixed(2)})`}
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
                    </div>
                  )}

                  {/* Step 6: Review */}
                  {step === 6 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">Shipment Summary</h3>
                          <p className="text-sm text-muted-foreground">Confirm your shipment details</p>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-muted/80 border border-border/50 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { label: "From", value: formData.origin_country, icon: MapPin },
                            { label: "To", value: formData.destination_country, icon: MapPin },
                            { label: "Warehouse", value: warehouseLocations.find(w => w.id === formData.warehouse_location)?.name, icon: Warehouse },
                            { label: "Weight", value: `${formData.weight} KG`, icon: Scale },
                            { label: "Service", value: formData.service_type.replace("-", " "), icon: Truck },
                            { label: "Sender", value: `${formData.sender_name} (${formData.sender_phone})`, icon: User },
                            { label: "Receiver", value: `${formData.receiver_name} (${formData.receiver_phone})`, icon: MapPinned },
                          ].map((item) => (
                            <div key={item.label} className="bg-card rounded-xl p-3 border border-border/50">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                                <item.icon className="w-3 h-3" /> {item.label}
                              </p>
                              <p className="font-semibold text-foreground text-sm capitalize">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        {estimatedCost !== null && (
                          <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                              <span>Shipping Cost</span>
                              <span className="font-semibold text-foreground">${estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                            </div>
                            {prepayPickup && (
                              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>Pickup Fee</span>
                                <span className="font-semibold text-foreground">${pickupFee.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between">
                              <span className="font-bold text-foreground">Total</span>
                              <span className="font-bold text-primary text-lg">${totalPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                            </div>
                            {!prepayPickup && (
                              <p className="text-xs text-muted-foreground mt-2 italic">Pickup fee will be paid on collection.</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By confirming, you agree to our shipping terms. Your shipment will be created and you can proceed to payment from your dashboard.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 mt-6 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(Math.max(1, step - 1))}
                      disabled={step === 1}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>

                    {step < TOTAL_STEPS ? (
                      <Button
                        type="button"
                        variant="cta"
                        disabled={!canProceed(step)}
                        onClick={() => setStep(step + 1)}
                        className="gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="cta"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="gap-2"
                      >
                        {isSubmitting ? "Creating..." : "Confirm Shipment"} <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Shipping Works */}
        <section className="section-padding bg-background">
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
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Shipping;
