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
    <section ref={ref} className="py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl opacity-50" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Industries We Serve
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-foreground mb-6 leading-tight transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Solutions for <span className="text-secondary">Every Industry</span>
          </h2>
          <p
            className={`text-lg lg:text-xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Tailored logistics solutions designed to meet the unique needs of 
            diverse industries across the globe.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {industries.map((industry, index) => (
            <div
              key={industry.title}
              className={`group bg-gradient-to-br from-card to-muted/20 rounded-2xl p-6 lg:p-8 border border-border/50 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-secondary/30 flex items-start gap-5 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary group-hover:scale-110 transition-all duration-300 shadow-sm">
                <industry.icon
                  size={26}
                  className="text-secondary group-hover:text-secondary-foreground transition-colors"
                />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg lg:text-xl font-heading font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">
                  {industry.title}
                </h3>
                <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
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
