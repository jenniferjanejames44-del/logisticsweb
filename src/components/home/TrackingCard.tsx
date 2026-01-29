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
      case "delivered": return "text-emerald-500";
      case "in_transit": case "in transit": return "text-accent";
      case "pending": return "text-secondary";
      case "delayed": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-emerald-500/10 border-emerald-500/20";
      case "in_transit": case "in transit": return "bg-accent/10 border-accent/20";
      case "pending": return "bg-secondary/10 border-secondary/20";
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
      className={`relative transition-all duration-700 delay-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Main Card */}
      <div 
        className={`relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 ${
          isFocused ? "shadow-2xl shadow-accent/20 scale-[1.01]" : "shadow-xl"
        }`}
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl p-[1px] bg-gradient-to-br from-accent/30 via-secondary/20 to-primary/20 -z-10" />
        
        {/* Glow Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-accent/20 via-secondary/20 to-accent/20 rounded-3xl blur-xl transition-opacity duration-500 -z-20 ${
          isFocused ? "opacity-100" : "opacity-0"
        }`} />

        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="relative">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-accent to-accent/80 ring-4 ring-accent/10">
                <Search size={18} className="sm:hidden text-white" />
                <Search size={24} className="hidden sm:block text-white" />
              </div>
              {/* Pulse Animation */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-accent/30 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <h3 className="font-bold text-base sm:text-lg text-primary leading-tight">Track Your Shipment</h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                className={`h-12 sm:h-14 pl-4 pr-12 text-sm sm:text-base font-medium bg-muted/50 border-2 text-foreground placeholder:text-muted-foreground rounded-xl transition-all duration-300 ${
                  isFocused 
                    ? "border-accent ring-4 ring-accent/10 bg-background" 
                    : "border-border hover:border-accent/50"
                }`}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={handleTrackClick}
              disabled={isLoading || trackingNumber.length < 6}
              className="group h-12 sm:h-14 px-6 sm:px-8 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2.5 bg-gradient-to-r from-secondary via-secondary to-[hsl(38,92%,50%)] text-primary shadow-lg hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg uppercase tracking-wide overflow-hidden relative"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10">Track Now</span>
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
            </button>
          </div>

          {/* Results Section */}
          {(shipmentData || error) && trackingNumber.length >= 6 && (
            <div className="mt-4 sm:mt-5 animate-fade-in">
              {error ? (
                <div className="bg-destructive/5 rounded-xl p-3 sm:p-4 flex items-center gap-3 border border-destructive/20">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertCircle size={18} className="text-destructive" />
                  </div>
                  <span className="text-destructive text-sm font-medium">{error}</span>
                </div>
              ) : shipmentData && (
                <div className="bg-muted/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border/50">
                  {/* Shipment Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md shrink-0">
                        {(() => {
                          const ServiceIcon = getServiceIcon(shipmentData.service_type);
                          return <ServiceIcon size={18} className="sm:w-5 sm:h-5 text-white" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-primary font-bold text-sm sm:text-base tracking-wide">{shipmentData.tracking_number}</p>
                        <p className="text-xs text-muted-foreground capitalize">{shipmentData.service_type.replace(/_/g, " ")} Shipping</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusBgColor(shipmentData.status)} ${getStatusColor(shipmentData.status)}`}>
                      {shipmentData.status.replace("_", " ")}
                    </div>
                  </div>
                  
                  {/* Route Display */}
                  <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-background/80 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      <span className="truncate font-medium text-foreground">{shipmentData.origin_city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                      <div className="w-8 h-[2px] bg-gradient-to-r from-accent to-secondary rounded-full" />
                      {(() => {
                        const ServiceIcon = getServiceIcon(shipmentData.service_type);
                        return <ServiceIcon size={14} className="text-accent" />;
                      })()}
                      <div className="w-8 h-[2px] bg-gradient-to-r from-secondary to-accent rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="truncate font-medium text-foreground">{shipmentData.destination_city}</span>
                      <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                    </div>
                  </div>

                  {/* Progress Steps - Mobile Optimized */}
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-5 right-5 h-1 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-1000 ease-out"
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
                          <div key={step.label} className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <div 
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                isActive 
                                  ? "bg-gradient-to-br from-accent to-secondary text-white shadow-lg shadow-accent/30" 
                                  : "bg-muted text-muted-foreground border-2 border-border"
                              } ${isCurrent ? "ring-4 ring-accent/20 scale-110" : ""}`}
                            >
                              <StepIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
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
                    className="mt-4 w-full py-2.5 text-center text-sm font-semibold text-accent hover:text-accent/80 transition-colors flex items-center justify-center gap-2 group"
                  >
                    View Full Details
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
