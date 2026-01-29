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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative transition-all duration-600 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Card */}
              <div className="h-full p-5 sm:p-6 lg:p-8 relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                {/* Step Number */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 lg:top-6 lg:right-6 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 gradient-yellow rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm text-primary shadow-lg">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 gradient-blue rounded-xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 shadow-lg">
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2 sm:mb-3 pr-10 sm:pr-12">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector - Desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-secondary" />
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
