import { Shield, Eye, Zap, Lock, HeartHandshake } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "Consistently delivering on our promises with dependable service you can trust.",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Real-time tracking and clear communication throughout your shipment journey.",
    color: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Express delivery options ensuring your packages arrive on time, every time.",
    color: "from-amber-500/20 to-amber-600/10",
  },
  {
    icon: Lock,
    title: "Security",
    description: "Advanced handling protocols and insurance for complete peace of mind.",
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: HeartHandshake,
    title: "Customer-Centric",
    description: "24/7 support and personalized solutions tailored to your unique needs.",
    color: "from-rose-500/20 to-rose-600/10",
  },
];

const CoreValuesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative elements - Hidden on mobile */}
      <div className="hidden sm:block absolute top-1/2 left-0 w-px h-40 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      <div className="hidden sm:block absolute top-1/2 right-0 w-px h-40 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6">
        {/* Premium Header - Responsive */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-20">
          <span
            className={`inline-block text-secondary font-bold text-xs sm:text-sm tracking-widest uppercase mb-2 sm:mb-3 md:mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Principles
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-foreground mb-3 sm:mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Core{" "}
            <span className="bg-gradient-to-r from-secondary to-[hsl(40,100%,55%)] bg-clip-text text-transparent">
              Values
            </span>
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 px-2 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The fundamental principles that guide everything we do and 
            define who we are as a company.
          </p>
        </div>

        {/* Premium Values Grid - Fully Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`group relative bg-card rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 text-center shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 md:hover:-translate-y-4 border border-border/50 overflow-hidden ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon - Responsive */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto bg-secondary/10 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 group-hover:bg-secondary group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-yellow">
                  <value.icon
                    size={20}
                    className="sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 text-secondary group-hover:text-secondary-foreground transition-colors duration-300"
                  />
                </div>

                {/* Title - Responsive */}
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-heading font-bold text-foreground mb-2 sm:mb-3 md:mb-4 group-hover:text-secondary transition-colors duration-300">
                  {value.title}
                </h3>
                
                {/* Description - Hidden on mobile for cleaner look, visible on larger screens */}
                <p className="hidden sm:block text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 sm:h-1 bg-gradient-to-r from-secondary to-[hsl(40,100%,55%)] group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValuesSection;