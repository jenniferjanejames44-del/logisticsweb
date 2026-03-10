import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Plane, Ship, ShoppingBag, Package, Zap, Shield, Clock, CheckCircle, ArrowRight } from "lucide-react";

const countries = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "NG", name: "Nigeria" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" },
];

const services = [
  { id: "air-express", name: "Air Express", icon: Plane, fallbackRate: 25, description: "1-3 days delivery" },
  { id: "air-standard", name: "Air Standard", icon: Plane, fallbackRate: 18, description: "3-5 days delivery" },
  { id: "ocean-fcl", name: "Ocean FCL", icon: Ship, fallbackRate: 8, description: "15-30 days delivery" },
  { id: "ocean-lcl", name: "Ocean LCL", icon: Ship, fallbackRate: 5, description: "20-35 days delivery" },
  { id: "personal-shopping", name: "Personal Shopping", icon: ShoppingBag, fallbackRate: 15, description: "Varies by source" },
  { id: "procurement", name: "Procurement", icon: Package, fallbackRate: 12, description: "Custom timeline" },
];

interface RoutePrice {
  origin_country: string;
  destination_country: string;
  price_per_kg: number;
}

const Pricing = () => {
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const { user } = useAuth();
  const { formatUsd } = useCurrency();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routePrices, setRoutePrices] = useState<RoutePrice[]>([]);
  const [routeRate, setRouteRate] = useState<number | null>(null);

  // Fetch route-based prices from database
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

  const handleProceedToPayment = () => {
    if (user) {
      navigate("/dashboard/shipments");
    } else {
      navigate("/auth");
    }
  };

  useEffect(() => {
    if (selectedCountry && weight && selectedService && parseFloat(weight) > 0) {
      setIsCalculating(true);
      
      const timer = setTimeout(() => {
        const country = countries.find(c => c.code === selectedCountry);
        const service = services.find(s => s.id === selectedService);
        
        if (country && service) {
          // Look for a route-based price (origin: Nigeria → destination)
          const route = routePrices.find(
            r => r.origin_country === "Nigeria" && r.destination_country === country.name
          );
          
          const ratePerKg = route ? Number(route.price_per_kg) : service.fallbackRate;
          setRouteRate(route ? Number(route.price_per_kg) : null);
          
          const basePrice = ratePerKg * parseFloat(weight);
          const handlingFee = 15;
          const insuranceFee = basePrice * 0.02;
          const totalPrice = basePrice + handlingFee + insuranceFee;
          
          setCalculatedPrice(Math.round(totalPrice * 100) / 100);
        }
        setIsCalculating(false);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setCalculatedPrice(null);
      setRouteRate(null);
    }
  }, [selectedCountry, weight, selectedService, routePrices]);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const baseRate = routeRate ?? selectedServiceData?.fallbackRate ?? 0;
  const baseShippingCost = weight ? parseFloat(weight) * baseRate : 0;
  const handlingFee = 15;
  const insuranceFee = baseShippingCost * 0.02;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden bg-primary"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
            }}
          />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-3xl mx-auto transition-all duration-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 text-white/90 backdrop-blur-sm border border-white/20 rounded-full text-sm font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Transparent Pricing
              </span>
              <h1 className="text-white mb-4 leading-tight">
                Calculate Your Shipping Cost
              </h1>
              <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
                Get instant, transparent pricing for your shipments. No hidden fees, no surprises.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="section-padding bg-background">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Calculator Form */}
              <Card className="border-border shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                   <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-accent-foreground" />
                    </div>
                    Price Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="font-medium text-sm">Destination Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="country"><SelectValue placeholder="Select destination country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="font-medium text-sm">Weight (KG)</Label>
                    <Input id="weight" type="number" min="0.1" step="0.1" placeholder="Enter weight in kilograms" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>

                  <div className="space-y-3">
                    <Label className="font-medium text-sm">Service Type</Label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`rounded-lg border bg-white p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 hover:border-primary/40 ${
                            selectedService === service.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/30'
                          }`}
                        >
                          <service.icon className={`w-5 h-5 mb-2 transition-colors ${
                            selectedService === service.id ? 'text-primary' : 'text-muted-foreground'
                          }`} strokeWidth={2.5} />
                          <div className={`text-base font-semibold transition-colors ${
                            selectedService === service.id ? 'text-foreground' : 'text-foreground/80'
                          }`}>{service.name}</div>
                          <div className="text-sm text-muted-foreground">{service.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Result */}
              <div className="space-y-5">
                <Card className={`border transition-all duration-300 ${
                  calculatedPrice !== null ? 'border-primary shadow-lg' : 'border-border'
                }`}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2 text-sm">Estimated Price</p>
                      <div className="h-16 flex items-center justify-center">
                        {isCalculating ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span className="text-muted-foreground text-sm">Calculating...</span>
                          </div>
                        ) : calculatedPrice !== null ? (
                          <span className="text-4xl md:text-5xl font-bold text-primary">
                            {formatUsd(calculatedPrice)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Fill in the form to get a quote</span>
                        )}
                      </div>
                      
                      {calculatedPrice !== null && selectedServiceData && (
                        <div className="mt-5 space-y-4">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <selectedServiceData.icon className="w-4 h-4" strokeWidth={2.5} />
                            <span>{selectedServiceData.name}</span>
                            <span>•</span>
                            <span>{selectedServiceData.description}</span>
                          </div>
                          
                          <div className="pt-4 border-t border-border space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Base Rate ({weight} KG × {formatUsd(baseRate)}/KG{routeRate ? " (route price)" : ""})</span>
                              <span>{formatUsd(baseShippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Handling Fee</span>
                              <span>{formatUsd(handlingFee)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Insurance (2%)</span>
                              <span>{formatUsd(insuranceFee)}</span>
                            </div>
                          </div>
                          
                          <Button variant="accent" className="w-full mt-4" size="lg" onClick={handleProceedToPayment}>
                            {user ? "Create Shipment & Pay" : "Sign In to Pay"}
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
                  <div className="flex flex-col items-center rounded-lg border border-border bg-white p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                    <Zap className="w-5 h-5 text-accent mb-1" />
                    <span className="text-sm font-medium text-foreground">Instant Quote</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg border border-border bg-white p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                    <Shield className="w-5 h-5 text-accent mb-1" />
                    <span className="text-sm font-medium text-foreground">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg border border-border bg-white p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                    <Clock className="w-5 h-5 text-accent mb-1" />
                    <span className="text-sm font-medium text-foreground">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="section-padding bg-muted">
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
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                >
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="font-medium text-foreground text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-primary">
          <div className="section-container text-center">
            <h2 className="text-white mb-6">Need a Custom Quote?</h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              For large shipments, special cargo, or bulk discounts, contact our team for a personalized quote.
            </p>
            <Link 
              to="/contact"
              className="btn btn-primary btn-lg"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Pricing;
