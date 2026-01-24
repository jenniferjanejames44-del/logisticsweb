import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Package, MapPin, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* High-quality Image Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Global Logistics"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        {/* Much lighter overlay - bright and professional */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/50 to-primary/40" />
        {/* Light glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-30" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10 py-28 lg:py-36">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 mb-10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            <span className="text-sm text-white font-bold tracking-wide uppercase">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Massive Hero Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black text-white leading-[0.95] mb-8 tracking-tight">
            Global Logistics
            <span className="block mt-2 sm:mt-4 text-secondary drop-shadow-[0_4px_20px_rgba(255,199,0,0.5)]">
              Delivered With Excellence
            </span>
          </h1>

          {/* Clear, visible subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl text-white font-medium mb-14 leading-relaxed max-w-3xl mx-auto">
            Your trusted partner for seamless shipping solutions. From air freight to ocean cargo, 
            we deliver your goods safely across the globe.
          </p>

          {/* Premium CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
            <Button variant="cta" size="xl" className="group text-lg px-10 py-7 rounded-2xl" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" size={24} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" className="group text-lg px-10 py-7 rounded-2xl" asChild>
              <Link to="/services">
                Explore Services
              </Link>
            </Button>
          </div>

          {/* Premium Glassmorphism Tracker */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto shadow-2xl">
            <h3 className="text-white font-heading font-bold text-2xl mb-8 flex items-center justify-center gap-4">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/30">
                <Search size={26} className="text-secondary-foreground" />
              </div>
              Track Your Shipment
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number"
                className="flex-1 bg-white/15 border-white/30 text-white placeholder:text-white/60 h-16 rounded-2xl text-lg font-medium px-6"
              />
              <Button variant="cta" className="h-16 px-10 text-lg font-bold rounded-2xl">
                Track Now
              </Button>
            </div>
            <p className="text-base text-white/70 mt-6 flex items-center justify-center gap-3 font-medium">
              <Package size={20} />
              Example: RAC-2026-XXXXXX
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { icon: MapPin, text: "150+ Countries" },
              { icon: Clock, text: "24/7 Support" },
              { icon: Shield, text: "Fully Insured" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <item.icon size={24} className="text-secondary" />
                <span className="font-bold text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smooth bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
