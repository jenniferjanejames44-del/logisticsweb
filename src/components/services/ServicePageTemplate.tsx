import { Link } from "react-router-dom";
import {
  LucideIcon,
  CheckCircle,
  ArrowRight,
  PlaneTakeoff,
  Globe2,
  Thermometer,
  ShieldCheck,
  Truck,
  Warehouse,
  FileCheck,
  Box,
  BadgeDollarSign,
  Leaf,
  Search,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WorkflowStep {
  step: number;
  title: string;
  description: string;
}

interface Benefit {
  title: string;
  description: string;
}

interface ServicePageProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
  workflowSteps: WorkflowStep[];
  benefits: Benefit[];
  features: string[];
  /** Slug passed as ?service= to the pricing page (e.g. "air", "ocean") */
  pricingSlug?: string;
}

const resolveServiceIcon = (label: string): LucideIcon => {
  const value = label.toLowerCase();

  if (value.includes("express") || value.includes("fast") || value.includes("priority") || value.includes("air")) return PlaneTakeoff;
  if (value.includes("global") || value.includes("world") || value.includes("coverage") || value.includes("destination") || value.includes("country")) return Globe2;
  if (value.includes("track") || value.includes("visibility") || value.includes("real-time") || value.includes("monitor")) return Search;
  if (value.includes("temperature") || value.includes("climate")) return Thermometer;
  if (value.includes("security") || value.includes("secure") || value.includes("dangerous") || value.includes("assurance")) return ShieldCheck;
  if (value.includes("delivery") || value.includes("pickup") || value.includes("door") || value.includes("transit")) return Truck;
  if (value.includes("warehouse") || value.includes("storage") || value.includes("inventory") || value.includes("fulfillment")) return Warehouse;
  if (value.includes("customs") || value.includes("document") || value.includes("compliance") || value.includes("broker") || value.includes("classification")) return FileCheck;
  if (value.includes("cost") || value.includes("savings") || value.includes("price") || value.includes("duty")) return BadgeDollarSign;
  if (value.includes("eco") || value.includes("sustainability")) return Leaf;
  if (value.includes("cargo") || value.includes("container") || value.includes("bulk") || value.includes("goods") || value.includes("handling")) return Box;

  return CheckCircle;
};

const serviceImages: Record<string, string> = {
  "Air Shipping": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80",
  "Ocean Shipping": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=80",
  "Personal Shopping": "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1920&q=80",
  "Procurement Services": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80",
  "Import/Export Services": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1920&q=80",
  "Warehousing & Storage": "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80",
  "Customs Clearance": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80",
  "Global Pickup Services": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80",
};

const ServicePageTemplate = ({
  icon: Icon,
  title,
  subtitle,
  description,
  workflowSteps,
  benefits,
  features,
  pricingSlug,
}: ServicePageProps) => {
  const quoteLink = pricingSlug ? `/pricing?service=${pricingSlug}` : "/pricing";
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const { ref: workflowRef, isInView: workflowInView } = useInView({ threshold: 0.1 });
  const { ref: benefitsRef, isInView: benefitsInView } = useInView({ threshold: 0.1 });

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="page-hero hero-gradient">
          <div className="absolute inset-0">
            <img 
              src={serviceImages[title] || serviceImages["Air Shipping"]}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-15"
            />
          </div>
          <div className="page-hero-overlay" />
          
          <div className="section-container relative z-10">
            <div className={`page-hero-shell text-left transition-all duration-500 ${heroInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <Link 
                to="/services" 
                className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-primary-foreground/80 shadow-[0_10px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-accent"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </span>
                Back to Services
              </Link>
              
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-px sm:h-16 sm:w-16">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent" strokeWidth={2.5} />
                </div>
                <span className="page-hero-badge border-0 bg-accent text-xs font-semibold text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] sm:text-sm">
                  {subtitle}
                </span>
              </div>
              
              <h1 className="text-white mb-6 leading-tight">{title}</h1>
              <p className="hero-subtext mb-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl">{description}</p>
              
              <div className="page-hero-actions sm:justify-start">
                <Button asChild variant="heroPrimary" size="lg">
                  <Link to="/pricing">Get a Quote</Link>
                </Button>
                <Button asChild variant="heroSecondary" size="lg">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="section-padding section-alt">
          <div className="section-container">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-6">
              {features.map((feature, index) => {
                const FeatureIcon = resolveServiceIcon(feature);

                return (
                  <Card
                    key={feature}
                    className="flex items-center gap-3 border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/15"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                      <FeatureIcon className="h-6 w-6 flex-shrink-0" strokeWidth={2.3} />
                    </span>
                    <span className="font-medium text-foreground text-sm sm:text-base">{feature}</span>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section ref={workflowRef} className="section-padding bg-background">
          <div className="section-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="section-badge border-accent/20 bg-accent text-accent-foreground">
                Process
              </span>
              <h2 className="text-foreground">How It Works</h2>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              
              {workflowSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative flex flex-col md:flex-row items-start gap-4 md:gap-8 mb-8 sm:mb-12 last:mb-0 transition-all duration-700 ${
                    workflowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-4 w-full md:hidden">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.16)]">
                      {step.step}
                    </div>
                    <Card className="flex-1 border-border transition-all duration-300 hover:border-primary/20">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-base leading-relaxed">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className={`hidden md:block flex-1 ${index % 2 === 0 ? 'text-right pr-16' : 'order-2 pl-16'}`}>
                    <Card className="inline-block text-left border-border transition-all duration-300 hover:border-primary/20">
                      <CardContent className="p-6">
                        <h3 className="mb-2 text-foreground">{step.title}</h3>
                        <p className="text-base leading-relaxed text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute left-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-[0_14px_30px_rgba(6,16,67,0.18)] md:flex">
                    {step.step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section ref={benefitsRef} className="section-padding section-alt">
          <div className="section-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="section-badge border-accent/20 bg-accent text-accent-foreground">
                Benefits
              </span>
              <h2 className="text-foreground">Why Choose Our {title}</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {benefits.map((benefit, index) => {
                const BenefitIcon = resolveServiceIcon(`${benefit.title} ${benefit.description}`);

                return (
                  <Card
                    key={benefit.title}
                    className={`group border-border transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 ${
                      benefitsInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition-all duration-200 group-hover:-translate-y-px group-hover:scale-105 group-hover:bg-primary/10 sm:h-14 sm:w-14">
                        <BenefitIcon className="h-6 w-6 text-primary sm:h-7 sm:w-7" strokeWidth={2.3} />
                      </div>
                      <h3 className="mb-2 text-foreground">{benefit.title}</h3>
                      <p className="text-base leading-relaxed text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-band section-padding">
          <div className="section-container text-center">
            <h2 className="text-white mb-6">Ready to Get Started?</h2>
            <p className="hero-subtext mb-6 max-w-2xl mx-auto text-base leading-relaxed sm:text-lg md:text-xl">
              Get a free quote today and experience the RAC Logistics difference.
            </p>
            <div className="cta-actions mt-10">
              <Button asChild variant="heroPrimary" size="lg">
                <Link to="/pricing">Get a Quote</Link>
              </Button>
              <Button asChild variant="heroSecondary" size="lg">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default ServicePageTemplate;
