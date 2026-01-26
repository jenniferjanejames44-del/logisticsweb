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
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 bg-gradient-to-br from-[hsl(222,47%,11%)] via-[hsl(222,40%,15%)] to-[hsl(222,47%,11%)] overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          </div>
          
          <div className="section-container relative z-10">
            <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-6">
                Our Services
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6">
                Comprehensive <span className="text-secondary">Logistics Solutions</span>
              </h1>
              <p className="text-lg md:text-xl text-[hsl(215,20%,80%)] mb-8 leading-relaxed">
                From air freight to customs clearance, we offer end-to-end logistics services tailored to your needs. Experience seamless shipping with RAC Logistics.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="default" size="xl" className="w-full sm:w-auto" asChild>
                  <Link to="/pricing">Get a Quote</Link>
                </Button>
                <Button variant="ghost" size="xl" className="w-full sm:w-auto" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section ref={servicesRef} className="section-padding bg-background">
          <div className="section-container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service, index) => (
                <Card
                  key={service.title}
                  className={`group bg-card border border-border rounded-2xl hover:border-secondary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                    servicesInView
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                      <service.icon className="w-7 h-7 md:w-8 md:h-8 text-secondary" />
                    </div>
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4 group-hover:text-secondary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="link" className="p-0 h-auto text-secondary group-hover:gap-3 transition-all" asChild>
                      <Link to={service.link}>
                        Learn More <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-br from-[hsl(222,47%,11%)] to-[hsl(222,40%,15%)]">
          <div className="section-container text-center">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Need a Custom Logistics Solution?
            </h2>
            <p className="text-lg md:text-xl text-[hsl(215,20%,80%)] mb-8 max-w-2xl mx-auto leading-relaxed">
              Our team of experts will work with you to create a tailored solution that meets your specific requirements.
            </p>
            <Button variant="default" size="xl" asChild>
              <Link to="/contact">Get in Touch</Link>
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
