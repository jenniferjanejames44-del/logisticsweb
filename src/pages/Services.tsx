import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { useInView } from "@/hooks/useInView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Ship, ShoppingBag, Globe, Send, Warehouse, FileCheck, ArrowRight, PackageCheck } from "lucide-react";

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
    icon: Globe,
    title: "Import",
    description: "Ship from supported RAC warehouse countries into your destination market with a guided import workflow.",
    link: "/services/import",
    features: ["Warehouse Countries", "Import Workflow", "Delivery Timeline", "Shipment Booking"]
  },
  {
    icon: Send,
    title: "Export",
    description: "Ship items internationally with supported destination guidance, packaging rules, and export steps.",
    link: "/services/export",
    features: ["Supported Destinations", "Packaging Guidance", "Export Rules", "Shipment Creation"]
  },
  {
    icon: ShoppingBag,
    title: "Buy For Me / Procurement",
    description: "Submit product links publicly and let RAC purchase items on your behalf using the existing procurement system.",
    link: "/services/procurement",
    features: ["Public Request Form", "Admin Fee Bands", "File Upload", "Existing Procurement Queue"]
  },
  {
    icon: PackageCheck,
    title: "Global Pickup",
    description: "We arrange package pickup from suppliers, warehouses, and businesses globally, transporting items safely to your destination.",
    link: "/services/global-pickup",
    features: ["Worldwide Coordination", "Secure Handling", "Fast Shipping", "Real-time Tracking"]
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
        <section ref={heroRef} className="page-hero">
          <div 
            className="page-hero-media"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1920&q=80)',
            }}
          />
          <div className="page-hero-overlay" />
          
          <div className="section-container relative z-10">
            <div className={`page-hero-shell transition-all duration-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="page-hero-badge mb-6">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Our Services
              </span>
              <h1 className="text-white mb-6 leading-tight">
                Comprehensive Logistics Solutions
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-6 max-w-2xl mx-auto">
                From air freight to customs clearance, we offer end-to-end logistics services tailored to your needs. Experience seamless shipping with RAC Logistics.
              </p>
              <div className="page-hero-actions">
                <Button asChild size="lg" variant="heroPrimary">
                  <Link to="/pricing">
                    Get a Quote
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="heroSecondary">
                  <Link to="/contact">
                    Contact Us
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section ref={servicesRef} className="section-padding bg-background">
          <div className="section-container">
            <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-16">
              <span className="section-badge border-primary/10 bg-primary/5 text-primary">Service Catalogue</span>
              <h2 className="text-foreground mb-5">
                Explore Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
                Comprehensive logistics solutions designed for your business needs.
              </p>
            </div>
            
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {services.map((service, index) => (
                <Card
                  key={service.title}
                  className={`group relative h-full overflow-hidden rounded-[24px] border-border/70 bg-white/95 transition-all duration-500 ${
                    servicesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                  <CardContent className="flex h-full flex-col p-6 md:p-8">
                    <div className="icon-tile mb-5 h-14 w-14 md:mb-6 md:h-16 md:w-16">
                      <service.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" strokeWidth={2.5} />
                    </div>
                    <h3 className="mb-4 text-foreground transition-colors duration-300 group-hover:text-primary">
                      {service.title}
                    </h3>
                    <p className="mb-6 text-base leading-relaxed text-muted-foreground">{service.description}</p>
                    <ul className="mb-6 space-y-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link 
                      to={service.link}
                      className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-primary transition-all duration-300 group-hover:gap-3"
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
        <section className="cta-band section-padding relative overflow-hidden">
          <div className="section-container text-center relative z-10">
            <h2 className="text-white mb-6">Need a Custom Logistics Solution?</h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Our team of experts will work with you to create a tailored solution that meets your specific requirements.
            </p>
            <Button asChild size="lg" variant="heroPrimary">
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="w-5 h-5" />
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

export default Services;
