import { useState, useEffect, useMemo, useRef, memo, ReactNode, ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import {
  computeShipmentTotals,
  formatPriceInCurrency,
  DEFAULT_VOLUMETRIC_DIVISOR,
  type CountryPricingRule,
  type ShipmentTotals,
} from "@/lib/pricingEngine";
import { matchPricingRule, toLegacyRule, getNgnRate, type PricingRuleV2 } from "@/lib/pricingEngineV2";
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
  PackageCheck, Box, Mail, ShoppingBag, Thermometer, Warehouse, MapPin, Phone, CheckCircle2,
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

interface ShipmentBox {
  id: string;
  packageId: string;
  customDims: { length_cm: string; width_cm: string; height_cm: string };
  items: Item[];
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

// RAC Logistics overseas warehouses for IMPORT shipments are loaded from the
// database (admin-managed) so addresses stay accurate everywhere.
interface WarehouseRecord {
  id: string;
  country: string;
  country_code: string | null;
  name: string;
  company: string | null;
  care_of: string | null;
  recipient: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  shipping_method: string | null;
  is_active: boolean;
}

const warehouseAddressLines = (w: WarehouseRecord): string[] => {
  const lines: string[] = [];
  if (w.company) lines.push(w.company);
  if (w.care_of) lines.push(`C/O ${w.care_of}`);
  if (w.recipient && w.recipient !== w.company) lines.push(`Recipient: ${w.recipient}`);
  lines.push(w.address);
  const locality = [w.city, w.state, w.zip_code].filter(Boolean).join(", ");
  if (locality) lines.push(locality);
  lines.push(w.country);
  return lines;
};

// "ocean" ships to sea-freight warehouses, air methods to air-freight ones.
const methodFreightKind = (methodId: string): "sea" | "air" | null => {
  if (!methodId) return null;
  if (methodId === "ocean") return "sea";
  if (methodId.startsWith("air")) return "air";
  return null;
};


const renderWarehouseFlag = (countryCode: string, country: string) => {
  if (countryCode === "us") {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label={`${country} flag`} className="h-full w-full">
        <rect width="64" height="64" fill="hsl(0 0% 100%)" />
        {[0, 10, 20, 30, 40, 50, 60].map((y) => <rect key={y} y={y} width="64" height="5" fill="hsl(355 78% 46%)" />)}
        <rect width="30" height="28" fill="hsl(220 70% 28%)" />
        {[6, 16, 26].map((x) => [6, 14, 22].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="hsl(0 0% 100%)" />))}
      </svg>
    );
  }
  if (countryCode === "gb") {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label={`${country} flag`} className="h-full w-full">
        <rect width="64" height="64" fill="hsl(224 72% 32%)" />
        <path d="M0 0 64 64M64 0 0 64" stroke="hsl(0 0% 100%)" strokeWidth="12" />
        <path d="M0 0 64 64M64 0 0 64" stroke="hsl(355 78% 46%)" strokeWidth="6" />
        <path d="M32 0v64M0 32h64" stroke="hsl(0 0% 100%)" strokeWidth="18" />
        <path d="M32 0v64M0 32h64" stroke="hsl(355 78% 46%)" strokeWidth="10" />
      </svg>
    );
  }
  if (countryCode === "ca") {
    return (
      <svg viewBox="0 0 64 64" role="img" aria-label={`${country} flag`} className="h-full w-full">
        <rect width="64" height="64" fill="hsl(0 0% 100%)" />
        <rect width="16" height="64" fill="hsl(355 78% 46%)" />
        <rect x="48" width="16" height="64" fill="hsl(355 78% 46%)" />
        <polygon points="32,16 35,26 43,22 38,32 46,34 38,38 40,46 32,42 24,46 26,38 18,34 26,32 21,22 29,26" fill="hsl(355 78% 46%)" />
      </svg>
    );
  }
  return (

    <svg viewBox="0 0 64 64" role="img" aria-label={`${country} flag`} className="h-full w-full">
      <rect width="64" height="64" fill="hsl(0 74% 45%)" />
      <polygon points="18,10 20.5,17 28,17 22,21.5 24,29 18,24.5 12,29 14,21.5 8,17 15.5,17" fill="hsl(48 96% 55%)" />
      <circle cx="36" cy="14" r="2.5" fill="hsl(48 96% 55%)" />
      <circle cx="43" cy="22" r="2.5" fill="hsl(48 96% 55%)" />
      <circle cx="43" cy="34" r="2.5" fill="hsl(48 96% 55%)" />
      <circle cx="36" cy="42" r="2.5" fill="hsl(48 96% 55%)" />
    </svg>
  );
};

const IMPORT_STEPS = [
  "Shipping", "Sender", "Receiver", "Items", "Summary",
] as const;
const EXPORT_STEPS = [
  "Shipping", "Sender", "Receiver", "Items", "Summary",
] as const;

const createEmptyItem = (): Item => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  weight: "",
  value: "",
});

