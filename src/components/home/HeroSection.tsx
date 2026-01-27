import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, AlertCircle, CheckCircle2, Plane, Ship, Truck, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-dark">
      {/* Animated Floating Orb */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full animate-float-orb opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.4) 0%, rgba(255, 140, 66, 0.2) 40%, transparent 70%)',
          top: '10%',
          right: '-20%',
        }}
      />
      
      {/* Second Orb */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full animate-float-orb opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 60%)',
          bottom: '10%',
          left: '-10%',
          animationDelay: '-10s',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 pt-20 pb-16 md:py-32">
        <div className="max-w-[600px] mx-auto text-center lg:text-left lg:mx-0">
          {/* Main Heading */}
          <h1 className={`mb-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <span className="text-white block">Global Logistics.</span>
            <span className="gradient-text block">Delivered With Excellence.</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg md:text-xl text-white/80 mb-10 leading-relaxed transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Link 
              to="/pricing"
              className="btn-primary flex items-center justify-center gap-2 group"
            >
              Get Quote
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/contact"
              className="btn-secondary flex items-center justify-center gap-2 group"
            >
              Contact Us
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Tracking Card - Glass Effect */}
          <div className={`glass-card p-6 md:p-8 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center shadow-lg">
                <Search size={22} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg">Track Your Shipment</h3>
                <p className="text-white/60 text-sm">Real-time updates • Instant results</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTrackClick()}
                placeholder="Enter tracking number (e.g., RAC123456)"
                className="flex-1 h-12 px-4 text-base bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
              <button 
                onClick={handleTrackClick}
                disabled={isLoading}
                className="h-12 px-6 btn-primary flex items-center justify-center gap-2 rounded-xl"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Track Now <ArrowRight size={18} /></>
                )}
              </button>
            </div>

            {/* Tracking Result Preview */}
            {(shipmentData || error) && trackingNumber.length >= 6 && (
              <div className="mt-4">
                {error ? (
                  <div className="glass rounded-xl p-4 flex items-center gap-3 border-red-500/30">
                    <AlertCircle size={20} className="text-red-400 shrink-0" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                ) : shipmentData && (
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 gradient-orange rounded-lg flex items-center justify-center">
                        {(() => {
                          const ServiceIcon = getServiceIcon(shipmentData.service_type);
                          return <ServiceIcon size={18} className="text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{shipmentData.tracking_number}</p>
                        <p className={`text-sm font-medium capitalize ${getStatusColor(shipmentData.status)}`}>
                          {shipmentData.status.replace("_", " ")}
                        </p>
                      </div>
                      {shipmentData.status.toLowerCase() === "delivered" ? (
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Loader2 size={18} className="text-secondary animate-spin shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                      <MapPin size={14} className="text-secondary shrink-0" />
                      <span className="truncate">{shipmentData.origin_city}</span>
                      <ArrowRight size={14} className="text-secondary shrink-0" />
                      <span className="truncate">{shipmentData.destination_city}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full gradient-orange rounded-full transition-all duration-700"
                          style={{ width: `${getStatusProgress(shipmentData.status)}%` }}
                        />
                      </div>
                      <span className="text-white/60 text-xs font-medium">
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
