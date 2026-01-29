import { Package, MapPin, Truck, CheckCircle, ArrowRight } from "lucide-react";
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
    <section ref={ref} className="section-padding bg-navy relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-6 transition-all duration-600 bg-secondary/20 border-2 border-secondary text-secondary ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Simple Process
          </span>
          <h2
            className={`text-white mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            How It <span className="text-secondary">Works</span>
          </h2>
          <p
            className={`text-white/70 text-lg transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Getting your shipment delivered is simple. Our streamlined process ensures a hassle-free experience.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative transition-all duration-200 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Card */}
              <div className="h-full p-5 sm:p-6 relative overflow-hidden bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 gradient-yellow rounded-lg flex items-center justify-center font-semibold text-xs text-primary shadow-sm">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-11 h-11 gradient-blue rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <step.icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-white mb-2 pr-10">
                  {step.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector - Large Desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden xl:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <div className="w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-secondary" />
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
