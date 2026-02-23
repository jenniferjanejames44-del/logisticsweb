import { ArrowRight, PlaneTakeoff, Anchor, Container } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Express Delivery",
    description: "Express delivery worldwide with real-time tracking and priority handling for urgent shipments.",
    href: "/services/air-shipping",
    image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&q=80",
    icon: PlaneTakeoff,
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments across all major international ports.",
    href: "/services/ocean-shipping",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80",
    icon: Anchor,
  },
  {
    title: "Warehousing",
    description: "Secure storage facilities with advanced inventory management systems.",
    href: "/services/warehousing",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80",
    icon: Container,
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-muted">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-bold mb-5 transition-all duration-500 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Services
          </span>
          <h2
            className={`text-foreground mb-5 transition-all duration-500 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics Solutions
          </h2>
          <p
            className={`text-muted-foreground text-lg md:text-xl leading-relaxed transition-all duration-500 delay-150 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            End-to-end logistics services tailored to your business needs with unmatched reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const ServiceIcon = service.icon;
            return (
              <Link
                key={service.title}
                to={service.href}
                className={`group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${index * 80 + 200}ms` }}
              >
                {/* Service Image */}
                <div className="relative w-full h-52 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/20 transition-colors duration-300" />
                  
                  {/* Icon Badge */}
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                    <ServiceIcon className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed mb-5">
                    {service.description}
                  </p>
                  <div className="inline-flex items-center gap-2 font-bold text-sm text-primary group-hover:gap-3 transition-all duration-200">
                    <span>Learn More</span>
                    <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-14 transition-all duration-500 delay-400 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2.5 px-8 py-3.5 font-bold text-sm rounded-full shadow-md transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
