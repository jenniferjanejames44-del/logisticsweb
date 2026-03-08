import { ArrowRight, PlaneTakeoff, Anchor, Container } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Express Delivery",
    description: "Express delivery worldwide with real-time tracking and priority handling for urgent shipments.",
    href: "/services/air-shipping",
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80",
    icon: PlaneTakeoff,
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments across all major international ports.",
    href: "/services/ocean-shipping",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80",
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
    <section ref={ref} className="section-padding bg-background">
      <div className="section-container">
        <div className="surface-muted px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-flex items-center rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm transition-all duration-500 ${
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const ServiceIcon = service.icon;
            return (
              <Link
                key={service.title}
                to={service.href}
                className={`group relative overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_55px_rgba(15,23,42,0.1)] ${
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
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-foreground/20 to-transparent group-hover:from-foreground/30 transition-all duration-300" />

                  {/* Icon Badge */}
                  <div className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_16px_35px_rgba(15,23,42,0.14)] transition-transform duration-200 group-hover:scale-110">
                    <ServiceIcon className="w-6 h-6 text-primary" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-7">
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
            className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_14px_30px_rgba(6,16,67,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/92 hover:shadow-[0_18px_36px_rgba(6,16,67,0.2)] active:scale-[0.98]"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
