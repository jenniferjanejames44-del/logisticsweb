import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "@/hooks/useInView";
import ShipmentTimeline from "@/components/shipments/ShipmentTimeline";
import StatusBadge from "@/components/shipments/StatusBadge";
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plane,
  Ship,
  Truck,
  ArrowRight,
  Bell,
  Copy,
  Share2,
  Mail,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface ShipmentData {
  id: string;
  tracking_number: string;
  status: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  service_type: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  created_at: string;
  updated_at: string;
  weight: number;
  description: string | null;
}



const emailSchema = z.string().email("Please enter a valid email address");

const Track = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("number") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const { toast } = useToast();
  
  // Email notification state
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Reset subscription state when tracking number changes
  useEffect(() => {
    setIsSubscribed(false);
    setNotifyEmail("");
    setEmailError(null);
  }, [trackingNumber]);

  // Real-time subscription for shipment updates
  useEffect(() => {
    if (!shipment) return;

    const channel = supabase
      .channel(`shipment-${shipment.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${shipment.id}`,
        },
        (payload) => {
          console.log('Shipment updated:', payload);
          setShipment(payload.new as ShipmentData);
          toast({
            title: "Shipment Updated!",
            description: `Status changed to: ${(payload.new as ShipmentData).status.replace("_", " ")}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipment?.id, toast]);

  // Auto-search if tracking number is in URL
  useEffect(() => {
    const number = searchParams.get("number");
    if (number) {
      setTrackingNumber(number);
      searchShipment(number);
    }
  }, [searchParams]);

  const searchShipment = async (number?: string) => {
    const searchNumber = number || trackingNumber;
    
    if (!searchNumber || searchNumber.length < 6) {
      setError("Please enter a valid tracking number (at least 6 characters)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setShipment(null);

    const { data, error: fetchError } = await supabase
      .from("shipments")
      .select("*")
      .ilike("tracking_number", `%${searchNumber}%`)
      .limit(1)
      .maybeSingle();

    setIsLoading(false);

    if (fetchError) {
      setError("Unable to search. Please try again later.");
    } else if (data) {
      setShipment(data);
      setSearchParams({ number: data.tracking_number });
    } else {
      setError("No shipment found with this tracking number. Please check and try again.");
    }
  };



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "success";
      case "in_transit": case "in transit": return "info";
      case "out_for_delivery": return "info";
      case "processing": return "warning";
      case "pending": return "warning";
      case "delayed": return "error";
      default: return "secondary";
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case "air": case "air_freight": case "air-express": case "air-standard": return Plane;
      case "ocean": case "sea_freight": case "ocean-fcl": case "ocean-lcl": return Ship;
      default: return Truck;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const copyTrackingNumber = () => {
    if (shipment) {
      navigator.clipboard.writeText(shipment.tracking_number);
      toast({
        title: "Copied!",
        description: "Tracking number copied to clipboard",
      });
    }
  };

  const shareTracking = () => {
    if (shipment && navigator.share) {
      navigator.share({
        title: `Shipment ${shipment.tracking_number}`,
        text: `Track shipment: ${shipment.tracking_number}`,
        url: window.location.href,
      });
    } else if (shipment) {
      copyTrackingNumber();
      toast({
        title: "Link Copied!",
        description: "Tracking link copied to clipboard",
      });
    }
  };

  const handleEmailSubscribe = async () => {
    if (!shipment) return;
    
    // Validate email
    const result = emailSchema.safeParse(notifyEmail);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }
    
    setEmailError(null);
    setIsSubscribing(true);
    
    try {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from("shipment_notifications")
        .select("id, is_active")
        .eq("tracking_number", shipment.tracking_number)
        .eq("email", notifyEmail)
        .maybeSingle();
      
      if (existing) {
        if (!existing.is_active) {
          // Reactivate subscription
          await supabase
            .from("shipment_notifications")
            .update({ is_active: true })
            .eq("id", existing.id);
        }
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from("shipment_notifications")
          .insert({
            tracking_number: shipment.tracking_number,
            email: notifyEmail,
          });
        
        if (insertError) throw insertError;
      }
      
      setIsSubscribed(true);
      toast({
        title: "Subscribed!",
        description: `You'll receive updates at ${notifyEmail}`,
      });
    } catch (err) {
      console.error("Subscription error:", err);
      toast({
        title: "Subscription Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const ServiceIcon = shipment ? getServiceIcon(shipment.service_type) : Package;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
	        {/* Hero Section */}
	        <section ref={heroRef} className="page-hero">
	          {/* Background Image */}
	          <div 
	            className="page-hero-media"
	            style={{
	              backgroundImage: 'url(https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80)',
	            }}
	          />
	          <div className="page-hero-overlay" />
          
	          <div className="section-container relative z-10">
	            <div className={`page-hero-shell transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
	              <span className="page-hero-badge mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                Real-Time Tracking
              </span>
              <h1 className="text-white mb-6 leading-tight">
                Track Your{" "}
                <span className="text-accent">Shipment</span>
              </h1>
	              <p className="hero-subtext mb-6 max-w-2xl mx-auto text-base leading-relaxed md:text-lg sm:mb-8">
                Enter your tracking number to get real-time updates on your shipment's location and delivery status.
              </p>

		              {/* Tracking Card */}
		              <div className="relative max-w-2xl mx-auto">
		                <div className="relative rounded-[26px] border border-border/70 bg-card p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
		                  {/* Header */}
			                  <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8 sm:gap-4">
			                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_14px_32px_rgba(6,16,67,0.32)] sm:h-14 sm:w-14">
                      <Search size={22} className="sm:w-6 sm:h-6 text-accent-foreground" />
                    </div>
                    <h3 className="text-foreground sm:text-[1.625rem]">
                      Track Your Shipment
                    </h3>
                  </div>
                  
		                  {/* Input section */}
			                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
		                        <div className="relative flex-1">
		                          <Input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && searchShipment()}
                        placeholder="Enter tracking number"
                        className="h-12 rounded-lg px-5 text-base sm:h-14"
                      />
                    </div>
			                        <button 
				                      className="button-balance-mobile flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-[22px] text-base font-semibold text-accent-foreground shadow-[0_14px_32px_rgba(223,81,1,0.3)] transition-all duration-200 hover:-translate-y-px hover:brightness-[1.03] disabled:opacity-50 active:scale-[0.98] sm:h-14 sm:px-10"
                      onClick={() => searchShipment()}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <span className="hidden sm:inline">Track Now</span>
                          <span className="sm:hidden">Track</span>
                          <ArrowRight className="ml-1 w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Helper text */}
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mt-5 sm:mt-6">
                    <Package size={16} className="text-accent" />
                    <p className="text-sm font-medium">
                      Example: <span className="text-foreground font-semibold">RAC + tracking ID</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="section-padding">
          <div className="section-container">
            {/* Error State */}
            {error && !isLoading && (
              <Card className="mx-auto max-w-2xl border-destructive/40 bg-destructive/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <CardContent className="flex items-center gap-4 p-6">
                  <AlertCircle className="text-destructive shrink-0" size={24} />
                  <div>
                    <h3 className="font-semibold text-foreground">Tracking Not Found</h3>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Searching for your shipment...</p>
              </div>
            )}

            {/* Shipment Found */}
            {shipment && !isLoading && (
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Card */}
                <Card className="overflow-hidden border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <div className="bg-primary p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
                          <ServiceIcon className="text-accent-foreground" size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-heading font-bold text-xl text-primary-foreground">
                              {shipment.tracking_number}
                            </h2>
                            <button onClick={copyTrackingNumber} className="text-primary-foreground/60 hover:text-accent transition-colors">
                              <Copy size={16} />
                            </button>
                          </div>
                          <Badge variant={getStatusColor(shipment.status) as any} className="capitalize">
                            {shipment.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
	                        <Button variant="outline" size="sm" onClick={shareTracking}>
                          <Share2 size={16} className="mr-2" />
                          Share
                        </Button>
	                        <Button variant="outline" size="sm">
                          <Bell size={16} className="mr-2" />
                          Notify Me
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 sm:p-8">
                    {/* Route */}
                    <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-5">
                      <div className="text-center flex-1">
                        <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="font-semibold text-foreground">{shipment.origin_city}</p>
                        <p className="text-sm text-muted-foreground">{shipment.origin_country}</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-primary/30 relative">
                          <ServiceIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-muted p-1.5 rounded-full text-primary" size={32} />
                        </div>
                      </div>
                      <div className="text-center flex-1">
                        <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="font-semibold text-foreground">{shipment.destination_city}</p>
                        <p className="text-sm text-muted-foreground">{shipment.destination_country}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-8">
                      <h3 className="mb-6 text-lg text-foreground">Tracking Timeline</h3>
                      <ShipmentTimeline
                        currentStatus={shipment.status}
                        createdAt={shipment.created_at}
                        updatedAt={shipment.updated_at}
                      />
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border border-border bg-background p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                        <Calendar className="w-5 h-5 text-accent mb-2" />
                        <p className="text-sm text-muted-foreground">Shipped Date</p>
                        <p className="font-semibold text-foreground">{formatDate(shipment.created_at)}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                        <Clock className="w-5 h-5 text-accent mb-2" />
                        <p className="text-sm text-muted-foreground">Est. Delivery</p>
                        <p className="font-semibold text-foreground">{formatDate(shipment.estimated_delivery)}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                        <Package className="w-5 h-5 text-accent mb-2" />
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-semibold text-foreground">{shipment.weight} KG</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                        <ServiceIcon className="w-5 h-5 text-accent mb-2" />
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-semibold text-foreground capitalize">{shipment.service_type.replace("_", " ")}</p>
                      </div>
                    </div>

                    {shipment.description && (
                      <div className="mt-6 rounded-lg border border-border bg-muted/30 p-5">
                        <p className="text-sm text-muted-foreground mb-1">Package Description</p>
                        <p className="text-foreground">{shipment.description}</p>
                      </div>
                    )}

                    {/* Email Notification Signup */}
                    <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-5 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                          <Bell className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-foreground">Get Status Updates</h4>
                          <p className="text-sm text-muted-foreground">Receive email notifications when your shipment status changes</p>
                        </div>
                      </div>
                      
                      {isSubscribed ? (
                        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4">
                          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">You're subscribed!</p>
                            <p className="text-sm text-muted-foreground">We'll notify you at {notifyEmail}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={notifyEmail}
                                onChange={(e) => {
                                  setNotifyEmail(e.target.value);
                                  setEmailError(null);
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleEmailSubscribe()}
                                className={`h-12 rounded-lg pl-12 ${emailError ? 'border-destructive focus:ring-destructive/20' : ''}`}
                              />
                            </div>
                            <Button
                              variant="cta"
                              onClick={handleEmailSubscribe}
                              disabled={isSubscribing || !notifyEmail}
                              className="h-12 rounded-lg px-6"
                            >
                              {isSubscribing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Bell className="w-4 h-4 mr-2" />
                                  Notify Me
                                </>
                              )}
                            </Button>
                          </div>
                          {emailError && (
                            <p className="text-sm text-destructive flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" />
                              {emailError}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            We'll only send you important updates about this shipment. Unsubscribe anytime.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Help Section */}
                <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <CardContent className="p-6 text-center">
                    <h3 className="mb-2 text-lg text-foreground">Need Help?</h3>
                    <p className="text-muted-foreground mb-4">
                      Our support team is available 24/7 to assist you with any questions.
                    </p>
	                    <div className="cta-actions">
                      <Button variant="cta" asChild>
                        <a href="/contact">Contact Support</a>
                      </Button>
                      <Button variant="outline">
                        Start Live Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!shipment && !error && !isLoading && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  Track Your Shipment
                </h3>
                <p className="text-muted-foreground mb-6">
                  Enter your tracking number above to get real-time updates on your package.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Badge variant="outline" className="px-4 py-2">Real-time updates</Badge>
                  <Badge variant="outline" className="px-4 py-2">Email notifications</Badge>
                  <Badge variant="outline" className="px-4 py-2">Delivery proof</Badge>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Track;
