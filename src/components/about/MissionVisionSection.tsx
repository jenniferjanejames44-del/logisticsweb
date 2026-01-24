import { Target, Eye, Lightbulb, Heart } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const MissionVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  const items = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide seamless, reliable, and cost-effective logistics solutions that empower businesses to reach their full potential in the global marketplace.",
      color: "bg-secondary",
      iconColor: "text-secondary-foreground",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "To become the world's most trusted logistics partner, setting new standards for innovation, sustainability, and customer excellence in the shipping industry.",
      color: "bg-primary",
      iconColor: "text-primary-foreground",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously invest in cutting-edge technology and processes to optimize operations and deliver exceptional value to our clients.",
      color: "bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      icon: Heart,
      title: "Our Promise",
      description: "Every package we handle represents someone's trust in us. We treat each shipment with the care and attention it deserves, delivering peace of mind.",
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

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
            OUR PURPOSE
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-secondary">Purpose</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide every decision we make and every 
            shipment we deliver around the world.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon size={28} className={item.iconColor} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;
