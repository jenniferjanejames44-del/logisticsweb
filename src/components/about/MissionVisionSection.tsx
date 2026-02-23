import { Target, Eye, Lightbulb, Heart } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const MissionVisionSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  const items = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide seamless, reliable, and cost-effective logistics solutions that empower businesses to reach their full potential in the global marketplace.",
      color: "bg-primary",
      iconColor: "text-primary-foreground",
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
      color: "bg-primary/10",
      iconColor: "text-primary",
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
    <section ref={ref} className="section-padding bg-background">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 transition-all duration-700 bg-accent text-accent-foreground ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            OUR PURPOSE
          </span>
          <h2
            className={`text-foreground mb-5 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Driven by <span className="text-primary">Purpose</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg md:text-xl font-medium leading-relaxed transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our mission and vision guide every decision we make and every 
            shipment we deliver around the world.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {items.map((item, index) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden bg-card rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              <div className={`w-14 h-14 sm:w-16 sm:h-16 ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 shadow-md transition-all duration-300`}>
                <item.icon size={26} className={`${item.iconColor}`} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
              <p className="text-muted-foreground text-base font-medium leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionSection;
