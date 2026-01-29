import { Target, Eye, Sparkles, TrendingUp, Globe, Rocket } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-section-blue relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`badge-blue mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Who We Are
          </span>
          <h2
            className={`text-primary mb-5 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="gradient-text">Purpose</span>
          </h2>
          <p
            className={`text-foreground/80 text-lg md:text-xl font-medium leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {/* Goal Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-1 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Top accent bar on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
            
            <div className="w-14 h-14 gradient-blue rounded-xl flex items-center justify-center mb-6 shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg">
              <Target size={28} className="text-white" />
            </div>
            
            <span className="inline-flex items-center gap-2 gradient-text font-bold text-sm tracking-wide uppercase mb-4">
              <TrendingUp size={16} />
              Our Goal
            </span>
            
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight group-hover:text-accent transition-colors duration-300">
              Excellence in Every <span className="gradient-text">Delivery</span>
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every single package we handle.
            </p>
            
            <div className="flex items-center gap-3 text-primary font-bold">
              <div className="w-10 h-10 rounded-lg gradient-yellow flex items-center justify-center shadow-sm">
                <Sparkles size={18} className="text-primary" />
              </div>
              <span>Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-1 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Top accent bar on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
            
            <div className="w-14 h-14 gradient-blue rounded-xl flex items-center justify-center mb-6 shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg">
              <Eye size={28} className="text-white" />
            </div>
            
            <span className="inline-flex items-center gap-2 gradient-text font-bold text-sm tracking-wide uppercase mb-4">
              <Globe size={16} />
              Our Vision
            </span>
            
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight group-hover:text-accent transition-colors duration-300">
              Leading Global <span className="gradient-text">Logistics</span>
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and excellence in global shipping.
            </p>
            
            <div className="flex items-center gap-3 text-primary font-bold">
              <div className="w-10 h-10 rounded-lg gradient-yellow flex items-center justify-center shadow-sm">
                <Rocket size={18} className="text-primary" />
              </div>
              <span>Transforming Global Trade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoalVisionSection;
