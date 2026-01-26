import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import { useParallax } from "@/hooks/useParallax";
import heroLogisticsImage from "@/assets/hero-logistics.jpg";

const CTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const parallaxOffset = useParallax(0.3);

  return (
    <section ref={ref} className="section-padding relative overflow-hidden min-h-[500px] flex items-center">
      {/* Parallax Image Background */}
      <div 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ 
          transform: `translateY(${parallaxOffset}px)`,
          willChange: 'transform'
        }}
      >
        <img 
          src={heroLogisticsImage} 
          alt="Global logistics background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Dark Navy Overlay for Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,11%)/90] via-[hsl(222,40%,12%)/85] to-[hsl(222,47%,11%)/90]" />
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(0,0%,100%) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px]" />

      <div className="section-container relative z-10 w-full">
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Heading */}
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight mb-6 transition-all duration-700 delay-100 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <span className="text-primary-foreground">Ready to Ship </span>
            <span className="text-secondary">Globally?</span>
          </h2>
          
          <p className={`text-lg sm:text-xl text-[hsl(215,20%,75%)] mb-10 leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-200 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Button variant="default" size="xl" className="w-full sm:w-auto group" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
            <Button variant="ghost" size="xl" className="w-full sm:w-auto group" asChild>
              <Link to="/contact">
                Contact Sales
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
