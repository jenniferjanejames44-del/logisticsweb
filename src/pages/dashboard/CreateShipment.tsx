import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Shipping from "@/pages/Shipping";
import { ArrowDownToLine, ArrowUpFromLine, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

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
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-5 sm:-mt-6">
          <Shipping embedded />
        </div>
      </DashboardLayout>
    );
  }

  // Direction selection screen
  return (
    <DashboardLayout
      title="Create Shipment"
      description="Choose a direction to begin — we'll guide you step by step."
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            Step 1 of 2
          </p>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold text-foreground">
            Where is your shipment going?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a direction to start. You can change it any time before submitting.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
