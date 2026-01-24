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
    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold bg-gradient-to-r from-secondary to-[hsl(40,100%,60%)] bg-clip-text text-transparent">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-navy-gradient relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary/5 to-transparent" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-56 md:w-80 h-56 md:h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Premium Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <span
            className={`inline-block text-secondary font-bold text-xs sm:text-sm tracking-widest uppercase mb-3 md:mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why RAC Logistics
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-primary-foreground mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That{" "}
            <span className="bg-gradient-to-r from-secondary to-[hsl(40,100%,60%)] bg-clip-text text-transparent">
              Speak
            </span>
          </h2>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-20">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group text-center p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto bg-secondary/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-secondary/30 transition-all duration-500">
                <stat.icon className="w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 text-secondary" />
              </div>
              <StatsCounter
                value={stat.value}
                suffix={stat.suffix}
                isActive={isInView}
              />
              <p className="text-primary-foreground/70 mt-3 md:mt-4 font-medium text-xs sm:text-sm md:text-base lg:text-lg">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Premium Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group relative bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 hover:bg-primary-foreground/10 transition-all duration-500 hover:-translate-y-3 overflow-hidden ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -inset-px bg-gradient-to-r from-secondary/20 via-secondary/10 to-secondary/20 rounded-2xl md:rounded-3xl blur-xl" />
              </div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-secondary/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 group-hover:bg-secondary transition-all duration-500">
                  <item.icon className="w-6 h-6 md:w-8 md:h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                </div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-primary-foreground mb-3 md:mb-4 group-hover:text-secondary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-primary-foreground/70 leading-relaxed text-sm md:text-base lg:text-lg">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
