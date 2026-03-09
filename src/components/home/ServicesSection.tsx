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
    <section ref={ref} className="section-padding section-alt">
      <div className="section-container">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
          <span
            className={`mb-5 inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.16)] transition-all duration-500 ${
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
            className={`text-base leading-relaxed text-muted-foreground transition-all duration-500 delay-150 md:text-base ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            End-to-end logistics services tailored to your business needs with unmatched reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const ServiceIcon = service.icon;
            return (
              <Link
                key={service.title}
                to={service.href}
                className={`group relative overflow-hidden rounded-lg border border-border bg-card shadow-[0_10px_30px_rgba(15,23,42,0.05),0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08),0_6px_14px_rgba(15,23,42,0.05)] ${
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
                  <div className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/50 bg-white/95 shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:-translate-y-px group-hover:scale-[1.03]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ServiceIcon className="w-6 h-6 text-primary" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-3 text-foreground transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>
                  <p className="mb-5 text-base leading-relaxed text-muted-foreground">
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
            className="btn btn-primary"
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
