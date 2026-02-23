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
    <section ref={ref} className="section-padding bg-muted relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 transition-all duration-600 bg-accent text-accent-foreground shadow-sm ${
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
            className={`text-muted-foreground text-lg md:text-xl font-medium leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Trusted by businesses worldwide for reliable, efficient logistics solutions.
          </p>
        </div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {differentiators.map((item, index) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 150}ms` }}
            >
              {/* Top accent bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-7 shadow-md transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg">
                <item.icon size={28} className="text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
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
