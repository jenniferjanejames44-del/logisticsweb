import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Premium service cards with images
const services = [
  {
    title: "Air Shipping",
    description: "Express delivery worldwide with real-time tracking and secure handling for time-sensitive cargo.",
    href: "/services/air",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments with full container and LCL options.",
    href: "/services/ocean",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Personal Shopping",
    description: "We buy and ship products from any store worldwide directly to your doorstep.",
    href: "/services/personal-shopping",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Procurement",
    description: "Source products globally with our expert procurement and supplier management services.",
    href: "/services/procurement",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Warehousing",
    description: "Secure storage solutions with advanced inventory management and distribution systems.",
    href: "/services/warehousing",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Customs Clearance",
    description: "Navigate customs regulations seamlessly with our expert clearance and compliance services.",
    href: "/services/customs",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-section-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Premium Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span
            className={`inline-block text-secondary font-bold text-sm tracking-widest uppercase mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What We Offer
          </span>
          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-foreground mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics{" "}
            <span className="bg-gradient-to-r from-secondary to-[hsl(40,100%,55%)] bg-clip-text text-transparent">
              Solutions
            </span>
          </h2>
          <p
            className={`text-lg md:text-xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            From air freight to ocean cargo, we provide end-to-end logistics services 
            tailored to your business needs with enterprise-grade reliability.
          </p>
        </div>

        {/* Premium Services Grid with Images */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`group relative bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Image Container with Zoom Effect */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                
                {/* Hover overlay with icon */}
                <div className="absolute inset-0 bg-secondary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <ArrowRight size={48} className="text-secondary-foreground" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-3 group-hover:text-secondary transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {service.description}
                </p>

                {/* Learn More Link */}
                <div className="flex items-center gap-2 text-secondary font-semibold">
                  <span>Learn More</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-2 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-secondary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={`text-center mt-16 transition-all duration-700 delay-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button variant="cta" size="xl" asChild>
            <Link to="/services" className="group">
              View All Services
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;