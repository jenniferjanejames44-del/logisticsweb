import { ArrowDownToLine, ArrowUpFromLine, AlertCircle, CheckCircle2 } from "lucide-react";

export type ShippingType = "import" | "export" | null;

interface ShippingTypeSelectorProps {
  value: ShippingType;
  onChange: (type: ShippingType) => void;
  showError?: boolean;
}

const options = [
  {
    type: "import" as const,
    icon: ArrowDownToLine,
    title: "Import to Nigeria",
    subtitle: "Receive goods from abroad",
    badge: "🇳🇬 Destination: Nigeria",
    gradient: "from-[#061043] to-[#0a1a6b]",
  },
  {
    type: "export" as const,
    icon: ArrowUpFromLine,
    title: "Export from Nigeria",
    subtitle: "Send goods internationally",
    badge: "🇳🇬 Origin: Nigeria",
    gradient: "from-[#DF5101] to-[#e96b2a]",
  },
];

const ShippingTypeSelector = ({ value, onChange, showError }: ShippingTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-foreground tracking-wide uppercase">
          Shipping Direction <span className="text-destructive">*</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Are you bringing goods into Nigeria or sending them out?
        </p>
      </div>

      {showError && !value && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">Please select a shipping direction to continue.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = value === opt.type;
          const Icon = opt.icon;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onChange(opt.type)}
              className={`group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                  : "border-border/60 bg-white hover:border-primary/30 hover:shadow-md"
              }`}
            >
              {/* Top row: Icon + Check */}
              <div className="flex items-start justify-between w-full">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-br ${opt.gradient} text-white shadow-lg`
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>

                {/* Selection indicator */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
                    isSelected
                      ? "bg-primary text-white scale-100"
                      : "border-2 border-border/60 scale-90 group-hover:border-primary/40"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="h-4 w-4" />}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <p className={`text-base font-bold transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {opt.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {opt.subtitle}
                </p>
              </div>

              {/* Badge */}
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {opt.badge}
              </div>

              {/* Selected bottom accent */}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-accent animate-in fade-in-0 duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Contextual info banner */}
      {value && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/[0.04] border border-primary/10 px-4 py-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {value === "import" ? (
              <ArrowDownToLine className="h-4 w-4 text-primary" />
            ) : (
              <ArrowUpFromLine className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {value === "import" ? "Import Mode Active" : "Export Mode Active"}
            </p>
            <p className="text-xs text-muted-foreground">
              {value === "import"
                ? "Ship from an international warehouse to Nigeria. Destination is locked."
                : "Ship from Nigeria to any international destination. Origin is locked."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingTypeSelector;
