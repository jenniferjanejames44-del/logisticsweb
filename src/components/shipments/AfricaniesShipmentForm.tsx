import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateShippingCost, PriceBreakdown } from "@/lib/pricingEngine";
import { savePendingShipment } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  User, Send, Package, Plus, Minus, Trash2, Loader2,
  ArrowRight, ArrowLeft, Building2, Plane, Ship, Check,
  PackageCheck, Store, MapPin,
} from "lucide-react";

type Flow = "import" | "export";

interface Item {
  id: string;
  description: string;
  quantity: number;
  weight: string;
  value: string;
  length?: string;
  width?: string;
  height?: string;
}

interface Warehouse {
  id: string;
  name: string;
  country: string;
  address: string;
  phone: string | null;
}

interface PackagingMaterial {
  id: string;
  name: string;
  price: number;
}

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Bangladesh","Belgium","Brazil",
  "Cameroon","Canada","China","Denmark","Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","India",
  "Indonesia","Ireland","Israel","Italy","Ivory Coast","Japan","Jordan","Kenya","Kuwait","Lebanon","Malaysia",
  "Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Philippines","Poland","Portugal",
  "Qatar","Russia","Saudi Arabia","Senegal","Singapore","South Africa","South Korea","Spain","Sweden","Switzerland",
  "Tanzania","Thailand","Togo","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Vietnam","Zambia","Zimbabwe",
];

const SHIPPING_METHODS = [
  { id: "air-express", label: "Air Delivery", days: "5–10 days", icon: Plane, desc: "Faster delivery via air freight" },
  { id: "ocean", label: "Ocean Delivery", days: "25–35 days", icon: Ship, desc: "Affordable for heavy or bulk shipments" },
];

const DELIVERY_TYPES = [
  { id: "drop_off", label: "Drop Off", desc: "I will use my courier to deliver to your warehouse", icon: PackageCheck },
  { id: "walk_in", label: "Walk-In", desc: "I will bring items to your warehouse", icon: Store },
];

const STEPS = [
  "Method",
  "Delivery Type",
  "Warehouse",
  "Sender",
  "Receiver",
  "Items",
  "Summary",
] as const;

