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
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 lg:py-36 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-secondary/5 rounded-full blur-3xl opacity-50" />
      
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Principles
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-foreground mb-6 transition-all duration-700 delay-100 leading-tight ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Core <span className="text-secondary">Values</span>
          </h2>
          <p
            className={`text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The fundamental principles that guide everything we do and define who we are as a company.
          </p>
        </div>

        {/* Values Grid - Mobile: 1 col, Tablet: 2-3 cols, Desktop: 5 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 lg:gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`group transition-all duration-700 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100 + 300}ms` }}
            >
              <div className="h-full bg-gradient-to-br from-card to-muted/20 rounded-2xl p-6 lg:p-8 text-center border border-border/50 hover:border-secondary/40 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                {/* Icon */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300 shadow-sm">
                  <value.icon className="w-7 h-7 lg:w-8 lg:h-8 text-secondary group-hover:text-secondary-foreground transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-base lg:text-lg font-heading font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValuesSection;