const createEmptyBox = (): ShipmentBox => ({
  id: crypto.randomUUID(),
  packageId: "",
  customDims: { length_cm: "", width_cm: "", height_cm: "" },
  items: [],
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
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("warehouses")
        .select("*")
        .eq("is_active", true)
        .order("country");
      if (!cancelled) setWarehouses((data || []) as WarehouseRecord[]);
    })();
    return () => { cancelled = true; };
  }, []);

  // Nigeria warehouses are for export drop-offs, not import destinations.
  const importWarehouses = useMemo(() => {
    const kind = methodFreightKind(method);
    return warehouses
      .filter((w) => w.country !== "Nigeria")
      .filter((w) => {
        const m = (w.shipping_method || "any").toLowerCase();
        if (m === "any" || !kind) return true;
        return m === kind;
      });
  }, [warehouses, method]);

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === warehouseId) || null,
    [warehouses, warehouseId],
  );

  // Clear a warehouse that is no longer valid for the chosen shipping method.
  useEffect(() => {
    if (warehouseId && !importWarehouses.some((w) => w.id === warehouseId)) {
      setWarehouseId("");
    }
  }, [importWarehouses, warehouseId]);


  const [senderFirstName, setSenderFirstName] = useState("");
  const [senderLastName, setSenderLastName] = useState("");
  const senderName = [senderFirstName, senderLastName].filter(Boolean).join(" ").trim();
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderCountry, setSenderCountry] = useState(isExport ? "Nigeria" : "");
  const [senderState, setSenderState] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderZip, setSenderZip] = useState("");
  const [senderHouseNumber, setSenderHouseNumber] = useState("");
  const [senderStreetName, setSenderStreetName] = useState("");
  const [senderLandmark, setSenderLandmark] = useState("");
  const [saveSender, setSaveSender] = useState(false);

  const [receiverFirstName, setReceiverFirstName] = useState("");
  const [receiverLastName, setReceiverLastName] = useState("");
  const receiverName = [receiverFirstName, receiverLastName].filter(Boolean).join(" ").trim();
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverCountry, setReceiverCountry] = useState(isExport ? "" : "Nigeria");
  const [receiverState, setReceiverState] = useState("");
  const [receiverCity, setReceiverCity] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverZip, setReceiverZip] = useState("");
  const [receiverHouseNumber, setReceiverHouseNumber] = useState("");
  const [receiverStreetName, setReceiverStreetName] = useState("");
  const [receiverLandmark, setReceiverLandmark] = useState("");

  // Boxes: one shipment can contain many boxes. Items inside a box are optional.
  const [boxes, setBoxes] = useState<ShipmentBox[]>(() => [createEmptyBox()]);
  const [expandedBoxIds, setExpandedBoxIds] = useState<string[]>(() => []);
  const [itemFormBoxId, setItemFormBoxId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<Item>(createEmptyItem());
  const [itemFormErrors, setItemFormErrors] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const [packageLoading, setPackageLoading] = useState(true);


  const [pricingRule, setPricingRule] = useState<CountryPricingRule | null>(null);
  const [matchedRule, setMatchedRule] = useState<PricingRuleV2 | null>(null);
  const [ngnRate, setNgnRate] = useState<number>(0);
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
    let cancelled = false;
    setPackageLoading(true);
    const loadPackages = async () => {
      const { data, error } = await supabase
        .from("packaging_materials")
        .select("id, name, price, description, icon_key, is_custom, length_cm, width_cm, height_cm")
        .eq("is_active", true)
        .order("price");
      if (cancelled) return;
      if (error) {
        toast({ title: "Packaging unavailable", description: "Could not load packaging options. Please try again.", variant: "destructive" });
        setPackageOptions([]);
      } else if (data) {
        setPackageOptions(data as unknown as PackageOption[]);
      }
      setPackageLoading(false);
    };
    loadPackages();
    return () => { cancelled = true; };
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, email, phone, address, city, state, country")
      .eq("user_id", user.id).single().then(({ data }) => {
        if (!data) return;
        const splitName = (full: string): [string, string] => {
          const parts = full.trim().split(/\s+/);
          return [parts[0] || "", parts.slice(1).join(" ")];
        };
        if (isExport) {
          if (!senderName && data.full_name) {
            const [fn, ln] = splitName(data.full_name);
            setSenderFirstName(fn);
            setSenderLastName(ln);
          }
          if (!senderEmail && data.email) setSenderEmail(data.email);
          if (!senderPhone && data.phone) setSenderPhone(data.phone);
          if (!senderAddress && data.address) setSenderAddress(data.address);
          if (!senderCity && data.city) setSenderCity(data.city);
          if (!senderState && data.state) setSenderState(data.state);
        } else {
          if (!receiverName && data.full_name) {
            const [fn, ln] = splitName(data.full_name);
            setReceiverFirstName(fn);
            setReceiverLastName(ln);
          }
          if (!receiverEmail && data.email) setReceiverEmail(data.email);
          if (!receiverPhone && data.phone) setReceiverPhone(data.phone);
          if (!receiverAddress && data.address) setReceiverAddress(data.address);
          if (!receiverCity && data.city) setReceiverCity(data.city);
          if (!receiverState && data.state) setReceiverState(data.state);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const dimsForBox = (box: ShipmentBox, pkg: PackageOption | null) => {
    if (!pkg) return { length_cm: 0, width_cm: 0, height_cm: 0 };
    if (pkg.is_custom) {
      return {
        length_cm: parseFloat(box.customDims.length_cm) || 0,
        width_cm: parseFloat(box.customDims.width_cm) || 0,
        height_cm: parseFloat(box.customDims.height_cm) || 0,
      };
    }
    return {
      length_cm: Number(pkg.length_cm) || 0,
      width_cm: Number(pkg.width_cm) || 0,
      height_cm: Number(pkg.height_cm) || 0,
    };
  };

  // Resolved boxes: package, dims, and per-box weights
  const resolvedBoxes = useMemo(
    () =>
      boxes.map((box, idx) => {
        const pkg = packageOptions.find((p) => p.id === box.packageId) || null;
        const dims = dimsForBox(box, pkg);
        const actualWeight = box.items.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0);
        const volumetricWeight =
          dims.length_cm > 0 && dims.width_cm > 0 && dims.height_cm > 0
            ? (dims.length_cm * dims.width_cm * dims.height_cm) / DEFAULT_VOLUMETRIC_DIVISOR
            : 0;
        return {
          box,
          index: idx,
          label: `Box ${idx + 1}`,
          pkg,
          dims,
          actualWeight,
          volumetricWeight,
          chargeableWeight: Math.max(actualWeight, volumetricWeight),
          price: Number(pkg?.price || 0),
        };
      }),
    [boxes, packageOptions],
  );

  const allItems = useMemo(() => boxes.flatMap((b) => b.items), [boxes]);

  const totalPackagePrice = useMemo(
    () => resolvedBoxes.reduce((s, b) => s + b.price, 0),
    [resolvedBoxes],
  );
  const totalChargeableWeight = useMemo(
    () => resolvedBoxes.reduce((s, b) => s + b.chargeableWeight, 0),
    [resolvedBoxes],
  );

  const totalWeight = useMemo(
    () => allItems.reduce((s, i) => s + (parseFloat(i.weight) || 0), 0),
    [allItems],
  );
  const totalValue = useMemo(
    () => allItems.reduce((s, i) => s + (parseFloat(i.value) || 0) * (i.quantity || 1), 0),
    [allItems],
  );


  const destinationCountry = isExport ? receiverCountry : "Nigeria";
  const warehouseCountryForRule = !isExport ? selectedWarehouse?.country : null;

  // Match a pricing rule whenever the shipment route or method changes
  useEffect(() => {
    if (isExport && !receiverCountry) { setPricingRule(null); setMatchedRule(null); return; }
    if (!isExport && !warehouseCountryForRule) { setPricingRule(null); setMatchedRule(null); return; }
    if (!method) { setPricingRule(null); setMatchedRule(null); return; }
    let cancelled = false;
    setCalculating(true);
    setPricingError(null);
    matchPricingRule({
      shipmentType: isExport ? "export" : "import",
      originCountry: isExport ? "Nigeria" : warehouseCountryForRule,
      destinationCountry: isExport ? receiverCountry : "Nigeria",
      warehouseCountry: isExport ? null : warehouseCountryForRule,
      shippingMethod: method,
    })
      .then(async (rule) => {
        if (cancelled) return;
        if (!rule) {
          setPricingError("No pricing rule found for this route. Please contact support.");
          setPricingRule(null);
          setMatchedRule(null);
          setNgnRate(0);
        } else {
          setMatchedRule(rule);
          setPricingRule(toLegacyRule(rule));
          if (rule.currency !== "NGN") {
            const r = await getNgnRate(rule.currency);
            if (!cancelled) setNgnRate(r);
          } else {
            setNgnRate(1);
          }
        }
      })
      .catch(() => { if (!cancelled) setPricingError("Could not load pricing."); })
      .finally(() => { if (!cancelled) setCalculating(false); });
    return () => { cancelled = true; };
  }, [isExport, receiverCountry, warehouseCountryForRule, method]);

  // Recompute totals whenever inputs change. Every box contributes its own
  // chargeable weight (max of actual vs volumetric) and its own packaging cost.
  useEffect(() => {
    const t = computeShipmentTotals({
      packageDims: { length_cm: 0, width_cm: 0, height_cm: 0 },
      divisor: DEFAULT_VOLUMETRIC_DIVISOR,
      items: [{ quantity: 1, weightKg: totalChargeableWeight, declaredValue: 0 }],
      packagePrice: totalPackagePrice,
      rule: pricingRule,
      declaredValue: totalValue,
    });
    setTotals({
      ...t,
      actualWeight: Number(totalWeight.toFixed(2)),
      volumetricWeight: Number(
        resolvedBoxes.reduce((s, b) => s + b.volumetricWeight, 0).toFixed(2),
      ),
    });
  }, [totalChargeableWeight, totalPackagePrice, pricingRule, totalValue, totalWeight, resolvedBoxes]);

  // ---------- Box helpers ----------
  const addBox = () => {
    const box = createEmptyBox();
    setBoxes((arr) => [...arr, box]);
    setExpandedBoxIds((ids) => [...ids, box.id]);
    clearFieldError("boxes");
  };

  const removeBox = (boxId: string) => {
    setBoxes((arr) => (arr.length <= 1 ? arr : arr.filter((b) => b.id !== boxId)));
    if (itemFormBoxId === boxId) setItemFormBoxId(null);
  };

  const updateBox = (boxId: string, patch: Partial<ShipmentBox>) =>
    setBoxes((arr) => arr.map((b) => (b.id === boxId ? { ...b, ...patch } : b)));

  const toggleBoxExpanded = (boxId: string) =>
    setExpandedBoxIds((ids) => (ids.includes(boxId) ? ids.filter((i) => i !== boxId) : [...ids, boxId]));

  const openAddItemForm = (boxId: string) => {
    setEditingItemId(null);
    setItemDraft(createEmptyItem());
    setItemFormErrors({});
    setItemFormBoxId(boxId);
  };

  const openEditItemForm = (boxId: string, item: Item) => {
    setEditingItemId(item.id);
    setItemDraft({ ...item });
    setItemFormErrors({});
    setItemFormBoxId(boxId);
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

    const boxId = itemFormBoxId;
    setBoxes((arr) =>
      arr.map((b) => {
        if (b.id !== boxId) return b;
        if (editingItemId) {
          return { ...b, items: b.items.map((it) => (it.id === editingItemId ? itemDraft : it)) };
        }
        return { ...b, items: [...b.items, itemDraft] };
      }),
    );
    setItemFormBoxId(null);
    setEditingItemId(null);
  };

  const removeItem = (boxId: string, itemId: string) =>
    setBoxes((arr) =>
      arr.map((b) => (b.id === boxId ? { ...b, items: b.items.filter((i) => i.id !== itemId) } : b)),
    );


  const getStepErrors = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    const isPhone = (v: string) => v.trim().replace(/[^\d+]/g, "").length >= 7;
    const stepName = STEPS[s];
    if (stepName === "Shipping") {
      if (!method) e.method = "Please select a shipping method.";
      if (!isExport && !warehouseId) e.warehouse = "Please select a RAC warehouse.";
      if (!deliveryType) e.deliveryType = "Please select a delivery type.";
    }
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
      if (boxes.length === 0) e.boxes = "Add at least one box.";
      resolvedBoxes.forEach((rb) => {
        if (!rb.pkg) {
          e[`box_${rb.box.id}_package`] = `${rb.label}: please select a box size.`;
          return;
        }
        if (rb.pkg.is_custom) {
          if (!(rb.dims.length_cm > 0) || !(rb.dims.width_cm > 0) || !(rb.dims.height_cm > 0)) {
            e[`box_${rb.box.id}_dims`] = `${rb.label}: enter length, width and height.`;
          }
        }
        rb.box.items.forEach((it, idx) => {
          if (!it.description.trim()) e[`box_${rb.box.id}_item_${idx}_desc`] = "Description is required";
          if (!it.weight || parseFloat(it.weight) <= 0) e[`box_${rb.box.id}_item_${idx}_weight`] = "Weight must be greater than 0";
        });
      });
    }

    return e;
  };

  const validateStep = (s: number): boolean => {
    const e = getStepErrors(s);
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
    let firstInvalidStep = -1;
    let firstInvalidErrors: Record<string, string> = {};

    for (let index = 0; index < STEPS.length; index += 1) {
      const stepErrors = getStepErrors(index);
      if (Object.keys(stepErrors).length > 0) {
        firstInvalidStep = index;
        firstInvalidErrors = stepErrors;
        break;
      }
    }

    if (firstInvalidStep >= 0) {
      setErrors(firstInvalidErrors);
      setStep(firstInvalidStep);
      const count = Object.keys(firstInvalidErrors).length;
      toast({
        title: `Check your ${STEPS[firstInvalidStep].toLowerCase()} details`,
        description: `${count} field${count === 1 ? "" : "s"} need${count === 1 ? "s" : ""} your attention. Your other details are still saved.`,
        variant: "destructive",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        description: allItems.map((i) => `${i.quantity}× ${i.description}`).join("; "),
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

      const boxLines = resolvedBoxes.map((rb) => {
        const dims = `${rb.dims.length_cm}×${rb.dims.width_cm}×${rb.dims.height_cm}cm`;
        const itemsTxt = rb.box.items.length
          ? rb.box.items.map((i) => `${i.quantity}× ${i.description} (${i.weight}kg${i.value ? `, $${i.value}` : ""})`).join(", ")
          : "no items declared";
        return `${rb.label}: ${rb.pkg?.name ?? "Box"} ${dims} — ${itemsTxt}`;
      });
      const desc = [
        !isExport && selectedWarehouse ? `Warehouse: ${selectedWarehouse.name}` : null,
        `Delivery: ${DELIVERY_TYPES.find((d) => d.id === deliveryType)?.label}`,
        `Boxes (${resolvedBoxes.length}): ${boxLines.join(" | ")}`,

        notes ? `Notes: ${notes}` : null,
      ].filter(Boolean).join(" | ");

      const primaryBox = resolvedBoxes[0];
      const storedItems = resolvedBoxes.flatMap((rb) =>
        rb.box.items.map((item) => ({
          ...item,
          box_id: rb.box.id,
          box_number: rb.index + 1,
          box_name: rb.pkg?.name ?? "Box",
          box_dimensions: rb.dims,
        })),
      );

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
        sender_address: [
          [senderHouseNumber, senderStreetName].filter(Boolean).join(" "),
          senderAddress,
          senderLandmark,
          senderCity,
          senderState,
          senderZip,
          senderCountry,
        ].filter(Boolean).join(", "),
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_address: [
          [receiverHouseNumber, receiverStreetName].filter(Boolean).join(" "),
          receiverAddress,
          receiverLandmark,
          receiverCity,
          receiverState,
          receiverZip,
          receiverCountry,
        ].filter(Boolean).join(", "),
        length_cm: primaryBox?.dims.length_cm || null,
        width_cm: primaryBox?.dims.width_cm || null,
        height_cm: primaryBox?.dims.height_cm || null,
        package_id: resolvedBoxes.length === 1 ? primaryBox?.pkg?.id ?? null : null,
        package_name: resolvedBoxes.length === 1 ? primaryBox?.pkg?.name ?? null : `${resolvedBoxes.length} boxes`,
        package_price: totalPackagePrice,
        actual_weight: totals?.actualWeight ?? totalWeight,
        volumetric_weight: totals?.volumetricWeight ?? 0,
        chargeable_weight: totals?.chargeableWeight ?? totalWeight,
        volumetric_divisor: DEFAULT_VOLUMETRIC_DIVISOR,
        items_json: storedItems as unknown as ShipmentInsert["items_json"],
      };

      const { data: shipment, error } = await supabase.from("shipments").insert(shipmentPayload).select("id").single();

      if (error) throw error;

      // Sync invoice currency/amount to the matched pricing rule so Paystack converts properly.
      if (shipment?.id && matchedRule && totals) {
        await (supabase as any)
          .from("invoices")
          .update({
            currency: matchedRule.currency,
            amount: totals.total,
            subtotal: totals.total,
            shipping_rate: totals.shippingCost,
          })
          .eq("shipment_id", shipment.id);
      }

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
      case "Shipping":
        return (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-bold text-foreground">Shipping Method</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose how you'd like your goods to travel.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {SHIPPING_METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setMethod(m.id); clearFieldError("method"); }}
                      className={`group rounded-xl border p-4 text-left transition-all ${
                        active ? "border-accent bg-accent/5 shadow-sm" : "border-border/60 bg-white hover:border-accent/40"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="mt-2.5 text-sm font-bold text-foreground">{m.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                      <div className="mt-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        {m.days}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.method && <p className="mt-2 text-xs text-destructive">{errors.method}</p>}
            </section>

            {!isExport && (
              <section className="border-t border-border/40 pt-6">
                <h2 className="text-lg font-bold text-foreground">RAC Warehouse</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your sender abroad will drop off or ship the goods to the RAC warehouse you select below.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {importWarehouses.map((w) => {
                const active = warehouseId === w.id;
                const freight = (w.shipping_method || "any").toLowerCase();
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { setWarehouseId(w.id); clearFieldError("warehouse"); }}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                      active ? "border-accent bg-accent/5 shadow-sm" : "border-border/60 bg-white hover:border-accent/40 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white shadow-sm">
                        {renderWarehouseFlag(w.country_code || "", w.country)}
                      </span>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? "border-accent bg-accent text-accent-foreground" : "border-border text-transparent"}`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-bold text-foreground">{w.name}</div>
                      <div className="mt-1 text-[11px] font-medium text-muted-foreground">
                        {[w.city, w.country].filter(Boolean).join(", ")}
                      </div>
                      {(freight === "sea" || freight === "air") && (
                        <span className="mt-2 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {freight === "sea" ? "Sea Freight" : "Air Freight"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
                </div>
                {importWarehouses.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">No warehouse is available for the selected shipping method yet.</p>
                )}
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
                    {warehouseAddressLines(selectedWarehouse).map((l, i) => <div key={`${l}-${i}`}>{l}</div>)}
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
              </section>
            )}

            <section className="border-t border-border/40 pt-6">
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
            </section>
          </div>
        );

      case "Sender":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Sender's Address</h2>
              <span className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm">
                {isExport ? "You are shipping from Nigeria to the World" : "You are shipping from the World to Nigeria"}
              </span>
            </div>

            {/* Address block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Address details</p>
                <button
                  type="button"
                  onClick={() => {
                    setSenderAddress(""); setSenderHouseNumber(""); setSenderStreetName("");
                    if (!isExport) { setSenderCountry(""); setSenderState(""); setSenderCity(""); }
                    setSenderZip(""); setSenderLandmark("");
                  }}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Clear Address
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                  <Field label="Add New Address" required error={errors.senderAddress}>
                    <LocationPicker
                      value={senderAddress}
                      onChange={updateField("senderAddress", setSenderAddress)}
                      onLocationSelect={(loc) => {
                        setSenderAddress(loc.address || senderAddress);
                        setSenderHouseNumber(loc.houseNumber || senderHouseNumber);
                        setSenderStreetName(loc.streetName || senderStreetName);
                        if (!isExport) setSenderCountry(loc.country || senderCountry);
                        setSenderState(loc.state || senderState);
                        setSenderCity(loc.city || senderCity);
                        setSenderZip(loc.postcode || senderZip);
                        clearFieldError("senderAddress");
                        clearFieldError("senderCountry");
                        clearFieldError("senderState");
                        clearFieldError("senderCity");
                      }}
                      country={senderCountry}
                      state={senderState}
                      city={senderCity}
                      placeholder="Enter Address"
                    />
                  </Field>
                </div>
                <Field label="House Number" required error={errors.senderHouseNumber}>
                  <SmoothInput value={senderHouseNumber} onCommit={setSenderHouseNumber} placeholder="4A/B" />
                </Field>
                <Field label="Street Name" required error={errors.senderStreetName}>
                  <SmoothInput value={senderStreetName} onCommit={setSenderStreetName} placeholder="Enter Street Name" />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                <Field label="Zip Code">
                  <SmoothInput value={senderZip} onCommit={setSenderZip} inputMode="text" autoComplete="postal-code" placeholder="Enter Postal Code" />
                </Field>
              </div>
              <Field label="Landmark (additional address info)">
                <SmoothInput value={senderLandmark} onCommit={setSenderLandmark} placeholder="Enter Address Info" />
              </Field>
            </div>

            {/* Personal info */}
            <div className="space-y-4 pt-2">
              <p className="text-sm font-semibold text-foreground">Personal Information</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="First Name" required error={errors.senderName}>
                  <SmoothInput value={senderFirstName} onCommit={(v) => { setSenderFirstName(v); clearFieldError("senderName"); }} placeholder="First name" />
                </Field>
                <Field label="Last Name" required>
                  <SmoothInput value={senderLastName} onCommit={setSenderLastName} placeholder="Last name" />
                </Field>
                <Field label="Email" error={errors.senderEmail}>
                  <SmoothInput type="email" value={senderEmail} onCommit={updateField("senderEmail", setSenderEmail)} autoComplete="email" placeholder="email@example.com" />
                </Field>
                <Field label="Phone" required error={errors.senderPhone}>
                  <SmoothInput value={senderPhone} onCommit={updateField("senderPhone", setSenderPhone)} inputMode="tel" autoComplete="tel" placeholder="+234…" />
                </Field>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={saveSender} onCheckedChange={(v) => setSaveSender(Boolean(v))} />
              <span className="text-xs text-foreground">Save as default sender</span>
            </label>
          </div>
        );

      case "Receiver":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Receiver's Address</h2>
              <span className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm">
                {isExport ? "Delivering to international destination" : "Delivering anywhere in Nigeria"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Address details</p>
                <button
                  type="button"
                  onClick={() => {
                    setReceiverAddress(""); setReceiverHouseNumber(""); setReceiverStreetName("");
                    if (isExport) { setReceiverCountry(""); setReceiverState(""); setReceiverCity(""); }
                    setReceiverZip(""); setReceiverLandmark("");
                  }}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Clear Address
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                  <Field label="Add New Address" required error={errors.receiverAddress}>
                    <LocationPicker
                      value={receiverAddress}
                      onChange={updateField("receiverAddress", setReceiverAddress)}
                      onLocationSelect={(loc) => {
                        setReceiverAddress(loc.address || receiverAddress);
                        setReceiverHouseNumber(loc.houseNumber || receiverHouseNumber);
                        setReceiverStreetName(loc.streetName || receiverStreetName);
                        if (isExport) setReceiverCountry(loc.country || receiverCountry);
                        setReceiverState(loc.state || receiverState);
                        setReceiverCity(loc.city || receiverCity);
                        setReceiverZip(loc.postcode || receiverZip);
                        clearFieldError("receiverAddress");
                        clearFieldError("receiverCountry");
                        clearFieldError("receiverState");
                        clearFieldError("receiverCity");
                      }}
                      country={receiverCountry}
                      state={receiverState}
                      city={receiverCity}
                      placeholder="Enter Address"
                    />
                  </Field>
                </div>
                <Field label="House Number" required error={errors.receiverHouseNumber}>
                  <SmoothInput value={receiverHouseNumber} onCommit={setReceiverHouseNumber} placeholder="4A/B" />
                </Field>
                <Field label="Street Name" required error={errors.receiverStreetName}>
                  <SmoothInput value={receiverStreetName} onCommit={setReceiverStreetName} placeholder="Enter Street Name" />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <LocationSelector
                  country={receiverCountry}
                  state={receiverState}
                  city={receiverCity}
                  onCountryChange={(v) => { setReceiverCountry(v); setReceiverState(""); setReceiverCity(""); clearFieldError("receiverCountry"); }}
                  onStateChange={(v) => { setReceiverState(v); setReceiverCity(""); clearFieldError("receiverState"); }}
                  onCityChange={(v) => { setReceiverCity(v); clearFieldError("receiverCity"); }}
                  countryDisabled={!isExport}
                  errors={{ country: errors.receiverCountry, state: errors.receiverState, city: errors.receiverCity }}
                />
                <Field label="Zip Code">
                  <SmoothInput value={receiverZip} onCommit={setReceiverZip} inputMode="text" autoComplete="postal-code" placeholder="Enter Postal Code" />
                </Field>
              </div>
              <Field label="Landmark (additional address info)">
                <SmoothInput value={receiverLandmark} onCommit={setReceiverLandmark} placeholder="Enter Address Info" />
              </Field>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-semibold text-foreground">Personal Information</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="First Name" required error={errors.receiverName}>
                  <SmoothInput value={receiverFirstName} onCommit={(v) => { setReceiverFirstName(v); clearFieldError("receiverName"); }} placeholder="First name" />
                </Field>
                <Field label="Last Name" required>
                  <SmoothInput value={receiverLastName} onCommit={setReceiverLastName} placeholder="Last name" />
                </Field>
                <Field label="Email" error={errors.receiverEmail}>
                  <SmoothInput type="email" value={receiverEmail} onCommit={updateField("receiverEmail", setReceiverEmail)} autoComplete="email" placeholder="email@example.com" />
                </Field>
                <Field label="Phone" required error={errors.receiverPhone}>
                  <SmoothInput value={receiverPhone} onCommit={updateField("receiverPhone", setReceiverPhone)} inputMode="tel" autoComplete="tel" placeholder="+234…" />
                </Field>
              </div>
            </div>
          </div>
        );

      case "Items":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Shipment Boxes</h2>
                <p className="mt-1 text-sm text-muted-foreground">Add every box now. Items inside each box are optional.</p>
              </div>
              <Button type="button" onClick={addBox} className="shrink-0 sm:w-auto">
                <Plus className="mr-1 h-4 w-4" /> Add Box
              </Button>
            </div>

            {packageLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/40" />)}
              </div>
            ) : packageOptions.length === 0 ? (
              <div className="rounded-xl border border-destructive/25 bg-destructive/[0.03] p-4 text-sm text-destructive">
                No active packaging materials are available. Please contact support.
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedBoxes.map((rb) => {
                  const expanded = expandedBoxIds.includes(rb.box.id) || !rb.pkg;
                  const PackageIcon = rb.pkg ? iconForPackage(rb.pkg.icon_key, rb.pkg.name) : Box;
                  return (
                    <section key={rb.box.id} className="overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
                      <div className="flex items-center gap-3 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <PackageIcon className="h-5 w-5" />
                        </span>
                        <button type="button" onClick={() => toggleBoxExpanded(rb.box.id)} className="min-w-0 flex-1 text-left">
                          <span className="block text-sm font-bold text-foreground">{rb.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {rb.pkg ? `${rb.pkg.name} · ${rb.box.items.length} item${rb.box.items.length === 1 ? "" : "s"}` : "Choose a box size"}
                          </span>
                        </button>
                        <Button type="button" variant="outline" onClick={() => openAddItemForm(rb.box.id)} className="hidden sm:inline-flex sm:w-auto">
                          <Plus className="mr-1 h-4 w-4" /> Add Item
                        </Button>
                        {boxes.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeBox(rb.box.id)} aria-label={`Remove ${rb.label}`} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {expanded && (
                        <div className="border-t border-border/40 p-4">
                          <PackageSelector
                            options={packageOptions}
                            selectedId={rb.box.packageId}
                            onSelect={(id) => {
                              updateBox(rb.box.id, { packageId: id });
                              clearFieldError(`box_${rb.box.id}_package`);
                            }}
                            customDims={rb.box.customDims}
                            onCustomDimsChange={(customDims) => updateBox(rb.box.id, { customDims })}
                            errors={{
                              package: errors[`box_${rb.box.id}_package`],
                              length: errors[`box_${rb.box.id}_dims`],
                            }}
                          />
                        </div>
                      )}

                      <div className="border-t border-border/40 p-4">
                        {rb.box.items.length === 0 ? (
                          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
                            <div>
                              <p className="text-sm font-semibold text-foreground">No items added yet</p>
                              <p className="text-xs text-muted-foreground">This box is valid and can be completed later.</p>
                            </div>
                            <Button type="button" variant="outline" onClick={() => openAddItemForm(rb.box.id)} className="w-full sm:w-auto">
                              <Plus className="mr-1 h-4 w-4" /> Add Item
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {rb.box.items.map((item, idx) => (
                              <div key={item.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{idx + 1}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-foreground">{item.description}</p>
                                  <p className="text-[11px] text-muted-foreground">Qty {item.quantity} · {item.weight} kg · ${item.value}</p>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => openEditItemForm(rb.box.id, item)}>Edit</Button>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(rb.box.id, item.id)} aria-label="Remove item" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => openAddItemForm(rb.box.id)} className="mt-2 w-full max-w-none">
                              <Plus className="mr-1 h-4 w-4" /> Add another item to {rb.label}
                            </Button>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {errors.boxes && <p className="text-xs text-destructive">{errors.boxes}</p>}

            {itemFormBoxId && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Package className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{editingItemId ? "Edit item" : "Add item"}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Add details to Box {boxes.findIndex((box) => box.id === itemFormBoxId) + 1}
                      </p>
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
                    <Field
                      label="Total Package Weight (kg)"
                      required
                      error={itemFormErrors.weight}
                    >
                      <SmoothInput type="number" min={0} step="0.1" inputMode="decimal" value={itemDraft.weight}
                        onCommit={(value) => setItemDraft((draft) => ({ ...draft, weight: value }))} placeholder="0.0" />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Enter the total weight of the full package. Quantity will not multiply this weight.
                      </p>
                    </Field>
                    <Field label="Value (USD)" required error={itemFormErrors.value}>
                      <SmoothInput type="number" min={0} inputMode="decimal" value={itemDraft.value}
                        onCommit={(value) => setItemDraft((draft) => ({ ...draft, value }))} placeholder="0" />
                    </Field>
                  </div>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => { setItemFormBoxId(null); setEditingItemId(null); }} className="sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="button" onClick={saveItemForm} className="sm:w-auto">
                      {editingItemId ? "Save Changes" : "Add Item"}
                    </Button>
                  </div>
                </div>
              )}



            <Button type="button" variant="outline" onClick={addBox} className="w-full max-w-none border-dashed">
              <Plus className="mr-1 h-4 w-4" /> Add Another Box
            </Button>
            <Field label="Additional notes (optional)">
              <SmoothTextarea rows={2} value={notes} onCommit={setNotes} placeholder="Special handling instructions, fragile items, etc." />
            </Field>
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
                    value={`${selectedWarehouse.name} — ${[selectedWarehouse.city, selectedWarehouse.country].filter(Boolean).join(", ")}`}
                  />
                )}
              </div>
              <div className="rounded-xl border border-border/60 bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Boxes &amp; Items</h3>
                <SummaryRow label="Total boxes" value={boxes.length} />
                <SummaryRow label="Total items" value={allItems.reduce((s, i) => s + (i.quantity || 0), 0)} />
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
              {resolvedBoxes.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-white p-4 lg:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Package Details</h3>
                  {resolvedBoxes.map((rb) => (
                    <SummaryRow
                      key={rb.box.id}
                      label={rb.label}
                      value={`${rb.pkg?.name ?? "Box"} · ${rb.dims.length_cm} × ${rb.dims.width_cm} × ${rb.dims.height_cm} cm · ${rb.box.items.length} item${rb.box.items.length === 1 ? "" : "s"}`}
                    />
                  ))}
                  <SummaryRow label="Packaging cost" value={`$${totalPackagePrice.toFixed(2)}`} />
                  {totals && (
                    <>
                      <SummaryRow label="Actual weight" value={`${totals.actualWeight.toFixed(2)} kg`} />
                      <SummaryRow label="Volumetric weight" value={`${totals.volumetricWeight.toFixed(2)} kg`} />
                      <SummaryRow label="Chargeable weight" value={`${totals.chargeableWeight.toFixed(2)} kg`} />
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0a1a6b] text-white shadow-lg">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
              <div className="relative p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  Order Total
                </div>
                <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                  {calculating ? (
                    <Loader2 className="h-7 w-7 animate-spin text-white/80" />
                  ) : totals && pricingRule ? (
                    <>
                      <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {formatPriceInCurrency(totals.total, totals.currency)}
                      </p>
                      <span className="text-xs font-medium text-white/70">{totals.currency}</span>
                    </>
                  ) : (
                    <p className="text-base font-medium text-white/80">
                      Calculating your shipping rate…
                    </p>
                  )}
                </div>
                {pricingError && (
                  <p className="mt-3 text-xs text-white/80">
                    Rates for this destination are being finalised. Our team will confirm
                    your final price shortly after you submit.
                  </p>
                )}

                {totals && pricingRule && (
                  <div className="mt-4 rounded-xl bg-white/10 backdrop-blur-sm p-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/90">
                      <span>Shipping · {totals.chargeableWeight.toFixed(2)} kg</span>
                      <span className="font-semibold tabular-nums">{formatPriceInCurrency(totals.shippingCost, totals.currency)}</span>
                    </div>
                    {totals.packagingCost > 0 && (
                      <div className="flex justify-between text-white/90">
                        <span>Packaging</span>
                        <span className="font-semibold tabular-nums">{formatPriceInCurrency(totals.packagingCost, totals.currency)}</span>
                      </div>
                    )}
                    {totals.handlingFee > 0 && (
                      <div className="flex justify-between text-white/90">
                        <span>Handling &amp; Customs</span>
                        <span className="font-semibold tabular-nums">{formatPriceInCurrency(totals.handlingFee, totals.currency)}</span>
                      </div>
                    )}
                    {totals.vat > 0 && (
                      <div className="flex justify-between text-white/90">
                        <span>VAT ({totals.vatPercent}%)</span>
                        <span className="font-semibold tabular-nums">{formatPriceInCurrency(totals.vat, totals.currency)}</span>
                      </div>
                    )}
                    {totals.insurance > 0 && (
                      <div className="flex justify-between text-white/90">
                        <span>Insurance</span>
                        <span className="font-semibold tabular-nums">{formatPriceInCurrency(totals.insurance, totals.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/15 pt-2 mt-2">
                      <span className="font-bold text-white">Total</span>
                      <span className="font-bold text-white tabular-nums">{formatPriceInCurrency(totals.total, totals.currency)}</span>
                    </div>
                  </div>
                )}

                <p className="mt-3 text-[11px] text-white/60">
                  Final price confirmed at checkout. Includes door-to-door tracking and standard insurance.
                </p>
              </div>
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
