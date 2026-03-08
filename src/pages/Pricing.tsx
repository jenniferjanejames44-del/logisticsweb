import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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

  return (
    <div className="page-shell">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="page-hero pb-20 md:pb-24"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,67,0.2),rgba(6,16,67,0.88))]" />
          
          <div className="section-container relative z-10">
            <div className={`mx-auto max-w-4xl rounded-[32px] border border-white/12 bg-white/8 px-6 py-10 text-center backdrop-blur-sm transition-all duration-500 sm:px-8 md:px-10 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-bold text-white/90">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Transparent Pricing
              </span>
              <h1 className="mt-6 mb-4 text-white leading-tight">
                Calculate Your Shipping Cost
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
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
              <Card className="border-border/70 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                   <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent shadow-[0_14px_28px_rgba(223,81,1,0.18)]">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`p-4 rounded-lg border text-left transition-all duration-200 hover:border-primary/50 ${
                            selectedService === service.id
                              ? 'border-primary bg-primary/5 shadow-[0_16px_36px_rgba(6,16,67,0.08)]'
                              : 'border-border bg-background hover:bg-muted/50'
                          }`}
                        >
                          <service.icon className={`w-5 h-5 mb-2 transition-colors ${
                            selectedService === service.id ? 'text-primary' : 'text-muted-foreground'
                          }`} strokeWidth={2.5} />
                          <div className={`font-semibold text-sm transition-colors ${
                            selectedService === service.id ? 'text-foreground' : 'text-foreground/80'
                          }`}>{service.name}</div>
                          <div className="text-xs text-muted-foreground">{service.description}</div>
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
                            ₦{calculatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                              <span>Base Rate ({weight} KG × ₦{routeRate ?? selectedServiceData.fallbackRate}/KG{routeRate ? " (route price)" : ""})</span>
                              <span>₦{(parseFloat(weight) * (routeRate ?? selectedServiceData.fallbackRate)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Handling Fee</span>
                              <span>₦15.00</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Insurance (2%)</span>
                              <span>₦{(calculatedPrice * 0.02).toFixed(2)}</span>
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-muted/55 p-3 text-center">
                    <Zap className="w-5 h-5 text-accent mb-1" />
                    <span className="text-xs font-medium text-foreground">Instant Quote</span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-muted/55 p-3 text-center">
                    <Shield className="w-5 h-5 text-accent mb-1" />
                    <span className="text-xs font-medium text-foreground">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-muted/55 p-3 text-center">
                    <Clock className="w-5 h-5 text-accent mb-1" />
                    <span className="text-xs font-medium text-foreground">24/7 Support</span>
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
              <span className="section-kicker mb-4">
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
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-shadow hover:shadow-[0_16px_30px_rgba(15,23,42,0.06)]"
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
              className="inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-3.5 text-sm font-extrabold text-accent-foreground shadow-[0_14px_34px_rgba(223,81,1,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_20px_40px_rgba(223,81,1,0.24)] active:scale-[0.98] sm:text-base"
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
