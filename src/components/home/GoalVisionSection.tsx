import { Eye, Sparkles, TrendingUp, Globe, Rocket, Target } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-muted relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 transition-all duration-600 bg-accent text-accent-foreground shadow-sm ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Who We Are
          </span>
          <h2
            className={`text-foreground mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-primary">Purpose</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg md:text-xl font-medium leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {/* Goal Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-2 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Top accent bar on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
            
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-7 shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg">
              <Target size={30} className="text-accent-foreground" />
            </div>
            
            <span className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase mb-4">
              <TrendingUp size={16} className="text-accent" />
              Our Goal
            </span>
            
            <h3 className="text-foreground mb-5 leading-tight group-hover:text-primary transition-colors duration-300">
              Excellence in Every Delivery
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-7 text-[15px]">
              Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every single package we handle.
            </p>
            
            <div className="flex items-center gap-3 text-foreground font-bold">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                <Sparkles size={20} className="text-primary" />
              </div>
              <span>Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card */}
          <div
            className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-2 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Top accent bar on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
            
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-7 shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg">
              <Eye size={30} className="text-accent-foreground" />
            </div>
            
            <span className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase mb-4">
              <Globe size={16} className="text-accent" />
              Our Vision
            </span>
            
            <h3 className="text-foreground mb-5 leading-tight group-hover:text-primary transition-colors duration-300">
              Leading Global Logistics
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-7 text-[15px]">
              To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and excellence in global shipping.
            </p>
            
            <div className="flex items-center gap-3 text-foreground font-bold">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                <Rocket size={20} className="text-primary" />
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
