import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Package, Users, Globe, Award } from "lucide-react";

const stats = [
  {
    icon: Package,
    value: 50000,
    suffix: "+",
    label: "Shipments Delivered",
  },
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Happy Customers",
  },
  {
    icon: Globe,
    value: 150,
    suffix: "+",
    label: "Countries Covered",
  },
  {
    icon: Award,
    value: 15,
    suffix: "+",
    label: "Years of Excellence",
  },
];

const differentiators = [
  {
    title: "Global Network",
    description: "Connected to every corner of the world through our extensive logistics network.",
  },
  {
    title: "Smart Technology",
    description: "AI-powered tracking and route optimization for efficient deliveries.",
  },
  {
    title: "Dedicated Support",
    description: "Round-the-clock customer service to assist you at every step.",
  },
];

const StatsCounter = ({
  value,
  suffix,
  isActive,
}: {
  value: number;
  suffix: string;
  isActive: boolean;
}) => {
  const count = useAnimatedCounter(value, 2000, isActive);
  return (
    <span className="text-4xl md:text-5xl font-heading font-bold text-secondary">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`inline-block text-secondary font-semibold mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            WHY RAC LOGISTICS
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-secondary">Speak</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-700 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                <stat.icon size={28} className="text-secondary" />
              </div>
              <StatsCounter
                value={stat.value}
                suffix={stat.suffix}
                isActive={isInView}
              />
              <p className="text-primary-foreground/70 mt-2 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Differentiators */}
        <div className="grid md:grid-cols-3 gap-6">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 hover:bg-primary-foreground/10 transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
            >
              <h3 className="text-xl font-heading font-bold text-primary-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-primary-foreground/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
