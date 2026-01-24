import { Target, Eye, Sparkles, TrendingUp, Globe, ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 sm:py-32 lg:py-40 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded-full mb-6 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Who We Are
          </span>
          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-foreground mb-6 transition-all duration-700 delay-100 leading-[1.1] ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-secondary">Purpose</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Goal Card */}
          <div
            className={`group bg-card rounded-3xl p-8 sm:p-10 lg:p-12 shadow-lg hover:shadow-2xl transition-all duration-700 border border-border hover:border-secondary/30 hover:-translate-y-2 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Icon */}
            <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-500">
              <Target size={40} className="text-secondary" />
            </div>
            
            {/* Label */}
            <span className="inline-flex items-center gap-2 text-secondary font-bold text-sm tracking-widest uppercase mb-4">
              <TrendingUp size={16} />
              Our Goal
            </span>
            
            {/* Title */}
            <h3 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-6 leading-tight">
              Excellence in Every{" "}
              <span className="text-secondary">Delivery</span>
            </h3>
            
            {/* Description */}
            <p className="text-lg text-foreground/70 leading-relaxed mb-8">
              Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every package we handle.
            </p>
            
            {/* Footer */}
            <div className="flex items-center gap-4 text-secondary font-bold text-lg">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Sparkles size={22} />
              </div>
              <span>Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card */}
          <div
            className={`group bg-primary rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-700 delay-200 relative overflow-hidden hover:-translate-y-2 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Glowing orb */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl group-hover:bg-secondary/30 transition-all duration-500" />
            
            {/* Icon */}
            <div className="relative w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-yellow">
              <Eye size={40} className="text-primary" />
            </div>
            
            {/* Label */}
            <span className="relative inline-flex items-center gap-2 text-secondary font-bold text-sm tracking-widest uppercase mb-4">
              <Globe size={16} />
              Our Vision
            </span>
            
            {/* Title */}
            <h3 className="relative text-3xl sm:text-4xl font-heading font-bold text-white mb-6 leading-tight">
              Leading Global{" "}
              <span className="text-secondary">Logistics</span>
            </h3>
            
            {/* Description */}
            <p className="relative text-lg text-white/85 leading-relaxed mb-8">
              To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and customer satisfaction.
            </p>
            
            {/* Footer */}
            <div className="relative flex items-center gap-4 text-secondary font-bold text-lg">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <Sparkles size={22} className="text-primary" />
              </div>
              <span>Transforming Global Trade</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-16 lg:mt-20 transition-all duration-700 delay-500 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button variant="cta" size="xl" className="text-lg px-12 py-7 rounded-2xl" asChild>
            <Link to="/about" className="group">
              Learn More About Us
              <ArrowRight size={24} className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GoalVisionSection;
