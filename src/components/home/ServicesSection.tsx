import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Air Shipping",
    description: "Express delivery worldwide with real-time tracking.",
    href: "/services/air",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments.",
    href: "/services/ocean",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Personal Shopping",
    description: "We buy and ship products from any store worldwide.",
    href: "/services/personal-shopping",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Procurement",
    description: "Source products globally with expert management.",
    href: "/services/procurement",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Warehousing",
    description: "Secure storage with inventory management.",
    href: "/services/warehousing",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Customs Clearance",
    description: "Expert clearance and compliance services.",
    href: "/services/customs",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-xs sm:text-sm tracking-wider uppercase px-4 py-2 rounded-full mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Services
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 sm:mb-5 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics{" "}
            <span className="text-secondary">Solutions</span>
          </h2>
          <p
            className={`text-base sm:text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            End-to-end logistics services tailored to your business needs.
          </p>
        </div>

        {/* Services Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`group relative bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border hover:border-secondary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                
                {/* Title on image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-white">
                    {service.title}
                  </h3>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-95 transition-opacity duration-300">
                  <ArrowRight size={40} className="text-secondary-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 lg:p-6">
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 text-secondary font-bold text-sm sm:text-base">
                  <span>Learn More</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-10 sm:mt-14 lg:mt-16 transition-all duration-700 delay-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button variant="cta" size="lg" className="text-sm sm:text-base px-6 sm:px-10 py-5 sm:py-6 rounded-xl" asChild>
            <Link to="/services" className="group">
              View All Services
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
