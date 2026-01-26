import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Clock, Shield, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-logistics-video.mp4";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-primary">
      {/* Video Background with Deep Navy Overlay */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroImage}
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <img
          src={heroImage}
          alt="Global Logistics"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        {/* Deep Navy gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/90 to-primary" />
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-secondary/5 to-transparent" />
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[100px] animate-float" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl rounded-full px-5 sm:px-6 py-2.5 sm:py-3 mb-6 sm:mb-8 shadow-xl border border-white/20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}>
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-secondary"></span>
            </span>
            <span className="text-xs sm:text-sm text-white font-semibold tracking-wide">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Main Headline */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-extrabold text-white leading-[0.95] mb-5 sm:mb-6 tracking-tight transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Global Logistics
            <span 
              className="block mt-2 sm:mt-3 text-[hsl(45,97%,55%)]"
              style={{ textShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 4px 20px rgba(251, 191, 36, 0.3)' }}
            >
              Delivered With Excellence
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl md:text-2xl text-[hsl(217,21%,90%)] mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-3xl mx-auto px-2 font-medium transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 sm:mb-16 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Button 
              variant="heroPrimary" 
              size="lg" 
              className="w-fit px-8 py-6 text-base font-bold shadow-[0_4px_20px_rgba(255,107,53,0.4)] hover:shadow-[0_8px_30px_rgba(255,107,53,0.5)]" 
              asChild
            >
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            </Button>
            <Button 
              variant="heroSecondary" 
              size="lg" 
              className="w-fit px-8 py-6 text-base font-bold border-2 border-white text-white bg-white/10 hover:bg-white hover:text-primary" 
              asChild
            >
              <Link to="/services">
                <Play size={16} className="mr-2" />
                Our Services
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-8 sm:mt-12 grid grid-cols-3 max-w-3xl mx-auto gap-4 sm:gap-8 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            {[
              { icon: MapPin, text: "150+ Countries", highlight: "Global" },
              { icon: Clock, text: "24/7 Support", highlight: "Always" },
              { icon: Shield, text: "Fully Insured", highlight: "100%" },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center text-center group transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${500 + index * 100}ms` }}
              >
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-secondary/30 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-secondary to-[hsl(24,95%,45%)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <span className="text-secondary font-extrabold text-xs sm:text-sm tracking-wide mb-0.5">
                  {item.highlight}
                </span>
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
