import { Target, Eye, Sparkles } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const GoalVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Goal */}
          <div
            className={`bg-card rounded-2xl p-8 shadow-card hover-lift transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
              <Target size={32} className="text-secondary" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              Our Goal
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              "Delivering shipments globally with unmatched speed, precision, and security. 
              We strive to exceed expectations with every package we handle."
            </p>
            <div className="mt-6 flex items-center gap-2 text-secondary font-medium">
              <Sparkles size={18} />
              Excellence in Every Delivery
            </div>
          </div>

          {/* Vision */}
          <div
            className={`bg-primary rounded-2xl p-8 shadow-card hover-lift transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
              <Eye size={32} className="text-primary" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-primary-foreground mb-4">
              Our Vision
            </h3>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              "To become the world's most reliable and trusted logistics partner, 
              setting the standard for innovation and customer satisfaction."
            </p>
            <div className="mt-6 flex items-center gap-2 text-secondary font-medium">
              <Sparkles size={18} />
              Leading Global Logistics
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoalVisionSection;
