import { useInView } from "@/hooks/useInView";
import { Globe, Zap, HeadphonesIcon, CheckCircle } from "lucide-react";

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

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span
            className={`inline-flex items-center gap-2 bg-white/20 text-white font-semibold text-sm tracking-wide uppercase px-4 py-2 rounded-full mb-4 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <CheckCircle size={14} />
            Our Advantage
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why Choose Us
          </h2>
        </div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-card rounded-2xl p-8 md:p-10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-105 transition-all duration-300">
                <item.icon className="w-7 h-7 text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-secondary font-medium text-sm">
                <CheckCircle size={16} />
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
