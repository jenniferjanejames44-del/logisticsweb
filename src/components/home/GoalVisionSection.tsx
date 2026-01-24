import { Target, Eye, Sparkles, TrendingUp, Globe } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-28 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase px-4 py-2 rounded-full mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Who We Are
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-secondary">Purpose</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {/* Goal Card */}
          <div
            className={`group bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-500 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-secondary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform">
              <Target size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary" />
            </div>
            
            <span className="inline-flex items-center gap-2 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase mb-3">
              <TrendingUp size={14} />
              Our Goal
            </span>
            
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Excellence in Every{" "}
              <span className="text-secondary">Delivery</span>
            </h3>
            
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
              Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every package.
            </p>
            
            <div className="flex items-center gap-3 text-secondary font-semibold text-sm sm:text-base">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Sparkles size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span>Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card */}
          <div
            className={`group bg-primary rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden transition-all duration-500 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 bg-secondary/15 rounded-full blur-3xl" />
            
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-secondary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform">
              <Eye size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
            </div>
            
            <span className="relative inline-flex items-center gap-2 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase mb-3">
              <Globe size={14} />
              Our Vision
            </span>
            
            <h3 className="relative text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-white mb-3 sm:mb-4 leading-tight">
              Leading Global{" "}
              <span className="text-secondary">Logistics</span>
            </h3>
            
            <p className="relative text-sm sm:text-base text-white/80 leading-relaxed mb-4 sm:mb-6">
              To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation.
            </p>
            
            <div className="relative flex items-center gap-3 text-secondary font-semibold text-sm sm:text-base">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Sparkles size={16} className="sm:w-5 sm:h-5 text-primary" />
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
