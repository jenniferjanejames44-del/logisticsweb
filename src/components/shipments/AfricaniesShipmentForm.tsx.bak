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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  User, Send, Package, MapPin, Plus, Minus, Trash2, Box, Loader2,
  ArrowRight, Phone, Mail, Building2, Globe, Scale, DollarSign,
} from "lucide-react";

type Flow = "import" | "export";

interface Item {
  id: string;
  description: string;
  quantity: number;
  weight: string;
  value: string;
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

const WAREHOUSES: { country: string; flag: string; label: string }[] = [
  { country: "China", flag: "🇨🇳", label: "China" },
  { country: "United States", flag: "🇺🇸", label: "USA" },
  { country: "United Kingdom", flag: "🇬🇧", label: "UK" },
];

const BOX_SIZES = [
  { id: "small", label: "Small Box", dims: "30 × 30 × 30 cm", weight: "Up to 5 kg" },
  { id: "medium", label: "Medium Box", dims: "45 × 45 × 45 cm", weight: "Up to 15 kg" },
  { id: "large", label: "Large Box", dims: "60 × 60 × 60 cm", weight: "Up to 30 kg" },
  { id: "custom", label: "Custom Size", dims: "Enter your own", weight: "Any weight" },
];

const SHIPPING_METHODS = [
  { id: "air-express", label: "Express Air", days: "5–7 days", icon: "✈️" },
  { id: "air-standard", label: "Standard Air", days: "10–14 days", icon: "🛫" },
  { id: "ocean", label: "Ocean Freight", days: "25–35 days", icon: "🚢" },
];

export default function AfricaniesShipmentForm({ flow }: { flow: Flow }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isExport = flow === "export";
  const fixedNigeria = isExport ? "origin" : "destination";

  // Sender
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [senderCountry, setSenderCountry] = useState(isExport ? "Nigeria" : "");

  // Receiver
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverCity, setReceiverCity] = useState("");
  const [receiverCountry, setReceiverCountry] = useState(isExport ? "" : "Nigeria");

  // Warehouse (only for import flow)
  const [warehouse, setWarehouse] = useState<string>("");

