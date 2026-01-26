import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Package, MapPin, Clock, Shield, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-logistics-video.mp4";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Video Background with Deep Navy Overlay */}
      <div className="absolute inset-0">
        {/* Video background with lazy loading */}
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
        {/* Fallback image with lazy loading */}
        <img
          src={heroImage}
          alt="Global Logistics"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        {/* Deep Navy gradient overlay - Clean solid overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/90 to-primary" />
        {/* Subtle animated accent */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-secondary/5 to-transparent" />
        {/* Animated gradient orbs - more subtle */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[100px] animate-float" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge - Enhanced Glass effect with icon */}
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

          {/* Main Headline - Pure White with enhanced typography */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-extrabold text-white leading-[0.95] mb-5 sm:mb-6 tracking-tight transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Global Logistics
            {/* Subheading - Golden Yellow #FBBF24 for maximum visibility */}
            <span 
              className="block mt-2 sm:mt-3 text-[hsl(45,97%,55%)]"
              style={{ textShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 4px 20px rgba(251, 191, 36, 0.3)' }}
            >
              Delivered With Excellence
            </span>
          </h1>

          {/* Subtitle - Light Gray #E5E7EB for better readability */}
          <p className={`text-lg sm:text-xl md:text-2xl text-[hsl(217,21%,90%)] mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-3xl mx-auto px-2 font-medium transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons - Fixed spacing with w-fit */}
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

          {/* Tracker Card - Premium Glassmorphism */}
          <div className={`relative group max-w-xl mx-auto transition-all duration-700 delay-[400ms] ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}>
            {/* Glow effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary/50 via-secondary/30 to-secondary/50 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {/* Main card */}
            <div className="relative bg-gradient-to-br from-primary/80 via-primary/70 to-primary/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-secondary/30">
              {/* Header */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-secondary rounded-xl sm:rounded-2xl blur-md opacity-50" />
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-secondary to-[hsl(24,95%,45%)] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Search size={22} className="sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-primary-foreground font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl">
                  Track Your Shipment
                </h3>
              </div>
              
              {/* Input section */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-0 bg-primary-foreground/5 rounded-xl sm:rounded-2xl" />
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="relative flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-14 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg px-5 focus:bg-primary-foreground/15 focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all"
                  />
                </div>
                <Button 
                  variant="heroPrimary" 
                  size="lg" 
                  className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgba(255,107,53,0.5)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span className="hidden sm:inline">Track Now</span>
                  <span className="sm:hidden">Track</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              
              {/* Helper text */}
              <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 text-primary-foreground/60">
                <Package size={16} className="text-secondary" />
                <p className="text-sm sm:text-base font-medium">
                  Example: <span className="text-primary-foreground/80 font-semibold">RAC-2026-XXXXXX</span>
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators - Enhanced styling */}
          <div className={`mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-16 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            {[
              { icon: MapPin, text: "150+ Countries", highlight: "Global" },
              { icon: Clock, text: "24/7 Support", highlight: "Always" },
              { icon: Shield, text: "Fully Insured", highlight: "100%" },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 text-white/90 group transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors border border-white/10">
                  <item.icon size={20} className="sm:w-6 sm:h-6 text-secondary" />
                </div>
                <div className="text-left">
                  <span className="block text-xs text-secondary font-semibold">{item.highlight}</span>
                  <span className="font-bold text-sm sm:text-base">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to background - seamless transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
