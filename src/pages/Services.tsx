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
        <section
          ref={heroRef}
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden bg-primary"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1920&q=80)',
            }}
          />
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-3xl mx-auto transition-all duration-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 text-white/90 backdrop-blur-sm border border-white/20 rounded-full text-sm font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Our Services
              </span>
              <h1 className="text-white mb-6 leading-tight">
                Comprehensive Logistics Solutions
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
                From air freight to customs clearance, we offer end-to-end logistics services tailored to your needs. Experience seamless shipping with RAC Logistics.
              </p>
              <div className="flex flex-row justify-center gap-4">
                <Link 
                  to="/pricing"
                  className="btn btn-primary btn-lg"
                >
                  Get a Quote
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link 
                  to="/contact"
                  className="btn btn-secondary btn-lg"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section ref={servicesRef} className="section-padding bg-background">
          <div className="section-container">
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
              <h2 className="text-foreground mb-5">
                Explore Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
                Comprehensive logistics solutions designed for your business needs.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Card
                  key={service.title}
                  className={`group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${
                    servicesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                  <CardContent className="p-6 md:p-8">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15 md:mb-6 md:h-16 md:w-16">
                      <service.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" strokeWidth={2.5} />
                    </div>
                    <h3 className="mb-4 text-foreground transition-colors duration-300 group-hover:text-primary">
                      {service.title}
                    </h3>
                    <p className="mb-6 text-base leading-relaxed text-muted-foreground">{service.description}</p>
                    <ul className="space-y-2.5 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
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
            <h2 className="text-white mb-6">Need a Custom Logistics Solution?</h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Our team of experts will work with you to create a tailored solution that meets your specific requirements.
            </p>
            <Link 
              to="/contact"
              className="btn btn-primary btn-lg"
            >
              Get in Touch
              <ArrowRight className="w-5 h-5" />
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
