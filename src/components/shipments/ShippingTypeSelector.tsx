import { ArrowDownToLine, ArrowUpFromLine, AlertCircle } from "lucide-react";

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
    title: "Import",
    subtitle: "Ship to Nigeria",
    description: "Shipping from international warehouse to Nigeria",
    color: "primary",
  },
  {
    type: "export" as const,
    icon: ArrowUpFromLine,
    title: "Export",
    subtitle: "Ship from Nigeria",
    description: "Shipping from Nigeria to international destination",
    color: "primary",
  },
];

const ShippingTypeSelector = ({ value, onChange, showError }: ShippingTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Select Shipping Type *</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose whether you are importing or exporting goods</p>
      </div>

      {showError && !value && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/15 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Please select a shipping type before continuing.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.type;
          const Icon = opt.icon;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onChange(opt.type)}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/[0.04] shadow-sm"
                  : "border-border/50 bg-white hover:border-border hover:shadow-sm"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {opt.title}
                </p>
                <p className={`text-xs font-medium ${isSelected ? "text-primary/70" : "text-muted-foreground"}`}>
                  {opt.subtitle}
                </p>
              </div>
              {/* Radio indicator */}
              <div
                className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                  isSelected ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            {value === "import" ? (
              <ArrowDownToLine className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpFromLine className="h-3.5 w-3.5 text-primary" />
            )}
          </div>
          <p className="text-xs font-medium text-primary/80">
            {value === "import"
              ? "You are shipping from an international warehouse to Nigeria"
              : "You are shipping from Nigeria to an international destination"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingTypeSelector;
