import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  const { formatUsd } = useCurrency();
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

  const inputClass = "h-12 rounded-lg bg-card border-border text-foreground placeholder:text-muted-foreground shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-primary/25 focus:border-primary";

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(223,81,1,0.08),transparent_48%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="mb-10 text-center animate-fade-in-soft">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.16)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-foreground/15">
              <Package className="w-4 h-4" />
            </span>
            Quick Shipping
          </span>
          <h2 className="text-foreground mb-4">
            Start Your <span className="text-primary">Shipment</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            Quickly create a shipment and calculate your delivery cost.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-lg border border-border bg-card p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05),0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08),0_6px_14px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  Origin Country
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
                <Label className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  Destination Country
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
                <Label className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary">
                    <Scale className="w-3.5 h-3.5" />
                  </span>
                  Weight (KG)
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
            </div>

            {/* Instant price preview */}
            {estimatedCost !== null && (
              <div className="mt-5 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-5 animate-fade-in-soft">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </span>
                  <span className="text-base font-semibold text-foreground">Estimated Cost</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatUsd(estimatedCost)}
                </span>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button
                variant="cta"
                size="lg"
                disabled={!isComplete}
                onClick={handleContinue}
                className="gap-2"
              >
                Continue Shipment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShipmentEntrySection;
