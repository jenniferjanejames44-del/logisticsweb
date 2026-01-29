import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, AlertCircle, CheckCircle2, Plane, Ship, Truck, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useParallax } from "@/hooks/useParallax";

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
  const parallaxOffset = useParallax(0.4);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

  const handleTrackClick = () => {
    if (trackingNumber.length >= 6) {
      navigate(`/track?number=${trackingNumber}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "text-green-600";
      case "in_transit": case "in transit": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "delayed": return "text-red-600";
      default: return "text-muted-foreground";
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80)',
          transform: `translateY(${parallaxOffset}px) scale(1.1)`,
        }}
      />
      
      {/* Blue Gradient Overlay */}
      <div className="absolute inset-0 bg-navy opacity-90" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 pt-28 sm:pt-32 pb-16 md:py-32">
        <div className="max-w-[600px] mx-auto text-center lg:text-left lg:mx-0">
          {/* Main Heading */}
          <h1 className={`mb-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <span className="text-white block font-extrabold">Global Logistics.</span>
            <span className="text-secondary block font-extrabold">Delivered With Excellence.</span>
          </h1>

          {/* Subtitle - Enhanced visibility */}
          <p className={`text-lg sm:text-xl md:text-2xl mb-10 sm:mb-14 leading-relaxed font-semibold transition-all duration-700 delay-100 text-white ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)', letterSpacing: '-0.01em' }}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-10 sm:mb-14 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md group"
            >
              Get Quote
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out bg-white/10 text-white border-2 border-white/40 hover:bg-white/20 hover:border-white/60 hover:-translate-y-0.5 active:translate-y-0 active:bg-white/15 group backdrop-blur-sm"
            >
              Sign Up
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Tracking Card - Enhanced Mobile Design */}
          <div className={`p-5 sm:p-6 md:p-8 transition-all duration-700 delay-300 rounded-2xl border border-white/20 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ 
            background: 'rgba(255, 255, 255, 0.98)', 
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {/* Header with Icon */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div className="w-12 h-12 sm:w-[60px] sm:h-[60px] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg gradient-blue shrink-0 ring-4 ring-accent/10">
                <Search size={20} className="sm:hidden text-white" />
                <Search size={28} className="hidden sm:block text-white" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-primary leading-tight">Track Your Shipment</h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Real-time updates worldwide</p>
              </div>
            </div>
            
            {/* Input and Button - Premium Mobile Design */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTrackClick()}
                placeholder="Enter tracking number"
                className="flex-1 h-12 sm:h-12 px-4 sm:px-4 text-sm font-medium bg-muted border-2 border-border text-foreground placeholder:text-muted-foreground rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <button 
                onClick={handleTrackClick}
                disabled={isLoading}
                className="h-12 sm:h-14 px-6 sm:px-8 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2.5 bg-gradient-to-r from-secondary to-[hsl(38,92%,50%)] text-primary shadow-lg hover:shadow-xl hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 group"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    Track Now
                    <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

            {/* Tracking Result Preview */}
            {(shipmentData || error) && trackingNumber.length >= 6 && (
              <div className="mt-3 sm:mt-4">
                {error ? (
                  <div className="bg-destructive/10 rounded-lg sm:rounded-xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 border border-destructive/30">
                    <AlertCircle size={16} className="sm:w-5 sm:h-5 text-destructive shrink-0" />
                    <span className="text-destructive text-xs sm:text-sm">{error}</span>
                  </div>
                ) : shipmentData && (
                  <div className="bg-muted rounded-lg sm:rounded-xl p-2.5 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-blue rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
                        {(() => {
                          const ServiceIcon = getServiceIcon(shipmentData.service_type);
                          return <ServiceIcon size={14} className="sm:w-[18px] sm:h-[18px] text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-primary font-semibold text-xs sm:text-sm truncate">{shipmentData.tracking_number}</p>
                        <p className={`text-xs sm:text-sm font-medium capitalize ${getStatusColor(shipmentData.status)}`}>
                          {shipmentData.status.replace("_", " ")}
                        </p>
                      </div>
                      {shipmentData.status.toLowerCase() === "delivered" ? (
                        <CheckCircle2 size={14} className="sm:w-[18px] sm:h-[18px] text-green-600 shrink-0" />
                      ) : (
                        <Loader2 size={14} className="sm:w-[18px] sm:h-[18px] text-accent animate-spin shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-accent shrink-0" />
                      <span className="truncate">{shipmentData.origin_city}</span>
                      <ArrowRight size={10} className="sm:w-[14px] sm:h-[14px] text-accent shrink-0" />
                      <span className="truncate">{shipmentData.destination_city}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-1 h-1.5 sm:h-2 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full gradient-blue rounded-full transition-all duration-700"
                          style={{ width: `${getStatusProgress(shipmentData.status)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">
                        {getStatusProgress(shipmentData.status)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
