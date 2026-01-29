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
    <section ref={ref} className="section-padding bg-section-blue relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a8a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`badge-blue mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <CheckCircle size={14} />
            Our Advantage
          </span>
          <h2
            className={`text-primary transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why Choose <span className="gradient-text">Us</span>
          </h2>
        </div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-1 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Top accent bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              
              <div className="w-14 h-14 gradient-blue rounded-xl flex items-center justify-center mb-6 shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg">
                <item.icon size={26} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-3 group-hover:text-accent transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-accent font-bold text-sm">
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
