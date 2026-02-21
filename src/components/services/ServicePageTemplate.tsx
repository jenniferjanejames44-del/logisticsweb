import { Link } from "react-router-dom";
import { LucideIcon, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Card, CardContent } from "@/components/ui/card";

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

// High-quality service images from Unsplash
const serviceImages: Record<string, string> = {
  "Air Shipping": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80",
  "Ocean Shipping": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80",
  "Personal Shopping": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80",
  "Procurement": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80",
  "Import & Export": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80",
  "Warehousing": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80",
  "Customs Clearance": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80",
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
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={serviceImages[title] || serviceImages["Air Shipping"]}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/90" />
          </div>
          
          <div className="section-container relative z-10">
            <div className={`max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Link 
                to="/services" 
                className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-[hsl(45,100%,51%)] transition-colors mb-6 text-sm font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Services
              </Link>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[hsl(45,100%,51%)]/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[hsl(45,100%,51%)]" />
                </div>
                <span className="px-4 py-2 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] rounded-full text-xs sm:text-sm font-bold">
                  {subtitle}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                {title}
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed">
                {description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link 
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 font-semibold text-[15px] rounded-[10px] shadow-md transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] hover:shadow-lg active:scale-[0.98]"
                >
                  Get a Quote
                </Link>
                <Link 
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 font-semibold text-[15px] rounded-[10px] shadow-sm transition-all duration-200 bg-transparent text-white border-2 border-white/60 hover:bg-white hover:text-primary active:scale-[0.98]"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-10 sm:py-16 bg-muted">
          <div className="section-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-3.5 sm:p-4 bg-background rounded-lg border border-border/50 transition-shadow duration-200 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-[hsl(45,100%,51%)] flex-shrink-0" />
                  <span className="font-medium text-foreground text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section ref={workflowRef} className="section-padding bg-background">
          <div className="section-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block px-4 py-2 bg-[hsl(45,100%,51%)]/15 text-[hsl(45,100%,40%)] rounded-full text-sm font-bold mb-4">
                Process
              </span>
              <h2 className="text-foreground">
                How It Works
              </h2>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              {/* Connection Line - hidden on mobile */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              
              {workflowSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative flex flex-col md:flex-row items-start gap-4 md:gap-8 mb-8 sm:mb-12 last:mb-0 transition-all duration-700 ${
                    workflowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Mobile: step number + card inline */}
                  <div className="flex items-start gap-4 w-full md:hidden">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                      {step.step}
                    </div>
                    <Card className="flex-1 border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4 sm:p-5">
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Desktop: alternating layout */}
                  <div className={`hidden md:block flex-1 ${index % 2 === 0 ? 'text-right pr-16' : 'order-2 pl-16'}`}>
                    <Card className="inline-block text-left border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Step Number - Desktop */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full items-center justify-center font-bold text-lg shadow-lg z-10">
                    {step.step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section ref={benefitsRef} className="section-padding bg-muted">
          <div className="section-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block px-4 py-2 bg-[hsl(45,100%,51%)]/15 text-[hsl(45,100%,40%)] rounded-full text-sm font-bold mb-4">
                Benefits
              </span>
              <h2 className="text-foreground">
                Why Choose Our {title}
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {benefits.map((benefit, index) => (
                <Card
                  key={benefit.title}
                  className={`group border-border/50 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ${
                    benefitsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[hsl(45,100%,51%)]/15 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[hsl(45,100%,51%)]/25 transition-colors">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(45,100%,51%)]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-primary">
          <div className="section-container text-center">
            <h2 className="text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
              Get a free quote today and experience the RAC Logistics difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link 
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 font-semibold text-[15px] rounded-[10px] shadow-md transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] hover:shadow-lg active:scale-[0.98]"
              >
                Get a Quote
              </Link>
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 font-semibold text-[15px] rounded-[10px] shadow-sm transition-all duration-200 bg-background text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                Contact Sales
              </Link>
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
