import { ClipboardCheck, LocateFixed, Route, PackageCheck, ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";

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
    <section ref={ref} className="section-padding bg-primary relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 transition-all duration-600 bg-accent text-accent-foreground shadow-md ${
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
            How It Works
          </h2>
          <p
            className={`text-white/85 text-lg md:text-xl font-medium leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Getting your shipment delivered is simple. Our streamlined process ensures a hassle-free experience.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative transition-all duration-400 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Card */}
              <div className="h-full p-7 lg:p-8 relative overflow-hidden bg-white/10 border border-white/20 rounded-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-400 ease-out hover:-translate-y-2 group">
                {/* Top accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                
                {/* Step Number */}
                <div className="absolute top-6 right-6 w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-sm text-accent-foreground shadow-md">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 shadow-sm transition-all duration-400 group-hover:scale-110 group-hover:bg-white/25 border border-white/20">
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-3 pr-12 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-white/75 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector - Large Desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden xl:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-white/20 border border-white/30 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
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
