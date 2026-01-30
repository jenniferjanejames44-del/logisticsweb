import { ArrowRight, Plane, Ship, Warehouse } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Express Delivery",
    description: "Express delivery worldwide with real-time tracking and priority handling for urgent shipments.",
    href: "/services/air-shipping",
    image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&q=80",
    icon: Plane,
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments across all major international ports.",
    href: "/services/ocean-shipping",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80",
    icon: Ship,
  },
  {
    title: "Warehousing",
    description: "Secure storage facilities with advanced inventory management systems.",
    href: "/services/warehousing",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80",
    icon: Warehouse,
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-section-blue relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`badge-blue mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Services
          </span>
          <h2
            className={`text-primary mb-5 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics <span className="gradient-text">Solutions</span>
          </h2>
          <p
            className={`text-foreground/80 text-lg md:text-xl font-medium leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            End-to-end logistics services tailored to your business needs with unmatched reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const ServiceIcon = service.icon;
            return (
              <Link
                key={service.title}
                to={service.href}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-400 ease-out hover:-translate-y-2 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 80 + 150}ms` }}
              >
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent via-secondary to-accent bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px]">
                  <div className="absolute inset-[2px] rounded-2xl bg-card" />
                </div>

                {/* Card content container */}
                <div className="relative bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-accent/10 transition-all duration-400">
                  {/* Top accent bar on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left z-10" />
                  
                  {/* Service Image with Overlay */}
                  <div className="relative w-full h-[200px] overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-400" />
                    
                    {/* Floating Icon Badge */}
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <ServiceIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-6">
                    {/* Subtle glow effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                      {service.description}
                    </p>
                    <div className="inline-flex items-center gap-2 font-bold text-sm text-accent transition-all duration-300 group-hover:gap-3">
                      <span className="uppercase tracking-wide">Learn More</span>
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
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
            className="btn btn-primary uppercase tracking-wide group"
          >
            View All Services
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
