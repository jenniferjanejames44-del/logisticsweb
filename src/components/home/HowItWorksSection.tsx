import { ClipboardCheck, LocateFixed, Route, PackageCheck, ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Book Shipment",
    description: "Create your shipment order online or contact our team for personalized assistance.",
    step: "01",
  },
  {
    icon: LocateFixed,
    title: "Package Pickup",
    description: "We collect your package from your location at your preferred time.",
    step: "02",
  },
  {
    icon: Route,
    title: "In Transit",
    description: "Track your shipment in real-time as it moves securely to its destination.",
    step: "03",
  },
  {
    icon: PackageCheck,
    title: "Delivered",
    description: "Safe and timely delivery with proof of delivery notification sent to you.",
    step: "04",
  },
];

const HowItWorksSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding relative overflow-hidden bg-section-light">
      <div className="section-container relative">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-16">
          <span
            className={`mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-accent-foreground shadow-md transition-all duration-600 ${
              isInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Simple Process
          </span>
          <h2
            className={`mb-6 text-foreground transition-all duration-600 delay-100 ${
              isInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            How It Works
          </h2>
          <p
            className={`text-lg font-medium leading-relaxed text-muted-foreground transition-all duration-600 delay-200 md:text-xl ${
              isInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Getting your shipment delivered is simple. Our streamlined process ensures a hassle-free experience.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative transition-all duration-400 ${
                isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Card */}
              <Card className="group relative h-full overflow-hidden rounded-2xl border-border/60 transition-all duration-400 ease-out hover:-translate-y-2 hover:border-primary/20">
                {/* Top accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                <CardContent className="relative p-7 lg:p-8">
                  {/* Step Number */}
                  <div className="absolute right-7 top-7 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground shadow-md">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 shadow-sm transition-all duration-400 group-hover:scale-110 group-hover:bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" strokeWidth={2.5} />
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 pr-12 text-lg font-semibold text-foreground transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Connector - Large Desktop only */}
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 z-10 hidden -right-3 -translate-y-1/2 transform lg:flex xl:-right-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/10 bg-background shadow-sm">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
