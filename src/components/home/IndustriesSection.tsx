import { ShoppingCart, Factory, Pill, Laptop, Utensils, Car } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const industries = [
  {
    icon: ShoppingCart,
    title: "E-Commerce",
    description: "Fast, reliable shipping for online retailers worldwide.",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    description: "Supply chain solutions for industrial operations.",
  },
  {
    icon: Pill,
    title: "Healthcare",
    description: "Temperature-controlled logistics for pharmaceuticals.",
  },
  {
    icon: Laptop,
    title: "Technology",
    description: "Secure handling for sensitive electronics.",
  },
  {
    icon: Utensils,
    title: "Food & Beverage",
    description: "Cold chain logistics for perishable goods.",
  },
  {
    icon: Car,
    title: "Automotive",
    description: "Parts logistics and just-in-time delivery.",
  },
];

const IndustriesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-background relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`badge-yellow mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Industries We Serve
          </span>
          <h2
            className={`text-primary mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Solutions for <span className="gradient-text">Every Industry</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Tailored logistics solutions designed to meet the unique needs of 
            diverse industries across the globe.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => (
            <div
              key={industry.title}
              className={`glass-card card-top-border p-8 group flex items-start gap-5 transition-all duration-600 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 flex-shrink-0 gradient-blue rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <industry.icon size={24} className="text-white" />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                  {industry.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {industry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
