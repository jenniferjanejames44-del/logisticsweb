import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import { useParallax } from "@/hooks/useParallax";

const CTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const parallaxOffset = useParallax(0.3);

  return (
    <section ref={ref} className="section-padding relative overflow-hidden min-h-[500px]">
      {/* Background Image Grid */}
      <div className="absolute inset-0 grid grid-cols-3 gap-2 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80" 
          alt="Cargo logistics"
          className="w-full h-full object-cover"
        />
        <img 
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80" 
          alt="Cargo ship at sea"
          className="w-full h-full object-cover"
        />
        <img 
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80" 
          alt="Shipping containers"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/85 via-[#0C4A6E]/80 to-[#0A1628]/85" />

      {/* Decorative Glow Elements */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl will-change-transform" 
        style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl will-change-transform" 
        style={{ transform: `translateY(${-parallaxOffset * 0.3}px)` }}
      />

      <div className="section-container relative z-10">
        <div
          className={`text-center max-w-3xl mx-auto transition-all duration-600 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Heading */}
          <h2 
            className={`mb-5 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
          >
            <span className="text-white">Ready to Ship </span>
            <span className="text-secondary">Globally?</span>
          </h2>
          
          <p 
            className={`text-lg md:text-2xl text-white font-medium mb-12 leading-relaxed max-w-2xl mx-auto transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)', letterSpacing: '-0.01em' }}
          >
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-500 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md group"
            >
              Get Quote
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out bg-white/10 text-white border-2 border-white/40 hover:bg-white/20 hover:border-white/60 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm group"
            >
              Contact Us
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
