import { Target, Eye, Sparkles, TrendingUp, Globe, Rocket } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 sm:py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span
            className={`inline-block bg-primary/10 text-primary font-bold text-xs sm:text-sm tracking-wider uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Who We Are
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-5 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-primary">Purpose</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* Goal Card */}
          <div
            className={`group bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-border hover:border-primary/40 hover:shadow-card-hover transition-all duration-500 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-all shadow-lg">
              <Target size={28} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
            </div>
            
            <span className="inline-flex items-center gap-2 text-primary font-bold text-xs sm:text-sm tracking-wider uppercase mb-4">
              <TrendingUp size={16} />
              Our Goal
            </span>
            
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4 sm:mb-5 leading-tight">
              Excellence in Every{" "}
              <span className="text-primary">Delivery</span>
            </h3>
            
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8">
              Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every single package we handle.
            </p>
            
            <div className="flex items-center gap-4 text-primary font-semibold">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-md">
                <Sparkles size={20} />
              </div>
              <span className="text-foreground">Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card - Electric Blue gradient */}
          <div
            className={`group bg-gradient-to-br from-primary via-primary to-[hsl(200,100%,50%)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden transition-all duration-500 delay-200 shadow-blue ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 bg-secondary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-secondary rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform shadow-accent">
              <Eye size={28} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-secondary-foreground" />
            </div>
            
            <span className="relative inline-flex items-center gap-2 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase mb-4">
              <Globe size={16} />
              Our Vision
            </span>
            
            <h3 className="relative text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-4 sm:mb-5 leading-tight">
              Leading Global{" "}
              <span className="text-secondary">Logistics</span>
            </h3>
            
            <p className="relative text-base sm:text-lg text-white/90 leading-relaxed mb-6 sm:mb-8">
              To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and excellence in global shipping.
            </p>
            
            <div className="relative flex items-center gap-4 text-secondary font-semibold">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-accent">
                <Rocket size={20} className="text-secondary-foreground" />
              </div>
              <span className="text-white">Transforming Global Trade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoalVisionSection;
