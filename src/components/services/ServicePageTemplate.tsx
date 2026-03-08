import { Link } from "react-router-dom";
import { LucideIcon, CheckCircle, ArrowRight } from "lucide-react";
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
}

const serviceImages: Record<string, string> = {
  "Air Shipping": "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1920&q=80",
  "Ocean Shipping": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80",
  "Personal Shopping": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80",
  "Procurement Services": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80",
  "Import/Export Services": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80",
  "Warehousing & Storage": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80",
  "Customs Clearance": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80",
};

const ServicePageTemplate = ({
  icon: Icon,
  title,
  subtitle,
  description,
  workflowSteps,
  benefits,
  features
}: ServicePageProps) => {
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const { ref: workflowRef, isInView: workflowInView } = useInView({ threshold: 0.1 });
  const { ref: benefitsRef, isInView: benefitsInView } = useInView({ threshold: 0.1 });

  return (
    <div className="page-shell">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="page-hero pb-20 md:pb-24"
        >
          <div className="absolute inset-0">
            <img 
              src={serviceImages[title] || serviceImages["Air Shipping"]}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-15"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,67,0.2),rgba(6,16,67,0.88))]" />
          
          <div className="section-container relative z-10">
            <div className={`mx-auto max-w-4xl rounded-[32px] border border-white/12 bg-white/8 px-6 py-10 backdrop-blur-sm transition-all duration-500 sm:px-8 md:px-10 ${heroInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <Link 
                to="/services" 
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-accent"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Services
              </Link>
              
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[24px] border border-white/20 bg-white/12 shadow-lg backdrop-blur-sm sm:h-16 sm:w-16">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent" strokeWidth={2.5} />
                </div>
                <span className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-md sm:text-sm">
                  {subtitle}
                </span>
              </div>
              
              <h1 className="text-white mb-6 leading-tight">{title}</h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">{description}</p>
              
              <div className="flex flex-wrap items-center justify-start gap-4">
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
        <section className="bg-section-light py-10 sm:py-16">
          <div className="section-container">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4 lg:gap-6">
              {features.map((feature, index) => (
                <Card
                  key={feature}
                  className="flex items-center gap-3 border-border/60 bg-background transition-shadow duration-200 hover:border-primary/15 hover:shadow-[0_18px_36px_rgba(15,23,42,0.06)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2.5} />
                  <span className="font-medium text-foreground text-sm sm:text-base">{feature}</span>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section ref={workflowRef} className="section-padding bg-background">
          <div className="section-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="section-kicker mb-4">
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
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md">
                      {step.step}
                    </div>
                    <Card className="flex-1 border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className={`hidden md:block flex-1 ${index % 2 === 0 ? 'text-right pr-16' : 'order-2 pl-16'}`}>
                    <Card className="inline-block text-left border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute left-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg md:flex">
                    {step.step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section ref={benefitsRef} className="section-padding bg-section-light">
          <div className="section-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="section-kicker mb-4">
                Benefits
              </span>
              <h2 className="text-foreground">Why Choose Our {title}</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {benefits.map((benefit, index) => (
                <Card
                  key={benefit.title}
                  className={`group border-border/60 transition-all duration-500 hover:-translate-y-1 hover:border-primary/20 ${
                    benefitsInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/15 sm:h-14 sm:w-14">
                      <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-primary">
          <div className="section-container text-center">
            <h2 className="text-white mb-6">Ready to Get Started?</h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Get a free quote today and experience the RAC Logistics difference.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
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
