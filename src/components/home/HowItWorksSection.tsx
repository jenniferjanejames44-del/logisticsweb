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
    <section ref={ref} className="py-20 sm:py-28 lg:py-36 bg-background relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block text-secondary font-bold text-sm tracking-widest uppercase mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Simple Process
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-foreground mb-6 transition-all duration-700 delay-100 leading-tight ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            How It <span className="text-secondary">Works</span>
          </h2>
          <p
            className={`text-foreground/70 text-base md:text-lg lg:text-xl leading-relaxed transition-all duration-700 delay-200 font-medium ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Getting your shipment delivered is simple. Our streamlined process ensures a hassle-free experience from start to finish.
          </p>
        </div>

        {/* Steps Grid */}
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
              <div className="group h-full bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-secondary/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-secondary text-primary rounded-xl flex items-center justify-center font-heading font-extrabold text-base shadow-lg">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-heading font-bold text-foreground mb-3 pr-14">
                  {step.title}
                </h3>
                <p className="text-foreground/60 text-base leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow - Desktop only */}
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
