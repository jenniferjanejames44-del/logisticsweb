import { Fragment, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  MapPinned, Building2, Tag, Send, Shield, Box, Zap, Search, Minus, Plus, AlertCircle, FileText,
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

const shipmentWorkflowGuides = {
  import: {
    badge: "Import workflow",
    shipmentTitle: "Start your import shipment",
    quoteTitle: "Get an import shipping quote",
    description: "Use this flow when your goods are moving from a supported RAC warehouse country to the final destination.",
    serviceLink: "/services/import",
  },
  export: {
    badge: "Export workflow",
    shipmentTitle: "Start your export shipment",
    quoteTitle: "Calculate your export shipment",
    description: "Use this flow when you are dispatching goods internationally to an approved destination country.",
    serviceLink: "/services/export",
  },
} as const;

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
  const { formatUsd } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const flow = searchParams.get("flow");
  const intent = searchParams.get("intent") === "quote" ? "quote" : "shipment";
  const workflowGuide = flow === "import" || flow === "export" ? shipmentWorkflowGuides[flow] : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStepValidation, setShowStepValidation] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    description: "", category: "", weight: "", length_cm: "", width_cm: "", height_cm: "", quantity: "1", declared_value: "",
    origin_country: "", destination_country: "", warehouse_location: "",
    insurance_required: "false", notes: "",
  });

  // Volumetric & chargeable weight
  const volumetricWeight = useMemo(() => {
    const l = parseFloat(formData.length_cm);
    const w = parseFloat(formData.width_cm);
    const h = parseFloat(formData.height_cm);
    if (l > 0 && w > 0 && h > 0) return (l * w * h) / 5000;
    return 0;
  }, [formData.length_cm, formData.width_cm, formData.height_cm]);

  const chargeableWeight = useMemo(() => {
    const actual = parseFloat(formData.weight) || 0;
    return Math.max(actual, volumetricWeight);
  }, [formData.weight, volumetricWeight]);

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const registerFieldRef = useCallback(
    (field: string) => (node: HTMLDivElement | null) => {
      fieldRefs.current[field] = node;
    },
    [],
  );

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
    if (!formData.destination_country || chargeableWeight <= 0) return;
    setPriceLoading(true);
    const declaredVal = parseFloat(formData.declared_value) || 0;
    const result = await calculateShippingCost(formData.destination_country, chargeableWeight, selectedExtras, declaredVal);
    setPriceBreakdown(result);
    setPriceLoading(false);
  }, [formData.destination_country, chargeableWeight, formData.declared_value, selectedExtras]);

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
    formData.sender_name,
    formData.sender_phone,
    formData.receiver_name,
    formData.receiver_phone,
    formData.receiver_country,
    formData.weight,
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
      if (formData.declared_value) descParts.push(`Declared Value (USD): $${formData.declared_value}`);
      if (formData.category) descParts.push(`Category: ${formData.category}`);
      if (formData.quantity && formData.quantity !== "1") descParts.push(`Quantity: ${formData.quantity}`);
      descParts.push(`Delivery: ${selectedDeliveryMethodData?.name || "Pickup"}`);
      descParts.push(`Speed: ${shippingSpeed}`);
      if (priceBreakdown?.extraCharges.length) descParts.push(`Extras: ${priceBreakdown.extraCharges.map(e => e.name).join(", ")}`);
      const pkgItems = packagingMaterials.filter(p => (packagingQuantities[p.id] || 0) > 0).map(p => `${p.name} x${packagingQuantities[p.id]}`);
      if (pkgItems.length) descParts.push(`Packaging: ${pkgItems.join(", ")}`);
      if (isPickupMethod && !pickupFeePrepaid && deliveryFee > 0) descParts.push(`Pickup fee USD ${deliveryFee.toFixed(2)} to be paid at office`);

      const { data: shipmentData, error } = await supabase.from("shipments").insert({
        user_id: user.id,
        origin_country: formData.origin_country,
        origin_city: formData.sender_city || formData.origin_country,
        destination_country: formData.destination_country,
        destination_city: formData.receiver_city || formData.destination_country,
        weight: parseFloat(formData.weight),
        length_cm: parseFloat(formData.length_cm) || null,
        width_cm: parseFloat(formData.width_cm) || null,
        height_cm: parseFloat(formData.height_cm) || null,
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

  const isSenderNameInvalid = showStepValidation && !formData.sender_name;
  const isSenderPhoneInvalid = showStepValidation && !formData.sender_phone;
  const isReceiverNameInvalid = showStepValidation && !formData.receiver_name;
  const isReceiverPhoneInvalid = showStepValidation && !formData.receiver_phone;
  const isReceiverCountryInvalid = showStepValidation && !formData.receiver_country;
  const isWeightInvalid = showStepValidation && (!formData.weight || parseFloat(formData.weight) <= 0);
  const isOriginInvalid = showStepValidation && !formData.origin_country;
  const isDestinationInvalid = showStepValidation && !formData.destination_country;
  const isRouteInvalid = showStepValidation && !!formData.origin_country && !!formData.destination_country && !isRouteValid;
  const isWarehouseInvalid = showStepValidation && !formData.warehouse_location;
  const isDeliveryInvalid = showStepValidation && !selectedDeliveryMethod;
  const isPackagingInvalid = showStepValidation && packagingSelectionRequired && !hasPackagingSelection;

  const canProceed = (s: number) => {
    if (s === 1) return !!isStep1Complete;
    if (s === 2) return !!isStep2Complete;
    if (s === 3) return !!isStep3Complete;
    if (s === 4) return !!isStep4Complete;
    return true;
  };

  const getFirstInvalidField = useCallback((currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.sender_name) return "sender_name";
      if (!formData.sender_phone) return "sender_phone";
      return null;
    }
    if (currentStep === 2) {
      if (!formData.receiver_name) return "receiver_name";
      if (!formData.receiver_phone) return "receiver_phone";
      if (!formData.receiver_country) return "receiver_country";
      return null;
    }
    if (currentStep === 3) {
      if (!formData.weight || parseFloat(formData.weight) <= 0) return "weight";
      return null;
    }
    if (currentStep === 4) {
      if (!formData.origin_country) return "origin_country";
      if (!formData.destination_country || !isRouteValid) return "destination_country";
      if (!formData.warehouse_location) return "warehouse_location";
      if (!selectedDeliveryMethod) return "delivery_method";
      if (packagingSelectionRequired && !hasPackagingSelection) return "packaging_materials";
    }
    return null;
  }, [
    formData.destination_country,
    formData.origin_country,
    formData.receiver_country,
    formData.receiver_name,
    formData.receiver_phone,
    formData.sender_name,
    formData.sender_phone,
    formData.warehouse_location,
    formData.weight,
    hasPackagingSelection,
    isRouteValid,
    packagingSelectionRequired,
    selectedDeliveryMethod,
  ]);

  const scrollToInvalidField = useCallback((field: string | null) => {
    if (!field) return;
    const container = fieldRefs.current[field];
    if (!container) return;
    container.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      const focusTarget = container.querySelector("input, textarea, button, [role='combobox']") as HTMLElement | null;
      focusTarget?.focus();
    }, 160);
  }, []);

  const inputClass = "h-12 rounded-lg border border-border/70 bg-white px-4 text-[15px] text-foreground placeholder:text-muted-foreground/55 shadow-sm transition-all duration-200 hover:border-primary/25 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12";
  const textAreaClass = "min-h-[104px] resize-none rounded-lg border border-border/70 bg-white px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/55 shadow-sm transition-all duration-200 hover:border-primary/25 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12";
  const invalidFieldClass = "!border-destructive/60 !ring-2 !ring-destructive/12 focus:!border-destructive focus:!ring-destructive/18";
  const stepPanelClass = "space-y-6 sm:space-y-7 animate-in fade-in-0 slide-in-from-right-2 duration-300";
  const softPanelClass = "rounded-xl border border-border/50 bg-muted/30 p-4 sm:p-5";
  const interactiveCardClass = "transition-colors duration-200 hover:bg-muted/40";
  const actionBarClass = "mt-8 flex flex-col gap-3 border-t border-border/40 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4";

  const categories = [
    "Electronics", "Clothing & Fashion", "Food & Beverages", "Documents",
    "Health & Beauty", "Auto Parts", "Home & Furniture", "Books & Media",
    "Sports & Outdoor", "Other",
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="bg-primary pt-28 pb-12 sm:pt-32 sm:pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/30" />
          <div className="section-container text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 bg-primary-foreground/10 text-primary-foreground/90 border border-primary-foreground/10">
              <Package className="w-3.5 h-3.5" /> {workflowGuide?.badge || "New Shipment"}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3 tracking-tight">
              {workflowGuide ? (intent === "quote" ? workflowGuide.quoteTitle : workflowGuide.shipmentTitle) : "Create a Shipment"}
            </h1>
            <p className="text-primary-foreground/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {workflowGuide?.description || "Fill in your details step by step and we'll calculate the cost automatically."}
            </p>
          </div>
        </section>

        <section className="section-padding bg-[hsl(220,20%,97%)]">
          <div className="section-container">
            {workflowGuide && (
              <div className="mx-auto mb-6 max-w-4xl rounded-xl border border-border/60 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary">{workflowGuide.badge}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Need more context first? Review the dedicated service guide before you complete shipment details.</p>
                  </div>
                  <Button asChild variant="dashOutline" size="sm">
                    <Link to={workflowGuide.serviceLink}>Back to service guide</Link>
                  </Button>
                </div>
              </div>
            )}
            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
                {/* Progress */}
                <div className="border-b border-border/50 bg-white p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Step {step} of {TOTAL_STEPS}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{progressSteps[step - 1]?.label}</p>
                    </div>
                    <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-bold text-primary">
                      {Math.round((step / TOTAL_STEPS) * 100)}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mb-5 h-1.5 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
                  </div>
                  {/* Step pills */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {progressSteps.map((s, i) => {
                      const isComplete = step > s.num;
                      const isCurrent = step === s.num;
                      const StepIcon = s.icon;
                      return (
                        <Fragment key={s.num}>
                          <button
                            type="button"
                            onClick={() => { if (isComplete) setStep(s.num); }}
                            disabled={!isComplete}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-3 sm:py-2.5 sm:text-sm ${
                              isComplete
                                ? "bg-primary/8 text-primary cursor-pointer hover:bg-primary/12"
                                : isCurrent
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted/50 text-muted-foreground cursor-default"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                            ) : (
                              <StepIcon className="h-4 w-4 shrink-0" strokeWidth={2} />
                            )}
                            <span className="hidden sm:inline">{s.label}</span>
                          </button>
                          {i < progressSteps.length - 1 && (
                            <div className="h-px w-2 bg-border/60 sm:w-4" />
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Form */}
                <div className="bg-white p-5 sm:p-6 lg:p-8">

                  {/* ===== STEP 1: Sender ===== */}
                  {step === 1 && (
                    <div className={stepPanelClass}>
                      <div className="flex items-center gap-3 border-b border-border/40 pb-5 mb-1">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><User className="w-5 h-5" strokeWidth={2} /></div>
                        <div><h3 className="font-bold text-lg text-foreground">Sender Details</h3><p className="text-sm text-muted-foreground">Who is sending this package?</p></div>
                      </div>
                      {showStepValidation && !isStep1Complete && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-destructive/[0.04] p-3 text-sm text-destructive ring-1 ring-destructive/20">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Please complete all required fields before continuing.</span>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div ref={registerFieldRef("sender_name")} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" strokeWidth={2.5} /> Full Name *</Label>
                          <Input aria-invalid={isSenderNameInvalid || undefined} value={formData.sender_name} onChange={(e) => updateField("sender_name", e.target.value)} placeholder="Full name" className={`${inputClass} ${isSenderNameInvalid ? invalidFieldClass : ""}`} />
                          {isSenderNameInvalid && <p className="text-xs text-destructive">Please complete this field before continuing.</p>}
                        </div>
                        <div ref={registerFieldRef("sender_phone")} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" strokeWidth={2.5} /> Phone Number *</Label>
                          <Input aria-invalid={isSenderPhoneInvalid || undefined} type="tel" value={formData.sender_phone} onChange={(e) => updateField("sender_phone", e.target.value)} placeholder="Phone number" className={`${inputClass} ${isSenderPhoneInvalid ? invalidFieldClass : ""}`} />
                          {isSenderPhoneInvalid && <p className="text-xs text-destructive">Please complete this field before continuing.</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1"><Mail className="w-3 h-3" strokeWidth={2.5} /> Email</Label>
                        <Input type="email" value={formData.sender_email} onChange={(e) => updateField("sender_email", e.target.value)} placeholder="Email address" className={inputClass} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={2.5} /> Address</Label>
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
                    <div className={stepPanelClass}>
                      <div className="flex flex-col gap-3 border-b border-border/30 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20"><Send className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Receiver Details</h3><p className="text-[13px] text-muted-foreground mt-0.5">Who will receive this package?</p></div>
                      </div>
                      {showStepValidation && !isStep2Complete && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/40 bg-destructive/5 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Please complete all required fields before continuing.</span>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div ref={registerFieldRef("receiver_name")} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> Receiver Name *</Label>
                          <Input aria-invalid={isReceiverNameInvalid || undefined} value={formData.receiver_name} onChange={(e) => updateField("receiver_name", e.target.value)} placeholder="Full name" className={`${inputClass} ${isReceiverNameInvalid ? invalidFieldClass : ""}`} />
                          {isReceiverNameInvalid && <p className="text-xs text-destructive">Please complete this field before continuing.</p>}
                        </div>
                        <div ref={registerFieldRef("receiver_phone")} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number *</Label>
                          <Input aria-invalid={isReceiverPhoneInvalid || undefined} type="tel" value={formData.receiver_phone} onChange={(e) => updateField("receiver_phone", e.target.value)} placeholder="Phone number" className={`${inputClass} ${isReceiverPhoneInvalid ? invalidFieldClass : ""}`} />
                          {isReceiverPhoneInvalid && <p className="text-xs text-destructive">Please complete this field before continuing.</p>}
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
                        <div ref={registerFieldRef("receiver_country")} className="col-span-2 sm:col-span-1 space-y-2">
                          <Label className="text-sm font-medium">Country *</Label>
                          <Select value={formData.receiver_country} onValueChange={(v) => updateField("receiver_country", v)}>
                            <SelectTrigger aria-invalid={isReceiverCountryInvalid || undefined} className={`${inputClass} ${isReceiverCountryInvalid ? invalidFieldClass : ""}`}><SelectValue placeholder="Select country" /></SelectTrigger>
                            <SelectContent className="bg-card border-border max-h-60">
                              {ALL_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {isReceiverCountryInvalid && <p className="text-xs text-destructive">Please complete this field before continuing.</p>}
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
                    <div className={stepPanelClass}>
                      <div className="flex flex-col gap-3 border-b border-border/30 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-md shadow-accent/20"><Package className="w-5 h-5 text-accent-foreground" strokeWidth={2.5} /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Package Details</h3><p className="text-[13px] text-muted-foreground mt-0.5">What are you shipping?</p></div>
                      </div>
                      {showStepValidation && !isStep3Complete && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/40 bg-destructive/5 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Please complete all required fields before continuing.</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Package Description</Label>
                        <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe the contents of your package" rows={3} className={textAreaClass} />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Category</Label>
                        <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div ref={registerFieldRef("weight")} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><Scale className="w-3 h-3" /> Weight (KG) *</Label>
                          <Input aria-invalid={isWeightInvalid || undefined} type="number" min="0.1" step="0.1" value={formData.weight} onChange={(e) => updateField("weight", e.target.value)} placeholder="e.g. 5" className={`${inputClass} ${isWeightInvalid ? invalidFieldClass : ""}`} />
                          {isWeightInvalid && <p className="text-xs text-destructive">Please complete this field before continuing.</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Length (cm)</Label>
                          <Input type="number" min="0" step="0.1" value={formData.length_cm} onChange={(e) => updateField("length_cm", e.target.value)} placeholder="e.g. 50" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Width (cm)</Label>
                          <Input type="number" min="0" step="0.1" value={formData.width_cm} onChange={(e) => updateField("width_cm", e.target.value)} placeholder="e.g. 40" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Height (cm)</Label>
                          <Input type="number" min="0" step="0.1" value={formData.height_cm} onChange={(e) => updateField("height_cm", e.target.value)} placeholder="e.g. 30" className={inputClass} />
                        </div>
                      </div>

                      {/* Weight breakdown */}
                      {volumetricWeight > 0 && (
                        <div className={softPanelClass}>
                          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">Weight Breakdown</p>
                          <div className="flex items-start justify-between gap-3 text-sm">
                            <span className="text-muted-foreground">Actual Weight</span>
                            <span className="whitespace-nowrap font-semibold text-foreground">{parseFloat(formData.weight || "0").toFixed(2)} kg</span>
                          </div>
                          <div className="flex items-start justify-between gap-3 text-sm">
                            <span className="text-muted-foreground">Volumetric Weight</span>
                            <span className="whitespace-nowrap font-semibold text-foreground">{volumetricWeight.toFixed(2)} kg</span>
                          </div>
                          <div className="flex items-start justify-between gap-3 border-t border-border/40 pt-1.5 text-sm">
                            <span className="font-semibold text-foreground">Chargeable Weight</span>
                            <span className="whitespace-nowrap font-bold text-primary">{chargeableWeight.toFixed(2)} kg</span>
                          </div>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Quantity</Label>
                          <Input type="number" min="1" step="1" value={formData.quantity} onChange={(e) => updateField("quantity", e.target.value)} placeholder="1" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" strokeWidth={2.5} /> Declared Value (USD)</Label>
                          <Input type="number" min="0" step="0.01" value={formData.declared_value} onChange={(e) => updateField("declared_value", e.target.value)} placeholder="e.g. 500" className={inputClass} />
                        </div>
                      </div>

                      {/* Insurance Option */}
                      <div className={softPanelClass}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-[0_10px_20px_rgba(6,16,67,0.08)]">
                              <Shield className="w-5 h-5 text-primary" strokeWidth={2.5} />
                            </div>
                            <div>
                              <Label className="text-sm font-semibold cursor-pointer">Shipment Insurance</Label>
                              <p className="text-xs text-muted-foreground">Protect your package against loss or damage</p>
                            </div>
                          </div>
                          <Checkbox
                            checked={formData.insurance_required === "true"}
                            onCheckedChange={(checked) => updateField("insurance_required", checked ? "true" : "false")}
                          />
                        </div>
                        {formData.insurance_required === "true" && (
                          <div className="space-y-2 pl-[52px]">
                            <p className="text-xs text-muted-foreground">Insurance coverage based on declared value</p>
                          </div>
                        )}
                      </div>

                      {/* Shipment Notes */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1"><FileText className="w-3 h-3" strokeWidth={2.5} /> Shipment Notes (Optional)</Label>
                        <Textarea
                          value={formData.notes || ""}
                          onChange={(e) => updateField("notes", e.target.value)}
                          placeholder="Add any special instructions or notes for this shipment..."
                          rows={3}
                          className={textAreaClass}
                        />
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Upload Package Photos (Optional)</Label>
                        <p className="text-xs text-muted-foreground">Max 5 files. Images or PDF only.</p>
                        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/35 bg-primary/[0.05] px-4 py-2.5 text-sm font-semibold text-primary shadow-[0_10px_20px_rgba(6,16,67,0.04)] transition-all duration-200 hover:-translate-y-px hover:bg-primary/10">
                          <Upload className="w-4 h-4" /> Choose Files
                        </button>
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-border/50">
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
                    <div className={stepPanelClass}>
                      <div className="flex flex-col gap-3 border-b border-border/30 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20"><Truck className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} /></div>
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
                        <div ref={registerFieldRef("origin_country")} className="space-y-2">
                          <Label className="text-sm font-medium">Origin Country *</Label>
                          <Select value={formData.origin_country} onValueChange={(v) => { updateField("origin_country", v); updateField("destination_country", ""); updateField("warehouse_location", ""); }}>
                            <SelectTrigger aria-invalid={(isOriginInvalid || isRouteInvalid) || undefined} className={`${inputClass} ${(isOriginInvalid || isRouteInvalid) ? invalidFieldClass : ""}`}><SelectValue placeholder="Select origin" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">{originCountries.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                          {isOriginInvalid && <p className="text-xs text-destructive">Please select an origin country to continue.</p>}
                        </div>
                        <div ref={registerFieldRef("destination_country")} className="space-y-2">
                          <Label className="text-sm font-medium">Destination Country *</Label>
                          <Select value={formData.destination_country} onValueChange={(v) => { updateField("destination_country", v); updateField("warehouse_location", ""); }}>
                            <SelectTrigger aria-invalid={(isDestinationInvalid || isRouteInvalid) || undefined} className={`${inputClass} ${(isDestinationInvalid || isRouteInvalid) ? invalidFieldClass : ""}`}><SelectValue placeholder="Select destination" /></SelectTrigger>
                            <SelectContent className="bg-card border-border max-h-60">
                              {ALL_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {isDestinationInvalid && <p className="text-xs text-destructive">Please select a destination country to continue.</p>}
                          {!isDestinationInvalid && isRouteInvalid && <p className="text-xs text-destructive">This route is not currently available. Please choose another route.</p>}
                        </div>
                      </div>

                      {formData.origin_country && formData.destination_country && !isRouteValid && (
                        <div className="rounded-xl bg-destructive/[0.04] p-3 text-sm text-destructive ring-1 ring-destructive/20">
                          This route is not currently available. Please select a different origin/destination.
                        </div>
                      )}

                      {/* Warehouse */}
                      <div ref={registerFieldRef("warehouse_location")} className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1.5"><Warehouse className="w-3.5 h-3.5" /> Select Warehouse *</Label>
                        <Select value={formData.warehouse_location} onValueChange={(v) => updateField("warehouse_location", v)}>
                          <SelectTrigger aria-invalid={isWarehouseInvalid || undefined} className={`${inputClass} ${isWarehouseInvalid ? invalidFieldClass : ""}`}><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {(filteredWarehouses.length > 0 ? filteredWarehouses : warehouses).map((wh: any) => <SelectItem key={wh.id} value={wh.id}>{wh.name} ({wh.country})</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {isWarehouseInvalid && <p className="text-xs text-destructive">Please select a warehouse before continuing.</p>}
                      </div>
                      {selectedWarehouse && (
                        <div className={`${softPanelClass} bg-white`}>
                          <div className="flex items-center gap-2 mb-1"><Building2 className="w-4 h-4 text-primary" /><span className="font-semibold text-sm text-foreground">{selectedWarehouse.name}</span></div>
                          <p className="break-words text-sm text-muted-foreground">{selectedWarehouse.address}</p>
                          {selectedWarehouse.phone && <p className="mt-1 flex items-center gap-1 break-words text-sm text-muted-foreground"><Phone className="w-3 h-3 shrink-0" /> {selectedWarehouse.phone}</p>}
                        </div>
                      )}

                      {/* Delivery Method - from DB */}
                      {deliveryMethods.length > 0 && (
                        <div ref={registerFieldRef("delivery_method")} className={`space-y-3 rounded-xl p-4 ring-1 transition-all duration-200 ease-in-out sm:p-5 ${isDeliveryInvalid ? "bg-destructive/[0.03] ring-destructive/30" : "bg-muted/[0.18] ring-border/50"}`}>
                          <Label className="text-sm font-medium">Delivery Method *</Label>
                          {isDeliveryInvalid && (
                            <p className={`text-xs ${showStepValidation ? "text-destructive" : "text-muted-foreground"}`}>
                              Please select a delivery method to continue.
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {deliveryMethods.map((dm: any) => {
                              const isSelected = selectedDeliveryMethod === dm.id;
                              const isPickup = dm.name.toLowerCase().includes("pickup");
                              const Icon = isPickup ? MapPinned : Truck;
                              return (
                                <button
                                  key={dm.id}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedDeliveryMethod(dm.id)}
                                  className={`group flex flex-col items-start gap-3 rounded-xl bg-white p-4 text-left ring-1 transition-all duration-200 ease-in-out sm:flex-row sm:items-center ${isSelected ? "bg-primary/[0.05] ring-primary/20" : "ring-border/50 hover:bg-muted/20 hover:ring-primary/15 active:scale-[0.98]"}`}
                                >
                                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${isSelected ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(6,16,67,0.18)]" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                                    <Icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{dm.name}</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground sm:truncate">{dm.description || (Number(dm.fee) === 0 ? "Free" : formatUsd(Number(dm.fee)))}</p>
                                  </div>
                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    <span className={`text-sm font-bold whitespace-nowrap ${isSelected ? "text-primary" : "text-foreground"}`}>{Number(dm.fee) === 0 ? "Free" : formatUsd(Number(dm.fee))}</span>
                                    <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${isSelected ? "bg-primary" : "bg-muted"}`}>
                                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} strokeWidth={2.5} />
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Pickup Fee Option */}
                          {isPickupMethod && deliveryFee > 0 && (
                            <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-border/50 sm:p-5">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={pickupFeePrepaid}
                                  onCheckedChange={(checked) => setPickupFeePrepaid(!!checked)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">
                                    Pay pickup handling fee now — {formatUsd(deliveryFee)}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { value: "standard", label: "Standard", desc: "10–14 business days", icon: Package },
                            { value: "express", label: "Express", desc: "5–7 business days", icon: Zap },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setShippingSpeed(opt.value)}
                              className={`group flex items-center gap-3 rounded-xl bg-white p-4 text-left ring-1 transition-all duration-200 ease-in-out ${shippingSpeed === opt.value ? "bg-primary/[0.05] ring-primary/20" : "ring-border/50 hover:bg-muted/20 hover:ring-primary/15 active:scale-[0.98]"}`}
                            >
                              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${shippingSpeed === opt.value ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(6,16,67,0.18)]" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                                <opt.icon className="w-4 h-4" strokeWidth={2.5} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`font-semibold text-sm ${shippingSpeed === opt.value ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">{opt.desc}</p>
                              </div>
                              <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${shippingSpeed === opt.value ? "bg-primary" : "bg-muted"}`}>
                                <CheckCircle2 className={`w-3.5 h-3.5 ${shippingSpeed === opt.value ? "text-primary-foreground" : "text-muted-foreground"}`} strokeWidth={2.5} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Packaging Materials */}
                      {packagingMaterials.length > 0 && (
                        <div ref={registerFieldRef("packaging_materials")} className={`space-y-3 rounded-xl p-4 ring-1 transition-all duration-200 ease-in-out sm:p-5 ${isPackagingInvalid ? "bg-destructive/[0.03] ring-destructive/30" : "bg-muted/[0.18] ring-border/50"}`}>
                          <Label className="text-sm font-medium flex items-center gap-1.5"><Box className="w-3.5 h-3.5" strokeWidth={2.5} /> Packaging Materials *</Label>
                          {!hasPackagingSelection && (
                            <p className={`text-xs ${showStepValidation ? "text-destructive" : "text-muted-foreground"}`}>
                              Select at least one packaging material to continue.
                            </p>
                          )}
                          <div className="space-y-3">
                            {packagingMaterials.map((pkg: any) => {
                              const qty = packagingQuantities[pkg.id] || 0;
                              return (
                                <div key={pkg.id} className={`grid gap-4 rounded-xl bg-white p-4 ring-1 transition-all duration-200 ease-in-out sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${qty > 0 ? "bg-primary/[0.05] ring-primary/20" : "ring-border/50 hover:bg-muted/20 hover:ring-primary/15"}`}>
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${qty > 0 ? "bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(6,16,67,0.18)]" : "bg-muted text-muted-foreground"}`}>
                                      <Box className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                                      <p className="text-xs text-muted-foreground">{formatUsd(Number(pkg.price))} / unit</p>
                                    </div>
                                  </div>
                                  <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:flex-nowrap sm:justify-end">
                                    <div className="inline-flex min-w-[124px] items-center justify-between gap-2 rounded-xl bg-white/90 px-2 py-1.5 ring-1 ring-border/50">
                                      <button
                                        type="button"
                                        onClick={() => updatePackagingQty(pkg.id, -1)}
                                        disabled={qty === 0}
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 ease-in-out ${qty === 0 ? "border-border/30 text-muted-foreground/30 cursor-not-allowed" : "border-border text-foreground hover:-translate-y-px hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive active:scale-95"}`}
                                        aria-label="Decrease quantity"
                                      >
                                        <Minus className="w-4 h-4" strokeWidth={2.5} />
                                      </button>
                                      <span className={`w-10 text-center font-bold text-base ${qty > 0 ? "text-primary" : "text-muted-foreground"}`}>{qty}</span>
                                      <button
                                        type="button"
                                        onClick={() => updatePackagingQty(pkg.id, 1)}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-all duration-200 ease-in-out hover:-translate-y-px hover:bg-primary/10 hover:border-primary/40 hover:text-primary active:scale-95"
                                        aria-label="Increase quantity"
                                      >
                                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                                      </button>
                                    </div>
                                    {qty > 0 && (
                                      <span className="whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                                        {formatUsd(qty * Number(pkg.price))}
                                      </span>
                                    )}
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
                              <div key={ec.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-primary/20" onClick={() => toggleExtra(ec.id)}>
                                <Checkbox checked={selectedExtras.includes(ec.id)} onCheckedChange={() => toggleExtra(ec.id)} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{ec.name}</p>
                                  <p className="text-xs text-muted-foreground">{formatUsd(Number(ec.price))}</p>
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
                    <div className={stepPanelClass}>
                      <div className="flex flex-col gap-3 border-b border-border/30 pb-4 sm:flex-row sm:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20"><CheckCircle2 className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} /></div>
                        <div><h3 className="font-bold text-[1.125rem] text-foreground tracking-tight">Shipment Summary</h3><p className="text-[13px] text-muted-foreground mt-0.5">Review your details and confirm</p></div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_300px]">
                        <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(6,16,67,0.05),rgba(223,81,1,0.035))] p-5 ring-1 ring-primary/10 sm:p-6">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-3">
                              <span className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                Ready to confirm
                              </span>
                              <div>
                                <p className="break-words text-sm font-semibold text-foreground sm:text-base">{formData.origin_country} → {formData.destination_country}</p>
                                <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">
                                  {selectedDeliveryMethodData?.name || "Pickup"} • {shippingSpeed === "express" ? "Express" : "Standard"} • {selectedWarehouse?.name || "Warehouse pending"}
                                </p>
                              </div>
                            </div>
                            <div className="rounded-2xl bg-white/90 px-4 py-3 text-left ring-1 ring-primary/10 sm:min-w-[180px]">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estimated total</p>
                              <p className="mt-1 whitespace-nowrap text-3xl font-bold text-primary">{formatUsd(grandTotal)}</p>
                              <p className="text-xs text-muted-foreground">Final confirmation before submission</p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {[
                              { label: "Chargeable Weight", value: `${chargeableWeight.toFixed(2)} KG` },
                              { label: "Packaging", value: packagingCost > 0 ? formatUsd(packagingCost) : "None selected" },
                              { label: "Delivery Fee", value: deliveryFee > 0 ? formatUsd(deliveryFee) : "Included / N/A" },
                            ].map((item) => (
                              <div key={item.label} className="rounded-xl bg-white/80 p-4 ring-1 ring-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                                <p className="mt-1 break-words text-sm font-semibold text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-muted/[0.18] p-5 ring-1 ring-border/50">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Submission checklist</p>
                          <div className="mt-4 space-y-3 text-sm">
                            {[
                              `Sender and receiver details captured`,
                              `Route and warehouse selected`,
                              `${selectedDeliveryMethodData?.name || "Pickup"} delivery method confirmed`,
                              packagingCost > 0 ? "Packaging materials included" : "No packaging materials selected",
                            ].map((item) => (
                              <div key={item} className="flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-border/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span className="text-muted-foreground">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Details cards */}
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className={`${softPanelClass} ${interactiveCardClass}`}>
                            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5">Sender</p>
                            <p className="font-semibold text-sm text-foreground">{formData.sender_name}</p>
                            <p className="break-words text-xs text-muted-foreground">{formData.sender_phone}</p>
                            {formData.sender_address && <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{formData.sender_address}, {formData.sender_city}</p>}
                          </div>
                          <div className={`${softPanelClass} ${interactiveCardClass}`}>
                            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2.5">Receiver</p>
                            <p className="font-semibold text-sm text-foreground">{formData.receiver_name}</p>
                            <p className="break-words text-xs text-muted-foreground">{formData.receiver_phone}</p>
                            {formData.receiver_address && <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{formData.receiver_address}, {formData.receiver_city}, {formData.receiver_country}</p>}
                          </div>
                        </div>

                        <div className={`${softPanelClass} ${interactiveCardClass}`}>
                          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Shipment Details</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {[
                              { label: "Route", value: `${formData.origin_country} → ${formData.destination_country}` },
                              { label: "Actual Weight", value: `${formData.weight} KG` },
                              ...(volumetricWeight > 0 ? [
                                { label: "Dimensions", value: `${formData.length_cm}×${formData.width_cm}×${formData.height_cm} cm` },
                                { label: "Volumetric Weight", value: `${volumetricWeight.toFixed(2)} KG` },
                                { label: "Chargeable Weight", value: `${chargeableWeight.toFixed(2)} KG` },
                              ] : []),
                              { label: "Warehouse", value: selectedWarehouse?.name || "—" },
                              { label: "Delivery", value: selectedDeliveryMethodData?.name || "Pickup" },
                              { label: "Speed", value: shippingSpeed === "express" ? "Express" : "Standard" },
                              { label: "Category", value: formData.category || "—" },
                              { label: "Quantity", value: formData.quantity || "1" },
                              { label: "Declared Value (USD)", value: formData.declared_value ? `$${formData.declared_value}` : "—" },
                              { label: "Insurance", value: formData.insurance_required === "true" ? "Yes" : "No" },
                            ].map((item) => (
                              <div key={item.label} className="rounded-xl bg-white/80 p-3 ring-1 ring-border/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                                <p className="mt-1 break-words text-sm font-semibold leading-snug text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>
                          {formData.notes && (
                            <div className="mt-4 pt-4 border-t border-border/40">
                              <p className="text-xs text-muted-foreground mb-1">Shipment Notes</p>
                              <p className="break-words text-sm leading-relaxed text-foreground">{formData.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Packaging summary */}
                        {packagingCost > 0 && (
                          <div className={`${softPanelClass} ${interactiveCardClass}`}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Packaging</p>
                              <span className="whitespace-nowrap rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
                                {formatUsd(packagingCost)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {packagingMaterials.filter(p => (packagingQuantities[p.id] || 0) > 0).map(p => (
                                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2.5 text-sm ring-1 ring-border/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                                  <span className="break-words text-muted-foreground">{p.name} × {packagingQuantities[p.id]}</span>
                                  <span className="whitespace-nowrap font-semibold text-foreground">{formatUsd(packagingQuantities[p.id] * Number(p.price))}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(6,16,67,0.05),rgba(223,81,1,0.035))] p-5 ring-1 ring-primary/10 sm:p-6">
                        {priceLoading ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Calculating price...</p>
                        ) : (
                          <div className="space-y-2.5">
                            {priceBreakdown && priceBreakdown.shippingCost > 0 && (
                              <>
                                <div className="flex items-start justify-between gap-3 text-sm">
                                  <span className="text-muted-foreground">Shipping Cost {priceBreakdown.zone && `(${priceBreakdown.zone})`}</span>
                                  <span className="whitespace-nowrap font-semibold text-foreground">{formatUsd(priceBreakdown.shippingCost)}</span>
                                </div>
                                {priceBreakdown.extraCharges.map((ec) => (
                                  <div key={ec.name} className="flex items-start justify-between gap-3 text-sm">
                                    <span className="text-muted-foreground">{ec.name}</span>
                                    <span className="whitespace-nowrap font-semibold text-foreground">{formatUsd(ec.price)}</span>
                                  </div>
                                ))}
                                {priceBreakdown.processingFee > 0 && (
                                  <div className="flex items-start justify-between gap-3 text-sm">
                                    <span className="text-muted-foreground">Processing Fee</span>
                                    <span className="whitespace-nowrap font-semibold text-foreground">{formatUsd(priceBreakdown.processingFee)}</span>
                                  </div>
                                )}
                                {priceBreakdown.taxes.map((t) => (
                                  <div key={t.name} className="flex items-start justify-between gap-3 text-sm">
                                    <span className="text-muted-foreground">{t.name} ({t.rate}%)</span>
                                    <span className="whitespace-nowrap font-semibold text-foreground">{formatUsd(t.amount)}</span>
                                  </div>
                                ))}
                              </>
                            )}
                            {packagingCost > 0 && (
                              <div className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-muted-foreground">Packaging Materials</span>
                                <span className="whitespace-nowrap font-semibold text-foreground">{formatUsd(packagingCost)}</span>
                              </div>
                            )}
                            {deliveryFee > 0 && !isPickupMethod && (
                              <div className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-muted-foreground">Delivery Fee ({selectedDeliveryMethodData?.name})</span>
                                <span className="whitespace-nowrap font-semibold text-foreground">{formatUsd(deliveryFee)}</span>
                              </div>
                            )}
                            {isPickupMethod && deliveryFee > 0 && (
                              <div className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-muted-foreground">Pickup Handling Fee {pickupFeePrepaid ? "(Prepaid)" : "(Pay at office)"}</span>
                                <span className={`whitespace-nowrap font-semibold ${pickupFeePrepaid ? "text-foreground" : "text-muted-foreground line-through"}`}>{formatUsd(deliveryFee)}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-3 rounded-xl bg-white/85 px-4 py-3 ring-1 ring-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                              <span className="font-bold text-foreground text-lg">Total</span>
                              <span className="whitespace-nowrap text-2xl font-bold text-primary sm:text-3xl">{formatUsd(grandTotal)}</span>
                            </div>
                            {grandTotal === 0 && (
                              <p className="text-sm text-muted-foreground text-center pt-1">
                                No pricing configured for this route/weight. Admin will set the price after review.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-3 rounded-xl bg-muted/[0.18] p-4 ring-1 ring-border/50">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Shield className="w-4 h-4 text-primary" /></div>
                        <p className="text-sm text-muted-foreground">By confirming, you agree to our shipping terms. You can pay immediately or save and pay later from your dashboard.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className={actionBarClass}>
                    <Button
                      type="button"
                      variant="dashOutline"
                      size="dash"
                      onClick={() => {
                        setStep(Math.max(1, step - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={step === 1}
                      className="order-2 min-h-[44px] w-full gap-2 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-px sm:order-1 sm:w-auto"
                    >
                      <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Back
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
                            // Smooth scroll to top of form
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            return;
                          }
                          setShowStepValidation(true);
                          scrollToInvalidField(getFirstInvalidField(step));
                          toast({
                            title: "Complete required fields",
                            description: "Please complete all required selections before continuing.",
                            variant: "destructive",
                          });
                        }}
                        className="order-1 min-h-[44px] w-full gap-2 shadow-md shadow-primary/15 transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20 sm:order-2 sm:min-w-[150px] sm:w-auto"
                      >
                        Continue <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="dashAccent"
                        size="dash"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="order-1 min-h-[44px] w-full gap-2 shadow-md shadow-accent/15 transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg hover:shadow-accent/20 sm:order-2 sm:min-w-[170px] sm:w-auto"
                      >
                        {isSubmitting ? "Creating..." : "Confirm & Pay"} <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
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
            <div className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground shadow-sm"><Truck className="w-4 h-4" />Process</span>
              <h2 className="text-foreground mb-4">How <span className="text-primary">Shipping Works</span></h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">From booking to delivery in five simple steps.</p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { num: 1, title: "Create your shipment online", icon: ClipboardList },
                { num: 2, title: "Send package to our warehouse", icon: Package },
                { num: 3, title: "Our team processes the shipment", icon: Truck },
                { num: 4, title: "Track from your dashboard", icon: Globe },
                { num: 5, title: "Receive delivery or pickup", icon: CheckCircle2 },
              ].map((s) => (
                <div key={s.num} className="group relative flex flex-col items-center rounded-2xl border border-border/70 bg-white/95 p-6 text-center shadow-[0_16px_36px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(15,23,42,0.07)]">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-[0_14px_28px_rgba(6,16,67,0.16)] transition-transform group-hover:scale-105"><s.icon className="w-6 h-6 text-primary-foreground" /></div>
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
