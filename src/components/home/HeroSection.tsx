import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MapPin, Clock, Shield, Search, UserPlus, Package, Loader2, AlertCircle, CheckCircle2, Plane, Ship, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import heroVideo from "@/assets/hero-logistics-video.mp4";
import heroImage from "@/assets/hero-logistics.jpg";

interface ShipmentData {
  tracking_number: string;
  status: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  service_type: string;
  estimated_delivery: string | null;
  updated_at: string;
}

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Debounced search for tracking number
  useEffect(() => {
    const searchShipment = async () => {
      if (trackingNumber.length < 6) {
        setShipmentData(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("shipments")
        .select("tracking_number, status, origin_city, origin_country, destination_city, destination_country, service_type, estimated_delivery, updated_at")
        .ilike("tracking_number", `%${trackingNumber}%`)
        .limit(1)
        .maybeSingle();

      setIsLoading(false);

      if (fetchError) {
        setError("Unable to search. Please try again.");
        setShipmentData(null);
      } else if (data) {
        setShipmentData(data);
        setError(null);
      } else {
        setShipmentData(null);
        setError(trackingNumber.length >= 8 ? "No shipment found with this tracking number" : null);
      }
    };

    const debounceTimer = setTimeout(searchShipment, 500);
    return () => clearTimeout(debounceTimer);
  }, [trackingNumber]);

  const handleSignUpClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "text-emerald-400";
      case "in_transit": case "in transit": return "text-blue-400";
      case "pending": return "text-amber-400";
      case "delayed": return "text-red-400";
      default: return "text-primary-foreground/70";
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return 100;
      case "in_transit": case "in transit": return 75;
      case "processing": return 50;
      case "pending": return 25;
      default: return 10;
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case "air": case "air_freight": case "air-express": case "air-standard": return Plane;
      case "ocean": case "sea_freight": case "ocean-fcl": case "ocean-lcl": return Ship;
      default: return Truck;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const handleTrackClick = () => {
    if (trackingNumber.length >= 6) {
      navigate(`/track?number=${trackingNumber}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
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
              onClick={handleSignUpClick}
            >
              <UserPlus size={16} className="mr-2" />
              {user ? "Go to Dashboard" : "Sign Up"}
            </Button>
          </div>

          {/* Premium Glassmorphism Tracking Card - Enhanced */}
          <div className={`relative group max-w-2xl mx-auto transition-all duration-700 delay-[400ms] ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}>
            {/* Multi-layer glow effects */}
            <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-secondary/30 via-[hsl(45,97%,55%)]/40 to-secondary/30 rounded-[2.5rem] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse-slow" />
            <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-br from-secondary/50 to-[hsl(24,95%,45%)]/50 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            
            {/* Main card with enhanced styling */}
            <div className="relative bg-gradient-to-br from-[hsl(230,45%,16%)] via-[hsl(230,40%,12%)] to-[hsl(230,45%,8%)] backdrop-blur-3xl rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.5)] border-2 border-secondary/30 overflow-hidden">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-secondary/20 to-transparent rounded-br-full" />
              <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-tl from-secondary/15 to-transparent rounded-tl-full" />
              
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-[2rem] p-[2px] bg-gradient-to-r from-secondary/0 via-secondary/50 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header with enhanced icon */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="relative">
                    {/* Animated glow ring */}
                    <div className="absolute inset-0 bg-secondary rounded-2xl blur-xl opacity-60 animate-pulse" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-[hsl(45,97%,55%)] rounded-2xl opacity-40 blur-lg" />
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary via-[hsl(24,95%,50%)] to-[hsl(45,97%,55%)] rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                      <Search size={24} className="sm:w-7 sm:h-7 text-primary-foreground drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-primary-foreground font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                      Track Your Shipment
                    </h3>
                    <p className="text-primary-foreground/60 text-sm sm:text-base mt-1 hidden sm:block">
                      Real-time updates • Instant results
                    </p>
                  </div>
                </div>
                
                {/* Input section with enhanced styling */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative group/input">
                    {/* Input glow on focus */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-secondary/30 to-[hsl(45,97%,55%)]/30 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300" />
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleTrackClick()}
                      placeholder="Enter your tracking number (e.g., RAC123456)"
                      className="relative w-full bg-primary-foreground/10 border-2 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-14 sm:h-16 lg:h-18 rounded-xl sm:rounded-2xl text-base sm:text-lg lg:text-xl px-5 sm:px-6 focus:bg-primary-foreground/15 focus:border-secondary focus:ring-4 focus:ring-secondary/20 transition-all duration-300"
                    />
                    {/* Search icon inside input on mobile */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:hidden">
                      <Search size={20} className="text-primary-foreground/40" />
                    </div>
                  </div>
                  
                  <Button 
                    variant="heroPrimary" 
                    size="lg" 
                    className="h-14 sm:h-16 lg:h-18 px-8 sm:px-12 text-base sm:text-lg lg:text-xl font-bold rounded-xl sm:rounded-2xl shadow-[0_10px_40px_rgba(255,107,53,0.5)] hover:shadow-[0_15px_50px_rgba(255,107,53,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-secondary via-[hsl(24,95%,50%)] to-secondary bg-[length:200%_100%] hover:bg-right"
                    onClick={handleTrackClick}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <span className="flex items-center justify-center gap-2 sm:gap-3">
                        <span>Track Now</span>
                        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>

                {/* Tracking Status Preview - Real Data */}
                <div className={`overflow-hidden transition-all duration-500 ease-out ${
                  (shipmentData || error || isLoading) && trackingNumber.length >= 6 
                    ? "max-h-56 opacity-100 mt-5 sm:mt-6" 
                    : "max-h-0 opacity-0 mt-0"
                }`}>
                  {isLoading ? (
                    <div className="bg-primary-foreground/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-primary-foreground/10 flex items-center justify-center gap-3">
                      <Loader2 size={22} className="text-secondary animate-spin" />
                      <span className="text-primary-foreground/70 font-medium text-base sm:text-lg">Searching...</span>
                    </div>
                  ) : error ? (
                    <div className="bg-red-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-red-500/20 flex items-center gap-3">
                      <AlertCircle size={22} className="text-red-400 shrink-0" />
                      <span className="text-red-300 text-sm sm:text-base">{error}</span>
                    </div>
                  ) : shipmentData ? (
                    <div className="bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-primary-foreground/15">
                      {/* Shipment Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl flex items-center justify-center">
                          {(() => {
                            const ServiceIcon = getServiceIcon(shipmentData.service_type);
                            return <ServiceIcon size={20} className="text-secondary" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-primary-foreground font-bold text-base sm:text-lg truncate">
                            {shipmentData.tracking_number}
                          </p>
                          <p className={`text-sm sm:text-base font-semibold capitalize ${getStatusColor(shipmentData.status)}`}>
                            {shipmentData.status.replace("_", " ")}
                          </p>
                        </div>
                        {shipmentData.status.toLowerCase() !== "delivered" && (
                          <Loader2 size={20} className="text-secondary animate-spin shrink-0" />
                        )}
                        {shipmentData.status.toLowerCase() === "delivered" && (
                          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                        )}
                      </div>

                      {/* Route Info */}
                      <div className="flex items-center gap-2 text-sm sm:text-base text-primary-foreground/70 mb-3">
                        <MapPin size={14} className="text-secondary shrink-0" />
                        <span className="font-medium truncate">{shipmentData.origin_city}</span>
                        <ArrowRight size={14} className="text-secondary shrink-0" />
                        <span className="font-medium truncate">{shipmentData.destination_city}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-2.5 sm:h-3 bg-primary-foreground/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-secondary via-[hsl(45,97%,55%)] to-emerald-400 rounded-full transition-all duration-700 relative"
                            style={{ width: `${getStatusProgress(shipmentData.status)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                          </div>
                        </div>
                        <span className="text-primary-foreground/70 text-sm font-bold min-w-[45px] text-right">
                          {getStatusProgress(shipmentData.status)}%
                        </span>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <p className="text-primary-foreground/50 flex items-center gap-1.5">
                          <Clock size={14} className="text-secondary" />
                          Updated {formatTimeAgo(shipmentData.updated_at)}
                        </p>
                        {shipmentData.estimated_delivery && (
                          <p className="text-primary-foreground/50">
                            ETA: <span className="text-primary-foreground/70 font-medium">
                              {new Date(shipmentData.estimated_delivery).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                
                {/* Helper text with animation */}
                <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-primary-foreground/50 transition-all duration-300 ${
                  shipmentData || error || isLoading ? "mt-4" : "mt-5 sm:mt-6"
                }`}>
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-secondary" />
                    <p className="text-sm sm:text-base font-medium">
                      Enter: <span className="text-primary-foreground/70 font-semibold">RAC + tracking ID</span>
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <span className="w-1 h-1 bg-secondary/50 rounded-full" />
                    <span>Instant results</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-14 sm:mt-20 grid grid-cols-3 max-w-3xl mx-auto gap-4 sm:gap-8 transition-all duration-700 delay-500 ${
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
                style={{ transitionDelay: `${600 + index * 100}ms` }}
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
