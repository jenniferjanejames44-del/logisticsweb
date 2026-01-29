import { Shield, Eye, Zap, Lock, HeartHandshake } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "Consistently delivering on our promises with dependable service you can trust.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Real-time tracking and clear communication throughout your shipment journey.",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Express delivery options ensuring your packages arrive on time, every time.",
  },
  {
    icon: Lock,
    title: "Security",
    description: "Advanced handling protocols and insurance for complete peace of mind.",
  },
  {
    icon: HeartHandshake,
    title: "Customer-Centric",
    description: "24/7 support and personalized solutions tailored to your unique needs.",
  },
];

const CoreValuesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-background relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className={`badge-yellow mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Principles
          </span>
          <h2
            className={`text-primary mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Core <span className="gradient-text">Values</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The fundamental principles that guide everything we do and define who we are.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`glass-card card-top-border p-6 text-center group transition-all duration-200 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 60 + 150}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 mx-auto gradient-blue rounded-lg flex items-center justify-center mb-5 shadow-sm transition-transform duration-200 group-hover:scale-105">
                <value.icon size={22} className="text-white" />
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-primary mb-2">
                {value.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValuesSection;
