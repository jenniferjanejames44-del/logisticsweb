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
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-semibold text-sm tracking-wide uppercase px-4 py-2 rounded-full mb-4 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Industries We Serve
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Solutions for <span className="text-secondary">Every Industry</span>
          </h2>
          <p
            className={`text-lg md:text-xl text-muted-foreground leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Tailored logistics solutions designed to meet the unique needs of 
            diverse industries across the globe.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {industries.map((industry, index) => (
            <div
              key={industry.title}
              className={`group bg-card rounded-2xl p-6 md:p-8 border border-border/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-start gap-5 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 flex-shrink-0 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:scale-105 transition-all duration-300">
                <industry.icon size={22} className="text-secondary group-hover:text-white transition-colors" />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-secondary transition-colors">
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
