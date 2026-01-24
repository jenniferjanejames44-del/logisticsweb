import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Premium service cards with real logistics images
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
    <section ref={ref} className="py-24 sm:py-32 lg:py-40 bg-background relative overflow-hidden">
      {/* Light decorative backgrounds */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Bigger, bolder */}
        <div className="text-center max-w-4xl mx-auto mb-20 sm:mb-24">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded-full mb-6 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Services
          </span>
          <h2
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black text-foreground mb-8 transition-all duration-700 delay-100 leading-[1.05] ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics{" "}
            <span className="text-secondary">Solutions</span>
          </h2>
          <p
            className={`text-xl md:text-2xl text-foreground/70 leading-relaxed transition-all duration-700 delay-200 font-medium ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            From air freight to ocean cargo, we provide end-to-end logistics services 
            tailored to your business needs with enterprise-grade reliability.
          </p>
        </div>

        {/* Premium Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`group relative bg-card rounded-3xl overflow-hidden border border-border/80 hover:border-secondary/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
                
                {/* Title overlay on image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white drop-shadow-lg">
                    {service.title}
                  </h3>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-95 transition-all duration-400">
                  <div className="text-center p-6">
                    <ArrowRight size={56} className="text-secondary-foreground mx-auto mb-4" />
                    <span className="text-secondary-foreground font-bold text-xl">View Service</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 bg-card">
                <p className="text-foreground/70 leading-relaxed text-lg mb-5">
                  {service.description}
                </p>

                {/* Learn More */}
                <div className="flex items-center gap-2 text-secondary font-bold text-lg">
                  <span>Learn More</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-3 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={`text-center mt-20 sm:mt-24 transition-all duration-700 delay-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button variant="cta" size="xl" className="text-lg px-12 py-7 rounded-2xl" asChild>
            <Link to="/services" className="group">
              View All Services
              <ArrowRight size={24} className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
