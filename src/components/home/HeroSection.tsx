import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Plane, Ship, Truck, Package, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Premium Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-transparent to-primary/80" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} />
      </div>

      {/* Animated Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {/* Glowing orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10 pt-24">
        <div className="max-w-4xl">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in-down">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="text-sm text-primary-foreground/90 font-medium tracking-wide">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Headline with premium typography */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-primary-foreground leading-[1.1] mb-8 animate-fade-in-up tracking-tight">
            Global Logistics
            <span className="block mt-3 bg-gradient-to-r from-secondary to-[hsl(40,100%,60%)] bg-clip-text text-transparent">
              Delivered With Excellence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 leading-relaxed max-w-2xl animate-fade-in-up font-light" style={{ animationDelay: "0.15s" }}>
            Your trusted partner for seamless shipping solutions. From air freight to ocean cargo, 
            we deliver your goods safely and on time across the globe.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-5 mb-14 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="cta" size="xl" className="group" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={20} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/services">
                Our Services
              </Link>
            </Button>
          </div>

          {/* Premium Shipment Tracker */}
          <div className="glass rounded-3xl p-8 max-w-xl animate-fade-in-up border border-primary-foreground/10" style={{ animationDelay: "0.45s" }}>
            <h3 className="text-primary-foreground font-heading font-bold text-lg mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Search size={20} className="text-secondary-foreground" />
              </div>
              Quick Shipment Tracker
            </h3>
            <div className="flex gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter your tracking number"
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-14 rounded-xl text-base px-5"
              />
              <Button variant="cta" size="lg" className="px-8 h-14">
                Track
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/50 mt-4 flex items-center gap-2">
              <Package size={14} />
              Example: RAC-2026-XXXXXX
            </p>
          </div>
        </div>
      </div>

      {/* Premium Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
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