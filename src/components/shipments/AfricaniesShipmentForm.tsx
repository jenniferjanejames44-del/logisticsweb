import { useState, useEffect, useMemo, useRef, memo, ReactNode, ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import {
  fetchCountryPricingRule,
  computeShipmentTotals,
  formatPriceInCurrency,
  DEFAULT_VOLUMETRIC_DIVISOR,
  type CountryPricingRule,
  type ShipmentTotals,
} from "@/lib/pricingEngine";
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
  Send, Package, Plus, Minus, Trash2, Loader2,
  ArrowRight, ArrowLeft, Plane, Ship, Check,
  PackageCheck, Box, Mail, ShoppingBag, Thermometer, Warehouse, MapPin, Phone,
} from "lucide-react";
import LocationSelector from "@/components/shipments/LocationSelector";
import LocationPicker from "@/components/shipments/LocationPicker";
import PackageSelector, { type PackageOption, iconForPackage } from "@/components/shipments/PackageSelector";

type Flow = "import" | "export";

interface Item {
  id: string;
  description: string;
  quantity: number;
  weight: string;
  value: string;
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
  { id: "air-express", label: "Express", days: "3–5 business days", icon: Plane, desc: "Fastest air delivery for urgent shipments" },
  { id: "air-standard", label: "Standard", days: "14–21 days", icon: Plane, desc: "Reliable air freight at a balanced price" },
  { id: "ocean", label: "Ocean", days: "45–60 days from vessel sails", icon: Ship, desc: "Most affordable option for heavy or bulk cargo" },
];

const IMPORT_DELIVERY_TYPES = [
  { id: "drop_off", label: "Drop-off at warehouse", desc: "Your sender drops the items off at the selected RAC warehouse", icon: Warehouse },
  { id: "pickup", label: "Pickup to warehouse", desc: "RAC picks up from the sender's address and delivers to the warehouse", icon: PackageCheck },
];

const EXPORT_DELIVERY_TYPES = [
  { id: "drop_off", label: "Drop-off at office", desc: "You bring your items to the RAC Logistics office in Nigeria", icon: Warehouse },
  { id: "pickup", label: "Pickup", desc: "We collect your items from your address in Nigeria", icon: PackageCheck },
];

// RAC Logistics overseas warehouses for IMPORT shipments. Senders abroad
// drop off / ship items to one of these addresses.
const IMPORT_WAREHOUSES = [
  {
    id: "usa_warehouse",
    name: "USA Warehouse",
    flag: "🇺🇸",
    country: "United States",
    lines: ["13107 Orchard Mill Drive", "Richmond, Texas 77407"],
    phone: "+1 281 591 9189",
  },
  {
    id: "uk_warehouse",
    name: "UK Warehouse",
    flag: "🇬🇧",
    country: "United Kingdom",
    lines: ["Unit 1, Loughborough Centre", "105 Angell Road", "Brixton, London, SW9 7PD"],
    phone: null,
  },
  {
    id: "china_warehouse",
    name: "China Warehouse",
    flag: "🇨🇳",
    country: "China",
    lines: ["Guangzhou Baiyun District", "Shijing Town Shitan West Road 12", "Jieli Logistics Park C08-B"],
    phone: null,
  },
] as const;

