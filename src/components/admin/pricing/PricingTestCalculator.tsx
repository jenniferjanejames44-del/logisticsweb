import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { fetchQuote, type QuoteResult } from "@/lib/quoteApi";
import { formatMoney } from "@/lib/pricingCore";

/**
 * Admin preview that calls the SAME server-side calculation customers use,
 * so admin configuration and customer pricing can never diverge.
 */
const PricingTestCalculator = () => {
  const [direction, setDirection] = useState<"import" | "export">("import");
  const [country, setCountry] = useState("United States");
  const [countryCode, setCountryCode] = useState("US");
  const [method, setMethod] = useState("air");
  const [serviceType, setServiceType] = useState("");
  const [weight, setWeight] = useState("3");
  const [declaredValue, setDeclaredValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchQuote({
        direction,
        originCountry: direction === "export" ? "Nigeria" : country,
        destinationCountry: direction === "export" ? country : "Nigeria",
        warehouseCountry: direction === "import" ? country : null,
        shippingMethod: method,
        serviceType: serviceType || null,
        weightKg: parseFloat(weight) || 0,
        declaredValue: parseFloat(declaredValue) || 0,
        countryCode: countryCode.trim().toUpperCase() || null,
      });
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };


  const q = result?.quote;
  const fmt = (n: number) => formatMoney(n, q?.currency || "USD");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4" /> Test Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as "import" | "export")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{direction === "import" ? "Origin / Warehouse country" : "Destination country"}</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Country code (ISO)</Label>
            <Input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="US" />
          </div>

          <div className="space-y-2">
            <Label>Shipping method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="air">Air</SelectItem>
                <SelectItem value="ocean">Ocean / Sea</SelectItem>
                <SelectItem value="road">Road</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Service type (optional)</Label>
            <Input value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="express / standard" />
          </div>
          <div className="space-y-2">
            <Label>Weight (KG)</Label>
            <Input type="number" min="0.1" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Declared value (optional)</Label>
            <Input type="number" min="0" step="1" value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} />
          </div>
        </div>

        <Button onClick={run} disabled={loading}>{loading ? "Calculating…" : "Calculate"}</Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {q && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{fmt(q.total)} {q.currency}</span>
            </div>
            {q.lines.map((l) => (
              <div key={l.key} className="flex justify-between text-muted-foreground">
                <span>{l.label}</span>
                <span>{fmt(l.amount)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 text-xs text-muted-foreground">
              <div>Rule: {q.rule_name} ({q.rule_id})</div>
              <div>Model: {q.pricing_model} · Chargeable weight: {q.chargeable_weight_kg} kg</div>
              <div>Included {q.included_weight_kg} kg @ {fmt(q.base_price)} · Extra {q.additional_weight_kg} kg @ {fmt(q.additional_rate_per_kg)}/kg</div>
              {result?.debug && <div>Active rules considered: {result.debug.candidates}</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingTestCalculator;
