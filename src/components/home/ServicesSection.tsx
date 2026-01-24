import { 
  Plane, 
  Ship, 
  ShoppingBag, 
  PackageSearch, 
  Warehouse, 
  FileCheck,
  ArrowRight 
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Plane,
    title: "Air Shipping",
    description: "Express delivery worldwide with real-time tracking and secure handling.",
    href: "/services/air",
    color: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Ship,
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments across continents.",
    href: "/services/ocean",
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: ShoppingBag,
    title: "Personal Shopping",
    description: "We buy and ship products from any store worldwide directly to you.",
    href: "/services/personal-shopping",
    color: "from-secondary/20 to-secondary/5",
  },
  {
    icon: PackageSearch,
    title: "Procurement",
    description: "Source products globally with our expert procurement services.",
    href: "/services/procurement",
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: Warehouse,
    title: "Warehousing",
    description: "Secure storage solutions with inventory management systems.",
    href: "/services/warehousing",
    color: "from-secondary/20 to-secondary/5",
  },
  {
    icon: FileCheck,
    title: "Customs Clearance",
    description: "Navigate customs regulations with our expert clearance services.",
    href: "/services/customs",
    color: "from-primary/10 to-primary/5",
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`inline-block text-secondary font-semibold mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            WHAT WE OFFER
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Comprehensive Logistics <span className="text-secondary">Solutions</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            From air freight to ocean cargo, we provide end-to-end logistics services 
            tailored to your business needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <service.icon size={28} className="text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-heading font-bold text-foreground mb-3 group-hover:text-secondary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {service.description}
              </p>

              {/* Link */}
              <div className="flex items-center gap-2 text-secondary font-medium">
                Learn More
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-12 transition-all duration-700 delay-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button variant="cta" size="lg" asChild>
            <Link to="/services">
              View All Services
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
