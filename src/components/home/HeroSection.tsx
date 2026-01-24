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
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Global Logistics"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Clean gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/75 to-primary/90" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-secondary"></span>
            </span>
            <span className="text-xs sm:text-sm text-white font-semibold">
              Trusted by 10,000+ Businesses
            </span>
          </div>

          {/* Main Headline - Responsive sizing */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-white leading-tight mb-4 sm:mb-6">
            Global Logistics
            <span className="block mt-1 sm:mt-2 text-secondary">
              Delivered With Excellence
            </span>
          </h1>

          {/* Subtitle - Good contrast */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-2xl mx-auto px-2">
            Your trusted partner for seamless shipping solutions. We deliver your goods safely across the globe.
          </p>

          {/* CTA Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 lg:mb-16 px-4 sm:px-0">
            <Button variant="cta" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-xl group" asChild>
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-xl" asChild>
              <Link to="/services">
                Our Services
              </Link>
            </Button>
          </div>

          {/* Tracker Card - Responsive */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 max-w-xl mx-auto">
            <h3 className="text-white font-heading font-bold text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Search size={18} className="sm:w-5 sm:h-5 text-secondary-foreground" />
              </div>
              Track Your Shipment
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 sm:h-14 rounded-xl text-sm sm:text-base"
              />
              <Button variant="cta" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl">
                Track Now
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-white/60 mt-4 flex items-center justify-center gap-2">
              <Package size={14} className="sm:w-4 sm:h-4" />
              Example: RAC-2026-XXXXXX
            </p>
          </div>

          {/* Trust Indicators - Responsive */}
          <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-12">
            {[
              { icon: MapPin, text: "150+ Countries" },
              { icon: Clock, text: "24/7 Support" },
              { icon: Shield, text: "Fully Insured" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-white/80">
                <item.icon size={18} className="sm:w-5 sm:h-5 text-secondary" />
                <span className="font-semibold text-sm sm:text-base">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
