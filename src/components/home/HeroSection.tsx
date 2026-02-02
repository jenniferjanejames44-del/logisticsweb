import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import TrackingCard from "./TrackingCard";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80)',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 pt-28 sm:pt-32 pb-16 md:py-32">
        <div className="max-w-[600px] mx-auto text-center lg:text-left lg:mx-0">
          {/* Main Heading */}
          <h1 className={`mb-6 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <span className="text-white block font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">Global Logistics.</span>
            <span className="text-white/90 block font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">Delivered With Excellence.</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed font-medium transition-all duration-500 delay-100 text-white/85 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10 transition-all duration-500 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 font-bold text-sm sm:text-base rounded-lg shadow-md transition-all duration-200 bg-white text-primary hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Get Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 font-bold text-sm sm:text-base rounded-lg shadow-sm transition-all duration-200 border-2 border-white/60 text-white hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:border-[hsl(45,100%,51%)] hover:shadow-md active:scale-[0.98]"
            >
              Sign Up
              <ArrowRight className="w-4 h-4" />
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
