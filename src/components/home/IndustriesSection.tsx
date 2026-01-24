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
    <section ref={ref} className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`inline-block text-secondary font-semibold mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            INDUSTRIES WE SERVE
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Solutions for <span className="text-secondary">Every Industry</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground transition-all duration-700 delay-200 ${
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
              className={`group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 flex items-start gap-4 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 flex-shrink-0 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                <industry.icon
                  size={24}
                  className="text-secondary group-hover:text-secondary-foreground transition-colors"
                />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">
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
