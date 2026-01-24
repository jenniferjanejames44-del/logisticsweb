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
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-24 lg:py-32 bg-muted relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` 
      }} />

      {/* Gradient orbs - Responsive sizes */}
      <div className="absolute top-0 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-40 sm:w-56 md:w-80 h-40 sm:h-56 md:h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Premium Header - Responsive */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-20">
          <span
            className={`inline-block text-secondary font-bold text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-3 md:mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Simple Process
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-foreground mb-3 sm:mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            How It{" "}
            <span className="bg-gradient-to-r from-secondary to-[hsl(40,100%,55%)] bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 px-2 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Getting your shipment delivered is as easy as 1-2-3-4. 
            Our streamlined process ensures a hassle-free experience.
          </p>
        </div>

        {/* Premium Steps - Fully Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-5">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative transition-all duration-700 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Connector Line - Desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-12 left-[55%] items-center w-full z-0">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-secondary/60 to-secondary/20 rounded-full" />
                  <ArrowRight size={16} className="text-secondary/40 -ml-2" />
                </div>
              )}

              {/* Card - Responsive padding and sizing */}
              <div className="group bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 relative z-10 border border-border/50">
                {/* Step Number Badge - Responsive */}
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-secondary to-[hsl(40,100%,55%)] rounded-xl sm:rounded-2xl flex items-center justify-center font-heading font-extrabold text-secondary-foreground text-sm sm:text-base md:text-lg shadow-yellow rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  {step.step}
                </div>

                {/* Icon Container - Responsive */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-navy-gradient rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <step.icon size={24} className="sm:w-7 sm:h-7 md:w-9 md:h-9 text-primary-foreground" />
                </div>

                {/* Content - Responsive typography */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground mb-2 sm:mb-3 md:mb-4 group-hover:text-secondary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;