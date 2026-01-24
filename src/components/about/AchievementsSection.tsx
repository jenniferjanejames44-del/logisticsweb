import { Award, Globe, Package, Users, ThumbsUp, Clock } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const achievements = [
  {
    icon: Package,
    value: 50000,
    suffix: "+",
    label: "Shipments Delivered",
    description: "Packages safely delivered worldwide",
  },
  {
    icon: Globe,
    value: 150,
    suffix: "+",
    label: "Countries Served",
    description: "Global reach across continents",
  },
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Happy Customers",
    description: "Businesses trusting our services",
  },
  {
    icon: Award,
    value: 25,
    suffix: "+",
    label: "Industry Awards",
    description: "Recognition for excellence",
  },
  {
    icon: ThumbsUp,
    value: 99,
    suffix: "%",
    label: "Satisfaction Rate",
    description: "Customer happiness guaranteed",
  },
  {
    icon: Clock,
    value: 98,
    suffix: "%",
    label: "On-Time Delivery",
    description: "Punctuality you can count on",
  },
];

const AchievementCounter = ({
  value,
  suffix,
  isActive,
}: {
  value: number;
  suffix: string;
  isActive: boolean;
}) => {
  const count = useAnimatedCounter(value, 2500, isActive);
  return (
    <span className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const AchievementsSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-secondary/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-secondary/10 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`inline-block text-secondary font-semibold mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            OUR ACHIEVEMENTS
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Numbers That <span className="text-secondary">Define Us</span>
          </h2>
          <p
            className={`text-lg text-primary-foreground/80 transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our track record speaks for itself. These milestones represent 
            years of dedication and excellence in logistics.
          </p>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.label}
              className={`group bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-8 text-center hover:bg-primary-foreground/10 transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                <achievement.icon
                  size={28}
                  className="text-secondary group-hover:text-secondary-foreground transition-colors"
                />
              </div>

              {/* Counter */}
              <AchievementCounter
                value={achievement.value}
                suffix={achievement.suffix}
                isActive={isInView}
              />

              {/* Label */}
              <h3 className="text-lg font-heading font-semibold text-primary-foreground mt-2 mb-2">
                {achievement.label}
              </h3>
              <p className="text-primary-foreground/60 text-sm">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
