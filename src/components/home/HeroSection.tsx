import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";
import TrackingCard from "./TrackingCard";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const parallaxOffset = useParallax(0.4);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80)',
          transform: `translateY(${parallaxOffset}px) scale(1.1)`,
        }}
      />
      
      {/* Blue Gradient Overlay */}
      <div className="absolute inset-0 bg-navy opacity-90" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 pt-28 sm:pt-32 pb-16 md:py-32">
        <div className="max-w-[600px] mx-auto text-center lg:text-left lg:mx-0">
          {/* Main Heading */}
          <h1 className={`mb-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <span className="text-white block font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">Global Logistics.</span>
            <span className="text-secondary block font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">Delivered With Excellence.</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg md:text-xl mb-10 sm:mb-14 leading-relaxed font-medium transition-all duration-700 delay-100 text-white/90 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-10 sm:mb-14 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Link 
              to="/pricing"
              className="group inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:shadow-secondary/30 hover:bg-[hsl(38,100%,55%)] hover:-translate-y-1 active:translate-y-0 active:shadow-md uppercase tracking-wide relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">Get Quote</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
            </Link>
            <Link 
              to="/auth"
              className="group inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out bg-white/10 text-white border-2 border-white/40 hover:bg-secondary hover:text-primary hover:border-secondary hover:-translate-y-1 active:translate-y-0 backdrop-blur-sm uppercase tracking-wide"
            >
              Sign Up
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Tracking Card Component */}
          <TrackingCard isVisible={isVisible} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
