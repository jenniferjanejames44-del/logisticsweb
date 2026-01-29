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
          className="relative pt-32 pb-24 md:pt-44 md:pb-28 overflow-hidden"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
            }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-navy opacity-90" />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block px-6 py-3 bg-secondary/20 text-secondary rounded-full text-sm font-bold tracking-wider uppercase mb-8 border border-secondary/30">
                Transparent Pricing
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                Calculate Your <span className="text-secondary">Shipping Cost</span>
              </h1>
              <p className="text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                Get instant, transparent pricing for your shipments. No hidden fees, no surprises.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="section-padding bg-gradient-to-b from-background to-muted/30">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Calculator Form */}
              <Card className="border-border/30 shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl md:text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-lg shadow-secondary/30">
                      <Calculator className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    Price Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  {/* Destination Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country" className="font-semibold text-sm text-foreground">
                      Destination Country
                    </Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="country" className="h-12 rounded-lg border-2 border-border focus:border-secondary">
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
                    <Label htmlFor="weight" className="font-semibold text-sm text-foreground">
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
                      className="h-12 rounded-lg border-2 border-border focus:border-secondary"
                    />
                  </div>

                  {/* Service Type */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-sm text-foreground">Service Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:border-secondary/50 hover:-translate-y-0.5 hover:shadow-md ${
                            selectedService === service.id
                              ? 'border-secondary bg-secondary/10 shadow-md'
                              : 'border-border bg-background hover:bg-muted/50'
                          }`}
                        >
                          <service.icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 transition-colors ${
                            selectedService === service.id ? 'text-secondary' : 'text-foreground/60'
                          }`} />
                          <div className={`font-bold text-sm sm:text-base transition-colors ${
                            selectedService === service.id ? 'text-foreground' : 'text-foreground/80'
                          }`}>{service.name}</div>
                          <div className="text-xs text-foreground/60 font-medium">{service.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Result */}
              <div className="space-y-6">
                <Card className={`border-2 rounded-2xl transition-all duration-500 ${
                  calculatedPrice !== null ? 'border-secondary shadow-orange' : 'border-border'
                }`}>
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">Estimated Price</p>
                      <div className="relative h-20 sm:h-24 flex items-center justify-center">
                        {isCalculating ? (
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                            <span className="text-muted-foreground text-sm sm:text-base">Calculating...</span>
                          </div>
                        ) : calculatedPrice !== null ? (
                          <div className="animate-count-up">
                            <span className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-secondary">
                              ${calculatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm sm:text-lg text-center px-4">
                            Fill in the form to get a quote
                          </span>
                        )}
                      </div>
                      
                      {calculatedPrice !== null && selectedServiceData && (
                        <div className="mt-6 space-y-4">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <selectedServiceData.icon className="w-5 h-5" />
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
                          
                          <button 
                            className="w-full mt-6 inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 group"
                          >
                            Proceed to Payment
                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                          </button>
                          <p className="text-xs text-foreground/60 font-medium mt-3">
                            Secure payment via Stripe/PayPal
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="flex flex-col items-center text-center p-3 sm:p-4 bg-muted rounded-xl">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground">Instant Quote</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 sm:p-4 bg-muted rounded-xl">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 sm:p-4 bg-muted rounded-xl">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="section-padding bg-section-blue">
          <div className="section-container">
            <div className="text-center mb-14 lg:mb-16">
              <span className="badge-yellow mb-6">
                Value
              </span>
              <h2 className="text-primary mb-5">
                What's <span className="gradient-text">Included</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                "Door-to-door delivery",
                "Real-time tracking",
                "Insurance coverage",
                "Customs clearance",
                "Documentation handling",
                "24/7 customer support",
                "Secure packaging",
                "Delivery confirmation"
              ].map((feature, index) => (
                <div
                  key={feature}
                  className="group flex items-center gap-3 p-5 lg:p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="font-bold text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="section-container text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              Need a Custom <span className="text-secondary">Quote?</span>
            </h2>
            <p className="text-lg md:text-xl text-white font-medium mb-10 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              For large shipments, special cargo, or bulk discounts, contact our team for a personalized quote.
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 font-bold text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 group"
            >
              Contact Sales
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
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
