import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Package, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Static Image Background - Premium & Professional */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Global Logistics"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Refined overlay - lighter, more professional */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10 py-32 lg:py-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="text-sm text-white font-semibold tracking-wide">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Headline - Strong, confident typography */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
            Global Logistics
            <span className="block mt-3 text-secondary drop-shadow-lg">
              Delivered With Excellence
            </span>
          </h1>

          {/* Subheadline - Clear visibility, good contrast */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Your trusted partner for seamless shipping solutions. From air freight to ocean cargo, 
            we deliver your goods safely and on time across the globe.
          </p>

          {/* CTA Buttons - Premium styling */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button variant="cta" size="xl" className="group text-base" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" className="group text-base" asChild>
              <Link to="/services">
                <Play size={18} className="mr-2" />
                Our Services
              </Link>
            </Button>
          </div>

          {/* Tracker Card - Glassmorphism effect */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl">
            <h3 className="text-white font-heading font-bold text-xl mb-6 flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Search size={22} className="text-secondary-foreground" />
              </div>
              Track Your Shipment
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-14 rounded-xl text-base font-medium"
              />
              <Button variant="cta" className="h-14 px-8 text-base font-bold">
                Track Now
              </Button>
            </div>
            <p className="text-sm text-white/60 mt-5 flex items-center justify-center gap-2 font-medium">
              <Package size={16} />
              Example: RAC-2026-XXXXXX
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
