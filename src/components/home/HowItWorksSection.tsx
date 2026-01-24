import { Package, MapPin, Truck, CheckCircle } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    icon: Package,
    title: "Book Shipment",
    description: "Create your shipment order online or contact our team for personalized assistance.",
    step: "01",
  },
  {
    icon: MapPin,
    title: "Package Pickup",
    description: "We collect your package from your location at your preferred time.",
    step: "02",
  },
  {
    icon: Truck,
    title: "In Transit",
    description: "Track your shipment in real-time as it moves securely to its destination.",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "Delivered",
    description: "Safe and timely delivery with proof of delivery notification sent to you.",
    step: "04",
  },
];

const HowItWorksSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-muted relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block text-secondary font-semibold text-sm tracking-widest uppercase mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Simple Process
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-5 transition-all duration-700 delay-100 leading-tight ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            How It <span className="text-secondary">Works</span>
          </h2>
          <p
            className={`text-muted-foreground text-base md:text-lg leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Getting your shipment delivered is simple. Our streamlined process ensures a hassle-free experience from start to finish.
          </p>
        </div>

        {/* Steps - Mobile: Stack, Tablet: 2x2, Desktop: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative transition-all duration-700 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100 + 300}ms` }}
            >
              {/* Card */}
              <div className="group h-full bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-secondary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-10 h-10 lg:w-12 lg:h-12 bg-secondary text-secondary-foreground rounded-xl flex items-center justify-center font-heading font-bold text-sm lg:text-base shadow-md">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-primary rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <step.icon className="w-7 h-7 lg:w-8 lg:h-8 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-lg lg:text-xl font-heading font-bold text-foreground mb-3 pr-12">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow - only on desktop between cards */}
              {index < steps.length - 1 && (
                <div className="hidden xl:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
