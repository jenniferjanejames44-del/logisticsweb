import { Shield, Eye, Zap, Lock, HeartHandshake } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "Consistently delivering on our promises with dependable service you can trust.",
    emoji: "🛡️",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Real-time tracking and clear communication throughout your shipment journey.",
    emoji: "👁️",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Express delivery options ensuring your packages arrive on time, every time.",
    emoji: "⚡",
  },
  {
    icon: Lock,
    title: "Security",
    description: "Advanced handling protocols and insurance for complete peace of mind.",
    emoji: "🔒",
  },
  {
    icon: HeartHandshake,
    title: "Customer-Centric",
    description: "24/7 support and personalized solutions tailored to your unique needs.",
    emoji: "🤝",
  },
];

const CoreValuesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding gradient-dark relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className={`badge-orange mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Principles
          </span>
          <h2
            className={`text-white mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Core <span className="gradient-text">Values</span>
          </h2>
          <p
            className={`text-white/70 text-lg transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The fundamental principles that guide everything we do and define who we are.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`glass-card card-top-border p-8 text-center group transition-all duration-600 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80 + 200}ms` }}
            >
              {/* Emoji Icon */}
              <div className="w-14 h-14 mx-auto gradient-orange rounded-xl flex items-center justify-center mb-6 text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                {value.emoji}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-3">
                {value.title}
              </h3>
              
              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed">
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
