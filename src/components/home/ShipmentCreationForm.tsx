import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  MapPin,
  Truck,
  Plane,
  Ship,
  ArrowRight,
  Scale,
  FileText,
  CheckCircle2,
} from "lucide-react";

const countries = [
  "United States", "United Kingdom", "Germany", "France", "China", 
  "Japan", "Australia", "Canada", "Nigeria", "UAE", "Singapore", "India",
  "Brazil", "Mexico", "South Korea", "Italy", "Spain", "Netherlands"
];

const serviceTypes = [
  { id: "air-express", name: "Air Express", icon: Plane, description: "1-3 days" },
  { id: "air-standard", name: "Air Standard", icon: Plane, description: "5-7 days" },
  { id: "ocean-fcl", name: "Ocean FCL", icon: Ship, description: "20-30 days" },
  { id: "ocean-lcl", name: "Ocean LCL", icon: Ship, description: "25-35 days" },
  { id: "road-freight", name: "Road Freight", icon: Truck, description: "3-10 days" },
];

const ShipmentCreationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isFocused, setIsFocused] = useState(false);

  const [formData, setFormData] = useState({
    origin_country: "",
    origin_city: "",
    destination_country: "",
    destination_city: "",
    weight: "",
    service_type: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to create a shipment.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    const estimatedDays = formData.service_type.includes("express") ? 3 : 
                          formData.service_type.includes("ocean") ? 25 : 7;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

    const { error } = await supabase.from("shipments").insert({
      user_id: user.id,
      origin_country: formData.origin_country,
      origin_city: formData.origin_city,
      destination_country: formData.destination_country,
      destination_city: formData.destination_city,
      weight: parseFloat(formData.weight),
      service_type: formData.service_type,
      description: formData.description || null,
      status: "pending",
      estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
      tracking_number: "",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Shipment Created!",
        description: "Your shipment has been created successfully. Check your dashboard for tracking details.",
      });
      setFormData({
        origin_country: "",
        origin_city: "",
        destination_country: "",
        destination_city: "",
        weight: "",
        service_type: "",
        description: "",
      });
      setStep(1);
      navigate("/dashboard/shipments");
    }

    setIsSubmitting(false);
  };

  const isStep1Complete = formData.origin_country && formData.origin_city && formData.destination_country && formData.destination_city;
  const isStep2Complete = formData.weight && formData.service_type;

  const progressSteps = [
    { num: 1, label: "Route", icon: MapPin },
    { num: 2, label: "Details", icon: Scale },
    { num: 3, label: "Review", icon: CheckCircle2 },
  ];

  return (
    <section className="section-padding bg-section-blue relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center mb-12">
          <span className="badge-yellow mb-6">
            <Package className="w-4 h-4" />
            Quick Shipping
          </span>
          <h2 className="text-primary mb-4">
            Create Your <span className="gradient-text">Shipment</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started with your shipping in minutes. Fill out the form below and we'll handle the rest.
          </p>
        </div>

        {/* Premium Card Container */}
        <div 
          className={`relative max-w-4xl mx-auto rounded-2xl overflow-hidden transition-all duration-500 ${
            isFocused ? "shadow-2xl shadow-accent/20" : "shadow-xl"
          }`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent via-secondary to-accent bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite] p-[2px]">
            <div className="absolute inset-[2px] rounded-2xl bg-card" />
          </div>

          {/* Glass overlay */}
          <div className="relative backdrop-blur-xl bg-card/95 rounded-2xl border border-border/50">
            {/* Progress Steps - Premium Design */}
            <div className="bg-gradient-to-r from-muted/80 via-muted to-muted/80 border-b border-border/50 p-5 sm:p-8">
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                {progressSteps.map((s, i) => {
                  const isActive = step >= s.num;
                  const isCurrent = step === s.num;
                  const isComplete = step > s.num;
                  const StepIcon = s.icon;

                  return (
                    <div key={s.num} className="flex items-center gap-2 sm:gap-4">
                      <div className="flex flex-col items-center gap-1.5">
                        {/* Step Circle */}
                        <div 
                          className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? "bg-gradient-to-br from-accent to-secondary text-white shadow-lg shadow-accent/30" 
                              : "bg-muted border-2 border-border text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-accent/20 scale-110" : ""}`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                          
                          {/* Pulse effect for current step */}
                          {isCurrent && (
                            <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
                          )}
                        </div>
                        
                        {/* Step Label */}
                        <span className={`text-xs sm:text-sm font-semibold transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {s.label}
                        </span>
                      </div>

                      {/* Connector Line */}
                      {i < progressSteps.length - 1 && (
                        <div className="relative w-12 sm:w-20 h-1 rounded-full bg-border overflow-hidden mx-1 sm:mx-2">
                          <div 
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-500 ${
                              step > s.num ? "w-full" : "w-0"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8 lg:p-10">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Route */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Origin Card */}
                      <div className="group relative p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-lg text-foreground">Origin</span>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">Country</Label>
                            <Select
                              value={formData.origin_country}
                              onValueChange={(value) => setFormData({ ...formData, origin_country: value })}
                            >
                              <SelectTrigger className="h-12 bg-card border-border text-foreground hover:border-accent/50 transition-colors">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">City</Label>
                            <Input
                              value={formData.origin_city}
                              onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                              placeholder="Enter city"
                              className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent transition-colors"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Destination Card */}
                      <div className="group relative p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold text-lg text-foreground">Destination</span>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">Country</Label>
                            <Select
                              value={formData.destination_country}
                              onValueChange={(value) => setFormData({ ...formData, destination_country: value })}
                            >
                              <SelectTrigger className="h-12 bg-card border-border text-foreground hover:border-accent/50 transition-colors">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm font-medium">City</Label>
                            <Input
                              value={formData.destination_city}
                              onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                              placeholder="Enter city"
                              className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent transition-colors"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Route Visualization */}
                    <div className="flex items-center justify-center gap-3 py-4">
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-accent mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">{formData.origin_city || "Origin"}</span>
                      </div>
                      <div className="flex-1 max-w-32 h-0.5 bg-gradient-to-r from-accent via-secondary to-accent rounded-full" />
                      <Plane className="w-5 h-5 text-accent -rotate-45" />
                      <div className="flex-1 max-w-32 h-0.5 bg-gradient-to-r from-accent via-secondary to-accent rounded-full" />
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-secondary mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">{formData.destination_city || "Destination"}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="button" 
                        disabled={!isStep1Complete}
                        onClick={() => setStep(2)}
                        className="group relative btn btn-primary disabled:opacity-50 uppercase tracking-wide overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Continue
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Shipment Details */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="group p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 hover:border-accent/30 transition-all duration-300">
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Scale className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold">Weight (KG)</span>
                        </Label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="Enter package weight"
                          className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent transition-colors"
                          required
                        />
                      </div>
                      <div className="group p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 hover:border-accent/30 transition-all duration-300">
                        <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Truck className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold">Service Type</span>
                        </Label>
                        <Select
                          value={formData.service_type}
                          onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                        >
                          <SelectTrigger className="h-12 bg-card border-border text-foreground hover:border-accent/50 transition-colors">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {serviceTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4 text-accent" />
                                  <span>{type.name}</span>
                                  <span className="text-muted-foreground text-xs">({type.description})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="group p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 hover:border-accent/30 transition-all duration-300">
                      <Label className="flex items-center gap-2 text-muted-foreground mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent/80 to-secondary/80 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Description (Optional)</span>
                      </Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the contents of your shipment"
                        rows={3}
                        className="resize-none bg-card border-border text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent transition-colors"
                      />
                    </div>

                    <div className="flex justify-between pt-4">
                      <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="btn btn-secondary uppercase tracking-wide"
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        disabled={!isStep2Complete}
                        onClick={() => setStep(3)}
                        className="group btn btn-primary disabled:opacity-50 uppercase tracking-wide"
                      >
                        <span className="flex items-center gap-2">
                          Review
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                    <div className="relative p-6 rounded-xl bg-gradient-to-br from-muted/80 to-muted border border-border/50 overflow-hidden">
                      {/* Decorative background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
                      
                      <h3 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        Shipment Summary
                      </h3>
                      
                      <div className="grid sm:grid-cols-2 gap-4 relative z-10">
                        <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 hover:shadow-md transition-all">
                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> From
                          </p>
                          <p className="font-bold text-foreground">{formData.origin_city}, {formData.origin_country}</p>
                        </div>
                        <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 hover:shadow-md transition-all">
                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> To
                          </p>
                          <p className="font-bold text-foreground">{formData.destination_city}, {formData.destination_country}</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4 relative z-10">
                        <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 hover:shadow-md transition-all">
                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <Scale className="w-3 h-3" /> Weight
                          </p>
                          <p className="font-bold text-foreground">{formData.weight} KG</p>
                        </div>
                        <div className="group bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 hover:shadow-md transition-all">
                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Service
                          </p>
                          <p className="font-bold text-foreground capitalize">{formData.service_type.replace("-", " ")}</p>
                        </div>
                      </div>

                      {formData.description && (
                        <div className="mt-4 group bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 hover:shadow-md transition-all relative z-10">
                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Description
                          </p>
                          <p className="text-foreground">{formData.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-accent/10 via-secondary/10 to-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By submitting, you agree to our shipping terms. Our team will review your request and set a competitive price.
                      </p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button 
                        type="button" 
                        onClick={() => setStep(2)}
                        className="btn btn-secondary uppercase tracking-wide"
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="group btn btn-primary disabled:opacity-50 uppercase tracking-wide"
                      >
                        <span className="flex items-center gap-2">
                          {isSubmitting ? "Creating..." : "Create Shipment"}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShipmentCreationForm;
