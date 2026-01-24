import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Package, Users, Globe, Award, Zap, HeadphonesIcon, CheckCircle, Star } from "lucide-react";

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
    <section ref={ref} className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-primary via-primary to-[hsl(200,100%,50%)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.07]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(200,100%,55%)]/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <span
            className={`inline-flex items-center gap-2 bg-secondary/20 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Star size={14} className="fill-secondary" />
            Why Choose Us
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-5 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-secondary drop-shadow-[0_2px_10px_rgba(255,213,0,0.4)]">Speak</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-primary-foreground/85 leading-relaxed transition-all duration-700 delay-200 ${
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
              className={`group text-center p-5 sm:p-6 lg:p-8 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto bg-secondary/20 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:bg-secondary transition-all shadow-lg">
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
              className={`group bg-white/10 border border-white/15 rounded-2xl p-6 sm:p-8 hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-secondary/20 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all shadow-lg">
                <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary-foreground mb-3 sm:mb-4">
                {item.title}
              </h3>
              <p className="text-primary-foreground/80 text-base sm:text-lg leading-relaxed">
                {item.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-secondary font-semibold">
                <CheckCircle size={18} className="fill-secondary/20" />
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
