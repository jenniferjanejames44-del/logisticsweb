import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import { useParallax } from "@/hooks/useParallax";
import heroLogisticsImage from "@/assets/hero-logistics.jpg";

const CTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const parallaxOffset = useParallax(0.3);

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 relative overflow-hidden min-h-[450px] flex items-center">
      {/* Parallax Image Background */}
      <div 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ transform: `translateY(${parallaxOffset}px)`, willChange: 'transform' }}
      >
        <img 
          src={heroLogisticsImage} 
          alt="Global logistics background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-foreground/85" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full">
        <div
          className={`text-center max-w-3xl mx-auto transition-all duration-600 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Heading */}
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-6 transition-all duration-600 delay-100 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <span className="text-white">Ready to Ship </span>
            <span className="text-secondary">Globally?</span>
          </h2>
          
          <p className={`text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto transition-all duration-600 delay-200 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-600 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Link 
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-white font-semibold text-base rounded-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Quote
              <ArrowRight size={18} />
            </Link>
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-foreground font-semibold text-base rounded-xl hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Contact Us
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
