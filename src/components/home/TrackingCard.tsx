import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, AlertCircle, CheckCircle2, Plane, Ship, Truck, MapPin, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

interface TrackingCardProps {
  isVisible: boolean;
}

const TrackingCard = ({ isVisible }: TrackingCardProps) => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

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
      case "delivered": return "text-primary";
      case "in_transit": case "in transit": return "text-primary";
      case "pending": return "text-muted-foreground";
      case "delayed": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-primary/10 border-primary/20";
      case "in_transit": case "in transit": return "bg-primary/10 border-primary/20";
      case "pending": return "bg-muted border-border";
      case "delayed": return "bg-destructive/10 border-destructive/20";
      default: return "bg-muted border-border";
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

  const progressSteps = [
    { label: "Picked Up", icon: Package },
    { label: "In Transit", icon: Truck },
    { label: "Out for Delivery", icon: MapPin },
    { label: "Delivered", icon: CheckCircle2 },
  ];

  const getActiveStep = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return 4;
      case "in_transit": case "in transit": return 2;
      case "processing": return 1;
      case "pending": return 0;
      default: return 0;
    }
  };

  return (
    <div 
      className={`relative transition-all duration-500 delay-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Main Card */}
      <div 
        className={`relative rounded-xl overflow-hidden transition-all duration-300 bg-background border border-border ${
          isFocused ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-accent">
              <Search size={18} className="sm:hidden text-accent-foreground" />
              <Search size={20} className="hidden sm:block text-accent-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">Track Your Shipment</h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Real-time updates worldwide
              </p>
            </div>
          </div>
          
          {/* Input Group */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTrackClick()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter tracking number"
                className={`h-11 sm:h-12 pl-4 pr-12 text-sm font-medium bg-muted/50 border text-foreground placeholder:text-muted-foreground rounded-lg transition-all duration-200 ${
                  isFocused 
                    ? "border-primary ring-2 ring-primary/10 bg-background" 
                    : "border-border hover:border-primary/50"
                }`}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={handleTrackClick}
              disabled={isLoading || trackingNumber.length < 6}
              className="h-11 sm:h-12 px-6 font-bold text-sm rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 active:scale-[0.98]"
            >
              Track Now
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Results Section */}
          {(shipmentData || error) && trackingNumber.length >= 6 && (
            <div className="mt-4 animate-fade-in-up">
              {error ? (
                <div className="bg-destructive/5 rounded-lg p-3 flex items-center gap-3 border border-destructive/20">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} className="text-destructive" />
                  </div>
                  <span className="text-destructive text-sm font-medium">{error}</span>
                </div>
              ) : shipmentData && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  {/* Shipment Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        {(() => {
                          const ServiceIcon = getServiceIcon(shipmentData.service_type);
                          return <ServiceIcon size={18} className="text-primary-foreground" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-semibold text-sm tracking-wide">{shipmentData.tracking_number}</p>
                        <p className="text-xs text-muted-foreground capitalize">{shipmentData.service_type.replace(/_/g, " ")} Shipping</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusBgColor(shipmentData.status)} ${getStatusColor(shipmentData.status)}`}>
                      {shipmentData.status.replace("_", " ")}
                    </div>
                  </div>
                  
                  {/* Route Display */}
                  <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="truncate font-medium text-foreground">{shipmentData.origin_city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                      <div className="w-6 h-[2px] bg-primary rounded-full" />
                      {(() => {
                        const ServiceIcon = getServiceIcon(shipmentData.service_type);
                        return <ServiceIcon size={14} className="text-primary" />;
                      })()}
                      <div className="w-6 h-[2px] bg-primary rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="truncate font-medium text-foreground">{shipmentData.destination_city}</span>
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${getStatusProgress(shipmentData.status)}%` }}
                      />
                    </div>
                    
                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {progressSteps.map((step, index) => {
                        const activeStep = getActiveStep(shipmentData.status);
                        const isActive = index < activeStep;
                        const isCurrent = index === activeStep - 1;
                        const StepIcon = step.icon;
                        
                        return (
                          <div key={step.label} className="flex flex-col items-center gap-1.5">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isActive 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted text-muted-foreground border border-border"
                              } ${isCurrent ? "ring-2 ring-primary/20 scale-110" : ""}`}
                            >
                              <StepIcon size={14} />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
                              isActive ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Details Link */}
                  <button 
                    onClick={handleTrackClick}
                    className="mt-4 w-full py-2 text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2"
                  >
                    View Full Details
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingCard;
