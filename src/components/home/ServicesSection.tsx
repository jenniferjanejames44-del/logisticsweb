import { ArrowRight, Plane, Package, Ship } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const services = [
  {
    title: "Air Express",
    description: "Premium express air freight delivering in 3–5 business days. Fast, reliable, and fully tracked to major destinations worldwide.",
    href: "/services/air-shipping",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    icon: Plane,
  },
  {
    title: "Standard Shipping",
    description: "Reliable standard air freight with 14-day delivery. The perfect balance of speed and cost for regular business shipments.",
    href: "/services/import",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
    icon: Package,
  },
  {
    title: "Ocean / Sea Freight",
    description: "Economical sea freight for large and heavy cargo. FCL and LCL options with 45–60 day transit to ports worldwide.",
    href: "/services/ocean-shipping",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=80",
    icon: Ship,
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding section-alt">
      <div className="section-container">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-16">
          <span
            className={`section-badge mb-5 border-accent/20 bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.16)] transition-all duration-500 ${
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
            className={`mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground transition-all duration-500 delay-150 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            End-to-end logistics services tailored to your business needs with unmatched reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-7">
          {services.map((service, index) => {
            const ServiceIcon = service.icon;
            return (
              <Link
                key={service.title}
                to={service.href}
                className={`group surface-grid-card h-full p-0 transition-all duration-300 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${index * 80 + 200}ms` }}
              >
                {/* Service Image */}
                <div className="relative h-56 w-full overflow-hidden sm:h-60">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-foreground/20 to-transparent group-hover:from-foreground/30 transition-all duration-300" />

                  {/* Icon Badge */}
                  <div className="absolute bottom-4 right-4 rounded-[20px] border border-white/50 bg-white/95 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition-all duration-200 group-hover:-translate-y-px group-hover:scale-[1.03]">
                    <span className="icon-tile h-11 w-11 rounded-[16px]">
                      <ServiceIcon className="w-6 h-6 text-primary" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7">
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
          className={`mt-14 text-center transition-all duration-500 delay-400 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button asChild variant="default" size="lg">
            <Link to="/services">
              View All Services
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
