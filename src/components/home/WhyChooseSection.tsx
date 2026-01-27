import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { Package, Users, Globe, Award, Zap, HeadphonesIcon, CheckCircle } from "lucide-react";

const stats = [
  { icon: Package, value: 10000, suffix: "+", label: "Shipments Delivered" },
  { icon: Globe, value: 150, suffix: "+", label: "Countries Served" },
  { icon: Award, value: 99.8, suffix: "%", label: "On-Time Delivery", isDecimal: true },
  { icon: HeadphonesIcon, value: 24, suffix: "/7", label: "Customer Support" },
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

const StatsCounter = ({ value, suffix, isActive, isDecimal }: { value: number; suffix: string; isActive: boolean; isDecimal?: boolean }) => {
  const count = useAnimatedCounter(isDecimal ? value * 10 : value, 2000, isActive);
  const displayValue = isDecimal ? (count / 10).toFixed(1) : count.toLocaleString();
  
  return (
    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-white whitespace-nowrap">
      {displayValue}{suffix}
    </span>
  );
};

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 sm:py-32 lg:py-40 bg-gradient-to-r from-secondary to-[hsl(18,100%,55%)] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      {/* Additional depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <span
            className={`inline-flex items-center gap-2 bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wider uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <CheckCircle size={14} className="fill-white/30" />
            Why Choose Us
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-5 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-white/90" style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)' }}>Speak</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-white/90 leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our track record speaks for itself - trusted by thousands worldwide
          </p>
        </div>


        {/* Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-gradient-to-br from-card to-muted/20 rounded-2xl p-8 lg:p-10 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-3 border border-border/30 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="w-16 h-16 lg:w-18 lg:h-18 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all shadow-sm">
                <item.icon className="w-8 h-8 text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-4">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                {item.description}
              </p>
              <div className="mt-6 flex items-center gap-2 text-secondary font-semibold">
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
