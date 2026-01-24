import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Plane, Ship, Truck } from "lucide-react";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
      </div>

      {/* Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-10 animate-float opacity-20">
          <Plane size={80} className="text-secondary" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 animate-float opacity-20" style={{ animationDelay: "2s" }}>
          <Ship size={100} className="text-secondary" />
        </div>
        <div className="absolute top-1/2 right-1/3 animate-float opacity-20" style={{ animationDelay: "4s" }}>
          <Truck size={60} className="text-secondary" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-full px-4 py-2 mb-6 animate-fade-in-down">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm text-secondary font-medium">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6 animate-fade-in-up">
            Global Logistics
            <span className="text-secondary block mt-2">Delivered With Excellence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Your trusted partner for seamless shipping solutions. From air freight to ocean cargo, 
            we deliver your goods safely and on time across the globe.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="cta" size="xl" className="group">
              Get Free Quote
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
            <Button variant="heroOutline" size="xl">
              Our Services
            </Button>
          </div>

          {/* Shipment Tracker */}
          <div className="bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-6 max-w-xl animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <h3 className="text-primary-foreground font-heading font-semibold mb-4 flex items-center gap-2">
              <Search size={20} className="text-secondary" />
              Quick Shipment Tracker
            </h3>
            <div className="flex gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number"
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12"
              />
              <Button variant="cta" size="lg" className="px-8">
                Track
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/60 mt-3">
              Example: RAC-2026-XXXXXX
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-secondary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
