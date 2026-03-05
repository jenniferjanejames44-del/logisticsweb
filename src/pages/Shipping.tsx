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
  MapPinned, Building2, Tag,
} from "lucide-react";

const TOTAL_STEPS = 4;

const progressSteps = [
  { num: 1, label: "Sender", icon: User },
  { num: 2, label: "Shipment", icon: Package },
  { num: 3, label: "Extras", icon: Tag },
  { num: 4, label: "Summary", icon: CheckCircle2 },
];

const Shipping = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DB data
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [extraCharges, setExtraCharges] = useState<any[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<any[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    sender_name: "",
    sender_email: "",
    sender_phone: "",
    origin_country: "",
    destination_country: "",
    warehouse_location: "",
    weight: "",
    description: "",
    declared_value: "",
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    receiver_city: "",
    receiver_country: "",
  });

  // Fetch warehouses, extra charges, and active routes
  useEffect(() => {
    const fetchData = async () => {
      const [whRes, ecRes, routeRes] = await Promise.all([
        (supabase as any).from("warehouses").select("*").eq("is_active", true),
        (supabase as any).from("extra_charges").select("*").eq("is_active", true),
        supabase.from("shipping_routes").select("origin_country, destination_country").eq("is_active", true),
      ]);
      setWarehouses(whRes.data || []);
      setExtraCharges(ecRes.data || []);
      setActiveRoutes(routeRes.data || []);
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
        destination_country: destination || prev.destination_country,
        weight: weight || prev.weight,
      }));
    }
  }, [searchParams]);

  // Pre-fill sender info from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, email, phone").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setFormData((prev) => ({
        ...prev,
        sender_name: data.full_name || prev.sender_name,
        sender_email: data.email || prev.sender_email,
        sender_phone: data.phone || prev.sender_phone,
      }));
    });
  }, [user]);

  // Calculate price when moving to step 4
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
    if (step === 4) calculatePrice();
  }, [step, calculatePrice]);

  // Route validation
  const isRouteValid = useMemo(() => {
    if (!formData.origin_country || !formData.destination_country) return true; // no selection yet
    return activeRoutes.some(
      (r: any) => r.origin_country === formData.origin_country && r.destination_country === formData.destination_country
    );
  }, [formData.origin_country, formData.destination_country, activeRoutes]);

  // Get unique countries from routes
  const originCountries = useMemo(() => [...new Set(activeRoutes.map((r: any) => r.origin_country))].sort(), [activeRoutes]);
  const destinationCountries = useMemo(() => {
    if (!formData.origin_country) return [...new Set(activeRoutes.map((r: any) => r.destination_country))].sort();
    return activeRoutes
      .filter((r: any) => r.origin_country === formData.origin_country)
      .map((r: any) => r.destination_country)
      .sort();
  }, [formData.origin_country, activeRoutes]);

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

  const handleSubmit = async () => {
    if (!user) {
      savePendingShipment(formData as any);
      toast({ title: "Login Required", description: "Please log in to complete your shipment." });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 14);

    const descParts = [formData.description];
    if (formData.sender_name) descParts.push(`Sender: ${formData.sender_name}`);
    if (formData.sender_phone) descParts.push(`Sender Phone: ${formData.sender_phone}`);
    if (formData.receiver_name) descParts.push(`Receiver: ${formData.receiver_name}`);
    if (formData.receiver_phone) descParts.push(`Receiver Phone: ${formData.receiver_phone}`);
    if (formData.receiver_address) descParts.push(`Receiver Address: ${formData.receiver_address}, ${formData.receiver_city}, ${formData.receiver_country}`);
    if (formData.declared_value) descParts.push(`Declared Value: $${formData.declared_value}`);
    if (priceBreakdown?.extraCharges.length) descParts.push(`Extras: ${priceBreakdown.extraCharges.map(e => e.name).join(", ")}`);

    const { error } = await supabase.from("shipments").insert({
      user_id: user.id,
      origin_country: formData.origin_country,
      origin_city: formData.origin_country,
      destination_country: formData.destination_country,
      destination_city: formData.destination_country,
      weight: parseFloat(formData.weight),
      service_type: "air-standard",
      description: descParts.filter(Boolean).join(" | ") || null,
      warehouse_location: selectedWarehouse?.name || formData.warehouse_location || null,
      pickup_prepaid: false,
      status: "shipment_created",
      estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
      tracking_number: "",
      price: priceBreakdown?.total || null,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Shipment Created!", description: "Proceed to payment from your dashboard." });
      navigate("/dashboard/shipments");
    }
    setIsSubmitting(false);
  };

  // Validation
  const isStep1Complete = formData.sender_name && formData.sender_phone;
  const isStep2Complete = formData.origin_country && formData.destination_country && formData.warehouse_location && formData.weight && parseFloat(formData.weight) > 0 && isRouteValid;
  const canProceed = (s: number) => {
    if (s === 1) return !!isStep1Complete;
    if (s === 2) return !!isStep2Complete;
    return true;
  };

  const inputClass = "h-12 bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary transition-colors";

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="bg-primary pt-28 pb-12 sm:pt-32 sm:pb-16">
          <div className="section-container text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">Create a Shipment</h1>
            <p className="text-primary-foreground/85 text-lg max-w-2xl mx-auto leading-relaxed">
              Fill in your details and our system will calculate the cost automatically.
            </p>
          </div>
        </section>

        <section className="section-padding bg-muted relative overflow-hidden">
          <div className="section-container relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
                {/* Progress */}
                <div className="bg-muted/80 border-b border-border/50 p-3 sm:p-6">
                  <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                    <div className="flex items-center justify-between min-w-[320px] max-w-2xl mx-auto">
                      {progressSteps.map((s, i) => {
                        const isActive = step >= s.num;
                        const isCurrent = step === s.num;
                        const isComplete = step > s.num;
                        const StepIcon = s.icon;
                        return (
                          <div key={s.num} className="flex items-center gap-1 sm:gap-2">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? "bg-primary text-primary-foreground shadow-lg" : "bg-background border-2 border-border text-muted-foreground"} ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                                {isComplete ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <StepIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                              </div>
                              <span className={`text-[9px] sm:text-xs font-semibold transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                            </div>
                            {i < progressSteps.length - 1 && (
                              <div className="w-6 sm:w-12 lg:w-16 h-0.5 rounded-full bg-border overflow-hidden mx-0.5">
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
                  {/* Step 1: Sender Info */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md"><User className="w-5 h-5 text-primary-foreground" /></div>
                        <div><h3 className="font-bold text-lg text-foreground">Sender Information</h3><p className="text-sm text-muted-foreground">Who is sending this package?</p></div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> Full Name *</Label>
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

                  {/* Step 2: Shipment Details */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md"><Package className="w-5 h-5 text-primary-foreground" /></div>
                        <div><h3 className="font-bold text-lg text-foreground">Shipment Details</h3><p className="text-sm text-muted-foreground">Route, warehouse, and package info</p></div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Origin Country *</Label>
                          <Select value={formData.origin_country} onValueChange={(v) => setFormData({ ...formData, origin_country: v, destination_country: "" })}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select origin" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">{originCountries.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Destination Country *</Label>
                          <Select value={formData.destination_country} onValueChange={(v) => setFormData({ ...formData, destination_country: v })}>
                            <SelectTrigger className={inputClass}><SelectValue placeholder="Select destination" /></SelectTrigger>
                            <SelectContent className="bg-card border-border">{destinationCountries.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                        <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1.5"><Warehouse className="w-3.5 h-3.5" /> Select Warehouse *</Label>
                        <Select value={formData.warehouse_location} onValueChange={(v) => setFormData({ ...formData, warehouse_location: v })}>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {warehouses.map((wh: any) => <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedWarehouse && (
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                          <div className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4 text-primary" /><span className="font-semibold text-sm text-foreground">{selectedWarehouse.name}</span></div>
                          <p className="text-sm text-muted-foreground">{selectedWarehouse.address}</p>
                          {selectedWarehouse.phone && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {selectedWarehouse.phone}</p>}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Weight (KG) *</Label>
                          <Input type="number" min="0.1" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g. 5" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm font-medium">Declared Value (USD)</Label>
                          <Input type="number" min="0" step="0.01" value={formData.declared_value} onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })} placeholder="e.g. 500" className={inputClass} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm font-medium">Item Description</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe contents" rows={3} className="resize-none bg-card border-border text-foreground placeholder:text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Optional Services */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-md"><Tag className="w-5 h-5 text-accent-foreground" /></div>
                        <div><h3 className="font-bold text-lg text-foreground">Optional Services</h3><p className="text-sm text-muted-foreground">Add extras and upload photos</p></div>
                      </div>

                      {extraCharges.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-muted-foreground text-sm font-medium">Extra Charges</Label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {extraCharges.map((ec: any) => (
                              <div key={ec.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => toggleExtra(ec.id)}>
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

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm font-medium">Upload Photos / Documents (Optional)</Label>
                        <p className="text-xs text-muted-foreground">Max 5 files.</p>
                        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
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

                  {/* Step 4: Price Summary & Review */}
                  {step === 4 && (
                    <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md"><DollarSign className="w-5 h-5 text-primary-foreground" /></div>
                        <div><h3 className="font-bold text-lg text-foreground">Price Summary & Review</h3><p className="text-sm text-muted-foreground">Review and confirm your shipment</p></div>
                      </div>

                      {/* Shipment Summary */}
                      <div className="p-5 rounded-xl bg-muted/80 border border-border/50 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { label: "From", value: formData.origin_country, icon: MapPin },
                            { label: "To", value: formData.destination_country, icon: MapPin },
                            { label: "Warehouse", value: selectedWarehouse?.name || "—", icon: Warehouse },
                            { label: "Weight", value: `${formData.weight} KG`, icon: Scale },
                            { label: "Sender", value: `${formData.sender_name} (${formData.sender_phone})`, icon: User },
                          ].map((item) => (
                            <div key={item.label} className="bg-card rounded-xl p-3 border border-border/50">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5"><item.icon className="w-3 h-3" /> {item.label}</p>
                              <p className="font-semibold text-foreground text-sm capitalize">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
                        {priceLoading ? (
                          <p className="text-sm text-muted-foreground text-center">Calculating price...</p>
                        ) : priceBreakdown && priceBreakdown.shippingCost > 0 ? (
                          <div className="space-y-3">
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
                            <div className="border-t border-primary/20 pt-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold text-foreground">₦{priceBreakdown.subtotal.toLocaleString()}</span>
                              </div>
                            </div>
                            {priceBreakdown.taxes.map((t) => (
                              <div key={t.name} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t.name} ({t.rate}%)</span>
                                <span className="font-semibold text-foreground">₦{Math.round(t.amount).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="border-t border-primary/20 pt-3 flex justify-between items-center">
                              <span className="font-bold text-foreground text-lg">Total</span>
                              <span className="text-3xl font-bold text-primary">₦{Math.round(priceBreakdown.total).toLocaleString()}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No pricing configured for this destination/weight. Admin will set the price after review.
                          </p>
                        )}
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-primary" /></div>
                        <p className="text-sm text-muted-foreground">By confirming, you agree to our shipping terms. Proceed to payment from your dashboard.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-6 mt-6 border-t border-border/50">
                    <Button type="button" variant="dashOutline" size="dash" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    {step < TOTAL_STEPS ? (
                      <Button type="button" variant="dashAccent" size="dash" disabled={!canProceed(step)} onClick={() => setStep(step + 1)} className="gap-2">
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button type="button" variant="dashAccent" size="dash" disabled={isSubmitting} onClick={handleSubmit} className="gap-2">
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
