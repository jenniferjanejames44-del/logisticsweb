import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
    <section className="hero-gradient relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-primary">
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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(223,81,1,0.16),transparent_26%),linear-gradient(180deg,rgba(6,16,67,0.22),rgba(6,16,67,0.5))]" />

      <div className="section-container relative z-10 pb-14 pt-28 sm:pb-16 sm:pt-32 md:py-32 lg:py-36">
        <div className="mx-auto max-w-[820px] text-center animate-fade-in-soft">
          {/* Badge */}
          <div className={`mb-6 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <span className="page-hero-badge">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </span>
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
          <p className={`mb-10 max-w-2xl text-[1.05rem] font-medium leading-relaxed text-white/82 transition-all duration-700 delay-150 sm:mb-12 sm:text-[1.125rem] md:text-[1.25rem] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`mb-12 flex flex-col items-stretch justify-center gap-3.5 sm:flex-row sm:items-center transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Button asChild variant="heroPrimary" size="xl" className="w-full sm:w-auto">
              <Link to="/pricing">
                Get Quote
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button asChild variant="heroSecondary" size="xl" className="w-full sm:w-auto">
              <Link to="/auth">
                Sign Up
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
          </div>

          {/* Tracking Card Component */}
          <TrackingCard isVisible={isVisible} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