export default function AfricaniesShipmentForm({ flow }: { flow: Flow }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isExport = flow === "export";

  const [step, setStep] = useState(0);

  // Step 1: Method
  const [method, setMethod] = useState<string>("");

  // Step 2: Delivery type
  const [deliveryType, setDeliveryType] = useState<string>("");

  // Step 3: Warehouse
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>("");

  // Step 4: Sender
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderCountry, setSenderCountry] = useState(isExport ? "Nigeria" : "");
  const [senderCity, setSenderCity] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderZip, setSenderZip] = useState("");
  const [saveSender, setSaveSender] = useState(false);

  // Step 5: Receiver
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverCountry, setReceiverCountry] = useState(isExport ? "" : "Nigeria");
  const [receiverCity, setReceiverCity] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverZip, setReceiverZip] = useState("");

  // Step 6: Items
  const [items, setItems] = useState<Item[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, weight: "", value: "" },
  ]);
  const [notes, setNotes] = useState("");

  // Packaging materials (loaded from admin settings)
  const [packagingOptions, setPackagingOptions] = useState<PackagingMaterial[]>([]);
  const [packagingId, setPackagingId] = useState<string>("");

  // Pricing
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load warehouses from DB
  useEffect(() => {
    supabase
      .from("warehouses")
      .select("id, name, country, address, phone")
      .eq("is_active", true)
      .order("country")
      .then(({ data }) => {
        if (data) setWarehouses(data as Warehouse[]);
      });
  }, []);

  // Load packaging materials configured by admin
  useEffect(() => {
    (supabase as any)
      .from("packaging_materials")
      .select("id, name, price")
      .eq("is_active", true)
      .order("price")
      .then(({ data }: any) => {
        if (data) setPackagingOptions(data as PackagingMaterial[]);
      });
  }, []);

  // Prefill from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, email, phone, address, city, country")
      .eq("user_id", user.id).single().then(({ data }) => {
        if (!data) return;
        if (isExport) {
          if (!senderName && data.full_name) setSenderName(data.full_name);
          if (!senderEmail && data.email) setSenderEmail(data.email);
          if (!senderPhone && data.phone) setSenderPhone(data.phone);
          if (!senderAddress && data.address) setSenderAddress(data.address);
          if (!senderCity && data.city) setSenderCity(data.city);
        } else {
          if (!receiverName && data.full_name) setReceiverName(data.full_name);
          if (!receiverEmail && data.email) setReceiverEmail(data.email);
          if (!receiverPhone && data.phone) setReceiverPhone(data.phone);
          if (!receiverAddress && data.address) setReceiverAddress(data.address);
          if (!receiverCity && data.city) setReceiverCity(data.city);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === warehouseId),
    [warehouses, warehouseId],
  );

  const selectedPackaging = useMemo(
    () => packagingOptions.find((p) => p.id === packagingId),
    [packagingOptions, packagingId],
  );
  const packagingPrice = Number(selectedPackaging?.price || 0);
  const grandTotal = (breakdown?.total || 0) + packagingPrice;

  const totalWeight = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.weight) || 0) * (i.quantity || 1), 0),
    [items],
  );
  const totalValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.value) || 0) * (i.quantity || 1), 0),
    [items],
  );

  const destinationCountry = isExport ? receiverCountry : "Nigeria";

  // Auto price (only on summary step)
  useEffect(() => {
    if (step !== 6) return;
    if (!destinationCountry || totalWeight <= 0) {
      setBreakdown(null);
      return;
    }
    let cancelled = false;
    setCalculating(true);
    calculateShippingCost(destinationCountry, totalWeight, [], totalValue)
      .then((b) => { if (!cancelled) setBreakdown(b); })
      .finally(() => { if (!cancelled) setCalculating(false); });
    return () => { cancelled = true; };
  }, [step, destinationCountry, totalWeight, totalValue]);

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () =>
    setItems((arr) => [...arr, { id: crypto.randomUUID(), description: "", quantity: 1, weight: "", value: "" }]);
  const removeItem = (id: string) =>
    setItems((arr) => (arr.length > 1 ? arr.filter((i) => i.id !== id) : arr));

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const isPhone = (v: string) => v.trim().replace(/[^\d+]/g, "").length >= 7;
    if (s === 0 && !method) e.method = "Please select a shipping method.";
    if (s === 1 && !deliveryType) e.deliveryType = "Please select a delivery type.";
    if (s === 2 && !warehouseId) e.warehouse = "Please select a warehouse.";
    if (s === 3) {
      if (!senderName.trim()) e.senderName = "Full name is required";
      if (!senderPhone.trim()) e.senderPhone = "Phone number is required";
      else if (!isPhone(senderPhone)) e.senderPhone = "Enter a valid phone number";
      if (senderEmail.trim() && !isEmail(senderEmail)) e.senderEmail = "Enter a valid email";
      if (!senderCountry) e.senderCountry = "Country is required";
      if (!senderCity.trim()) e.senderCity = "City is required";
      if (!senderAddress.trim()) e.senderAddress = "Street address is required";
    }
    if (s === 4) {
      if (!receiverName.trim()) e.receiverName = "Full name is required";
      if (!receiverPhone.trim()) e.receiverPhone = "Phone number is required";
      else if (!isPhone(receiverPhone)) e.receiverPhone = "Enter a valid phone number";
      if (receiverEmail.trim() && !isEmail(receiverEmail)) e.receiverEmail = "Enter a valid email";
      if (!receiverCountry) e.receiverCountry = "Country is required";
      if (!receiverCity.trim()) e.receiverCity = "City is required";
      if (!receiverAddress.trim()) e.receiverAddress = "Street address is required";
    }
    if (s === 5) {
      items.forEach((it, idx) => {
        if (!it.description.trim()) e[`item_${idx}_desc`] = "Description is required";
        if (!it.weight || parseFloat(it.weight) <= 0) e[`item_${idx}_weight`] = "Weight must be greater than 0";
        if (!it.value || parseFloat(it.value) <= 0) e[`item_${idx}_value`] = "Value must be greater than 0";
      });
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const count = Object.keys(e).length;
      toast({
        title: "Please complete required fields",
        description: `${count} field${count > 1 ? "s" : ""} need${count > 1 ? "" : "s"} your attention.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!user) {
      savePendingShipment({
        origin_country: senderCountry,
        origin_city: senderCity,
        destination_country: receiverCountry,
        destination_city: receiverCity,
        weight: String(totalWeight),
        service_type: method,
        description: items.map((i) => `${i.quantity}× ${i.description}`).join("; "),
      });
      toast({ title: "Login required", description: "Please log in to complete your shipment." });
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      const eta = new Date();
      eta.setDate(eta.getDate() + (method === "ocean" ? 30 : 7));

      const itemLines = items.map((i) =>
        `${i.quantity}× ${i.description} (${i.weight}kg${i.value ? `, $${i.value}` : ""})`,
      );
      const desc = [
        `Delivery: ${DELIVERY_TYPES.find((d) => d.id === deliveryType)?.label}`,
        selectedWarehouse ? `Warehouse: ${selectedWarehouse.name} (${selectedWarehouse.country})` : null,
        selectedPackaging ? `Packaging: ${selectedPackaging.name} ($${packagingPrice.toFixed(2)})` : null,
        `Items: ${itemLines.join("; ")}`,
        notes ? `Notes: ${notes}` : null,
      ].filter(Boolean).join(" | ");

      const { data: shipment, error } = await supabase.from("shipments").insert({
        user_id: user.id,
        origin_country: senderCountry,
        origin_city: senderCity,
        destination_country: receiverCountry,
        destination_city: receiverCity,
        weight: totalWeight,
        service_type: method,
        status: "shipment_created",
        estimated_delivery: eta.toISOString().split("T")[0],
        tracking_number: "",
          price: breakdown ? grandTotal : null,
        warehouse_location: selectedWarehouse?.country || null,
          pickup_prepaid: false,
        description: desc,
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_address: [senderAddress, senderCity, senderZip, senderCountry].filter(Boolean).join(", "),
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_address: [receiverAddress, receiverCity, receiverZip, receiverCountry].filter(Boolean).join(", "),
      } as any).select("id").single();

      if (error) throw error;

      if (saveSender) {
        await supabase.from("profiles").update({
          full_name: senderName,
          phone: senderPhone,
          address: senderAddress,
          city: senderCity,
          country: senderCountry,
        }).eq("user_id", user.id);
      }

      toast({ title: "Shipment created!", description: "Redirecting to payment…" });
      navigate(`/dashboard/shipments?pay=${shipment?.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not create shipment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI helpers ----------
  const Field = ({ label, required, error, children }: any) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );

  // ---------- Stepper ----------
  const Stepper = () => (
    <div className="mb-5 overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-max sm:min-w-0 sm:justify-between">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  active ? "bg-white/25" : done ? "bg-primary text-primary-foreground" : "bg-background"
                }`}>
                  {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && <span className="text-muted-foreground/40 text-xs">›</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---------- Step bodies ----------
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Select Your Preferred Shipment Method</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose how you'd like your goods to travel.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SHIPPING_METHODS.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`group rounded-2xl border-2 p-5 text-left transition-all ${
                      active ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 bg-white hover:border-primary/40"
                    }`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3 text-sm font-bold text-foreground">{m.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      {m.days}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.method && <p className="mt-2 text-xs text-destructive">{errors.method}</p>}
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Delivery Type</h2>
            <p className="mt-1 text-sm text-muted-foreground">How will your goods reach the warehouse?</p>
            <div className="mt-4">
              <Field label="Delivery type" required error={errors.deliveryType}>
                <Select value={deliveryType} onValueChange={setDeliveryType}>
                  <SelectTrigger><SelectValue placeholder="Select a delivery type" /></SelectTrigger>
                  <SelectContent>
                    {DELIVERY_TYPES.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label} — {d.desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {DELIVERY_TYPES.map((d) => {
                  const Icon = d.icon;
                  const active = deliveryType === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDeliveryType(d.id)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        active ? "border-primary bg-primary/5" : "border-border/60 bg-white hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="mt-2 text-sm font-bold text-foreground">{d.label}</div>
                      <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{d.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2: {
        // Build display list: ensure China, USA, UK appear (USA shows "coming soon" if not in DB)
        const displayCountries = ["China", "United States", "United Kingdom"];
        const items = displayCountries.map((country) => {
          const w = warehouses.find((x) => x.country === country);
          return { country, warehouse: w };
        });
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Choose RAC Warehouse</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select where your goods will be received.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {items.map(({ country, warehouse: w }) => {
                const flag = country === "China" ? "🇨🇳" : country === "United States" ? "🇺🇸" : "🇬🇧";
                const label = country === "United States" ? "USA" : country === "United Kingdom" ? "UK" : "China";
                const active = w && warehouseId === w.id;
                const disabled = !w;
                return (
                  <button
                    key={country}
                    type="button"
                    disabled={disabled}
                    onClick={() => w && setWarehouseId(w.id)}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      active ? "border-primary bg-primary/5 shadow-sm" :
                      disabled ? "border-border/40 bg-muted/30 opacity-60 cursor-not-allowed" :
                      "border-border/60 bg-white hover:border-primary/40"
                    }`}
                  >
                    <div className="text-3xl">{flag}</div>
                    <div className="mt-1 text-sm font-bold text-foreground">{label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {w ? "Available" : "Coming soon"}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.warehouse && <p className="mt-2 text-xs text-destructive">{errors.warehouse}</p>}

            {selectedWarehouse && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground">{selectedWarehouse.name}</div>
                    <div className="mt-1 grid gap-1 text-xs text-muted-foreground">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        <span className="break-words">{selectedWarehouse.address}</span>
                      </div>
                      <div><span className="font-semibold text-foreground">Country:</span> {selectedWarehouse.country}</div>
                      {selectedWarehouse.phone && (
                        <div><span className="font-semibold text-foreground">Phone:</span> {selectedWarehouse.phone}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 3:
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Sender Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Who is sending the shipment?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name" required error={errors.senderName}>
                <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="John Doe" />
              </Field>
              <Field label="Phone number" required error={errors.senderPhone}>
                <Input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="+234…" />
              </Field>
              <Field label="Email" error={errors.senderEmail}>
                <Input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="email@example.com" />
              </Field>
              <Field label="Country" required error={errors.senderCountry}>
                <Select value={senderCountry} onValueChange={setSenderCountry} disabled={isExport}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="City" required error={errors.senderCity}>
                <Input value={senderCity} onChange={(e) => setSenderCity(e.target.value)} placeholder="Lagos" />
              </Field>
              <Field label="Zip / Postal code">
                <Input value={senderZip} onChange={(e) => setSenderZip(e.target.value)} placeholder="100001" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street address" required error={errors.senderAddress}>
                  <Input value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} placeholder="Street, building, apt" />
                </Field>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 cursor-pointer">
              <Checkbox checked={saveSender} onCheckedChange={(v) => setSaveSender(Boolean(v))} />
              <span className="text-xs text-foreground">Save as default sender</span>
            </label>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Receiver Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Who will receive the shipment?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name" required error={errors.receiverName}>
                <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Jane Doe" />
              </Field>
              <Field label="Phone number" required error={errors.receiverPhone}>
                <Input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="+234…" />
              </Field>
              <Field label="Email" error={errors.receiverEmail}>
                <Input type="email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} placeholder="email@example.com" />
              </Field>
              <Field label="Country" required error={errors.receiverCountry}>
                <Select value={receiverCountry} onValueChange={setReceiverCountry} disabled={!isExport}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="City" required error={errors.receiverCity}>
                <Input value={receiverCity} onChange={(e) => setReceiverCity(e.target.value)} placeholder="City" />
              </Field>
              <Field label="Zip / Postal code">
                <Input value={receiverZip} onChange={(e) => setReceiverZip(e.target.value)} placeholder="00000" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street address" required error={errors.receiverAddress}>
                  <Input value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Street, building, apt" />
                </Field>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Item Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">List the items inside your shipment.</p>
            <div className="mt-4 space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Description" required error={errors[`item_${idx}_desc`]}>
                        <Input value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="e.g. Phone, Clothes, Electronics" />
                      </Field>
                    </div>
                    <Field label="Quantity" required>
                      <div className="flex items-center rounded-[16px] border border-border/70 bg-white h-12">
                        <button type="button" onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                          className="px-3 text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
                        <input type="number" min={1} value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-full text-center bg-transparent text-sm font-semibold outline-none" />
                        <button type="button" onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                          className="px-3 text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
                      </div>
                    </Field>
                    <Field label="Weight (kg)" required error={errors[`item_${idx}_weight`]}>
                      <Input type="number" min={0} step="0.1" value={item.weight}
                        onChange={(e) => updateItem(item.id, { weight: e.target.value })} placeholder="0.0" />
                    </Field>
                    <Field label="Value (USD)" required error={errors[`item_${idx}_value`]}>
                      <Input type="number" min={0} value={item.value}
                        onChange={(e) => updateItem(item.id, { value: e.target.value })} placeholder="0" />
                    </Field>
                    <div className="grid grid-cols-3 gap-2 sm:col-span-1">
                      <Field label="L (cm)">
                        <Input type="number" value={item.length || ""} onChange={(e) => updateItem(item.id, { length: e.target.value })} placeholder="—" />
                      </Field>
                      <Field label="W (cm)">
                        <Input type="number" value={item.width || ""} onChange={(e) => updateItem(item.id, { width: e.target.value })} placeholder="—" />
                      </Field>
                      <Field label="H (cm)">
                        <Input type="number" value={item.height || ""} onChange={(e) => updateItem(item.id, { height: e.target.value })} placeholder="—" />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add another item
              </Button>
              <Field label="Additional notes (optional)">
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special handling instructions, fragile items, etc." />
              </Field>

              {packagingOptions.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <Label className="text-xs font-semibold text-foreground">
                    Packaging Material <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                    Choose a box or bag — the price is added to your total.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPackagingId("")}
                      className={`text-left rounded-lg border-2 px-3 py-2 transition-all ${
                        packagingId === ""
                          ? "border-primary bg-primary/5"
                          : "border-border/60 bg-white hover:border-primary/40"
                      }`}
                    >
                      <div className="text-xs font-semibold text-foreground">No packaging</div>
                      <div className="text-[11px] text-muted-foreground">I'll package it myself</div>
                    </button>
                    {packagingOptions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPackagingId(p.id)}
                        className={`text-left rounded-lg border-2 px-3 py-2 transition-all ${
                          packagingId === p.id
                            ? "border-primary bg-primary/5"
                            : "border-border/60 bg-white hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">{p.name}</span>
                          <span className="text-xs font-bold text-primary">${Number(p.price).toFixed(2)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6: {
        const methodLabel = SHIPPING_METHODS.find((m) => m.id === method)?.label || "—";
        const deliveryLabel = DELIVERY_TYPES.find((d) => d.id === deliveryType)?.label || "—";
        const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
          <div className="flex items-start justify-between gap-3 py-2 border-b border-border/30 last:border-0 text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground text-right break-words max-w-[60%]">{value}</span>
          </div>
        );
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Review Your Shipment</h2>
              <p className="mt-1 text-sm text-muted-foreground">Confirm details before payment.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Shipment</h3>
                <SummaryRow label="Method" value={methodLabel} />
                <SummaryRow label="Delivery type" value={deliveryLabel} />
                <SummaryRow label="Warehouse" value={selectedWarehouse ? `${selectedWarehouse.name} (${selectedWarehouse.country})` : "—"} />
              </div>
              <div className="rounded-xl border border-border/60 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items</h3>
                <SummaryRow label="Total items" value={items.reduce((s, i) => s + (i.quantity || 0), 0)} />
                <SummaryRow label="Total weight" value={`${totalWeight.toFixed(2)} kg`} />
                <SummaryRow label="Declared value" value={`$${totalValue.toFixed(2)}`} />
              </div>
              <div className="rounded-xl border border-border/60 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sender</h3>
                <SummaryRow label="Name" value={senderName} />
                <SummaryRow label="Phone" value={senderPhone} />
                <SummaryRow label="Address" value={[senderAddress, senderCity, senderZip, senderCountry].filter(Boolean).join(", ")} />
              </div>
              <div className="rounded-xl border border-border/60 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Receiver</h3>
                <SummaryRow label="Name" value={receiverName} />
                <SummaryRow label="Phone" value={receiverPhone} />
                <SummaryRow label="Address" value={[receiverAddress, receiverCity, receiverZip, receiverCountry].filter(Boolean).join(", ")} />
              </div>
            </div>

            <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated total</div>
                  <div className="mt-1 text-2xl font-bold text-foreground">
                    {calculating ? <Loader2 className="h-6 w-6 animate-spin" /> :
                      breakdown ? `$${grandTotal.toFixed(2)}` : "—"}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  Calculated by RAC pricing engine
                </div>
              </div>
              {breakdown && (
                <div className="mt-3 rounded-xl bg-white/80 border border-border/40 p-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping ({breakdown.zone || "zone"})</span><span className="font-semibold">${breakdown.shippingCost.toFixed(2)}</span></div>
                  {breakdown.processingFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Processing fee</span><span className="font-semibold">${breakdown.processingFee.toFixed(2)}</span></div>}
                  {breakdown.taxes.map((t) => (
                    <div key={t.name} className="flex justify-between"><span className="text-muted-foreground">{t.name} ({t.rate}%)</span><span className="font-semibold">${t.amount.toFixed(2)}</span></div>
                  ))}
                  {selectedPackaging && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Packaging ({selectedPackaging.name})</span><span className="font-semibold">${packagingPrice.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between border-t border-border/30 pt-1 mt-1"><span className="font-bold">Total</span><span className="font-bold text-primary">${grandTotal.toFixed(2)}</span></div>
                </div>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-4 sm:p-6">
      <Stepper />

      <div className="min-h-[300px]">{renderStep()}</div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t border-border/40">
        <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {!isLast ? (
          <Button type="button" onClick={next} className="font-semibold">
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting} className="font-bold h-11">
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</> :
              <>Proceed to Payment <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        )}
      </div>
    </div>
  );
}