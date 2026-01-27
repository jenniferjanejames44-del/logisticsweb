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

  return (
    <section className="section-padding gradient-overlay relative overflow-hidden">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="badge-orange mb-6">
            <Package className="w-4 h-4" />
            Quick Shipping
          </span>
          <h2 className="text-white mb-4">
            Create Your <span className="gradient-text">Shipment</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Get started with your shipping in minutes. Fill out the form below and we'll handle the rest.
          </p>
        </div>

        <div className="glass-card max-w-4xl mx-auto overflow-hidden">
          {/* Progress Steps */}
          <div className="glass border-b border-white/10 p-4 sm:p-6">
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              {[
                { num: 1, label: "Route", icon: MapPin },
                { num: 2, label: "Details", icon: Scale },
                { num: 3, label: "Review", icon: CheckCircle2 },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 sm:gap-4">
                  <div className={`flex items-center gap-2 ${step >= s.num ? "text-secondary" : "text-white/40"}`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step >= s.num 
                        ? "gradient-orange text-white" 
                        : "glass text-white/40"
                    }`}>
                      {step > s.num ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : s.num}
                    </div>
                    <span className="hidden sm:block font-medium text-white">{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div className={`w-8 sm:w-16 h-0.5 rounded-full ${step > s.num ? "gradient-orange" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Route */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white font-semibold mb-2">
                        <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        Origin
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-white/70">Country</Label>
                          <Select
                            value={formData.origin_country}
                            onValueChange={(value) => setFormData({ ...formData, origin_country: value })}
                          >
                            <SelectTrigger className="h-12 glass border-white/10 text-white">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="glass border-white/10">
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/70">City</Label>
                          <Input
                            value={formData.origin_city}
                            onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                            placeholder="Enter city"
                            className="h-12 glass border-white/10 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white font-semibold mb-2">
                        <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        Destination
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-white/70">Country</Label>
                          <Select
                            value={formData.destination_country}
                            onValueChange={(value) => setFormData({ ...formData, destination_country: value })}
                          >
                            <SelectTrigger className="h-12 glass border-white/10 text-white">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="glass border-white/10">
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/70">City</Label>
                          <Input
                            value={formData.destination_city}
                            onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                            placeholder="Enter city"
                            className="h-12 glass border-white/10 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="button" 
                      disabled={!isStep1Complete}
                      onClick={() => setStep(2)}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipment Details */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-white/70">
                        <Scale className="w-4 h-4" />
                        Weight (KG)
                      </Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="Enter package weight"
                        className="h-12 glass border-white/10 text-white placeholder:text-white/40"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-white/70">
                        <Truck className="w-4 h-4" />
                        Service Type
                      </Label>
                      <Select
                        value={formData.service_type}
                        onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                      >
                        <SelectTrigger className="h-12 glass border-white/10 text-white">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent className="glass border-white/10">
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.name}</span>
                                <span className="text-white/40 text-xs">({type.description})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-white/70">
                      <FileText className="w-4 h-4" />
                      Description (Optional)
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the contents of your shipment"
                      rows={3}
                      className="resize-none glass border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      disabled={!isStep2Complete}
                      onClick={() => setStep(3)}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      Review
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  <div className="glass rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-lg text-white">Shipment Summary</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="glass rounded-lg p-4">
                        <p className="text-sm text-white/60 mb-1">From</p>
                        <p className="font-semibold text-white">{formData.origin_city}, {formData.origin_country}</p>
                      </div>
                      <div className="glass rounded-lg p-4">
                        <p className="text-sm text-white/60 mb-1">To</p>
                        <p className="font-semibold text-white">{formData.destination_city}, {formData.destination_country}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="glass rounded-lg p-4">
                        <p className="text-sm text-white/60 mb-1">Weight</p>
                        <p className="font-semibold text-white">{formData.weight} KG</p>
                      </div>
                      <div className="glass rounded-lg p-4">
                        <p className="text-sm text-white/60 mb-1">Service</p>
                        <p className="font-semibold text-white capitalize">{formData.service_type.replace("-", " ")}</p>
                      </div>
                    </div>

                    {formData.description && (
                      <div className="glass rounded-lg p-4">
                        <p className="text-sm text-white/60 mb-1">Description</p>
                        <p className="text-white">{formData.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="glass border-secondary/30 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <p className="text-sm text-white/70">
                      By submitting, you agree to our shipping terms. Our team will review your request and set a competitive price.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating..." : "Create Shipment"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShipmentCreationForm;
