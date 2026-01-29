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
    <section ref={ref} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span
            className={`inline-block text-secondary font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            OUR PURPOSE
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-secondary">Purpose</span>
          </h2>
          <p
            className={`text-base md:text-lg text-muted-foreground transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide every decision we make and every 
            shipment we deliver around the world.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {items.map((item, index) => (
            <div
              key={item.title}
              className={`group bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon size={24} className={`${item.iconColor} sm:w-7 sm:h-7`} />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground mb-2 sm:mb-4">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
