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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative transition-all duration-400 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Card */}
              <div className="h-full p-6 lg:p-7 relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-400 ease-out hover:-translate-y-1 group">
                {/* Top accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                
                {/* Step Number */}
                <div className="absolute top-5 right-5 w-9 h-9 gradient-yellow rounded-xl flex items-center justify-center font-bold text-xs text-primary shadow-md">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 gradient-blue rounded-xl flex items-center justify-center mb-5 shadow-md transition-all duration-400 group-hover:scale-110">
                  <step.icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-white mb-3 pr-12 group-hover:text-secondary transition-colors duration-300">
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
