import { useState, useEffect, useMemo, useRef, memo, ReactNode, ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
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
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal-shell";
import { useToast } from "@/hooks/use-toast";
import {
  Send, Package, Plus, Minus, Trash2, Loader2,
  ArrowRight, ArrowLeft, Building2, Plane, Ship, Check,
  PackageCheck, Store, MapPin, Box, Mail, ShoppingBag, Thermometer,
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

type ShipmentInsert = TablesInsert<"shipments">;

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
  "Method", "Delivery Type", "Warehouse", "Sender", "Receiver", "Items", "Summary",
] as const;

const createEmptyItem = (): Item => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  weight: "",
  value: "",
});

// Pick an icon for a packaging material based on its name keywords.
const iconFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("envelope") || n.includes("mailer")) return Mail;
  if (n.includes("vacuum")) return ShoppingBag;
  if (n.includes("warm") || n.includes("thermal") || n.includes("insulated")) return Thermometer;
  if (n.includes("bag")) return ShoppingBag;
  return Box;
};

// ---------- Hoisted UI helpers (defined OUTSIDE the parent component to
//             prevent React from remounting inputs on every keystroke) ----------

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border/30 last:border-0 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground text-right break-words max-w-[60%]">{value}</span>
    </div>
  );
}

type SmoothInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "defaultValue"> & {
  value: string | number | null | undefined;
  onCommit: (value: string) => void;
};

const toDraft = (value: string | number | null | undefined) => (value == null ? "" : String(value));

const SmoothInput = memo(function SmoothInput({
  value,
  onCommit,
  onBlur,
  ...props
}: SmoothInputProps) {
  const [draft, setDraft] = useState(() => toDraft(value));
  const lastPropValueRef = useRef(toDraft(value));
  const focusedRef = useRef(false);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    const next = toDraft(value);
    // Never overwrite the user's in-progress typing.
    if (!focusedRef.current && next !== lastPropValueRef.current) {
      lastPropValueRef.current = next;
      setDraft(next);
    }
  }, [value]);

  return (
    <Input
      {...props}
      value={draft}
      onFocus={(e) => {
        focusedRef.current = true;
        props.onFocus?.(e);
      }}
      onChange={(e) => {
        // Local-only updates while typing — zero parent re-renders.
        setDraft(e.target.value);
      }}
      onBlur={(e) => {
        focusedRef.current = false;
        const next = e.target.value;
        if (next !== lastPropValueRef.current) {
          lastPropValueRef.current = next;
          onCommitRef.current(next);
        }
        onBlur?.(e);
      }}
    />
  );
});

type SmoothTextareaProps = Omit<ComponentProps<typeof Textarea>, "value" | "onChange" | "defaultValue"> & {
  value: string | null | undefined;
  onCommit: (value: string) => void;
};

const SmoothTextarea = memo(function SmoothTextarea({
  value,
  onCommit,
  onBlur,
  ...props
}: SmoothTextareaProps) {
  const [draft, setDraft] = useState(() => value || "");
  const lastPropValueRef = useRef(value || "");
  const focusedRef = useRef(false);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    const next = value || "";
    if (!focusedRef.current && next !== lastPropValueRef.current) {
      lastPropValueRef.current = next;
      setDraft(next);
    }
  }, [value]);

  return (
    <Textarea
      {...props}
      value={draft}
      onFocus={(e) => {
        focusedRef.current = true;
        props.onFocus?.(e);
      }}
      onChange={(e) => {
        setDraft(e.target.value);
      }}
      onBlur={(e) => {
        focusedRef.current = false;
        const next = e.target.value;
        if (next !== lastPropValueRef.current) {
          lastPropValueRef.current = next;
          onCommitRef.current(next);
        }
        onBlur?.(e);
      }}
    />
  );
});

