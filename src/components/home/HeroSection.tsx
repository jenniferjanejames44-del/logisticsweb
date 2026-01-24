import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Plane, Ship, Truck, Package, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Premium Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Clean gradient overlay - no dark area near tracker */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/60" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} />
      </div>

      {/* Animated Floating Icons - Hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <div className="absolute top-[15%] right-[8%] animate-float opacity-15">
          <div className="bg-secondary/20 backdrop-blur-sm rounded-2xl p-4">
            <Plane size={60} className="text-secondary" />
          </div>
        </div>
        <div className="absolute bottom-[20%] right-[25%] animate-float opacity-15" style={{ animationDelay: "2s" }}>
          <div className="bg-secondary/20 backdrop-blur-sm rounded-2xl p-4">
            <Ship size={70} className="text-secondary" />
          </div>
        </div>
        <div className="absolute top-[45%] right-[15%] animate-float opacity-15" style={{ animationDelay: "4s" }}>
          <div className="bg-secondary/20 backdrop-blur-sm rounded-2xl p-4">
            <Truck size={50} className="text-secondary" />
          </div>
        </div>
        <div className="absolute bottom-[35%] right-[5%] animate-float opacity-10" style={{ animationDelay: "3s" }}>
          <div className="bg-secondary/20 backdrop-blur-sm rounded-2xl p-3">
            <Package size={40} className="text-secondary" />
          </div>
        </div>
      </div>

      {/* Glowing orbs for depth - Smaller on mobile */}
      <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 md:w-96 h-32 sm:h-48 md:h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-28 sm:w-40 md:w-80 h-28 sm:h-40 md:h-80 bg-primary/30 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-24 sm:pt-28 md:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 mb-4 sm:mb-6 md:mb-8 animate-fade-in-down">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-secondary"></span>
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/90 font-medium tracking-wide">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Headline with premium typography - Centered */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-primary-foreground leading-[1.1] mb-4 sm:mb-6 md:mb-8 animate-fade-in-up tracking-tight">
            Global Logistics
            <span className="block mt-1 sm:mt-2 md:mt-3 bg-gradient-to-r from-secondary to-[hsl(40,100%,60%)] bg-clip-text text-transparent">
              Delivered With Excellence
            </span>
          </h1>

          {/* Subheadline - Centered */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/80 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in-up font-light px-2" style={{ animationDelay: "0.15s" }}>
            Your trusted partner for seamless shipping solutions. From air freight to ocean cargo, 
            we deliver your goods safely and on time across the globe.
          </p>

          {/* CTA Buttons - Centered */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-5 mb-8 sm:mb-10 md:mb-14 animate-fade-in-up px-4 sm:px-0" style={{ animationDelay: "0.3s" }}>
            <Button variant="cta" size="lg" className="group w-full sm:w-auto text-sm sm:text-base" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-sm sm:text-base" asChild>
              <Link to="/services">
                Our Services
              </Link>
            </Button>
          </div>

          {/* Premium Shipment Tracker - Centered */}
          <div className="glass rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 max-w-xl mx-auto animate-fade-in-up border border-primary-foreground/10" style={{ animationDelay: "0.45s" }}>
            <h3 className="text-primary-foreground font-heading font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-5 flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-secondary rounded-lg md:rounded-xl flex items-center justify-center">
                <Search size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-secondary-foreground" />
              </div>
              Quick Shipment Tracker
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number"
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5"
              />
              <Button variant="cta" size="default" className="px-4 sm:px-6 md:px-8 h-10 sm:h-12 md:h-14 w-full sm:w-auto text-xs sm:text-sm md:text-base">
                Track
              </Button>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/50 mt-2 sm:mt-3 md:mt-4 flex items-center justify-center gap-2">
              <Package size={12} className="sm:w-3.5 sm:h-3.5" />
              Example: RAC-2026-XXXXXX
            </p>
          </div>
        </div>
      </div>

      {/* Premium Scroll Indicator - Hidden on mobile */}

      {/* Premium Scroll Indicator - Hidden on mobile */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:block">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-primary-foreground/50 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-8 h-12 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-3">
            <ChevronDown size={16} className="text-secondary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;