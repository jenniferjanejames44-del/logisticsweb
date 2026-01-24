import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Package, Users, Globe, Award, Zap, HeadphonesIcon } from "lucide-react";

const stats = [
  { icon: Package, value: 50000, suffix: "+", label: "Shipments" },
  { icon: Users, value: 10000, suffix: "+", label: "Customers" },
  { icon: Globe, value: 150, suffix: "+", label: "Countries" },
  { icon: Award, value: 15, suffix: "+", label: "Years" },
];

const differentiators = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Connected to every corner of the world through our extensive logistics network.",
  },
  {
    icon: Zap,
    title: "Smart Technology",
    description: "AI-powered tracking and route optimization for faster deliveries.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock customer service ready to assist you.",
  },
];

const StatsCounter = ({ value, suffix, isActive }: { value: number; suffix: string; isActive: boolean }) => {
  const count = useAnimatedCounter(value, 2000, isActive);
  return (
    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-secondary">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-28 bg-primary relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <span
            className={`inline-block bg-secondary/20 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase px-4 py-2 rounded-full mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why Choose Us
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-4 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-secondary">Speak</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-14 lg:mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group text-center p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mx-auto bg-secondary/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-secondary" />
              </div>
              <StatsCounter value={stat.value} suffix={stat.suffix} isActive={isInView} />
              <p className="text-primary-foreground/70 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all duration-300 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:scale-105 transition-all">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary group-hover:text-secondary-foreground transition-colors" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-primary-foreground mb-2 sm:mb-3">
                {item.title}
              </h3>
              <p className="text-primary-foreground/70 text-sm sm:text-base leading-relaxed">
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
