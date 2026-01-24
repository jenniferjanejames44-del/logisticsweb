import { Target, Eye, Sparkles, TrendingUp, Globe } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 sm:py-28 lg:py-36 bg-background relative overflow-hidden">
      {/* Subtle background lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Goal Card - Light background */}
          <div
            className={`group bg-muted/50 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-card hover:shadow-card-hover transition-all duration-700 border border-border/50 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Target size={36} className="text-secondary sm:w-10 sm:h-10" />
            </div>
            
            {/* Label */}
            <span className="inline-flex items-center gap-2 text-secondary font-bold text-sm tracking-widest uppercase mb-4">
              <TrendingUp size={14} />
              Our Goal
            </span>
            
            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground mb-6 leading-tight">
              Excellence in Every{" "}
              <span className="text-secondary">Delivery</span>
            </h3>
            
            {/* Quote */}
            <p className="text-base sm:text-lg text-foreground/70 leading-relaxed mb-8">
              "Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every package we handle."
            </p>
            
            {/* Footer */}
            <div className="flex items-center gap-3 text-secondary font-bold">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span>Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card - Dark Navy background */}
          <div
            className={`group bg-primary rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xl transition-all duration-700 delay-200 relative overflow-hidden ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-5" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm-20 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
            }} />
            
            {/* Glowing orb */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-secondary/15 rounded-full blur-3xl" />
            
            {/* Icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-yellow">
              <Eye size={36} className="text-primary sm:w-10 sm:h-10" />
            </div>
            
            {/* Label */}
            <span className="relative inline-flex items-center gap-2 text-secondary font-bold text-sm tracking-widest uppercase mb-4">
              <Globe size={14} />
              Our Vision
            </span>
            
            {/* Title */}
            <h3 className="relative text-2xl sm:text-3xl font-heading font-extrabold text-white mb-6 leading-tight">
              Leading Global{" "}
              <span className="text-secondary">Logistics</span>
            </h3>
            
            {/* Quote */}
            <p className="relative text-base sm:text-lg text-white/80 leading-relaxed mb-8">
              "To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and customer satisfaction."
            </p>
            
            {/* Footer */}
            <div className="relative flex items-center gap-3 text-secondary font-bold">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Sparkles size={18} className="text-primary" />
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
