import { useState, useEffect } from "react";
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
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-primary">
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

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 pt-32 sm:pt-36 pb-20 md:py-40">
        <div className="max-w-[800px] mx-auto text-center">
          {/* Badge */}
          <div className={`mb-6 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white/15 text-white/90 backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Trusted Global Logistics Partner
            </span>
          </div>

          {/* Main Heading */}
          <h1 className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <span className="text-white block leading-[1.05]">Global Logistics.</span>
            <span className="text-accent block leading-[1.05]">Delivered With Excellence.</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl md:text-2xl mb-10 sm:mb-12 leading-relaxed font-medium transition-all duration-700 delay-150 text-white/80 max-w-2xl mx-auto ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-row items-center justify-center gap-4 mb-12 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 font-extrabold text-sm sm:text-base rounded-full shadow-lg transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Get Quote
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 font-extrabold text-sm sm:text-base rounded-full shadow-sm transition-all duration-200 bg-white text-primary hover:bg-white/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Sign Up
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
