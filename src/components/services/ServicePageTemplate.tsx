import { Link } from "react-router-dom";
import { LucideIcon, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
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
        {/* Hero Section with Real Photography */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 overflow-hidden"
        >
          {/* Background Image with lazy loading */}
          <div className="absolute inset-0">
            <img 
              src={serviceImages[title] || serviceImages["Air Shipping"]}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/85" />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className={`max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Link 
                to="/services" 
                className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors mb-6"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Services
              </Link>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-secondary" />
                </div>
                <span className="px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-medium">
                  {subtitle}
                </span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                {title}
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-8">
                {description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="cta" size="xl" asChild>
                  <Link to="/pricing">Get a Quote</Link>
                </Button>
                <Button variant="heroOutline" size="xl" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="font-medium text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section ref={workflowRef} className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
                Process
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                How It Works
              </h2>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              {/* Connection Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-secondary/50 to-secondary hidden md:block" />
              
              {workflowSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative flex items-start gap-8 mb-12 last:mb-0 transition-all duration-700 ${
                    workflowInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-16' : 'md:order-2 md:pl-16'}`}>
                    <Card className="inline-block text-left border-border/50 hover:border-secondary/50 hover:shadow-card transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm md:hidden">
                            {step.step}
                          </span>
                          <h3 className="font-heading text-xl font-bold text-foreground">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Step Number - Desktop */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-secondary text-secondary-foreground rounded-full items-center justify-center font-bold text-lg shadow-lg z-10">
                    {step.step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section ref={benefitsRef} className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
                Benefits
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Why Choose Our {title}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card
                  key={benefit.title}
                  className={`group border-border/50 hover:border-secondary/50 hover:shadow-card hover:-translate-y-2 transition-all duration-500 ${
                    benefitsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                      <CheckCircle className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Get a free quote today and experience the RAC Logistics difference.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="cta" size="xl" asChild>
                <Link to="/pricing">Get a Quote</Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
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
