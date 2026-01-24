import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Package, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-logistics-video.mp4";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        {/* Subtle pattern overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} />
      </div>

      {/* Glowing orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-40 md:w-80 h-40 md:h-80 bg-primary/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-24 sm:pt-28 md:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 md:mb-8 animate-fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="text-xs sm:text-sm text-primary-foreground/90 font-medium tracking-wide">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Headline with premium typography */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-primary-foreground leading-[1.1] mb-5 md:mb-8 animate-fade-in tracking-tight">
            Global Logistics
            <span className="block mt-2 md:mt-3 bg-gradient-to-r from-secondary to-[hsl(40,100%,60%)] bg-clip-text text-transparent">
              Delivered With Excellence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in font-light px-2">
            Your trusted partner for seamless shipping solutions. From air freight to ocean cargo, 
            we deliver your goods safely and on time across the globe.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10 md:mb-14 animate-fade-in px-4 sm:px-0">
            <Button variant="cta" size="lg" className="group w-full sm:w-auto" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" className="w-full sm:w-auto" asChild>
              <Link to="/services">
                Our Services
              </Link>
            </Button>
          </div>

          {/* Premium Shipment Tracker */}
          <div className="glass rounded-2xl md:rounded-3xl p-5 sm:p-7 md:p-8 max-w-xl mx-auto animate-fade-in border border-primary-foreground/10 shadow-2xl">
            <h3 className="text-primary-foreground font-heading font-bold text-base md:text-lg mb-4 md:mb-5 flex items-center justify-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Search size={16} className="md:w-5 md:h-5 text-secondary-foreground" />
              </div>
              Quick Shipment Tracker
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number"
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12 md:h-14 rounded-xl text-sm md:text-base px-4 md:px-5"
              />
              <Button variant="cta" size="default" className="px-6 md:px-8 h-12 md:h-14 w-full sm:w-auto text-sm md:text-base">
                Track Now
              </Button>
            </div>
            <p className="text-xs md:text-sm text-primary-foreground/50 mt-3 md:mt-4 flex items-center justify-center gap-2">
              <Package size={14} />
              Example: RAC-2026-XXXXXX
            </p>
          </div>
        </div>
      </div>

      {/* Premium Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-primary-foreground/50 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-8 h-12 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-3">
            <ChevronDown size={16} className="text-secondary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
