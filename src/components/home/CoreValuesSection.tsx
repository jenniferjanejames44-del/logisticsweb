import { Shield, Eye, Zap, Lock, HeartHandshake } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "Consistently delivering on our promises with dependable service you can trust.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Real-time tracking and clear communication throughout your shipment journey.",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Express delivery options ensuring your packages arrive on time, every time.",
  },
  {
    icon: Lock,
    title: "Security",
    description: "Advanced handling protocols and insurance for complete peace of mind.",
  },
  {
    icon: HeartHandshake,
    title: "Customer-Centric",
    description: "24/7 support and personalized solutions tailored to your unique needs.",
  },
];

const CoreValuesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="hidden md:block absolute top-1/2 left-0 w-px h-40 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      <div className="hidden md:block absolute top-1/2 right-0 w-px h-40 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6">
        {/* Premium Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <span
            className={`inline-block text-secondary font-bold text-xs sm:text-sm tracking-widest uppercase mb-3 md:mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Principles
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-foreground mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Core{" "}
            <span className="bg-gradient-to-r from-secondary to-[hsl(40,100%,55%)] bg-clip-text text-transparent">
              Values
            </span>
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The fundamental principles that guide everything we do and 
            define who we are as a company.
          </p>
        </div>

        {/* Premium Values Grid - Fully Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`group relative bg-card rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 text-center shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 md:hover:-translate-y-4 border border-border/50 overflow-hidden ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto bg-secondary/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-secondary group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-lg">
                  <value.icon
                    className="w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 text-secondary group-hover:text-secondary-foreground transition-colors duration-300"
                  />
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-heading font-bold text-foreground mb-2 md:mb-4 group-hover:text-secondary transition-colors duration-300">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-secondary to-[hsl(40,100%,55%)] group-hover:w-full transition-all duration-500 rounded-t-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValuesSection;
