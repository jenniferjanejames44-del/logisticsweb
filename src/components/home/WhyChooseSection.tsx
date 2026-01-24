import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Package, Users, Globe, Award, Zap, HeadphonesIcon, CheckCircle } from "lucide-react";

const stats = [
  { icon: Package, value: 50000, suffix: "+", label: "Shipments Delivered" },
  { icon: Users, value: 10000, suffix: "+", label: "Happy Customers" },
  { icon: Globe, value: 150, suffix: "+", label: "Countries Served" },
  { icon: Award, value: 15, suffix: "+", label: "Years Experience" },
];

const differentiators = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Connected to every corner of the world through our extensive logistics network spanning 150+ countries.",
  },
  {
    icon: Zap,
    title: "Smart Technology",
    description: "AI-powered tracking and route optimization for faster, more efficient deliveries every time.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock customer service with dedicated agents ready to assist you anytime.",
  },
];

const StatsCounter = ({ value, suffix, isActive }: { value: number; suffix: string; isActive: boolean }) => {
  const count = useAnimatedCounter(value, 2000, isActive);
  return (
    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-secondary">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 sm:py-24 lg:py-32 bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <span
            className={`inline-block bg-secondary/20 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why Choose Us
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-5 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-secondary">Speak</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-primary-foreground/80 leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our track record speaks for itself - trusted by thousands worldwide
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group text-center p-5 sm:p-6 lg:p-8 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto bg-secondary/20 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:bg-secondary transition-all">
                <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
              </div>
              <StatsCounter value={stat.value} suffix={stat.suffix} isActive={isInView} />
              <p className="text-primary-foreground/80 mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-white/10 border border-white/15 rounded-2xl p-6 sm:p-8 hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-secondary/20 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all">
                <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary-foreground mb-3 sm:mb-4">
                {item.title}
              </h3>
              <p className="text-primary-foreground/80 text-base sm:text-lg leading-relaxed">
                {item.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-secondary font-semibold">
                <CheckCircle size={18} />
                <span>Guaranteed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
