import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Package, Users, Globe, Award, Zap, HeadphonesIcon } from "lucide-react";

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
    icon: Globe,
    title: "Global Network",
    description: "Connected to every corner of the world through our extensive logistics network spanning 6 continents.",
  },
  {
    icon: Zap,
    title: "Smart Technology",
    description: "AI-powered tracking and route optimization for faster, more efficient deliveries every time.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description: "Round-the-clock customer service with real humans ready to assist you at every step.",
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
    <span className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-secondary">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-primary relative overflow-hidden">
      {/* Subtle pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block text-secondary font-semibold text-sm tracking-widest uppercase mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why RAC Logistics
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-5 transition-all duration-700 delay-100 leading-tight ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-secondary">Speak</span>
          </h2>
        </div>

        {/* Stats Grid - Mobile: 2x2, Desktop: 4 cols */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16 lg:mb-20">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group text-center p-5 sm:p-6 lg:p-8 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-300 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100 + 300}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto bg-secondary/20 rounded-xl flex items-center justify-center mb-4 lg:mb-5 group-hover:scale-105 transition-transform duration-300">
                <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary" />
              </div>
              
              {/* Counter */}
              <StatsCounter value={stat.value} suffix={stat.suffix} isActive={isInView} />
              
              {/* Label */}
              <p className="text-primary-foreground/70 mt-2 lg:mt-3 text-sm lg:text-base font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Differentiators - Mobile: Stack, Tablet+: 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-6 lg:p-8 hover:bg-primary-foreground/10 transition-all duration-300 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100 + 300}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-secondary/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:scale-105 transition-all duration-300">
                <item.icon className="w-6 h-6 lg:w-7 lg:h-7 text-secondary group-hover:text-secondary-foreground transition-colors duration-300" />
              </div>
              
              {/* Title */}
              <h3 className="text-lg lg:text-xl font-heading font-bold text-primary-foreground mb-3">
                {item.title}
              </h3>
              
              {/* Description */}
              <p className="text-primary-foreground/70 text-sm lg:text-base leading-relaxed">
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
