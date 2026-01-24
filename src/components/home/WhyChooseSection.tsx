import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Package, Users, Globe, Award, Zap, HeadphonesIcon, CheckCircle } from "lucide-react";

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
    <span className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-secondary drop-shadow-lg">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 lg:py-36 bg-primary relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <span
            className={`inline-block bg-secondary/20 text-secondary font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded-full mb-6 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why RAC Logistics
          </span>
          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-foreground mb-6 transition-all duration-700 delay-100 leading-[1.1] ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-secondary">Speak</span>
          </h2>
          <p
            className={`text-xl text-primary-foreground/70 transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our track record speaks for itself. We deliver excellence, every single time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-20 lg:mb-28">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group text-center p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-secondary/30 transition-all duration-500 hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100 + 300}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary/30 transition-all duration-500">
                <stat.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-secondary" />
              </div>
              
              {/* Counter */}
              <StatsCounter value={stat.value} suffix={stat.suffix} isActive={isInView} />
              
              {/* Label */}
              <p className="text-primary-foreground/80 mt-4 text-base lg:text-lg font-semibold">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-10 hover:bg-white/10 hover:border-secondary/30 transition-all duration-500 hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100 + 300}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 lg:w-18 lg:h-18 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all duration-500">
                <item.icon className="w-8 h-8 lg:w-9 lg:h-9 text-secondary group-hover:text-secondary-foreground transition-colors duration-300" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-primary-foreground mb-4">
                {item.title}
              </h3>
              
              {/* Description */}
              <p className="text-primary-foreground/70 text-base lg:text-lg leading-relaxed">
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
