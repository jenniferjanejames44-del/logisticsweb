import { Target, Eye, Sparkles, TrendingUp, Globe, Rocket } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding gradient-dark relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`badge-orange mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Who We Are
          </span>
          <h2
            className={`text-white mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="gradient-text">Purpose</span>
          </h2>
          <p
            className={`text-white/70 text-lg transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Goal Card */}
          <div
            className={`glass-card card-top-border p-10 group transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="w-14 h-14 gradient-orange rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Target size={28} className="text-white" />
            </div>
            
            <span className="inline-flex items-center gap-2 gradient-text font-semibold text-sm tracking-wide uppercase mb-4">
              <TrendingUp size={16} />
              Our Goal
            </span>
            
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 leading-tight">
              Excellence in Every <span className="gradient-text">Delivery</span>
            </h3>
            
            <p className="text-white/70 leading-relaxed mb-6">
              Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every single package we handle.
            </p>
            
            <div className="flex items-center gap-3 text-white font-medium">
              <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span>Committed to Your Success</span>
            </div>
          </div>

          {/* Vision Card */}
          <div
            className={`glass-card card-top-border p-10 group transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="w-14 h-14 gradient-orange rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Eye size={28} className="text-white" />
            </div>
            
            <span className="inline-flex items-center gap-2 gradient-text font-semibold text-sm tracking-wide uppercase mb-4">
              <Globe size={16} />
              Our Vision
            </span>
            
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 leading-tight">
              Leading Global <span className="gradient-text">Logistics</span>
            </h3>
            
            <p className="text-white/70 leading-relaxed mb-6">
              To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and excellence in global shipping.
            </p>
            
            <div className="flex items-center gap-3 text-white font-medium">
              <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
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