  // Box & items
  const [boxSize, setBoxSize] = useState("medium");
  const [items, setItems] = useState<Item[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, weight: "", value: "" },
  ]);

  // Shipping
  const [method, setMethod] = useState("air-standard");
  const [notes, setNotes] = useState("");

  // Pricing
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const totalWeight = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.weight) || 0) * (i.quantity || 1), 0),
    [items],
  );
  const totalValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.value) || 0) * (i.quantity || 1), 0),
    [items],
  );

  const destinationCountry = isExport ? receiverCountry : "Nigeria";

  // Auto price
  useEffect(() => {
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
  }, [destinationCountry, totalWeight, totalValue]);

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () =>
    setItems((arr) => [...arr, { id: crypto.randomUUID(), description: "", quantity: 1, weight: "", value: "" }]);
  const removeItem = (id: string) =>
    setItems((arr) => (arr.length > 1 ? arr.filter((i) => i.id !== id) : arr));

  const validate = (): string | null => {
    if (!senderName || !senderPhone || !senderAddress || !senderCity || !senderCountry)
      return "Please complete sender information.";
    if (!receiverName || !receiverPhone || !receiverAddress || !receiverCity || !receiverCountry)
      return "Please complete receiver information.";
    if (!isExport && !warehouse) return "Please select a RAC warehouse abroad.";
    if (items.some((i) => !i.description || !i.weight || parseFloat(i.weight) <= 0))
      return "Each item needs a description and a positive weight.";
    if (totalWeight <= 0) return "Total weight must be greater than zero.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      toast({ title: "Missing information", description: err, variant: "destructive" });
      return;
    }
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
      eta.setDate(eta.getDate() + (method === "air-express" ? 7 : method === "ocean" ? 30 : 14));

      const itemLines = items.map((i) =>
        `${i.quantity}× ${i.description} (${i.weight}kg${i.value ? `, $${i.value}` : ""})`,
      );
      const desc = [
        `Box: ${BOX_SIZES.find((b) => b.id === boxSize)?.label}`,
        `Items: ${itemLines.join("; ")}`,
        warehouse ? `Warehouse: ${warehouse}` : null,
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
        price: breakdown?.total || null,
        warehouse_location: warehouse || null,
        pickup_prepaid: false,
        description: desc,
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_address: [senderAddress, senderCity, senderCountry].filter(Boolean).join(", "),
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_address: [receiverAddress, receiverCity, receiverCountry].filter(Boolean).join(", "),
      } as any).select("id").single();

      if (error) throw error;
      toast({ title: "Shipment created!", description: "Redirecting to payment…" });
      navigate(`/dashboard/shipments?pay=${shipment?.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not create shipment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title, subtitle }: any) => (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  const Field = ({ label, children, required }: any) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Warehouse selector for IMPORT flow */}
      {!isExport && (
        <div className="rounded-2xl border border-border/60 bg-white p-5">
          <SectionTitle
            icon={Building2}
            title="Choose a RAC warehouse abroad"
            subtitle="Send your goods to one of our verified warehouses for onward shipping to Nigeria."
          />
          <div className="grid grid-cols-3 gap-3">
            {WAREHOUSES.map((w) => (
              <button
                key={w.country}
                type="button"
                onClick={() => { setWarehouse(w.country); setSenderCountry(w.country); }}
                className={`rounded-xl border-2 p-3 text-center transition-all ${
                  warehouse === w.country
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-white hover:border-primary/40"
                }`}
              >
                <div className="text-3xl">{w.flag}</div>
                <div className="mt-1 text-xs font-semibold text-foreground">{w.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sender + Receiver side-by-side */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* SENDER */}
        <div className="rounded-2xl border border-border/60 bg-white p-5">
          <SectionTitle icon={User} title="Sender Details" subtitle="Who is sending the parcel?" />
          <div className="space-y-3">
            <Field label="Full name" required>
              <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="John Doe" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" required>
                <Input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="+234…" />
              </Field>
              <Field label="Email">
                <Input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="email@…" />
              </Field>
            </div>
            <Field label="Address" required>
              <Input value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} placeholder="Street, building" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <Input value={senderCity} onChange={(e) => setSenderCity(e.target.value)} placeholder="Lagos" />
              </Field>
              <Field label="Country" required>
                <Select value={senderCountry} onValueChange={setSenderCountry} disabled={isExport}>
                  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </div>

        {/* RECEIVER */}
        <div className="rounded-2xl border border-border/60 bg-white p-5">
          <SectionTitle icon={Send} title="Receiver Details" subtitle="Who will receive the parcel?" />
          <div className="space-y-3">
            <Field label="Full name" required>
              <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Jane Doe" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" required>
                <Input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="+1…" />
              </Field>
              <Field label="Email">
                <Input type="email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} placeholder="email@…" />
              </Field>
            </div>
            <Field label="Address" required>
              <Input value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Street, building" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <Input value={receiverCity} onChange={(e) => setReceiverCity(e.target.value)} placeholder="City" />
              </Field>
              <Field label="Country" required>
                <Select value={receiverCountry} onValueChange={setReceiverCountry} disabled={!isExport}>
                  <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Box selector */}
      <div className="rounded-2xl border border-border/60 bg-white p-5">
        <SectionTitle icon={Box} title="Choose box size" subtitle="Pick the closest size — we'll confirm at the warehouse." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {BOX_SIZES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBoxSize(b.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                boxSize === b.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/60 bg-white hover:border-primary/40"
              }`}
            >
              <Box className={`h-6 w-6 mb-2 ${boxSize === b.id ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-sm font-bold text-foreground">{b.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{b.dims}</div>
              <div className="text-[11px] text-muted-foreground">{b.weight}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border/60 bg-white p-5">
        <SectionTitle icon={Package} title="Items in your shipment" subtitle="Add each item — needed for customs and pricing." />
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Item #{idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Description (e.g. Phone, Clothes)"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center rounded-[16px] border border-border/70 bg-white h-12">
                    <button type="button" onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                      className="px-2 text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
                    <input type="number" min={1} value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full text-center bg-transparent text-sm font-semibold outline-none" />
                    <button type="button" onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                      className="px-2 text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Input type="number" min={0} step="0.1" value={item.weight}
                    onChange={(e) => updateItem(item.id, { weight: e.target.value })} placeholder="kg" />
                </div>
                <div className="sm:col-span-3">
                  <Input type="number" min={0} value={item.value}
                    onChange={(e) => updateItem(item.id, { value: e.target.value })} placeholder="Value (USD)" />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add another item
          </Button>
        </div>
      </div>

      {/* Shipping method */}
      <div className="rounded-2xl border border-border/60 bg-white p-5">
        <SectionTitle icon={Globe} title="Shipping method" />
        <div className="grid gap-3 sm:grid-cols-3">
          {SHIPPING_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                method === m.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/60 bg-white hover:border-primary/40"
              }`}
            >
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-sm font-bold text-foreground">{m.label}</div>
              <div className="text-[11px] text-muted-foreground">{m.days}</div>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Additional notes (optional)">
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Special handling instructions, fragile items, etc." />
          </Field>
        </div>
      </div>

      {/* Summary + submit */}
      <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
        <div className="grid gap-3 sm:grid-cols-3 mb-4">
          <div className="rounded-xl bg-white border border-border/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Scale className="h-3 w-3" /> Total weight</div>
            <div className="mt-1 text-lg font-bold text-foreground">{totalWeight.toFixed(2)} kg</div>
          </div>
          <div className="rounded-xl bg-white border border-border/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><DollarSign className="h-3 w-3" /> Declared value</div>
            <div className="mt-1 text-lg font-bold text-foreground">${totalValue.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-primary text-primary-foreground border border-primary/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] opacity-80"><Globe className="h-3 w-3" /> Estimated total</div>
            <div className="mt-1 text-lg font-bold">
              {calculating ? <Loader2 className="h-5 w-5 animate-spin" /> :
                breakdown ? `$${breakdown.total.toFixed(2)}` : "—"}
            </div>
          </div>
        </div>

        {breakdown && (
          <div className="rounded-xl bg-white/80 border border-border/40 p-3 mb-4 space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping ({breakdown.zone || "zone"})</span><span className="font-semibold">${breakdown.shippingCost.toFixed(2)}</span></div>
            {breakdown.processingFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Processing fee</span><span className="font-semibold">${breakdown.processingFee.toFixed(2)}</span></div>}
            {breakdown.taxes.map((t) => (
              <div key={t.name} className="flex justify-between"><span className="text-muted-foreground">{t.name} ({t.rate}%)</span><span className="font-semibold">${t.amount.toFixed(2)}</span></div>
            ))}
            <div className="flex justify-between border-t border-border/30 pt-1 mt-1"><span className="font-bold">Total</span><span className="font-bold text-primary">${breakdown.total.toFixed(2)}</span></div>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 text-sm font-bold">
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating shipment…</> :
            <>Confirm & Proceed to Payment <ArrowRight className="h-4 w-4 ml-2" /></>}
        </Button>
      </div>
    </div>
  );
}