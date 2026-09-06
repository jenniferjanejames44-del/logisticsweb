import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Plane, Ship, Package, Zap, Shield, Clock, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { getCountries } from "@/lib/locationData";
import { computeShipmentTotals, formatPriceInCurrency, type ShipmentTotals } from "@/lib/pricingEngine";
import { matchPricingRule, toLegacyRule } from "@/lib/pricingEngineV2";

const allCountries = getCountries();

const services = [
  { id: "air-express", name: "Air Express", icon: Plane, method: "air", serviceType: "express", description: "3–5 Business Days" },
  { id: "standard-shipping", name: "Standard Shipping", icon: Package, method: "air", serviceType: null, description: "14 Business Days" },
  { id: "ocean-sea-freight", name: "Ocean / Sea Freight", icon: Ship, method: "ocean", serviceType: null, description: "45–60 Days" },
];

const serviceSlugMap: Record<string, string> = {
  air: "air-express",
  ocean: "ocean-sea-freight",
};

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [declaredValue, setDeclaredValue] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [totals, setTotals] = useState<ShipmentTotals | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Auto-select service from URL param
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam && serviceSlugMap[serviceParam]) {
      setSelectedService(serviceSlugMap[serviceParam]);
    }
  }, [searchParams]);

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const calculatedPrice = totals?.total ?? null;
  const currency = totals?.currency || "USD";
  const fmt = (n: number) => formatPriceInCurrency(n, currency);

  const handleContinueToCheckout = () => {
    if (!selectedCountry || !weight || !selectedService || calculatedPrice === null) return;

    const country = allCountries.find(c => c.isoCode === selectedCountry);
    const service = services.find(s => s.id === selectedService);

    // Store quote data for checkout
    const quoteData = {
      destination_country: country?.name || selectedCountry,
      destination_code: selectedCountry,
      weight: weight,
      service_type: selectedService,
      service_name: service?.name || selectedService,
      delivery_estimate: service?.description || "",
      calculated_price: calculatedPrice,
      currency,
      base_rate: totals && totals.chargeableWeight > 0 ? totals.shippingCost / totals.chargeableWeight : 0,
      base_shipping_cost: totals?.shippingCost ?? 0,
      handling_fee: totals?.handlingFee ?? 0,
      vat: totals?.vat ?? 0,
      insurance_fee: totals?.insurance ?? 0,
      declared_value: totals?.declaredValue ?? 0,
    };
    localStorage.setItem("pricing_quote_data", JSON.stringify(quoteData));

    if (user) {
      navigate("/checkout");
    } else {
      localStorage.setItem("post_auth_redirect", "/checkout");
      navigate("/auth");
    }
  };

  // Live quote using the same pricing engine the shipment form and admin use.
  useEffect(() => {
    const country = allCountries.find((c) => c.isoCode === selectedCountry);
    const service = services.find((s) => s.id === selectedService);
    const w = parseFloat(weight);

    if (!country || !service || !w || w <= 0) {
      setTotals(null);
      setPricingError(null);
      setIsCalculating(false);
      return;
    }

    let cancelled = false;
    setIsCalculating(true);
    setPricingError(null);

    const timer = setTimeout(async () => {
      try {
        const rule = await matchPricingRule({
          shipmentType: "export",
          originCountry: "Nigeria",
          destinationCountry: country.name,
          shippingMethod: service.method,
          serviceType: service.serviceType,
          chargeableWeight: w,
        });
        if (cancelled) return;
        if (!rule) {
          setTotals(null);
          setPricingError(
            `We don't have a published ${service.name.toLowerCase()} rate to ${country.name} yet. Please contact us for a quote.`,
          );
          return;
        }
        const t = computeShipmentTotals({
          packageDims: { length_cm: 0, width_cm: 0, height_cm: 0 },
          items: [{ quantity: 1, weightKg: w, declaredValue: 0 }],
          packagePrice: 0,
          rule: toLegacyRule(rule),
          declaredValue: parseFloat(declaredValue) || 0,
        });
        setTotals(t);
      } catch {
        if (!cancelled) {
          setTotals(null);
          setPricingError("Could not load pricing right now. Please try again.");
        }
      } finally {
        if (!cancelled) setIsCalculating(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedCountry, weight, declaredValue, selectedService]);


  return (
    <div className="min-h-screen">
      <Header />
      <main>
	        {/* Hero Section */}
	        <section ref={heroRef} className="page-hero">
	          <div 
	            className="page-hero-media"
	            style={{
	              backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
	            }}
	          />
	          <div className="page-hero-overlay" />
	          
	          <div className="section-container relative z-10">
	            <div className={`page-hero-shell transition-all duration-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
	              <span className="page-hero-badge mb-6">
	                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
	                Transparent Pricing
	              </span>
	              <h1 className="text-white mb-4 leading-tight">
	                Calculate Your Shipping Cost
	              </h1>
	              <p className="hero-subtext max-w-xl mx-auto text-base leading-relaxed md:text-lg">
	                Get instant, transparent pricing for your shipments. No hidden fees, no surprises.
	              </p>
	            </div>
	          </div>
	        </section>

	        {/* Calculator Section */}
	        <section className="section-padding relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(6,16,67,0.06),transparent_38%),linear-gradient(180deg,#ffffff_0%,rgba(248,250,252,0.96)_100%)]">
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="section-container">
	            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
	              {/* Calculator Form */}
	              <Card className="border-border/70 bg-white/95 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                   <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-[0_12px_24px_rgba(223,81,1,0.22)]">
                      <Calculator className="w-5 h-5 text-accent-foreground" />
                    </div>
                    Price Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
	                    <div className="space-y-2">
                    <Label htmlFor="country" className="font-medium text-sm">Destination Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="country" className="h-11 rounded-lg border-border bg-white"><SelectValue placeholder="Select destination country" /></SelectTrigger>
                      <SelectContent>
                        {allCountries.map((country) => (
                          <SelectItem key={country.isoCode} value={country.isoCode}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

	                    <div className="space-y-2">
                    <Label htmlFor="weight" className="font-medium text-sm">Weight (KG)</Label>
                    <Input id="weight" type="number" min="0.1" step="0.1" placeholder="Enter weight in kilograms" className="h-11 rounded-lg border-border bg-white" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>

	                    <div className="space-y-2">
                    <Label htmlFor="declared" className="font-medium text-sm">Declared Value (optional)</Label>
                    <Input id="declared" type="number" min="0" step="1" placeholder="Value of goods, for insurance" className="h-11 rounded-lg border-border bg-white" value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} />
                  </div>


	                    <div className="space-y-3">
                    <Label className="font-medium text-sm">Service Type</Label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {services.map((service) => (
	                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`group rounded-xl border p-5 text-left transition-all duration-200 ${
                            selectedService === service.id
                              ? 'border-primary/25 bg-primary/[0.05] shadow-[0_16px_30px_rgba(6,16,67,0.08)] ring-1 ring-primary/10'
                              : 'border-border/70 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:-translate-y-px hover:border-primary/20 hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                              selectedService === service.id ? 'bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(6,16,67,0.2)]' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                              <service.icon className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-base font-semibold transition-colors ${
                                selectedService === service.id ? 'text-foreground' : 'text-foreground/80'
                              }`}>{service.name}</div>
                              <div className="mt-1 text-sm text-muted-foreground">{service.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

	              {/* Price Result */}
	              <div className="space-y-5 lg:sticky lg:top-28">
	                <Card className={`overflow-hidden border bg-white/95 transition-all duration-300 backdrop-blur-sm ${
                  calculatedPrice !== null ? 'border-primary/20 shadow-[0_22px_48px_rgba(6,16,67,0.1)] ring-1 ring-primary/10' : 'border-border/70 shadow-[0_16px_38px_rgba(15,23,42,0.06)]'
                }`}>
                  <CardContent className="p-6">
                    <div className="space-y-5 text-center">
                      <div className="rounded-2xl border border-primary/10 bg-[linear-gradient(180deg,rgba(6,16,67,0.06),rgba(223,81,1,0.04))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        <p className="mb-2 text-sm font-semibold text-muted-foreground">Estimated Price</p>
                        <div className="flex h-16 items-center justify-center">
                        {isCalculating ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span className="text-muted-foreground text-sm">Calculating...</span>
                          </div>
                        ) : calculatedPrice !== null ? (
                          <span className="text-4xl md:text-5xl font-bold text-primary">
                            {fmt(calculatedPrice)}
                          </span>
                        ) : pricingError ? (
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4 text-accent" />
                            {pricingError}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Fill in the form to get a quote</span>
                        )}
                        </div>
                      </div>
                      
                      {calculatedPrice !== null && totals && selectedServiceData && (
                        <div className="mt-5 space-y-4">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <selectedServiceData.icon className="w-4 h-4" strokeWidth={2.5} />
                            <span>{selectedServiceData.name}</span>
                            <span>•</span>
                            <span>{selectedServiceData.description}</span>
                          </div>
                          
                          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/[0.18] p-4 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Shipping ({totals.chargeableWeight} KG)</span>
                              <span>{fmt(totals.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Handling &amp; Customs</span>
                              <span>{fmt(totals.handlingFee)}</span>
                            </div>
                            {totals.vat > 0 && (
                              <div className="flex justify-between text-muted-foreground">
                                <span>VAT ({totals.vatPercent}%)</span>
                                <span>{fmt(totals.vat)}</span>
                              </div>
                            )}
                            {totals.insurance > 0 && (
                              <div className="flex justify-between text-muted-foreground">
                                <span>Insurance ({totals.insurancePercent}%)</span>
                                <span>{fmt(totals.insurance)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-border/70 pt-2 font-semibold text-foreground">
                              <span>Total</span>
                              <span>{fmt(totals.total)}</span>
                            </div>
                          </div>

                          
                          <Button variant="accent" className="mt-4 shadow-[0_12px_24px_rgba(223,81,1,0.2)]" size="lg" onClick={handleContinueToCheckout}>
                            Continue Shipment
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">Secure payment via Paystack</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col items-center rounded-xl border border-border/70 bg-white/95 p-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                    <Zap className="w-5 h-5 text-accent mb-1" />
                    <span className="text-sm font-medium text-foreground">Instant Quote</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl border border-border/70 bg-white/95 p-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                    <Shield className="w-5 h-5 text-accent mb-1" />
                    <span className="text-sm font-medium text-foreground">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl border border-border/70 bg-white/95 p-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                    <Clock className="w-5 h-5 text-accent mb-1" />
                    <span className="text-sm font-medium text-foreground">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="section-padding bg-muted/60">
          <div className="section-container">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-bold mb-4">
                Value
              </span>
              <h2 className="text-foreground">What's Included</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "Door-to-door delivery",
                "Real-time tracking",
                "Insurance coverage",
                "Customs clearance",
                "Documentation handling",
                "24/7 customer support",
                "Secure packaging",
                "Delivery confirmation"
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-white/95 p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_16px_30px_rgba(15,23,42,0.06)]"
                >
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="font-medium text-foreground text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

	        {/* CTA */}
	        <section className="cta-band section-padding">
	          <div className="section-container text-center">
            <h2 className="text-white mb-6">Need a Custom Quote?</h2>
	            <p className="hero-subtext mb-6 max-w-2xl mx-auto text-lg leading-relaxed md:text-xl">
              For large shipments, special cargo, or bulk discounts, contact our team for a personalized quote.
            </p>
            <Button asChild>
              <Link to="/contact">
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Pricing;
