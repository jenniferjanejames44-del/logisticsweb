import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, MapPin, Scale, ArrowRight, DollarSign } from "lucide-react";

const countries = [
  "United States", "United Kingdom", "Germany", "France", "China",
  "Japan", "Australia", "Canada", "Nigeria", "UAE", "Singapore", "India",
  "Brazil", "Mexico", "South Korea", "Italy", "Spain", "Netherlands"
];

interface RoutePrice {
  origin_country: string;
  destination_country: string;
  price_per_kg: number;
}

const ShipmentEntrySection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [routePrices, setRoutePrices] = useState<RoutePrice[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const { data } = await supabase
        .from("shipping_routes")
        .select("origin_country, destination_country, price_per_kg")
        .eq("is_active", true);
      if (data) setRoutePrices(data);
    };
    fetchRoutes();
  }, []);

  const estimatedCost = useMemo(() => {
    const w = parseFloat(weight);
    if (!origin || !destination || !w || w <= 0) return null;
    const route = routePrices.find(
      (r) => r.origin_country === origin && r.destination_country === destination
    );
    if (!route) return null;
    return Number(route.price_per_kg) * w;
  }, [origin, destination, weight, routePrices]);

  const handleContinue = () => {
    if (!user) {
      // Save form data to localStorage so it persists through login
      const params = new URLSearchParams();
      if (origin) params.set("origin", origin);
      if (destination) params.set("destination", destination);
      if (weight) params.set("weight", weight);
      localStorage.setItem("pending_shipment_redirect", `/shipping?${params.toString()}`);
      navigate("/auth");
      return;
    }
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (weight) params.set("weight", weight);
    navigate(`/shipping?${params.toString()}`);
  };

  const isComplete = origin && destination && weight && parseFloat(weight) > 0;

  const inputClass = "h-12 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground transition-colors hover:border-primary/25 focus:border-primary";

  return (
    <section className="relative z-20 -mt-16 overflow-hidden px-4 pb-10 sm:px-6 md:-mt-20 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="surface-panel px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="mb-8 text-center lg:mb-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-sm">
              <Package className="w-4 h-4" />
              Quick Shipping
            </span>
            <h2 className="mt-5 mb-4 text-foreground">
              Start Your <span className="text-primary">Shipment</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Quickly create a shipment and calculate your delivery cost.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Origin Country
                </Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Destination Country
                </Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Weight (KG)
                </Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 5"
                  className={inputClass}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="cta"
                  size="lg"
                  disabled={!isComplete}
                  onClick={handleContinue}
                  className="h-12 w-full gap-2 px-8 lg:w-auto"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Instant price preview */}
            {estimatedCost !== null && (
              <div className="mt-5 flex items-center justify-between rounded-[24px] border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Estimated Cost</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ${estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-muted/55 px-4 py-3">
              <p className="text-sm text-muted-foreground">Door-to-door shipping workflow with fast quote setup.</p>
              <p className="text-sm font-semibold text-foreground">Flexible routes • instant estimate preview.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShipmentEntrySection;
