import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Air Shipping",
    description: "Express delivery worldwide with real-time tracking and priority handling.",
    href: "/services/air-shipping",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments across all major ports.",
    href: "/services/ocean-shipping",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Personal Shopping",
    description: "We buy and ship products from any store worldwide to your door.",
    href: "/services/personal-shopping",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Procurement",
    description: "Source products globally with expert supply chain management.",
    href: "/services/procurement",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Warehousing",
    description: "Secure storage with advanced inventory management systems.",
    href: "/services/warehousing",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Customs Clearance",
    description: "Expert clearance and full regulatory compliance services.",
    href: "/services/customs-clearance",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 sm:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration - enhanced */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-secondary/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-secondary/5 to-primary/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Services
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-5 sm:mb-6 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics{" "}
            <span className="text-secondary">Solutions</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            End-to-end logistics services tailored to your business needs with unmatched reliability.
          </p>
        </div>

        {/* Services Grid - Enhanced Cards with depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`group relative bg-card rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-2xl hover:border-secondary/50 transition-all duration-500 hover:-translate-y-3 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
                
                {/* Title on image */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl lg:text-2xl font-heading font-bold text-white">
                    {service.title}
                  </h3>
                </div>

                {/* Hover overlay with arrow - Orange accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 to-[hsl(18,100%,50%)]/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ArrowRight size={32} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-lg">Learn More</span>
                  </div>
                </div>
              </div>

              {/* Content - Enhanced styling */}
              <div className="p-5 sm:p-6">
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 text-secondary font-bold text-sm sm:text-base group-hover:gap-3 transition-all">
                  <span>Explore Service</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA - Enhanced */}
        <div
          className={`text-center mt-12 sm:mt-16 lg:mt-20 transition-all duration-700 delay-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button variant="cta" size="xl" className="text-base px-10 py-6 rounded-2xl shadow-[0_4px_20px_rgba(255,107,53,0.4)] hover:shadow-[0_8px_30px_rgba(255,107,53,0.5)]" asChild>
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
