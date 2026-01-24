import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Package, MapPin, Clock, Shield, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-logistics.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Teal Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Global Logistics"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Modern teal gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-[hsl(190,80%,35%)]/95" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 shadow-lg">
            <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-secondary"></span>
            </span>
            <span className="text-xs sm:text-sm text-white font-semibold tracking-wide">
              Trusted by 10,000+ Businesses Worldwide
            </span>
          </div>

          {/* Main Headline - Responsive sizing */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-extrabold text-white leading-[0.95] mb-5 sm:mb-6 tracking-tight">
            Global Logistics
            <span className="block mt-2 sm:mt-3 text-secondary drop-shadow-[0_4px_20px_rgba(255,201,71,0.4)]">
              Delivered With Excellence
            </span>
          </h1>

          {/* Subtitle - Good contrast */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-white/90 mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-3xl mx-auto px-2 font-medium">
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 sm:px-0">
            <Button variant="accent" size="xl" className="w-full sm:w-auto text-sm sm:text-base px-8 sm:px-10 py-6 rounded-2xl group shadow-accent-hover" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto text-sm sm:text-base px-8 sm:px-10 py-6 rounded-2xl group" asChild>
              <Link to="/services">
                <Play size={18} className="mr-2" />
                Our Services
              </Link>
            </Button>
          </div>

          {/* Tracker Card - Glassmorphism */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 max-w-xl mx-auto shadow-2xl">
            <h3 className="text-white font-heading font-bold text-lg sm:text-xl lg:text-2xl mb-5 sm:mb-6 flex items-center justify-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded-xl flex items-center justify-center shadow-accent">
                <Search size={20} className="sm:w-6 sm:h-6 text-secondary-foreground" />
              </div>
              Track Your Shipment
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 bg-white/15 border-white/25 text-white placeholder:text-white/60 h-14 sm:h-16 rounded-xl text-base focus:bg-white/20 focus:border-secondary transition-all"
              />
              <Button variant="accent" className="h-14 sm:h-16 px-8 text-base font-bold rounded-xl shadow-accent-hover">
                Track Now
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-4 flex items-center justify-center gap-2">
              <Package size={16} />
              Example: RAC-2026-XXXXXX
            </p>
          </div>

          {/* Trust Indicators - Responsive */}
          <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-16">
            {[
              { icon: MapPin, text: "150+ Countries", highlight: "Global" },
              { icon: Clock, text: "24/7 Support", highlight: "Always" },
              { icon: Shield, text: "Fully Insured", highlight: "100%" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
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

      {/* Bottom fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