const IMPORT_STEPS = [
  "Method", "Warehouse", "Delivery Type", "Sender", "Receiver", "Package", "Items", "Summary",
] as const;
const EXPORT_STEPS = [
  "Method", "Delivery Type", "Sender", "Receiver", "Package", "Items", "Summary",
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
        const next = e.target.value;
        setDraft(next);
        lastPropValueRef.current = next;
        onCommitRef.current(next);
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
        const next = e.target.value;
        setDraft(next);
        lastPropValueRef.current = next;
        onCommitRef.current(next);
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

function Stepper({ step, steps }: { step: number; steps: readonly string[] }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
      <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:justify-between">
        {steps.map((label, i) => {
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
              {i < steps.length - 1 && <span className="h-px w-4 bg-border sm:w-6" />}
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
  const STEPS = isExport ? EXPORT_STEPS : IMPORT_STEPS;
  const DELIVERY_TYPES = isExport ? EXPORT_DELIVERY_TYPES : IMPORT_DELIVERY_TYPES;

  const [step, setStep] = useState(0);

  const [method, setMethod] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const selectedWarehouse = useMemo(
    () => IMPORT_WAREHOUSES.find((w) => w.id === warehouseId) || null,
    [warehouseId],
  );

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderCountry, setSenderCountry] = useState(isExport ? "Nigeria" : "");
  const [senderState, setSenderState] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderZip, setSenderZip] = useState("");
  const [saveSender, setSaveSender] = useState(false);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverCountry, setReceiverCountry] = useState(isExport ? "" : "Nigeria");
  const [receiverState, setReceiverState] = useState("");
  const [receiverCity, setReceiverCity] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverZip, setReceiverZip] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<Item>(createEmptyItem());
  const [itemFormErrors, setItemFormErrors] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  // Package selection (one package per shipment)
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [customDims, setCustomDims] = useState({ length_cm: "", width_cm: "", height_cm: "" });

  const [pricingRule, setPricingRule] = useState<CountryPricingRule | null>(null);
  const [totals, setTotals] = useState<ShipmentTotals | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateField = (field: string, setter: (value: string) => void) => (value: string) => {
    setter(value);
    if (value.trim()) clearFieldError(field);
  };

  useEffect(() => {
    supabase
      .from("packaging_materials")
      .select("id, name, price, description, icon_key, is_custom, length_cm, width_cm, height_cm")
      .eq("is_active", true)
      .order("price")
      .then(({ data }) => {
        if (data) setPackageOptions(data as unknown as PackageOption[]);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, email, phone, address, city, state, country")
      .eq("user_id", user.id).single().then(({ data }) => {
        if (!data) return;
        if (isExport) {
          if (!senderName && data.full_name) setSenderName(data.full_name);
          if (!senderEmail && data.email) setSenderEmail(data.email);
          if (!senderPhone && data.phone) setSenderPhone(data.phone);
          if (!senderAddress && data.address) setSenderAddress(data.address);
          if (!senderCity && data.city) setSenderCity(data.city);
          if (!senderState && data.state) setSenderState(data.state);
        } else {
          if (!receiverName && data.full_name) setReceiverName(data.full_name);
          if (!receiverEmail && data.email) setReceiverEmail(data.email);
          if (!receiverPhone && data.phone) setReceiverPhone(data.phone);
          if (!receiverAddress && data.address) setReceiverAddress(data.address);
          if (!receiverCity && data.city) setReceiverCity(data.city);
          if (!receiverState && data.state) setReceiverState(data.state);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectedPackage = useMemo(
    () => packageOptions.find((p) => p.id === selectedPackageId) || null,
    [packageOptions, selectedPackageId],
  );

  const effectiveDims = useMemo(() => {
    if (!selectedPackage) return { length_cm: 0, width_cm: 0, height_cm: 0 };
    if (selectedPackage.is_custom) {
      return {
        length_cm: parseFloat(customDims.length_cm) || 0,
        width_cm: parseFloat(customDims.width_cm) || 0,
        height_cm: parseFloat(customDims.height_cm) || 0,
      };
    }
    return {
      length_cm: Number(selectedPackage.length_cm) || 0,
      width_cm: Number(selectedPackage.width_cm) || 0,
      height_cm: Number(selectedPackage.height_cm) || 0,
    };
  }, [selectedPackage, customDims]);

  const totalWeight = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.weight) || 0) * (i.quantity || 1), 0),
    [items],
  );
  const totalValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.value) || 0) * (i.quantity || 1), 0),
    [items],
  );

  const destinationCountry = isExport ? receiverCountry : "Nigeria";

  // Fetch country pricing rule when destination changes
  useEffect(() => {
    if (!destinationCountry) { setPricingRule(null); return; }
    let cancelled = false;
    setCalculating(true);
    setPricingError(null);
    fetchCountryPricingRule(destinationCountry)
      .then((rule) => {
        if (cancelled) return;
        if (!rule) {
          setPricingError(`We don't ship to ${destinationCountry} yet. Please contact support.`);
          setPricingRule(null);
        } else {
          setPricingRule(rule);
        }
      })
      .catch(() => { if (!cancelled) setPricingError("Could not load pricing."); })
      .finally(() => { if (!cancelled) setCalculating(false); });
    return () => { cancelled = true; };
  }, [destinationCountry]);

  // Recompute totals whenever inputs change
  useEffect(() => {
    const t = computeShipmentTotals({
      packageDims: effectiveDims,
      divisor: DEFAULT_VOLUMETRIC_DIVISOR,
      items: items.map((i) => ({
        quantity: i.quantity || 0,
        weightKg: parseFloat(i.weight) || 0,
        declaredValue: parseFloat(i.value) || 0,
      })),
      packagePrice: Number(selectedPackage?.price || 0),
      rule: pricingRule,
      declaredValue: totalValue,
    });
    setTotals(t);
  }, [effectiveDims, items, selectedPackage, pricingRule, totalValue]);

  const openAddItemForm = () => {
    setEditingItemId(null);
    setItemDraft(createEmptyItem());
    setItemFormErrors({});
    setItemFormOpen(true);
  };

  const openEditItemForm = (item: Item) => {
    setEditingItemId(item.id);
    setItemDraft({ ...item });
    setItemFormErrors({});
    setItemFormOpen(true);
  };

  const saveItemForm = () => {
    const e: Record<string, string> = {};
    if (!itemDraft.description.trim()) e.description = "Description is required";
    if (!itemDraft.weight || parseFloat(itemDraft.weight) <= 0) e.weight = "Weight must be greater than 0";
    if (!itemDraft.value || parseFloat(itemDraft.value) <= 0) e.value = "Value must be greater than 0";
    if (Object.keys(e).length > 0) {
      setItemFormErrors(e);
      return;
    }

    setItems((arr) => {
      if (editingItemId) return arr.map((it) => (it.id === editingItemId ? itemDraft : it));
      return [...arr, itemDraft];
    });
    setItemFormOpen(false);
  };

  const removeItem = (id: string) =>
    setItems((arr) => arr.filter((i) => i.id !== id));

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const isPhone = (v: string) => v.trim().replace(/[^\d+]/g, "").length >= 7;
    const stepName = STEPS[s];
    if (stepName === "Method" && !method) e.method = "Please select a shipping method.";
    if (stepName === "Warehouse" && !warehouseId) e.warehouse = "Please select a RAC warehouse.";
    if (stepName === "Delivery Type" && !deliveryType) e.deliveryType = "Please select a delivery type.";
    if (stepName === "Sender") {
      if (!senderName.trim()) e.senderName = "Full name is required";
      if (!senderPhone.trim()) e.senderPhone = "Phone number is required";
      else if (!isPhone(senderPhone)) e.senderPhone = "Enter a valid phone number";
      if (senderEmail.trim() && !isEmail(senderEmail)) e.senderEmail = "Enter a valid email";
      if (!senderCountry) e.senderCountry = "Country is required";
      if (!senderState.trim()) e.senderState = "Please select or enter your state";
      if (!senderCity.trim()) e.senderCity = "City is required";
      if (!senderAddress.trim()) e.senderAddress = "Street address is required";
    }
    if (stepName === "Receiver") {
      if (!receiverName.trim()) e.receiverName = "Full name is required";
      if (!receiverPhone.trim()) e.receiverPhone = "Phone number is required";
      else if (!isPhone(receiverPhone)) e.receiverPhone = "Enter a valid phone number";
      if (receiverEmail.trim() && !isEmail(receiverEmail)) e.receiverEmail = "Enter a valid email";
      if (!receiverCountry) e.receiverCountry = "Country is required";
      if (!receiverState.trim()) e.receiverState = "Please select or enter your state";
      if (!receiverCity.trim()) e.receiverCity = "City is required";
      if (!receiverAddress.trim()) e.receiverAddress = "Street address is required";
    }
    if (stepName === "Items") {
      if (items.length === 0) e.items = "Add at least one item.";
      items.forEach((it, idx) => {
        if (!it.description.trim()) e[`item_${idx}_desc`] = "Description is required";
        if (!it.weight || parseFloat(it.weight) <= 0) e[`item_${idx}_weight`] = "Weight must be greater than 0";
        if (!it.value || parseFloat(it.value) <= 0) e[`item_${idx}_value`] = "Value must be greater than 0";
      });
    }
    if (stepName === "Package") {
      if (!selectedPackage) e.package = "Please select a package.";
      if (selectedPackage?.is_custom) {
        if (!(parseFloat(customDims.length_cm) > 0)) e.length = "Length must be greater than 0";
        if (!(parseFloat(customDims.width_cm) > 0)) e.width = "Width must be greater than 0";
        if (!(parseFloat(customDims.height_cm) > 0)) e.height = "Height must be greater than 0";
      }
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
      const etaDays = method === "ocean" ? 60 : method === "air-standard" ? 21 : 5;
      eta.setDate(eta.getDate() + etaDays);

      const itemLines = items.map((i) =>
        `${i.quantity}× ${i.description} (${i.weight}kg${i.value ? `, $${i.value}` : ""})`,
      );
      const packagingDesc = selectedPackage
        ? `Package: ${selectedPackage.name} (${effectiveDims.length_cm}×${effectiveDims.width_cm}×${effectiveDims.height_cm}cm, $${Number(selectedPackage.price).toFixed(2)})`
        : null;
      const desc = [
        !isExport && selectedWarehouse ? `Warehouse: ${selectedWarehouse.name}` : null,
        `Delivery: ${DELIVERY_TYPES.find((d) => d.id === deliveryType)?.label}`,
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
        weight: totals?.chargeableWeight ?? totalWeight,
        service_type: method,
        status: "shipment_created",
        estimated_delivery: eta.toISOString().split("T")[0],
        tracking_number: "",
        price: totals && pricingRule ? totals.total : null,
        warehouse_location: isExport ? null : (warehouseId || null),
        pickup_prepaid: false,
        description: desc,
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_address: [senderAddress, senderCity, senderState, senderZip, senderCountry].filter(Boolean).join(", "),
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_address: [receiverAddress, receiverCity, receiverState, receiverZip, receiverCountry].filter(Boolean).join(", "),
        length_cm: effectiveDims.length_cm || null,
        width_cm: effectiveDims.width_cm || null,
        height_cm: effectiveDims.height_cm || null,
        package_id: selectedPackage?.id ?? null,
        package_name: selectedPackage?.name ?? null,
        package_price: Number(selectedPackage?.price || 0),
        actual_weight: totals?.actualWeight ?? totalWeight,
        volumetric_weight: totals?.volumetricWeight ?? 0,
        chargeable_weight: totals?.chargeableWeight ?? totalWeight,
        volumetric_divisor: DEFAULT_VOLUMETRIC_DIVISOR,
        items_json: items as unknown as ShipmentInsert["items_json"],
      };

      const { data: shipment, error } = await supabase.from("shipments").insert(shipmentPayload).select("id").single();

      if (error) throw error;

      if (saveSender) {
        await supabase.from("profiles").update({
          full_name: senderName,
          phone: senderPhone,
          address: senderAddress,
          city: senderCity,
          state: senderState,
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
    const stepName = STEPS[step];
    switch (stepName) {
      case "Method":
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
                    className={`group rounded-xl border p-5 text-left transition-all ${
                      active ? "border-accent bg-accent/5 shadow-sm" : "border-border/60 bg-white hover:border-accent/40"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"}`}>
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

      case "Warehouse":
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Choose RAC Warehouse</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your sender abroad will drop off or ship the goods to the RAC warehouse you select below.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {IMPORT_WAREHOUSES.map((w) => {
                const active = warehouseId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { setWarehouseId(w.id); clearFieldError("warehouse"); }}
                    className={`group rounded-xl border p-4 text-left transition-all ${
                      active ? "border-accent bg-accent/5 shadow-sm" : "border-border/60 bg-white hover:border-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{w.flag}</span>
                      <span className="text-sm font-bold text-foreground">{w.name}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">{w.country}</div>
                  </button>
                );
              })}
            </div>
            {errors.warehouse && <p className="mt-2 text-xs text-destructive">{errors.warehouse}</p>}

            {selectedWarehouse && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{selectedWarehouse.name} address</h3>
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs text-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="leading-relaxed">
                    {selectedWarehouse.lines.map((l) => <div key={l}>{l}</div>)}
                  </div>
                </div>
                {selectedWarehouse.phone && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {selectedWarehouse.phone}
                  </div>
                )}
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Share this address with your sender so they can drop off or ship the items to RAC.
                </p>
              </div>
            )}
          </div>
        );

      case "Delivery Type":
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Delivery Type</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isExport
                ? "How would you like us to receive your items in Nigeria?"
                : "How would you like us to receive your items?"}
            </p>
            <div className="mt-4">
              <Field label="Delivery type" required error={errors.deliveryType}>
                <Select value={deliveryType} onValueChange={setDeliveryType}>
                  <SelectTrigger className="h-auto min-h-12 py-2 [&>span]:line-clamp-none [&>span]:whitespace-normal [&>span]:text-left">
                    <SelectValue placeholder="Select a delivery type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_TYPES.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="py-3 pr-3 [&>span:last-child]:w-full">
                        <div className="flex w-full flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground">{d.label}</span>
                          <span className="block text-xs text-muted-foreground whitespace-normal break-words leading-snug">{d.desc}</span>
                        </div>
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
                      className={`rounded-xl border p-4 text-left transition-all ${
                        active ? "border-accent bg-accent/5" : "border-border/60 bg-white hover:border-accent/40"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}><Icon className="h-4 w-4" /></span>
                      <div className="mt-2 text-sm font-bold text-foreground">{d.label}</div>
                      <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{d.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "Sender":
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Sender Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isExport ? "Who is sending from Nigeria?" : "Who is sending the shipment?"}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name" required error={errors.senderName}>
                <SmoothInput value={senderName} onCommit={updateField("senderName", setSenderName)} placeholder="John Doe" />
              </Field>
              <Field label="Phone number" required error={errors.senderPhone}>
                <SmoothInput value={senderPhone} onCommit={updateField("senderPhone", setSenderPhone)} inputMode="tel" autoComplete="tel" placeholder="+234…" />
              </Field>
              <Field label="Email" error={errors.senderEmail}>
                <SmoothInput type="email" value={senderEmail} onCommit={updateField("senderEmail", setSenderEmail)} autoComplete="email" placeholder="email@example.com" />
              </Field>
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
                <Label className="text-xs font-semibold sm:col-span-1">Country <span className="text-destructive">*</span></Label>
                <Label className="text-xs font-semibold sm:col-span-1">State / Region <span className="text-destructive">*</span></Label>
                <Label className="text-xs font-semibold sm:col-span-1">City / LGA <span className="text-destructive">*</span></Label>
                <LocationSelector
                  country={senderCountry}
                  state={senderState}
                  city={senderCity}
                  onCountryChange={(v) => { setSenderCountry(v); setSenderState(""); setSenderCity(""); clearFieldError("senderCountry"); }}
                  onStateChange={(v) => { setSenderState(v); setSenderCity(""); clearFieldError("senderState"); }}
                  onCityChange={(v) => { setSenderCity(v); clearFieldError("senderCity"); }}
                  countryDisabled={isExport}
                  errors={{ country: errors.senderCountry, state: errors.senderState, city: errors.senderCity }}
                />
              </div>
              <Field label="Zip / Postal code">
                <SmoothInput value={senderZip} onCommit={setSenderZip} inputMode="text" autoComplete="postal-code" placeholder="100001" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street address" required error={errors.senderAddress}>
                  <LocationPicker
                    value={senderAddress}
                    onChange={updateField("senderAddress", setSenderAddress)}
                    country={senderCountry}
                    state={senderState}
                    city={senderCity}
                    placeholder="Search street, building, landmark"
                  />
                </Field>
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 cursor-pointer">
              <Checkbox checked={saveSender} onCheckedChange={(v) => setSaveSender(Boolean(v))} />
              <span className="text-xs text-foreground">Save as default sender</span>
            </label>
          </div>
        );

      case "Receiver":
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Receiver Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Who will receive the shipment?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name" required error={errors.receiverName}>
                <SmoothInput value={receiverName} onCommit={updateField("receiverName", setReceiverName)} placeholder="Jane Doe" />
              </Field>
              <Field label="Phone number" required error={errors.receiverPhone}>
                <SmoothInput value={receiverPhone} onCommit={updateField("receiverPhone", setReceiverPhone)} inputMode="tel" autoComplete="tel" placeholder="+234…" />
              </Field>
              <Field label="Email" error={errors.receiverEmail}>
                <SmoothInput type="email" value={receiverEmail} onCommit={updateField("receiverEmail", setReceiverEmail)} autoComplete="email" placeholder="email@example.com" />
              </Field>
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
                <Label className="text-xs font-semibold sm:col-span-1">Country <span className="text-destructive">*</span></Label>
                <Label className="text-xs font-semibold sm:col-span-1">State / Region <span className="text-destructive">*</span></Label>
                <Label className="text-xs font-semibold sm:col-span-1">City / LGA <span className="text-destructive">*</span></Label>
                <LocationSelector
                  country={receiverCountry}
                  state={receiverState}
                  city={receiverCity}
                  onCountryChange={(v) => { setReceiverCountry(v); setReceiverState(""); setReceiverCity(""); clearFieldError("receiverCountry"); }}
                  onStateChange={(v) => { setReceiverState(v); setReceiverCity(""); clearFieldError("receiverState"); }}
                  onCityChange={(v) => { setReceiverCity(v); clearFieldError("receiverCity"); }}
                  errors={{ country: errors.receiverCountry, state: errors.receiverState, city: errors.receiverCity }}
                />
              </div>
              <Field label="Zip / Postal code">
                <SmoothInput value={receiverZip} onCommit={setReceiverZip} inputMode="text" autoComplete="postal-code" placeholder="00000" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Street address" required error={errors.receiverAddress}>
                  <LocationPicker
                    value={receiverAddress}
                    onChange={updateField("receiverAddress", setReceiverAddress)}
                    country={receiverCountry}
                    state={receiverState}
                    city={receiverCity}
                    placeholder="Search street, building, landmark"
                  />
                </Field>
              </div>
            </div>
          </div>
        );

      case "Items":
        return (
          <div>
            <h2 className="text-lg font-bold text-foreground">Item Details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add the items included in your shipment.</p>
            <div className="mt-4 space-y-3">
              {items.length === 0 && !itemFormOpen ? (
                <button
                  type="button"
                  onClick={openAddItemForm}
                  className="flex min-h-[148px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center transition-colors hover:border-accent/50 hover:bg-accent/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-sm font-bold text-foreground">Add shipment item</span>
                  <span className="mt-1 text-xs text-muted-foreground">Description, quantity, weight and value</span>
                </button>
              ) : items.length > 0 ? (
                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={item.id} className="rounded-xl border border-border bg-background p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{idx + 1}</span>
                            <h3 className="truncate text-sm font-bold text-foreground">{item.description}</h3>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <div className="rounded-lg bg-muted/40 px-3 py-2"><span className="block text-muted-foreground">Qty</span><b>{item.quantity}</b></div>
                            <div className="rounded-lg bg-muted/40 px-3 py-2"><span className="block text-muted-foreground">Weight</span><b>{item.weight}kg</b></div>
                            <div className="rounded-lg bg-muted/40 px-3 py-2"><span className="block text-muted-foreground">Value</span><b>${item.value}</b></div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button type="button" onClick={() => openEditItemForm(item)} className="rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5">Edit</button>
                          <button type="button" onClick={() => removeItem(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10" aria-label="Remove item">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {itemFormOpen && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Package className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{editingItemId ? "Edit item" : "Add item"}</h3>
                      <p className="text-[11px] text-muted-foreground">Enter the item details for this shipment</p>
                    </div>
                  </div>
                  <Field label="Description" required error={itemFormErrors.description}>
                    <SmoothInput
                      value={itemDraft.description}
                      onCommit={(value) => setItemDraft((draft) => ({ ...draft, description: value }))}
                      placeholder="e.g. Phone, Clothes, Electronics"
                      autoFocus
                    />
                  </Field>
                  <Field label="Quantity" required>
                    <div className="flex h-12 items-center rounded-[10px] border border-border bg-white">
                      <button type="button" onClick={() => setItemDraft((draft) => ({ ...draft, quantity: Math.max(1, draft.quantity - 1) }))}
                        className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
                      <QuantityInput
                        value={itemDraft.quantity}
                        onCommit={(value) => setItemDraft((draft) => ({ ...draft, quantity: value }))}
                      />
                      <button type="button" onClick={() => setItemDraft((draft) => ({ ...draft, quantity: draft.quantity + 1 }))}
                        className="flex h-12 w-12 items-center justify-center text-accent hover:text-accent/80"><Plus className="h-4 w-4" /></button>
                    </div>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Weight (kg)" required error={itemFormErrors.weight}>
                      <SmoothInput type="number" min={0} step="0.1" inputMode="decimal" value={itemDraft.weight}
                        onCommit={(value) => setItemDraft((draft) => ({ ...draft, weight: value }))} placeholder="0.0" />
                    </Field>
                    <Field label="Value (USD)" required error={itemFormErrors.value}>
                      <SmoothInput type="number" min={0} inputMode="decimal" value={itemDraft.value}
                        onCommit={(value) => setItemDraft((draft) => ({ ...draft, value }))} placeholder="0" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="L (cm)">
                      <SmoothInput type="number" inputMode="decimal" value={itemDraft.length || ""} onCommit={(value) => setItemDraft((draft) => ({ ...draft, length: value }))} placeholder="—" />
                    </Field>
                    <Field label="W (cm)">
                      <SmoothInput type="number" inputMode="decimal" value={itemDraft.width || ""} onCommit={(value) => setItemDraft((draft) => ({ ...draft, width: value }))} placeholder="—" />
                    </Field>
                    <Field label="H (cm)">
                      <SmoothInput type="number" inputMode="decimal" value={itemDraft.height || ""} onCommit={(value) => setItemDraft((draft) => ({ ...draft, height: value }))} placeholder="—" />
                    </Field>
                  </div>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setItemFormOpen(false)} className="sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="button" onClick={saveItemForm} className="sm:w-auto">
                      {editingItemId ? "Save Changes" : "Add Item"}
                    </Button>
                  </div>
                </div>
              )}

              {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
              {items.length > 0 && !itemFormOpen && (
                <Button type="button" variant="outline" onClick={openAddItemForm} className="w-full max-w-none">
                  <Plus className="h-4 w-4 mr-1" /> Add another item
                </Button>
              )}
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
                          className={`rounded-xl border p-3 transition-all ${
                            active ? "border-accent bg-accent/5" : "border-border/60 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                              active ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
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
                                className="flex h-8 w-8 items-center justify-center text-accent hover:text-accent/80"
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

      case "Summary": {
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {isExport ? "Shipping From Nigeria" : "Shipment"}
                </h3>
                <SummaryRow label="Method" value={methodLabel} />
                <SummaryRow label="Delivery type" value={deliveryLabel} />
                {!isExport && selectedWarehouse && (
                  <SummaryRow
                    label="RAC warehouse"
                    value={`${selectedWarehouse.flag} ${selectedWarehouse.name}`}
                  />
                )}
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
                <SummaryRow label="Address" value={[senderAddress, senderCity, senderState, senderZip, senderCountry].filter(Boolean).join(", ")} />
              </div>
              <div className="rounded-xl border border-border/60 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Receiver</h3>
                <SummaryRow label="Name" value={receiverName} />
                <SummaryRow label="Phone" value={receiverPhone} />
                <SummaryRow label="Address" value={[receiverAddress, receiverCity, receiverState, receiverZip, receiverCountry].filter(Boolean).join(", ")} />
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
                      breakdown ? formatPriceInCurrency(breakdown.total + packagingTotal, breakdown.currency) : "—"}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  Calculated by RAC pricing engine
                </div>
              </div>
              {pricingError && (
                <div className="mt-3 rounded-xl bg-destructive/5 border border-destructive/30 p-3 text-xs text-destructive">
                  {pricingError}
                </div>
              )}
              {breakdown && (
                <div className="mt-3 rounded-xl bg-white/80 border border-border/40 p-3 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Base price ({breakdown.country})</span><span className="font-semibold">{formatPriceInCurrency(breakdown.basePrice, breakdown.currency)}</span></div>
                  {breakdown.handlingFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Handling / Customs</span><span className="font-semibold">{formatPriceInCurrency(breakdown.handlingFee, breakdown.currency)}</span></div>}
                  {breakdown.vat > 0 && <div className="flex justify-between"><span className="text-muted-foreground">VAT ({breakdown.vatPercent}%)</span><span className="font-semibold">{formatPriceInCurrency(breakdown.vat, breakdown.currency)}</span></div>}
                  {breakdown.insurance > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Insurance ({breakdown.insurancePercent}% of declared)</span><span className="font-semibold">{formatPriceInCurrency(breakdown.insurance, breakdown.currency)}</span></div>}
                  {packagingTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Packaging ({packagingLines.map((l) => `${l.qty}× ${l.name}`).join(", ")})
                      </span>
                      <span className="font-semibold">${packagingTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/30 pt-1 mt-1"><span className="font-bold">Total</span><span className="font-bold text-primary">{formatPriceInCurrency(breakdown.total + packagingTotal, breakdown.currency)}</span></div>
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
    <>
      <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm sm:p-6 pb-[calc(env(safe-area-inset-bottom)+88px)] sm:pb-6">
        <Stepper step={step} steps={STEPS} />

        <div className="min-h-[300px]">{renderStep()}</div>

        <div
          className="mt-6 gap-3
                     fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-row items-center justify-between
                     sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pb-0 sm:pt-4 sm:border-t sm:border-border/40 sm:flex sm:flex-row sm:items-center sm:justify-between"
        >
          <Button type="button" variant="outline" onClick={back} disabled={step === 0} className="max-w-none sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {!isLast ? (
            <Button type="button" onClick={next} className="font-semibold max-w-none sm:w-auto">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={submitting} className="font-bold h-11 max-w-none sm:w-auto">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…</> :
                <>Proceed to Payment <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