function QuantityInput({ value, onCommit }: { value: number; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    const next = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    setDraft(String(next));
    onCommit(next);
  };

  return (
    <input
      type="number"
      min={1}
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      className="w-full text-center bg-transparent text-sm font-semibold outline-none"
    />
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
      <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:justify-between">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${
                  active ? "border-accent bg-accent text-accent-foreground" : done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
                }`}>
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className={`hidden text-[11px] font-semibold sm:inline ${active ? "text-accent" : done ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <span className="h-px w-4 bg-border sm:w-6" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AfricaniesShipmentForm({ flow }: { flow: Flow }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isExport = flow === "export";

  const [step, setStep] = useState(0);

  const [method, setMethod] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("");

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>("");

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderCountry, setSenderCountry] = useState(isExport ? "Nigeria" : "");
  const [senderCity, setSenderCity] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderZip, setSenderZip] = useState("");
  const [saveSender, setSaveSender] = useState(false);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverCountry, setReceiverCountry] = useState(isExport ? "" : "Nigeria");
  const [receiverCity, setReceiverCity] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverZip, setReceiverZip] = useState("");

  const [items, setItems] = useState<Item[]>([createEmptyItem()]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<Item>(createEmptyItem());
  const [itemModalErrors, setItemModalErrors] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  // Packaging: { materialId: quantity }
  const [packagingOptions, setPackagingOptions] = useState<PackagingMaterial[]>([]);
  const [packagingQty, setPackagingQty] = useState<Record<string, number>>({});

  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("warehouses")
      .select("id, name, country, address, phone")
      .eq("is_active", true)
      .order("country")
      .then(({ data }) => { if (data) setWarehouses(data as Warehouse[]); });
  }, []);

  useEffect(() => {
    supabase
      .from("packaging_materials")
      .select("id, name, price")
      .eq("is_active", true)
      .order("price")
      .then(({ data }) => { if (data) setPackagingOptions(data as PackagingMaterial[]); });
  }, []);

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

  // Selected packaging summary: list of {name, qty, unit, lineTotal}
  const packagingLines = useMemo(() => {
    return packagingOptions
      .map((p) => {
        const qty = packagingQty[p.id] || 0;
        return { id: p.id, name: p.name, qty, unit: Number(p.price || 0), lineTotal: qty * Number(p.price || 0) };
      })
      .filter((l) => l.qty > 0);
  }, [packagingOptions, packagingQty]);

  const packagingTotal = useMemo(
    () => packagingLines.reduce((s, l) => s + l.lineTotal, 0),
    [packagingLines],
  );

  const grandTotal = (breakdown?.total || 0) + packagingTotal;

  const totalWeight = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.weight) || 0) * (i.quantity || 1), 0),
    [items],
  );
  const totalValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.value) || 0) * (i.quantity || 1), 0),
    [items],
  );

  const destinationCountry = isExport ? receiverCountry : "Nigeria";

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

  const openAddItemModal = () => {
    setEditingItemId(null);
    setItemDraft(createEmptyItem());
    setItemModalErrors({});
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: Item) => {
    setEditingItemId(item.id);
    setItemDraft({ ...item });
    setItemModalErrors({});
    setItemModalOpen(true);
  };

  const saveItemModal = () => {
    const e: Record<string, string> = {};
    if (!itemDraft.description.trim()) e.description = "Description is required";
    if (!itemDraft.weight || parseFloat(itemDraft.weight) <= 0) e.weight = "Weight must be greater than 0";
    if (!itemDraft.value || parseFloat(itemDraft.value) <= 0) e.value = "Value must be greater than 0";
    if (Object.keys(e).length > 0) {
      setItemModalErrors(e);
      return;
    }

    setItems((arr) => {
      if (editingItemId) return arr.map((it) => (it.id === editingItemId ? itemDraft : it));
      return [...arr, itemDraft];
    });
    setItemModalOpen(false);
  };

  const removeItem = (id: string) =>
    setItems((arr) => (arr.length > 1 ? arr.filter((i) => i.id !== id) : arr));

  const incPackaging = (id: string) =>
    setPackagingQty((q) => ({ ...q, [id]: (q[id] || 0) + 1 }));
  const decPackaging = (id: string) =>
    setPackagingQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) - 1) }));

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
      const packagingDesc = packagingLines.length
        ? `Packaging: ${packagingLines.map((l) => `${l.qty}× ${l.name} ($${l.lineTotal.toFixed(2)})`).join(", ")}`
        : null;
      const desc = [
        `Delivery: ${DELIVERY_TYPES.find((d) => d.id === deliveryType)?.label}`,
        selectedWarehouse ? `Warehouse: ${selectedWarehouse.name} (${selectedWarehouse.country})` : null,
        packagingDesc,
        `Items: ${itemLines.join("; ")}`,
        notes ? `Notes: ${notes}` : null,
      ].filter(Boolean).join(" | ");

      const shipmentPayload: ShipmentInsert = {
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
      };

      const { data: shipment, error } = await supabase.from("shipments").insert(shipmentPayload).select("id").single();

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not create shipment";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
        const displayCountries = ["China", "United States", "United Kingdom"];
        const wItems = displayCountries.map((country) => {
          const w = warehouses.find((x) => x.country === country);
          return { country, warehouse: w };
        });
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Choose RAC Warehouse</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select where your goods will be received.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {wItems.map(({ country, warehouse: w }) => {
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
                <SmoothInput value={senderName} onCommit={setSenderName} placeholder="John Doe" />
              </Field>
              <Field label="Phone number" required error={errors.senderPhone}>
                <SmoothInput value={senderPhone} onCommit={setSenderPhone} inputMode="tel" autoComplete="tel" placeholder="+234…" />
              </Field>
              <Field label="Email" error={errors.senderEmail}>
                <SmoothInput type="email" value={senderEmail} onCommit={setSenderEmail} autoComplete="email" placeholder="email@example.com" />
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
                <SmoothInput value={senderCity} onCommit={setSenderCity} placeholder="Lagos" />
              </Field>
              <Field label="Zip / Postal code">
                <SmoothInput value={senderZip} onCommit={setSenderZip} inputMode="text" autoComplete="postal-code" placeholder="100001" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street address" required error={errors.senderAddress}>
                  <SmoothInput value={senderAddress} onCommit={setSenderAddress} autoComplete="street-address" placeholder="Street, building, apt" />
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
                <SmoothInput value={receiverName} onCommit={setReceiverName} placeholder="Jane Doe" />
              </Field>
              <Field label="Phone number" required error={errors.receiverPhone}>
                <SmoothInput value={receiverPhone} onCommit={setReceiverPhone} inputMode="tel" autoComplete="tel" placeholder="+234…" />
              </Field>
              <Field label="Email" error={errors.receiverEmail}>
                <SmoothInput type="email" value={receiverEmail} onCommit={setReceiverEmail} autoComplete="email" placeholder="email@example.com" />
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
                <SmoothInput value={receiverCity} onCommit={setReceiverCity} placeholder="City" />
              </Field>
              <Field label="Zip / Postal code">
                <SmoothInput value={receiverZip} onCommit={setReceiverZip} inputMode="text" autoComplete="postal-code" placeholder="00000" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street address" required error={errors.receiverAddress}>
                  <SmoothInput value={receiverAddress} onCommit={setReceiverAddress} autoComplete="street-address" placeholder="Street, building, apt" />
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
                        <SmoothInput value={item.description}
                          onCommit={(value) => updateItem(item.id, { description: value })}
                          placeholder="e.g. Phone, Clothes, Electronics" />
                      </Field>
                    </div>
                    <Field label="Quantity" required>
                      <div className="flex items-center rounded-[16px] border border-border/70 bg-white h-12">
                        <button type="button" onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                          className="px-3 text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
                        <QuantityInput
                          value={item.quantity}
                          onCommit={(value) => updateItem(item.id, { quantity: value })}
                        />
                        <button type="button" onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                          className="px-3 text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
                      </div>
                    </Field>
                    <Field label="Weight (kg)" required error={errors[`item_${idx}_weight`]}>
                      <SmoothInput type="number" min={0} step="0.1" inputMode="decimal" value={item.weight}
                        onCommit={(value) => updateItem(item.id, { weight: value })} placeholder="0.0" />
                    </Field>
                    <Field label="Value (USD)" required error={errors[`item_${idx}_value`]}>
                      <SmoothInput type="number" min={0} inputMode="decimal" value={item.value}
                        onCommit={(value) => updateItem(item.id, { value })} placeholder="0" />
                    </Field>
                    <div className="grid grid-cols-3 gap-2 sm:col-span-1">
                      <Field label="L (cm)">
                        <SmoothInput type="number" inputMode="decimal" value={item.length || ""} onCommit={(value) => updateItem(item.id, { length: value })} placeholder="—" />
                      </Field>
                      <Field label="W (cm)">
                        <SmoothInput type="number" inputMode="decimal" value={item.width || ""} onCommit={(value) => updateItem(item.id, { width: value })} placeholder="—" />
                      </Field>
                      <Field label="H (cm)">
                        <SmoothInput type="number" inputMode="decimal" value={item.height || ""} onCommit={(value) => updateItem(item.id, { height: value })} placeholder="—" />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add another item
              </Button>
              <Field label="Additional notes (optional)">
                <SmoothTextarea rows={2} value={notes} onCommit={setNotes}
                  placeholder="Special handling instructions, fragile items, etc." />
              </Field>

              {packagingOptions.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <Label className="text-sm font-bold text-foreground">Packaging Materials</Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Choose any packaging — quantities are added to your total.
                      </p>
                    </div>
                    {packagingTotal > 0 && (
                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Subtotal</div>
                        <div className="text-sm font-bold text-primary">${packagingTotal.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
                    {packagingOptions.map((p) => {
                      const Icon = iconFor(p.name);
                      const qty = packagingQty[p.id] || 0;
                      const active = qty > 0;
                      const lineTotal = qty * Number(p.price || 0);
                      return (
                        <div
                          key={p.id}
                          className={`rounded-xl border-2 p-3 transition-all ${
                            active ? "border-primary bg-primary/5" : "border-border/60 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-foreground truncate">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground">
                                ${Number(p.price).toFixed(2)} each
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex items-center rounded-full border border-border/70 bg-white">
                              <button
                                type="button"
                                onClick={() => decPackaging(p.id)}
                                disabled={qty === 0}
                                aria-label={`Decrease ${p.name}`}
                                className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-[28px] text-center text-sm font-bold text-foreground select-none">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => incPackaging(p.id)}
                                aria-label={`Increase ${p.name}`}
                                className="flex h-8 w-8 items-center justify-center text-primary hover:text-primary/80"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {qty > 0 ? `$${lineTotal.toFixed(2)}` : "—"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6: {
        const methodLabel = SHIPPING_METHODS.find((m) => m.id === method)?.label || "—";
        const deliveryLabel = DELIVERY_TYPES.find((d) => d.id === deliveryType)?.label || "—";
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
              {packagingLines.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-white p-4 lg:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Packaging</h3>
                  {packagingLines.map((l) => (
                    <SummaryRow
                      key={l.id}
                      label={`${l.name} × ${l.qty}`}
                      value={`$${l.unit.toFixed(2)} → $${l.lineTotal.toFixed(2)}`}
                    />
                  ))}
                  <div className="flex items-center justify-between pt-2 mt-1 text-xs">
                    <span className="font-bold text-foreground">Packaging total</span>
                    <span className="font-bold text-primary">${packagingTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
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
                  {packagingTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Packaging ({packagingLines.map((l) => `${l.qty}× ${l.name}`).join(", ")})
                      </span>
                      <span className="font-semibold">${packagingTotal.toFixed(2)}</span>
                    </div>
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
    <div className="rounded-2xl border border-border/60 bg-white p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+88px)] sm:pb-6">
      <Stepper step={step} />

      <div className="min-h-[300px]">{renderStep()}</div>

      <div
        className="mt-6 gap-3
                   fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-row items-center justify-between
                   sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pb-0 sm:pt-4 sm:border-t sm:border-border/40 sm:flex sm:flex-row sm:items-center sm:justify-between"
      >
        <Button type="button" variant="outline" onClick={back} disabled={step === 0} className="sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {!isLast ? (
          <Button type="button" onClick={next} className="font-semibold sm:w-auto">
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting} className="font-bold h-11 sm:w-auto">
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</> :
              <>Proceed to Payment <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        )}
      </div>
    </div>
  );
}
