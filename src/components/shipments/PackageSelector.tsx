import { Mail, Box, Package as PackageIcon, ShoppingBag, Thermometer, Settings2, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PackageOption {
  id: string;
  name: string;
  price: number;
  description: string | null;
  icon_key: string | null;
  is_custom: boolean;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
}

export interface CustomDims {
  length_cm: string;
  width_cm: string;
  height_cm: string;
}

const ICONS: Record<string, LucideIcon> = {
  envelope: Mail,
  "small-box": Box,
  "medium-box": PackageIcon,
  "large-box": PackageIcon,
  "vacuum-bag": ShoppingBag,
  "warm-bag": Thermometer,
  custom: Settings2,
};

export const iconForPackage = (key: string | null | undefined, name?: string): LucideIcon => {
  if (key && ICONS[key]) return ICONS[key];
  const n = (name || "").toLowerCase();
  if (n.includes("envelope")) return Mail;
  if (n.includes("vacuum")) return ShoppingBag;
  if (n.includes("warm") || n.includes("thermal")) return Thermometer;
  if (n.includes("custom")) return Settings2;
  if (n.includes("large") || n.includes("medium")) return PackageIcon;
  return Box;
};

interface Props {
  options: PackageOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  customDims: CustomDims;
  onCustomDimsChange: (dims: CustomDims) => void;
  errors?: { package?: string; length?: string; width?: string; height?: string };
}

export default function PackageSelector({
  options,
  selectedId,
  onSelect,
  customDims,
  onCustomDimsChange,
  errors = {},
}: Props) {
  const selected = options.find((o) => o.id === selectedId);

  return (
    <div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => {
          const Icon = iconForPackage(opt.icon_key, opt.name);
          const active = selectedId === opt.id;
          const dims =
            opt.is_custom || !(opt.length_cm && opt.width_cm && opt.height_cm)
              ? "Custom dimensions"
              : `${opt.length_cm} × ${opt.width_cm} × ${opt.height_cm} cm`;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`group relative rounded-xl border-2 p-4 text-left transition-all min-h-[148px] ${
                active
                  ? "border-accent bg-accent/5 shadow-sm"
                  : "border-border/60 bg-white hover:border-accent/40"
              }`}
            >
              {active && (
                <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  ✓
                </span>
              )}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  active ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-bold text-foreground">{opt.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{dims}</div>
              {opt.description && (
                <div className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">{opt.description}</div>
              )}
              <div className="mt-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                ${Number(opt.price).toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
      {errors.package && <p className="mt-2 text-xs text-destructive">{errors.package}</p>}

      {selected?.is_custom && (
        <div className="mt-4 rounded-xl border border-accent/30 bg-accent/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-bold text-foreground">Enter your package dimensions</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["length_cm", "width_cm", "height_cm"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {field === "length_cm" ? "Length" : field === "width_cm" ? "Width" : "Height"} (cm){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  step="0.1"
                  inputMode="decimal"
                  value={customDims[field]}
                  onChange={(e) => onCustomDimsChange({ ...customDims, [field]: e.target.value })}
                  placeholder="0"
                />
                {errors[field === "length_cm" ? "length" : field === "width_cm" ? "width" : "height"] && (
                  <p className="text-[11px] text-destructive">
                    {errors[field === "length_cm" ? "length" : field === "width_cm" ? "width" : "height"]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            All values must be greater than 0. Used to calculate volumetric weight.
          </p>
        </div>
      )}
    </div>
  );
}