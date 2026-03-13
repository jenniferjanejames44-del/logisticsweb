import { useInView } from "@/hooks/useInView";
import { Network, BrainCircuit, Headset, BadgeCheck } from "lucide-react";

const differentiators = [
  {
    icon: Network,
    title: "Global Network",
    description: "Connected to every corner of the world through our extensive logistics network spanning 150+ countries.",
  },
  {
    icon: BrainCircuit,
    title: "Smart Technology",
    description: "AI-powered tracking and route optimization for faster, more efficient deliveries every time.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description: "Round-the-clock customer service with dedicated agents ready to assist you anytime.",
  },
];

const WhyChooseSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding section-alt relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center lg:mb-16">
          <span
            className={`section-badge mb-6 border-accent/20 bg-accent text-accent-foreground transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <BadgeCheck size={14} />
            Our Advantage
          </span>
          <h2
            className={`text-foreground mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Why Choose <span className="text-primary">Us</span>
          </h2>
          <p
            className={`mx-auto max-w-2xl text-base font-medium leading-relaxed text-muted-foreground transition-all duration-600 delay-200 sm:text-lg ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Trusted by businesses worldwide for reliable, efficient logistics solutions.
          </p>
        </div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-7">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`surface-grid-card group h-full p-6 sm:p-7 lg:p-8 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Top accent bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />

              <div className="icon-tile mb-6 transition-all duration-300 group-hover:scale-[1.04]">
                <item.icon size={28} className="text-primary" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <BadgeCheck size={16} />
                <span>Guaranteed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
