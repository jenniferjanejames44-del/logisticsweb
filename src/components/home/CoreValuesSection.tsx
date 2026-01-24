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
    <section ref={ref} className="py-20 lg:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block text-secondary font-semibold text-sm tracking-widest uppercase mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Principles
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-5 transition-all duration-700 delay-100 leading-tight ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Core <span className="text-secondary">Values</span>
          </h2>
          <p
            className={`text-muted-foreground text-base md:text-lg leading-relaxed transition-all duration-700 delay-200 ${
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
              style={{ transitionDelay: `${index * 80 + 300}ms` }}
            >
              <div className="h-full bg-card rounded-2xl p-6 lg:p-7 text-center border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
                {/* Icon */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto bg-secondary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:scale-105 transition-all duration-300">
                  <value.icon className="w-7 h-7 lg:w-8 lg:h-8 text-secondary group-hover:text-secondary-foreground transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-base lg:text-lg font-heading font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
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
