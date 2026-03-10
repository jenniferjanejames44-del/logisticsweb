import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, Package, Clock, DollarSign, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RoutePrice {
  origin_country: string;
  destination_country: string;
  price_per_kg: number;
}

const CostEstimator = () => {
  const { formatUsd } = useCurrency();
  const [routePrices, setRoutePrices] = useState<RoutePrice[]>([]);
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [weight, setWeight] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoutePrices = async () => {
      const { data } = await supabase.from("route_prices").select("*");
      if (data) setRoutePrices(data);
    };
    fetchRoutePrices();
  }, []);

  const countries = Array.from(new Set([
    ...routePrices.map(r => r.origin_country),
    ...routePrices.map(r => r.destination_country)
  ])).sort();

  const calculateEstimate = () => {
    const weightNum = parseFloat(weight);
    if (!originCountry || !destinationCountry || !weightNum || weightNum <= 0) {
      setEstimatedCost(null);
      setEstimatedDays(null);
      return;
    }

    const route = routePrices.find(
      r => r.origin_country === originCountry && r.destination_country === destinationCountry
    );

    if (route) {
      const baseCost = route.price_per_kg * weightNum;
      const multiplier = shippingMethod === "express" ? 1.5 : shippingMethod === "economy" ? 0.8 : 1;
      setEstimatedCost(baseCost * multiplier);
      
      const days = shippingMethod === "express" ? 3 : shippingMethod === "economy" ? 10 : 7;
      setEstimatedDays(days);
    } else {
      setEstimatedCost(null);
      setEstimatedDays(null);
    }
  };

  useEffect(() => {
    calculateEstimate();
  }, [originCountry, destinationCountry, weight, shippingMethod, routePrices]);

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-accent" strokeWidth={2.5} />
          </div>
          Shipping Cost Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin Country</Label>
            <Select value={originCountry} onValueChange={setOriginCountry}>
              <SelectTrigger id="origin" className="h-11 rounded-xl">
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination Country</Label>
            <Select value={destinationCountry} onValueChange={setDestinationCountry}>
              <SelectTrigger id="destination" className="h-11 rounded-xl">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-11 rounded-xl"
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Shipping Method</Label>
            <Select value={shippingMethod} onValueChange={setShippingMethod}>
              <SelectTrigger id="method" className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {estimatedCost !== null && estimatedDays !== null && (
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" strokeWidth={2.5} />
                <span className="font-semibold text-foreground">Estimated Cost</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {formatUsd(estimatedCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" strokeWidth={2.5} />
                <span className="text-sm text-muted-foreground">Estimated Delivery</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {estimatedDays} {estimatedDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CostEstimator;

