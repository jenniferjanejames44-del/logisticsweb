import { Store, Cog, Syringe, Cpu, UtensilsCrossed, Fuel } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const industries = [
  {
    icon: Store,
    title: "E-Commerce",
    description: "Fast, reliable shipping for online retailers worldwide.",
  },
  {
    icon: Cog,
    title: "Manufacturing",
    description: "Supply chain solutions for industrial operations.",
  },
  {
    icon: Syringe,
    title: "Healthcare",
    description: "Temperature-controlled logistics for pharmaceuticals.",
  },
  {
    icon: Cpu,
    title: "Technology",
    description: "Secure handling for sensitive electronics.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Beverage",
    description: "Cold chain logistics for perishable goods.",
  },
  {
    icon: Fuel,
    title: "Oil & Gas",
    description: "Specialized logistics support for energy equipment and supply chains.",
  },
];

const IndustriesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-background relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 lg:mb-16">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 transition-all duration-600 bg-accent text-accent-foreground shadow-sm ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Industries We Serve
          </span>
          <h2
            className={`text-foreground mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Solutions for <span className="text-primary">Every Industry</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg md:text-xl font-medium leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Tailored logistics solutions designed to meet the unique needs of 
            diverse industries across the globe.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {industries.map((industry, index) => (
            <div
              key={industry.title}
              className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 flex items-start gap-6 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Top accent bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              
              {/* Icon */}
              <div className="w-16 h-16 flex-shrink-0 bg-accent rounded-2xl flex items-center justify-center shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg">
                <industry.icon size={26} className="text-accent-foreground" />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {industry.title}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">
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
