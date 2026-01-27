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
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80)',
        }}
      />
      
      {/* Blue Gradient Overlay */}
      <div className="absolute inset-0 bg-navy opacity-90" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 pt-20 pb-16 md:py-32">
        <div className="max-w-[600px] mx-auto text-center lg:text-left lg:mx-0">
          {/* Main Heading */}
          <h1 className={`mb-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <span className="text-white block font-extrabold">Global Logistics.</span>
            <span className="text-secondary block font-extrabold">Delivered With Excellence.</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg md:text-xl mb-8 sm:mb-12 leading-relaxed font-medium transition-all duration-700 delay-100 text-white/90 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            Your trusted partner for seamless shipping solutions across 150+ countries. 
            Fast, secure, and reliable delivery guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-8 sm:mb-16 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <Link 
              to="/pricing"
              className="btn btn-primary"
            >
              Get Quote
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/auth"
              className="btn btn-secondary"
            >
              Sign Up
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Tracking Card */}
          <div className={`p-6 md:p-8 transition-all duration-700 delay-300 rounded-[20px] border-2 border-white/20 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`} style={{ 
            background: 'rgba(255, 255, 255, 0.98)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center shadow-lg gradient-blue">
                <Search size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-primary">Track Your Shipment</h3>
                <p className="text-sm text-muted-foreground">Real-time updates • Instant results</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTrackClick()}
                placeholder="Enter tracking number (e.g., RAC123456)"
                className="flex-1 h-12 px-4 text-base bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button 
                onClick={handleTrackClick}
                disabled={isLoading}
                className="h-14 px-8 btn btn-primary rounded-xl"
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
                  <div className="bg-destructive/10 rounded-xl p-4 flex items-center gap-3 border border-destructive/30">
                    <AlertCircle size={20} className="text-destructive shrink-0" />
                    <span className="text-destructive text-sm">{error}</span>
                  </div>
                ) : shipmentData && (
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 gradient-blue rounded-lg flex items-center justify-center">
                        {(() => {
                          const ServiceIcon = getServiceIcon(shipmentData.service_type);
                          return <ServiceIcon size={18} className="text-white" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-primary font-semibold text-sm truncate">{shipmentData.tracking_number}</p>
                        <p className={`text-sm font-medium capitalize ${getStatusColor(shipmentData.status)}`}>
                          {shipmentData.status.replace("_", " ")}
                        </p>
                      </div>
                      {shipmentData.status.toLowerCase() === "delivered" ? (
                        <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                      ) : (
                        <Loader2 size={18} className="text-accent animate-spin shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin size={14} className="text-accent shrink-0" />
                      <span className="truncate">{shipmentData.origin_city}</span>
                      <ArrowRight size={14} className="text-accent shrink-0" />
                      <span className="truncate">{shipmentData.destination_city}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full gradient-blue rounded-full transition-all duration-700"
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
      </div>
    </section>
  );
};

export default HeroSection;
