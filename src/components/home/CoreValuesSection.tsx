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
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-semibold text-sm tracking-wide uppercase px-4 py-2 rounded-full mb-4 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Principles
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Core <span className="text-secondary">Values</span>
          </h2>
          <p
            className={`text-lg md:text-xl text-muted-foreground leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The fundamental principles that guide everything we do and define who we are as a company.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`group transition-all duration-600 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${index * 80 + 200}ms` }}
            >
              <div className="h-full bg-card rounded-2xl p-6 md:p-8 text-center border border-border/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                {/* Icon */}
                <div className="w-12 h-12 mx-auto bg-secondary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:scale-105 transition-all duration-300">
                  <value.icon className="w-6 h-6 text-secondary group-hover:text-white transition-colors" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-3">
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
