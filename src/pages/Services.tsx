import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Ship, ShoppingBag, Package, Globe, Warehouse, FileCheck, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Plane,
    title: "Air Shipping",
    description: "Fast and reliable air freight solutions for time-sensitive cargo. Global coverage with express delivery options.",
    link: "/services/air-shipping",
    features: ["Express Delivery", "Global Coverage", "Real-time Tracking", "Temperature Control"]
  },
  {
    icon: Ship,
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments. FCL and LCL options with worldwide port coverage.",
    link: "/services/ocean-shipping",
    features: ["FCL & LCL Options", "Worldwide Ports", "Bulk Cargo", "Container Tracking"]
  },
  {
    icon: ShoppingBag,
    title: "Personal Shopping",
    description: "Shop from any store worldwide and we'll deliver to your doorstep. Personal shopper service included.",
    link: "/services/personal-shopping",
    features: ["Buy Anywhere", "Price Comparison", "Quality Check", "Consolidated Shipping"]
  },
  {
    icon: Package,
    title: "Procurement",
    description: "End-to-end procurement services for businesses. Supplier sourcing, negotiation, and delivery.",
    link: "/services/procurement",
    features: ["Supplier Sourcing", "Price Negotiation", "Quality Assurance", "Bulk Ordering"]
  },
  {
    icon: Globe,
    title: "Import/Export",
    description: "Complete import and export solutions with customs clearance, documentation, and compliance.",
    link: "/services/import-export",
    features: ["Customs Clearance", "Documentation", "Compliance", "Trade Consulting"]
  },
  {
    icon: Warehouse,
    title: "Warehousing",
    description: "Secure storage solutions with inventory management. Fulfillment and distribution services.",
    link: "/services/warehousing",
    features: ["Secure Storage", "Inventory Management", "Order Fulfillment", "Distribution"]
  },
  {
    icon: FileCheck,
    title: "Customs Clearance",
    description: "Expert customs brokerage services. Fast clearance with full regulatory compliance.",
    link: "/services/customs-clearance",
    features: ["Fast Clearance", "Regulatory Compliance", "Duty Optimization", "Documentation"]
  }
];

const Services = () => {
  const { ref: heroRef, isInView: heroInView } = useInView({ threshold: 0.2 });
  const { ref: servicesRef, isInView: servicesInView } = useInView({ threshold: 0.1 });

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
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1920&q=80)',
            }}
          />
          {/* Dark Overlay - Using primary green */}
          <div className="absolute inset-0 bg-primary opacity-90" />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block px-6 py-3 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] rounded-full text-sm font-bold tracking-wider uppercase mb-8">
                Our Services
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                Comprehensive Logistics Solutions
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed mb-10 max-w-2xl mx-auto" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                From air freight to customs clearance, we offer end-to-end logistics services tailored to your needs. Experience seamless shipping with RAC Logistics.
              </p>
              <div className="flex flex-row justify-center gap-4">
                <Link 
                  to="/pricing"
                  className="inline-flex items-center gap-2 h-12 px-6 font-semibold text-[15px] rounded-[10px] transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] shadow-md hover:shadow-lg hover:bg-[hsl(45,100%,45%)] hover:-translate-y-0.5 active:scale-[0.98] group"
                >
                  Get a Quote
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link 
                  to="/contact"
                  className="inline-flex items-center gap-2 h-12 px-6 font-semibold text-[15px] rounded-[10px] transition-all duration-200 bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 active:scale-[0.98] group"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section ref={servicesRef} className="section-padding bg-background">
          <div className="section-container">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
              <h2 className="text-foreground mb-5">
                Explore Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
                Comprehensive logistics solutions designed for your business needs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service, index) => (
                <Card
                  key={service.title}
                  className={`group relative overflow-hidden bg-card border border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                    servicesInView
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                  
                  <CardContent className="p-6 md:p-8">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-[hsl(45,100%,51%)] rounded-xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 shadow-md transition-all duration-300">
                      <service.icon className="w-7 h-7 md:w-8 md:h-8 text-[hsl(0,0%,13%)]" />
                    </div>
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed font-medium">
                      {service.description}
                    </p>
                    <ul className="space-y-2.5 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link 
                      to={service.link}
                      className="inline-flex items-center gap-2 font-bold text-sm text-primary group-hover:gap-3 transition-all duration-300"
                    >
                      Learn More 
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-primary relative overflow-hidden">
          <div className="section-container text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              Need a Custom Logistics Solution?
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-medium mb-10 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              Our team of experts will work with you to create a tailored solution that meets your specific requirements.
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 h-12 px-8 font-semibold text-[15px] rounded-[10px] transition-all duration-200 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] shadow-md hover:shadow-lg hover:bg-[hsl(45,100%,45%)] hover:-translate-y-0.5 active:scale-[0.98] group"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Services;
