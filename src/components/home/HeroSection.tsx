import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import TrackingCard from "./TrackingCard";
import heroVideo from "@/assets/hero-logistics-video.mp4";
import heroPoster from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={heroPoster}
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

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
              className="inline-flex items-center gap-2 h-12 px-6 sm:px-8 font-semibold text-[15px] rounded-[10px] shadow-md transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Get Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2 h-12 px-6 sm:px-8 font-semibold text-[15px] rounded-[10px] shadow-sm transition-all duration-200 bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-[0.98]"
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
