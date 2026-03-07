import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateShippingCost, PriceBreakdown } from "@/lib/pricingEngine";
import { savePendingShipment } from "@/lib/pricing";
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
  Package, MapPin, Truck, ArrowRight, ArrowLeft, Scale, CheckCircle2,
  Warehouse, DollarSign, User, Mail, Phone, Upload, ClipboardList, Globe,
  MapPinned, Building2, Tag, Send, Shield, Box, Zap, Search, Minus, Plus, AlertCircle,
} from "lucide-react";
import LocationPicker from "@/components/shipments/LocationPicker";

const TOTAL_STEPS = 5;

const progressSteps = [
  { num: 1, label: "Sender", icon: User },
  { num: 2, label: "Receiver", icon: Send },
  { num: 3, label: "Package", icon: Package },
  { num: 4, label: "Shipping", icon: Truck },
  { num: 5, label: "Summary", icon: CheckCircle2 },
];

const ALL_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon",
  "Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia",
  "Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives",
  "Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
  "North Korea","North Macedonia","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan",
  "Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
  "Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam",
  "Yemen","Zambia","Zimbabwe",
];

const WAREHOUSE_COUNTRIES = ["China", "United States", "United Kingdom"];

// SearchableInput kept for backward compat but LocationPicker is preferred
const SearchableInput = ({
  value, onChange, placeholder, className,
}: { value: string; onChange: (val: string) => void; placeholder: string; className?: string }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`pl-9 ${className || ""}`} />
  </div>
);

