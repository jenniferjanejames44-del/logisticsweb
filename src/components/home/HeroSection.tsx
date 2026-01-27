import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, AlertCircle, CheckCircle2, Plane, Ship, Truck, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useParallax } from "@/hooks/useParallax";
import heroVideo from "@/assets/hero-logistics-video.mp4";

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
      case "delivered": return "text-emerald-400";
      case "in_transit": case "in transit": return "text-blue-400";
      case "pending": return "text-amber-400";
      case "delayed": return "text-red-400";
      default: return "text-white/70";
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
      {/* Video Background with Parallax */}
      <div 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ transform: `translateY(${parallaxOffset}px)`, willChange: 'transform' }}
      >
        <video autoPlay muted loop playsInline preload="metadata" className="w-full h-full object-cover">
          <source src={heroVideo} type="video/mp4" />
        </video>
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[hsl(222,47%,4%)]" style={{ opacity: 0.88 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,2%)]/60 via-transparent to-[hsl(222,47%,2%)]/60" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 py-32 md:py-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <span className="text-white">Global Logistics.</span>
            <br />
            <span className="text-secondary">Delivered With Excellence.</span>
          </h1>

          {/* Description */}
          <p className={`text-lg md:text-xl text-white/70 mb-12 leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <Button 
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl bg-secondary text-white hover:scale-[1.02] transition-all duration-300" 
              asChild
            >
              <Link to="/pricing">Get Quote</Link>
            </Button>
            <Button 
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl bg-white text-foreground hover:bg-white/90 hover:scale-[1.02] transition-all duration-300"
              asChild
            >
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>

          {/* Tracking Card - Clean minimal style */}
          <div className={`max-w-xl mx-auto transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Search size={22} className="text-secondary" />
                </div>
                <div className="text-left">
                  <h3 className="text-foreground font-semibold text-lg">Track Your Shipment</h3>
                  <p className="text-muted-foreground text-sm">Real-time updates • Instant results</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackClick()}
                  placeholder="Enter tracking number (e.g., RAC123456)"
                  className="flex-1 h-12 px-4 text-base border-border/50 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                <Button 
                  className="h-12 px-6 text-base font-semibold rounded-xl bg-secondary text-white hover:scale-[1.02] transition-all duration-300"
                  onClick={handleTrackClick}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>Track Now <ArrowRight size={18} className="ml-2" /></>
                  )}
                </Button>
              </div>

              {/* Tracking Result Preview */}
              {(shipmentData || error) && trackingNumber.length >= 6 && (
                <div className="mt-4">
                  {error ? (
                    <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle size={20} className="text-red-500 shrink-0" />
                      <span className="text-red-600 text-sm">{error}</span>
                    </div>
                  ) : shipmentData && (
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          {(() => {
                            const ServiceIcon = getServiceIcon(shipmentData.service_type);
                            return <ServiceIcon size={18} className="text-secondary" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-semibold text-sm truncate">{shipmentData.tracking_number}</p>
                          <p className={`text-sm font-medium capitalize ${getStatusColor(shipmentData.status)}`}>
                            {shipmentData.status.replace("_", " ")}
                          </p>
                        </div>
                        {shipmentData.status.toLowerCase() === "delivered" ? (
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Loader2 size={18} className="text-secondary animate-spin shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin size={14} className="text-secondary shrink-0" />
                        <span className="truncate">{shipmentData.origin_city}</span>
                        <ArrowRight size={14} className="text-secondary shrink-0" />
                        <span className="truncate">{shipmentData.destination_city}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-secondary to-emerald-400 rounded-full transition-all duration-700"
                            style={{ width: `${getStatusProgress(shipmentData.status)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">
                          {getStatusProgress(shipmentData.status)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-16 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            {[
              { value: "5,000+", label: "Shipments Delivered" },
              { value: "150+", label: "Countries Served" },
              { value: "99.8%", label: "On-Time Delivery" },
              { value: "24/7", label: "Customer Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
