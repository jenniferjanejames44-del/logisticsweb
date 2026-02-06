import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  { code: "US", name: "United States", airMultiplier: 1.0, oceanMultiplier: 1.0 },
  { code: "UK", name: "United Kingdom", airMultiplier: 1.1, oceanMultiplier: 1.05 },
  { code: "DE", name: "Germany", airMultiplier: 1.15, oceanMultiplier: 1.1 },
  { code: "FR", name: "France", airMultiplier: 1.12, oceanMultiplier: 1.08 },
  { code: "CN", name: "China", airMultiplier: 0.9, oceanMultiplier: 0.85 },
  { code: "JP", name: "Japan", airMultiplier: 1.2, oceanMultiplier: 1.15 },
  { code: "AU", name: "Australia", airMultiplier: 1.3, oceanMultiplier: 1.2 },
  { code: "CA", name: "Canada", airMultiplier: 1.05, oceanMultiplier: 1.02 },
  { code: "NG", name: "Nigeria", airMultiplier: 1.25, oceanMultiplier: 1.18 },
  { code: "AE", name: "United Arab Emirates", airMultiplier: 1.1, oceanMultiplier: 1.0 },
  { code: "SG", name: "Singapore", airMultiplier: 1.15, oceanMultiplier: 1.05 },
  { code: "IN", name: "India", airMultiplier: 0.95, oceanMultiplier: 0.9 },
];

const services = [
  { id: "air-express", name: "Air Express", icon: Plane, baseRate: 25, description: "1-3 days delivery" },
  { id: "air-standard", name: "Air Standard", icon: Plane, baseRate: 18, description: "3-5 days delivery" },
  { id: "ocean-fcl", name: "Ocean FCL", icon: Ship, baseRate: 8, description: "15-30 days delivery" },
  { id: "ocean-lcl", name: "Ocean LCL", icon: Ship, baseRate: 5, description: "20-35 days delivery" },
  { id: "personal-shopping", name: "Personal Shopping", icon: ShoppingBag, baseRate: 15, description: "Varies by source" },
  { id: "procurement", name: "Procurement", icon: Package, baseRate: 12, description: "Custom timeline" },
];

const Pricing = () => {
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (selectedCountry && weight && selectedService && parseFloat(weight) > 0) {
      setIsCalculating(true);
      
      const timer = setTimeout(() => {
        const country = countries.find(c => c.code === selectedCountry);
        const service = services.find(s => s.id === selectedService);
        
        if (country && service) {
          const multiplier = selectedService.includes("ocean") 
            ? country.oceanMultiplier 
            : country.airMultiplier;
          
          const basePrice = service.baseRate * parseFloat(weight) * multiplier;
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
    }
  }, [selectedCountry, weight, selectedService]);

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden bg-primary"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
            }}
          />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-3xl mx-auto transition-all duration-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-block px-4 py-2 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] rounded-full text-sm font-bold mb-6">
                Transparent Pricing
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
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
                   <div className="w-10 h-10 bg-[hsl(45,100%,51%)] rounded-lg flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-[hsl(0,0%,13%)]" />
                    </div>
                    Price Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Destination Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country" className="font-medium text-sm">
                      Destination Country
                    </Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select destination country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="font-medium text-sm">
                      Weight (KG)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="Enter weight in kilograms"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>

                  {/* Service Type */}
                  <div className="space-y-3">
                    <Label className="font-medium text-sm">Service Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`p-4 rounded-lg border text-left transition-all duration-200 hover:border-primary/50 ${
                            selectedService === service.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-background hover:bg-muted/50'
                          }`}
                        >
                          <service.icon className={`w-5 h-5 mb-2 transition-colors ${
                            selectedService === service.id ? 'text-primary' : 'text-muted-foreground'
                          }`} />
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
                            ${calculatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Fill in the form to get a quote
                          </span>
                        )}
                      </div>
                      
                      {calculatedPrice !== null && selectedServiceData && (
                        <div className="mt-5 space-y-4">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <selectedServiceData.icon className="w-4 h-4" />
                            <span>{selectedServiceData.name}</span>
                            <span>•</span>
                            <span>{selectedServiceData.description}</span>
                          </div>
                          
                          <div className="pt-4 border-t border-border space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Base Rate ({weight} KG × ${selectedServiceData.baseRate}/KG)</span>
                              <span>${(parseFloat(weight) * selectedServiceData.baseRate).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Handling Fee</span>
                              <span>$15.00</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Insurance (2%)</span>
                              <span>${(calculatedPrice * 0.02).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <Button className="w-full mt-4" size="lg">
                            Proceed to Payment
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Secure payment via Stripe/PayPal
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                    <Zap className="w-5 h-5 text-[hsl(45,100%,45%)] mb-1" />
                    <span className="text-xs font-medium text-foreground">Instant Quote</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                    <Shield className="w-5 h-5 text-[hsl(45,100%,45%)] mb-1" />
                    <span className="text-xs font-medium text-foreground">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                    <Clock className="w-5 h-5 text-[hsl(45,100%,45%)] mb-1" />
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
              <span className="inline-block px-3 py-1.5 bg-[hsl(45,100%,51%)]/15 text-[hsl(45,100%,40%)] rounded-full text-sm font-bold mb-4">
                Value
              </span>
              <h2 className="text-foreground">
                What's Included
              </h2>
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
                  className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  <CheckCircle className="w-5 h-5 text-[hsl(45,100%,45%)] flex-shrink-0" />
                  <span className="font-medium text-foreground text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-primary">
          <div className="section-container text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Need a Custom Quote?
            </h2>
            <p className="text-base text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              For large shipments, special cargo, or bulk discounts, contact our team for a personalized quote.
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-lg transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] active:scale-[0.98]"
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
