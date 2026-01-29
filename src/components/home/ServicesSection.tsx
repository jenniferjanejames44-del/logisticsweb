import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Express Delivery",
    description: "Express delivery worldwide with real-time tracking and priority handling for urgent shipments.",
    href: "/services/air-shipping",
    image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&q=80",
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments across all major international ports.",
    href: "/services/ocean-shipping",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80",
  },
  {
    title: "Warehousing",
    description: "Secure storage facilities with advanced inventory management systems.",
    href: "/services/warehousing",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80",
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-section-blue relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`badge-blue mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Services
          </span>
          <h2
            className={`text-primary mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics <span className="gradient-text">Solutions</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            End-to-end logistics services tailored to your business needs with unmatched reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-1 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Top accent bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              
              {/* Service Image with Overlay */}
              <div className="relative w-full h-[200px] overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent group-hover:from-black/40 transition-all duration-400" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {service.description}
                </p>
                <div className="inline-flex items-center gap-2 font-bold text-sm text-accent transition-all duration-300 group-hover:gap-3">
                  <span>Learn More</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-14 transition-all duration-500 delay-400 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link 
            to="/services" 
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 ease-out bg-secondary text-primary shadow-lg hover:shadow-xl hover:bg-secondary/95 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md group"
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
