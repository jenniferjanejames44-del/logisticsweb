import { Target, Eye, Sparkles, TrendingUp, Globe, Rocket } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span
            className={`inline-block bg-foreground/10 text-foreground font-semibold text-sm tracking-wide uppercase px-4 py-2 rounded-full mb-4 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Who We Are
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-secondary">Purpose</span>
          </h2>
          <p
            className={`text-lg md:text-xl text-muted-foreground leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
          {/* Goal Card */}
          <div
            className={`group bg-card rounded-2xl p-8 md:p-10 border border-border/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-105 transition-all duration-300">
              <Target size={28} className="text-secondary group-hover:text-white" />
            </div>
            
            <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm tracking-wide uppercase mb-4">
              <TrendingUp size={16} />
              Our Goal
            </span>
            
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-tight">
              Excellence in Every <span className="text-secondary">Delivery</span>
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-6">
              Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every single package we handle.
            </p>
            
            <div className="flex items-center gap-3 text-foreground font-medium">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary transition-all">
                <Sparkles size={18} className="text-secondary group-hover:text-white" />
              </div>
              <span>Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card */}
          <div
            className={`group bg-foreground rounded-2xl p-8 md:p-10 transition-all duration-300 delay-100 hover:shadow-md hover:-translate-y-1 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all duration-300">
              <Eye size={28} className="text-white" />
            </div>
            
            <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm tracking-wide uppercase mb-4">
              <Globe size={16} />
              Our Vision
            </span>
            
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 leading-tight">
              Leading Global <span className="text-secondary">Logistics</span>
            </h3>
            
            <p className="text-white/70 leading-relaxed mb-6">
              To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and excellence in global shipping.
            </p>
            
            <div className="flex items-center gap-3 text-white font-medium">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Rocket size={18} className="text-white" />
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