const Shipping = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStepValidation, setShowStepValidation] = useState(false);

  // DB data
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [extraCharges, setExtraCharges] = useState<any[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [packagingMaterials, setPackagingMaterials] = useState<any[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [packagingQuantities, setPackagingQuantities] = useState<Record<string, number>>({});
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>("");
  const [shippingSpeed, setShippingSpeed] = useState("standard");
  const [pickupFeePrepaid, setPickupFeePrepaid] = useState(false);

  const [formData, setFormData] = useState({
    sender_name: "", sender_email: "", sender_phone: "", sender_address: "", sender_city: "", sender_state: "", sender_country: "",
    receiver_name: "", receiver_phone: "", receiver_email: "", receiver_address: "", receiver_city: "", receiver_state: "", receiver_country: "", receiver_postal_code: "",
    description: "", category: "", weight: "", quantity: "1", declared_value: "",
    origin_country: "", destination_country: "", warehouse_location: "",
  });

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  // Fetch all DB data
  useEffect(() => {
    const fetchData = async () => {
      const [whRes, ecRes, routeRes, pkgRes, dmRes] = await Promise.all([
        (supabase as any).from("warehouses").select("*").eq("is_active", true),
        (supabase as any).from("extra_charges").select("*").eq("is_active", true),
        supabase.from("shipping_routes").select("origin_country, destination_country").eq("is_active", true),
        (supabase as any).from("packaging_materials").select("*").eq("is_active", true).order("name"),
        (supabase as any).from("delivery_methods").select("*").eq("is_active", true).order("fee"),
      ]);
      setWarehouses(whRes.data || []);
      setExtraCharges(ecRes.data || []);
      setActiveRoutes(routeRes.data || []);
      setPackagingMaterials(pkgRes.data || []);
      setDeliveryMethods(dmRes.data || []);
    };
    fetchData();
  }, []);

  // Pre-fill from URL params
  useEffect(() => {
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const weight = searchParams.get("weight");
    if (origin || destination || weight) {
      setFormData((prev) => ({
        ...prev,
        origin_country: origin || prev.origin_country,
        sender_country: origin || prev.sender_country,
        destination_country: destination || prev.destination_country,
        receiver_country: destination || prev.receiver_country,
        weight: weight || prev.weight,
      }));
    }
  }, [searchParams]);

  // Pre-fill sender from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, email, phone, address, city, country").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setFormData((prev) => ({
        ...prev,
        sender_name: data.full_name || prev.sender_name,
        sender_email: data.email || prev.sender_email,
        sender_phone: data.phone || prev.sender_phone,
        sender_address: data.address || prev.sender_address,
        sender_city: data.city || prev.sender_city,
        sender_country: data.country || prev.sender_country,
        origin_country: data.country || prev.origin_country,
      }));
    });
  }, [user]);

  // Packaging cost calculation
  const packagingCost = useMemo(() => {
    return packagingMaterials.reduce((total, pkg) => {
      const qty = packagingQuantities[pkg.id] || 0;
      return total + qty * Number(pkg.price);
    }, 0);
  }, [packagingQuantities, packagingMaterials]);

  // Delivery fee
  const deliveryFee = useMemo(() => {
    const method = deliveryMethods.find((m: any) => m.id === selectedDeliveryMethod);
    return method ? Number(method.fee) : 0;
  }, [selectedDeliveryMethod, deliveryMethods]);

  // Pickup fee logic: if Office Pickup is selected AND user opts to prepay
  const isPickupMethod = useMemo(() => {
    const method = deliveryMethods.find((m: any) => m.id === selectedDeliveryMethod);
    return method?.name?.toLowerCase().includes("pickup");
  }, [selectedDeliveryMethod, deliveryMethods]);

  // Calculate price on step 5
  const calculatePrice = useCallback(async () => {
    const weightNum = parseFloat(formData.weight);
    if (!formData.destination_country || !weightNum || weightNum <= 0) return;
    setPriceLoading(true);
    const declaredVal = parseFloat(formData.declared_value) || 0;
    const result = await calculateShippingCost(formData.destination_country, weightNum, selectedExtras, declaredVal);
    setPriceBreakdown(result);
    setPriceLoading(false);
  }, [formData.destination_country, formData.weight, formData.declared_value, selectedExtras]);

  useEffect(() => {
    if (step === 5) calculatePrice();
  }, [step, calculatePrice]);

  // Grand total = pricing engine total + packaging + delivery fee + pickup fee (if prepaid)
  const grandTotal = useMemo(() => {
    const engineTotal = priceBreakdown?.total || 0;
    const pickupFeeAmount = isPickupMethod && pickupFeePrepaid ? deliveryFee : 0;
    const nonPickupDeliveryFee = !isPickupMethod ? deliveryFee : 0;
    return engineTotal + packagingCost + nonPickupDeliveryFee + pickupFeeAmount;
  }, [priceBreakdown, packagingCost, deliveryFee, isPickupMethod, pickupFeePrepaid]);

  // Route validation
  const isRouteValid = useMemo(() => {
    if (!formData.origin_country || !formData.destination_country) return true;
    return activeRoutes.some(
      (r: any) => r.origin_country === formData.origin_country && r.destination_country === formData.destination_country
    );
  }, [formData.origin_country, formData.destination_country, activeRoutes]);

  const originCountries = useMemo(() => [...new Set(activeRoutes.map((r: any) => r.origin_country))].sort(), [activeRoutes]);

  // Always show all warehouses
  const filteredWarehouses = warehouses;

  const selectedWarehouse = useMemo(() =>
    warehouses.find((w: any) => w.id === formData.warehouse_location), [formData.warehouse_location, warehouses]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
  };
  const removeFile = (index: number) => setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const updatePackagingQty = (id: string, delta: number) => {
    setPackagingQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const selectedDeliveryMethodData = useMemo(() =>
    deliveryMethods.find((m: any) => m.id === selectedDeliveryMethod), [selectedDeliveryMethod, deliveryMethods]
  );

  const packagingSelectionRequired = packagingMaterials.length > 0;
  const hasPackagingSelection = Object.values(packagingQuantities).some((qty) => qty > 0);

  useEffect(() => {
    if (showStepValidation) {
      setShowStepValidation(false);
    }
  }, [
    step,
    formData.origin_country,
    formData.destination_country,
    formData.warehouse_location,
    selectedDeliveryMethod,
    isRouteValid,
    hasPackagingSelection,
    showStepValidation,
  ]);


  const handleSubmit = async () => {
    if (!user) {
      savePendingShipment(formData as any);
      toast({ title: "Login Required", description: "Please log in to complete your shipment." });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (shippingSpeed === "express" ? 7 : 14));

      const descParts = [formData.description];
      if (formData.sender_name) descParts.push(`Sender: ${formData.sender_name}`);
      if (formData.sender_phone) descParts.push(`Sender Phone: ${formData.sender_phone}`);
      if (formData.sender_address) descParts.push(`Sender Address: ${formData.sender_address}, ${formData.sender_city}, ${formData.sender_state}`);
      if (formData.receiver_name) descParts.push(`Receiver: ${formData.receiver_name}`);
      if (formData.receiver_phone) descParts.push(`Receiver Phone: ${formData.receiver_phone}`);
      if (formData.receiver_address) descParts.push(`Receiver Address: ${formData.receiver_address}, ${formData.receiver_city}, ${formData.receiver_state}, ${formData.receiver_country}`);
      if (formData.receiver_postal_code) descParts.push(`Postal Code: ${formData.receiver_postal_code}`);
      if (formData.declared_value) descParts.push(`Declared Value: $${formData.declared_value}`);
      if (formData.category) descParts.push(`Category: ${formData.category}`);
      if (formData.quantity && formData.quantity !== "1") descParts.push(`Quantity: ${formData.quantity}`);
      descParts.push(`Delivery: ${selectedDeliveryMethodData?.name || "Pickup"}`);
      descParts.push(`Speed: ${shippingSpeed}`);
      if (priceBreakdown?.extraCharges.length) descParts.push(`Extras: ${priceBreakdown.extraCharges.map(e => e.name).join(", ")}`);
      const pkgItems = packagingMaterials.filter(p => (packagingQuantities[p.id] || 0) > 0).map(p => `${p.name} x${packagingQuantities[p.id]}`);
      if (pkgItems.length) descParts.push(`Packaging: ${pkgItems.join(", ")}`);
      if (isPickupMethod && !pickupFeePrepaid && deliveryFee > 0) descParts.push(`Pickup fee ₦${deliveryFee.toLocaleString()} to be paid at office`);

      const { data: shipmentData, error } = await supabase.from("shipments").insert({
        user_id: user.id,
        origin_country: formData.origin_country,
        origin_city: formData.sender_city || formData.origin_country,
        destination_country: formData.destination_country,
        destination_city: formData.receiver_city || formData.destination_country,
        weight: parseFloat(formData.weight),
        service_type: shippingSpeed === "express" ? "air-express" : "air-standard",
        description: descParts.filter(Boolean).join(" | ") || null,
        warehouse_location: selectedWarehouse?.name || formData.warehouse_location || null,
        pickup_prepaid: isPickupMethod ? pickupFeePrepaid : false,
        status: "shipment_created",
        estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
        tracking_number: "",
        price: grandTotal || null,
      } as any).select("id").single();

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Shipment Created!", description: "Redirecting to payment..." });
        // Redirect to shipments page with auto-pay param
        navigate(`/dashboard/shipments?pay=${shipmentData?.id}`);
      }
    setIsSubmitting(false);
  };

  const isStep1Complete = formData.sender_name && formData.sender_phone;
  const isStep2Complete = formData.receiver_name && formData.receiver_phone && formData.receiver_country;
  const isStep3Complete = formData.weight && parseFloat(formData.weight) > 0;
  const isStep4Complete = formData.origin_country && formData.destination_country && formData.warehouse_location && isRouteValid && selectedDeliveryMethod && (!packagingSelectionRequired || hasPackagingSelection);

  const canProceed = (s: number) => {
    if (s === 1) return !!isStep1Complete;
    if (s === 2) return !!isStep2Complete;
    if (s === 3) return !!isStep3Complete;
    if (s === 4) return !!isStep4Complete;
    return true;
  };

  const inputClass = "h-12 bg-card border-border/60 text-foreground placeholder:text-muted-foreground/60 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 rounded-[10px] shadow-sm shadow-primary/[0.02]";

  const categories = [
    "Electronics", "Clothing & Fashion", "Food & Beverages", "Documents",
    "Health & Beauty", "Auto Parts", "Home & Furniture", "Books & Media",
    "Sports & Outdoor", "Other",
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="bg-primary pt-28 pb-14 sm:pt-32 sm:pb-18 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-transparent to-primary/20" />
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary-foreground)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="section-container text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 bg-primary-foreground/10 text-primary-foreground/90 border border-primary-foreground/10 backdrop-blur-sm">
              <Package className="w-3.5 h-3.5" /> New Shipment
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 tracking-tight">Create a Shipment</h1>
            <p className="text-primary-foreground/75 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Fill in your details step by step and we'll calculate the cost automatically.
            </p>
          </div>
        </section>

        <section className="section-padding bg-muted/40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="section-container relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl border border-border/50 shadow-xl shadow-primary/[0.04] overflow-hidden">
                {/* Progress */}
                <div className="bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 border-b border-border/40 p-3 sm:p-6 backdrop-blur-sm">
                  <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                    <div className="flex items-center justify-between min-w-[320px] max-w-3xl mx-auto">
                      {progressSteps.map((s, i) => {
                        const isActive = step >= s.num;
                        const isCurrent = step === s.num;
                        const isComplete = step > s.num;
                        const StepIcon = s.icon;
                        return (
                          <div key={s.num} className="flex items-center gap-0.5 sm:gap-1.5">
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                              <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-background border-2 border-border/60 text-muted-foreground"} ${isCurrent ? "ring-2 sm:ring-[3px] ring-primary/15 scale-105" : ""}`}>
                                {isComplete ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" /> : <StepIcon className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />}
                              </div>
                              <span className={`text-[8px] sm:text-xs font-semibold transition-colors whitespace-nowrap tracking-wide ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                            </div>
                            {i < progressSteps.length - 1 && (
                              <div className="w-3 sm:w-8 lg:w-12 h-0.5 rounded-full bg-border overflow-hidden mx-0.5">
                                <div className={`h-full bg-primary rounded-full transition-all duration-500 ${step > s.num ? "w-full" : "w-0"}`} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-6 sm:p-8 lg:p-10">

                  {/* ===== STEP 1: Sender ===== */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4 pb-5 border-b border-border/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20"><User className="w-5 h-5 text-primary-foreground" /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Sender Details</h3><p className="text-[13px] text-muted-foreground mt-0.5">Who is sending this package?</p></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> Full Name *</Label>
                          <Input value={formData.sender_name} onChange={(e) => updateField("sender_name", e.target.value)} placeholder="Full name" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number *</Label>
                          <Input type="tel" value={formData.sender_phone} onChange={(e) => updateField("sender_phone", e.target.value)} placeholder="Phone number" className={inputClass} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                        <Input type="email" value={formData.sender_email} onChange={(e) => updateField("sender_email", e.target.value)} placeholder="Email address" className={inputClass} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</Label>
                        <LocationPicker
                          value={formData.sender_address}
                          onChange={(v) => updateField("sender_address", v)}
                          onLocationSelect={(loc) => {
                            updateField("sender_address", loc.address);
                            if (loc.city) updateField("sender_city", loc.city);
                            if (loc.state) updateField("sender_state", loc.state);
                            if (loc.country) updateField("sender_country", loc.country);
                          }}
                          placeholder="Search your address"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">City</Label>
                          <Input value={formData.sender_city} onChange={(e) => updateField("sender_city", e.target.value)} placeholder="City" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">State</Label>
                          <Input value={formData.sender_state} onChange={(e) => updateField("sender_state", e.target.value)} placeholder="State" className={inputClass} />
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-2">
                          <Label className="text-sm font-medium">Country</Label>
                          <Input value={formData.sender_country} onChange={(e) => updateField("sender_country", e.target.value)} placeholder="Country" className={inputClass} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== STEP 2: Receiver ===== */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4 pb-5 border-b border-border/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20"><Send className="w-5 h-5 text-primary-foreground" /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Receiver Details</h3><p className="text-[13px] text-muted-foreground mt-0.5">Who will receive this package?</p></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> Receiver Name *</Label>
                          <Input value={formData.receiver_name} onChange={(e) => updateField("receiver_name", e.target.value)} placeholder="Full name" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number *</Label>
                          <Input type="tel" value={formData.receiver_phone} onChange={(e) => updateField("receiver_phone", e.target.value)} placeholder="Phone number" className={inputClass} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1"><Mail className="w-3 h-3" /> Email (optional)</Label>
                        <Input type="email" value={formData.receiver_email} onChange={(e) => updateField("receiver_email", e.target.value)} placeholder="Receiver email" className={inputClass} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Destination Address</Label>
                        <LocationPicker
                          value={formData.receiver_address}
                          onChange={(v) => updateField("receiver_address", v)}
                          onLocationSelect={(loc) => {
                            updateField("receiver_address", loc.address);
                            if (loc.city) updateField("receiver_city", loc.city);
                            if (loc.state) updateField("receiver_state", loc.state);
                            if (loc.country) updateField("receiver_country", loc.country);
                          }}
                          placeholder="Search destination address"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">City</Label>
                          <Input value={formData.receiver_city} onChange={(e) => updateField("receiver_city", e.target.value)} placeholder="City" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">State</Label>
                          <Input value={formData.receiver_state} onChange={(e) => updateField("receiver_state", e.target.value)} placeholder="State" className={inputClass} />
                        </div>
                        <div className="col-span-2 sm:col-span-1 space-y-2">
                          <Label className="text-sm font-medium">Country *</Label>
                          <Select value={formData.receiver_country} onValueChange={(v) => updateField("receiver_country", v)}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select country" /></SelectTrigger>
                            <SelectContent className="bg-card border-border max-h-60">
                              {ALL_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Postal Code</Label>
                        <Input value={formData.receiver_postal_code} onChange={(e) => updateField("receiver_postal_code", e.target.value)} placeholder="Postal / ZIP code" className={`${inputClass} max-w-xs`} />
                      </div>
                    </div>
                  )}

                  {/* ===== STEP 3: Package ===== */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4 pb-5 border-b border-border/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center shadow-md shadow-accent/20"><Package className="w-5 h-5 text-accent-foreground" /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Package Details</h3><p className="text-[13px] text-muted-foreground mt-0.5">What are you shipping?</p></div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Package Description</Label>
                        <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe the contents of your package" rows={3} className="resize-none bg-card border-border text-foreground placeholder:text-muted-foreground" />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Category</Label>
                          <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><Scale className="w-3 h-3" /> Weight (KG) *</Label>
                          <Input type="number" min="0.1" step="0.1" value={formData.weight} onChange={(e) => updateField("weight", e.target.value)} placeholder="e.g. 5" className={inputClass} />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Quantity</Label>
                          <Input type="number" min="1" step="1" value={formData.quantity} onChange={(e) => updateField("quantity", e.target.value)} placeholder="1" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" /> Declared Value (USD)</Label>
                          <Input type="number" min="0" step="0.01" value={formData.declared_value} onChange={(e) => updateField("declared_value", e.target.value)} placeholder="e.g. 500" className={inputClass} />
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Upload Package Photos (Optional)</Label>
                        <p className="text-xs text-muted-foreground">Max 5 files. Images or PDF only.</p>
                        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-[10px] border border-dashed border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                          <Upload className="w-4 h-4" /> Choose Files
                        </button>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted border border-border text-sm">
                                <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{file.name}</span>
                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:text-destructive/80 text-xs font-semibold ml-2 shrink-0">Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== STEP 4: Shipping Options ===== */}
                  {step === 4 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4 pb-5 border-b border-border/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20"><Truck className="w-5 h-5 text-primary-foreground" /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Shipping Options</h3><p className="text-[13px] text-muted-foreground mt-0.5">Choose your route, warehouse, and delivery preferences</p></div>
                      </div>

                      {showStepValidation && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/40 bg-destructive/5 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Please complete all required selections before continuing.</span>
                        </div>
                      )}

                      {/* Route */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Origin Country *</Label>
                          <Select value={formData.origin_country} onValueChange={(v) => { updateField("origin_country", v); updateField("destination_country", ""); updateField("warehouse_location", ""); }}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select origin" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">{originCountries.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Destination Country *</Label>
                          <Select value={formData.destination_country} onValueChange={(v) => { updateField("destination_country", v); updateField("warehouse_location", ""); }}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select destination" /></SelectTrigger>
                            <SelectContent className="bg-card border-border max-h-60">
                              {ALL_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {formData.origin_country && formData.destination_country && !isRouteValid && (
                        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
                          This route is not currently available. Please select a different origin/destination.
                        </div>
                      )}

                      {/* Warehouse */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1.5"><Warehouse className="w-3.5 h-3.5" /> Select Warehouse *</Label>
                        <Select value={formData.warehouse_location} onValueChange={(v) => updateField("warehouse_location", v)}>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {(filteredWarehouses.length > 0 ? filteredWarehouses : warehouses).map((wh: any) => <SelectItem key={wh.id} value={wh.id}>{wh.name} ({wh.country})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedWarehouse && (
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                          <div className="flex items-center gap-2 mb-1"><Building2 className="w-4 h-4 text-primary" /><span className="font-semibold text-sm text-foreground">{selectedWarehouse.name}</span></div>
                          <p className="text-sm text-muted-foreground">{selectedWarehouse.address}</p>
                          {selectedWarehouse.phone && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {selectedWarehouse.phone}</p>}
                        </div>
                      )}

                      {/* Delivery Method - from DB */}
                      {deliveryMethods.length > 0 && (
                        <div className={`space-y-3 rounded-2xl p-4 sm:p-5 border ${showStepValidation && !selectedDeliveryMethod ? "border-destructive/40 bg-destructive/5" : "border-border/50 bg-card"}`}>
                          <Label className="text-sm font-medium">Delivery Method *</Label>
                          {!selectedDeliveryMethod && (
                            <p className={`text-xs ${showStepValidation ? "text-destructive" : "text-muted-foreground"}`}>
                              Please select a delivery method to continue.
                            </p>
                          )}
                          <div className="grid sm:grid-cols-2 gap-3">
                            {deliveryMethods.map((dm: any) => {
                              const isSelected = selectedDeliveryMethod === dm.id;
                              const isPickup = dm.name.toLowerCase().includes("pickup");
                              const Icon = isPickup ? MapPinned : Truck;
                              return (
                                <button key={dm.id} type="button" onClick={() => setSelectedDeliveryMethod(dm.id)}
                                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected ? "border-primary bg-primary/[0.08] shadow-md shadow-primary/10 ring-1 ring-primary/20" : "border-border/60 hover:border-primary/30 hover:shadow-sm bg-card"}`}>
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isSelected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
                                    <Icon className="w-[18px] h-[18px]" />
                                  </div>
                                  <div className="flex-1">
                                    <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{dm.name}</p>
                                    <p className="text-xs text-muted-foreground">{dm.description || (Number(dm.fee) === 0 ? "Free" : `₦${Number(dm.fee).toLocaleString()}`)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>{Number(dm.fee) === 0 ? "Free" : `₦${Number(dm.fee).toLocaleString()}`}</span>
                                    {isSelected && (
                                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Pickup Fee Option */}
                          {isPickupMethod && deliveryFee > 0 && (
                            <div className="p-4 rounded-xl border border-border bg-card mt-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={pickupFeePrepaid}
                                  onCheckedChange={(checked) => setPickupFeePrepaid(!!checked)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">
                                    Pay pickup handling fee now — ₦{deliveryFee.toLocaleString()}
                                  </p>
                                  {!pickupFeePrepaid && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Pickup fee will be paid at the office during collection.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Shipping Speed */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Shipping Speed</Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { value: "standard", label: "Standard", desc: "10–14 business days", icon: Package },
                            { value: "express", label: "Express", desc: "5–7 business days", icon: Zap },
                          ].map((opt) => (
                            <button key={opt.value} type="button" onClick={() => setShippingSpeed(opt.value)}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${shippingSpeed === opt.value ? "border-primary bg-primary/[0.04] shadow-sm shadow-primary/10" : "border-border hover:border-primary/30 hover:shadow-sm"}`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${shippingSpeed === opt.value ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25" : "bg-muted text-muted-foreground"}`}>
                                <opt.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Packaging Materials */}
                      {packagingMaterials.length > 0 && (
                        <div className={`space-y-3 rounded-2xl p-4 sm:p-5 border ${showStepValidation && !hasPackagingSelection ? "border-destructive/40 bg-destructive/5" : "border-border/50 bg-card"}`}>
                          <Label className="text-sm font-medium flex items-center gap-1.5"><Box className="w-3.5 h-3.5" /> Packaging Materials *</Label>
                          {!hasPackagingSelection && (
                            <p className={`text-xs ${showStepValidation ? "text-destructive" : "text-muted-foreground"}`}>
                              Select at least one packaging material to continue.
                            </p>
                          )}
                          <div className="space-y-2">
                            {packagingMaterials.map((pkg: any) => {
                              const qty = packagingQuantities[pkg.id] || 0;
                              return (
                                <div key={pkg.id} className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 ${qty > 0 ? "border-primary/40 bg-primary/[0.06] shadow-md shadow-primary/[0.06] ring-1 ring-primary/10" : "border-border/50 bg-card hover:border-border/80"}`}>
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${qty > 0 ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                                      <Box className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                                      <p className="text-xs text-muted-foreground">₦{Number(pkg.price).toLocaleString()} / unit</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button type="button" onClick={() => updatePackagingQty(pkg.id, -1)} disabled={qty === 0}
                                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-primary/10 hover:border-primary/30 disabled:opacity-25 disabled:hover:bg-transparent transition-all duration-150">
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className={`w-8 text-center font-bold text-sm ${qty > 0 ? "text-primary" : "text-muted-foreground"}`}>{qty}</span>
                                    <button type="button" onClick={() => updatePackagingQty(pkg.id, 1)}
                                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all duration-150">
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                    {qty > 0 && <span className="text-xs font-bold text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded-md">₦{(qty * Number(pkg.price)).toLocaleString()}</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Extra Services */}
                      {extraCharges.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Extra Services</Label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {extraCharges.map((ec: any) => (
                              <div key={ec.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => toggleExtra(ec.id)}>
                                <Checkbox checked={selectedExtras.includes(ec.id)} onCheckedChange={() => toggleExtra(ec.id)} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{ec.name}</p>
                                  <p className="text-xs text-muted-foreground">₦{Number(ec.price).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== STEP 5: Summary ===== */}
                  {step === 5 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4 pb-5 border-b border-border/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20"><CheckCircle2 className="w-5 h-5 text-primary-foreground" /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Shipment Summary</h3><p className="text-[13px] text-muted-foreground mt-0.5">Review your details and confirm</p></div>
                      </div>

                      {/* Details cards */}
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                       <div className="p-5 rounded-xl bg-muted/60 border border-border/40">
                            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5">Sender</p>
                            <p className="font-semibold text-sm text-foreground">{formData.sender_name}</p>
                            <p className="text-xs text-muted-foreground">{formData.sender_phone}</p>
                            {formData.sender_address && <p className="text-xs text-muted-foreground mt-1">{formData.sender_address}, {formData.sender_city}</p>}
                          </div>
                          <div className="p-5 rounded-xl bg-muted/60 border border-border/40">
                            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5">Receiver</p>
                            <p className="font-semibold text-sm text-foreground">{formData.receiver_name}</p>
                            <p className="text-xs text-muted-foreground">{formData.receiver_phone}</p>
                            {formData.receiver_address && <p className="text-xs text-muted-foreground mt-1">{formData.receiver_address}, {formData.receiver_city}, {formData.receiver_country}</p>}
                          </div>
                        </div>

                        <div className="p-5 rounded-xl bg-muted/60 border border-border/40">
                          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Shipment Details</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { label: "Route", value: `${formData.origin_country} → ${formData.destination_country}` },
                              { label: "Weight", value: `${formData.weight} KG` },
                              { label: "Warehouse", value: selectedWarehouse?.name || "—" },
                              { label: "Delivery", value: selectedDeliveryMethodData?.name || "Pickup" },
                              { label: "Speed", value: shippingSpeed === "express" ? "Express" : "Standard" },
                              { label: "Category", value: formData.category || "—" },
                            ].map((item) => (
                              <div key={item.label}>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="font-semibold text-sm text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Packaging summary */}
                        {packagingCost > 0 && (
                          <div className="p-4 rounded-xl bg-muted/80 border border-border/50">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Packaging</p>
                            {packagingMaterials.filter(p => (packagingQuantities[p.id] || 0) > 0).map(p => (
                              <div key={p.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{p.name} × {packagingQuantities[p.id]}</span>
                                <span className="font-semibold text-foreground">₦{(packagingQuantities[p.id] * Number(p.price)).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="p-5 rounded-xl border border-primary/30 bg-primary/5">
                        {priceLoading ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Calculating price...</p>
                        ) : (
                          <div className="space-y-2.5">
                            {priceBreakdown && priceBreakdown.shippingCost > 0 && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Shipping Cost {priceBreakdown.zone && `(${priceBreakdown.zone})`}</span>
                                  <span className="font-semibold text-foreground">₦{priceBreakdown.shippingCost.toLocaleString()}</span>
                                </div>
                                {priceBreakdown.extraCharges.map((ec) => (
                                  <div key={ec.name} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{ec.name}</span>
                                    <span className="font-semibold text-foreground">₦{ec.price.toLocaleString()}</span>
                                  </div>
                                ))}
                                {priceBreakdown.processingFee > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Processing Fee</span>
                                    <span className="font-semibold text-foreground">₦{priceBreakdown.processingFee.toLocaleString()}</span>
                                  </div>
                                )}
                                {priceBreakdown.taxes.map((t) => (
                                  <div key={t.name} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t.name} ({t.rate}%)</span>
                                    <span className="font-semibold text-foreground">₦{Math.round(t.amount).toLocaleString()}</span>
                                  </div>
                                ))}
                              </>
                            )}
                            {packagingCost > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Packaging Materials</span>
                                <span className="font-semibold text-foreground">₦{packagingCost.toLocaleString()}</span>
                              </div>
                            )}
                            {deliveryFee > 0 && !isPickupMethod && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivery Fee ({selectedDeliveryMethodData?.name})</span>
                                <span className="font-semibold text-foreground">₦{deliveryFee.toLocaleString()}</span>
                              </div>
                            )}
                            {isPickupMethod && deliveryFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pickup Handling Fee {pickupFeePrepaid ? "(Prepaid)" : "(Pay at office)"}</span>
                                <span className={`font-semibold ${pickupFeePrepaid ? "text-foreground" : "text-muted-foreground line-through"}`}>₦{deliveryFee.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="border-t border-primary/20 pt-3 flex justify-between items-center">
                              <span className="font-bold text-foreground text-lg">Total</span>
                              <span className="text-3xl font-bold text-primary">₦{Math.round(grandTotal).toLocaleString()}</span>
                            </div>
                            {grandTotal === 0 && (
                              <p className="text-sm text-muted-foreground text-center pt-1">
                                No pricing configured for this route/weight. Admin will set the price after review.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0"><Shield className="w-4 h-4 text-primary" /></div>
                        <p className="text-sm text-muted-foreground">By confirming, you agree to our shipping terms. You can pay immediately or save and pay later from your dashboard.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-7 mt-8 border-t border-border/30">
                    <Button type="button" variant="dashOutline" size="dash" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="gap-2 shadow-sm">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    {step < TOTAL_STEPS ? (
                      <Button
                        type="button"
                        variant="dashPrimary"
                        size="dash"
                        onClick={() => {
                          if (canProceed(step)) {
                            setShowStepValidation(false);
                            setStep(step + 1);
                            return;
                          }
                          setShowStepValidation(true);
                          toast({
                            title: "Complete required fields",
                            description: "Please complete all required selections before continuing.",
                            variant: "destructive",
                          });
                        }}
                        className="gap-2 min-w-[150px] shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button type="button" variant="dashAccent" size="dash" disabled={isSubmitting} onClick={handleSubmit} className="gap-2 min-w-[170px] shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/20">
                        {isSubmitting ? "Creating..." : "Confirm & Pay"} <ArrowRight className="w-4 h-4" />
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground shadow-sm"><Truck className="w-4 h-4" />Process</span>
              <h2 className="text-foreground mb-4">How <span className="text-primary">Shipping Works</span></h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">From booking to delivery in five simple steps.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {[
                { num: 1, title: "Create your shipment online", icon: ClipboardList },
                { num: 2, title: "Send package to our warehouse", icon: Package },
                { num: 3, title: "Our team processes the shipment", icon: Truck },
                { num: 4, title: "Track from your dashboard", icon: Globe },
                { num: 5, title: "Receive delivery or pickup", icon: CheckCircle2 },
              ].map((s) => (
                <div key={s.num} className="group relative flex flex-col items-center text-center p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"><s.icon className="w-6 h-6 text-primary-foreground" /></div>
                  <span className="text-xs font-bold text-primary mb-2">Step {s.num}</span>
                  <p className="text-sm font-semibold text-foreground leading-snug">{s.title}</p>
                </div>
              ))}
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
