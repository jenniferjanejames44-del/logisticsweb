import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AfricaniesShipmentForm from "@/components/shipments/AfricaniesShipmentForm";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plane,
  Ship,
  Truck,
  ShieldCheck,
  Clock,
  HeadphonesIcon,
  Package,
} from "lucide-react";

const directionOptions = [
  {
    flow: "import" as const,
    icon: ArrowDownToLine,
    title: "Ship To Nigeria",
    subtitle: "Receive goods from China, USA, UK or other countries into Nigeria.",
    bullets: [
      "Use a RAC warehouse abroad as drop-off",
      "We handle customs & last-mile delivery",
      "Doorstep, office pickup or walk-in",
    ],
    accent: "bg-primary text-primary-foreground",
  },
  {
    flow: "export" as const,
    icon: ArrowUpFromLine,
    title: "Ship From Nigeria",
    subtitle: "Send goods from Nigeria to international destinations worldwide.",
    bullets: [
      "Drop off at our Nigeria warehouse",
      "Air, ocean or pickup options",
      "Live tracking from pickup to delivery",
    ],
    accent: "bg-accent text-accent-foreground",
  },
];

const CreateShipment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const flow = searchParams.get("flow");
  const hasDirection = flow === "import" || flow === "export";

  // If user has chosen a direction, render the wizard
  if (hasDirection) {
    return (
      <DashboardLayout
        title="Create Shipment"
        description="Fill in your details step by step — we'll calculate the cost automatically."
        action={
          <button
            type="button"
            onClick={() => navigate("/dashboard/shipments/new")}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change direction</span>
          </button>
        }
      >
        <div className="mb-5 rounded-xl border border-border/60 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${flow === "import" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                {flow === "import" ? <ArrowDownToLine className="h-5 w-5" /> : <ArrowUpFromLine className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active flow</p>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {flow === "import" ? "Ship To Nigeria" : "Ship From Nigeria"}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible">
              <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">Carriers:</span>
              {[
                { name: "RAC", Icon: Package, color: "bg-primary text-primary-foreground" },
                { name: "DHL", Icon: Plane, color: "bg-yellow-400 text-yellow-950" },
                { name: "Aramex", Icon: Truck, color: "bg-red-500 text-white" },
                { name: "Sea Freight", Icon: Ship, color: "bg-blue-500 text-white" },
              ].map((c) => (
                <div
                  key={c.name}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-foreground"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${c.color}`}>
                    <c.Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <AfricaniesShipmentForm flow={flow as "import" | "export"} />
          </div>

          <aside className="hidden xl:block space-y-4">
            <div className="sticky top-24 space-y-4">
              {/* Tips card */}
              <div className="rounded-xl border border-border/60 bg-white p-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Shipment Tips</h4>
                </div>
                <ul className="mt-3 space-y-3">
                  {[
                    "Use full names matching ID for customs clearance.",
                    "Declared value should reflect true item cost.",
                    "Add dimensions for accurate volumetric pricing.",
                    "Insurance recommended for items over $200.",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" strokeWidth={2.5} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estimated time card */}
              <div className="rounded-xl border border-border/60 bg-white p-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Delivery Times</h4>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Plane className="h-3 w-3" /> Express Air
                    </span>
                    <span className="font-semibold text-foreground">5–7 days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Plane className="h-3 w-3" /> Standard Air
                    </span>
                    <span className="font-semibold text-foreground">10–14 days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Ship className="h-3 w-3" /> Ocean Freight
                    </span>
                    <span className="font-semibold text-foreground">25–35 days</span>
                  </div>
                </div>
              </div>

              {/* Support card */}
              <div className="rounded-xl border border-primary/15 bg-primary p-5 text-primary-foreground">
                <HeadphonesIcon className="h-6 w-6 text-accent mb-2" />
                <h4 className="text-sm font-bold">Need help?</h4>
                <p className="mt-1 text-xs text-primary-foreground/80 leading-relaxed">
                  Our team can guide you through your first shipment.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/support")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  Contact Support
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </DashboardLayout>
    );
  }

  // Direction selection screen
  return (
    <DashboardLayout
      title="Shipments"
      description="Create and manage your logistics requests."
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 sm:mb-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
            <Package className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            New shipment
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
            Where is your shipment going?
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Pick a direction to start. You can change it any time before submitting.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {directionOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.flow}
                type="button"
                onClick={() => navigate(`/dashboard/shipments/new?flow=${opt.flow}`)}
                className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-xl border border-border/60 bg-white p-5 sm:p-6 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${opt.accent} shadow-sm`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opt.subtitle}
                  </p>
                </div>

                <ul className="w-full space-y-1.5 pt-2 border-t border-border/30">
                  {opt.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" strokeWidth={2.5} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  Start this flow
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Not sure? <button type="button" onClick={() => navigate("/dashboard/support")} className="font-semibold text-primary hover:underline">Contact support</button> and we'll help you choose.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default CreateShipment;
