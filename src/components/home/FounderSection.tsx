import { Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import founderImage from "@/assets/founder.jpg";

const FounderSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${founderImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-700 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative">
              <img
                src={founderImage}
                alt="James Wuyep - Founder & CEO"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary rounded-2xl flex items-center justify-center">
                <Quote size={40} className="text-secondary-foreground" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <span className="inline-block text-secondary font-semibold mb-4">
              LEADERSHIP
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-6">
              A Message From Our <span className="text-secondary">Founder</span>
            </h2>
            <blockquote className="text-xl text-primary-foreground/90 leading-relaxed mb-8 italic">
              "At RAC Logistics, we don't just move packages—we build bridges between 
              businesses and opportunities worldwide. Our commitment to excellence, 
              innovation, and customer satisfaction drives everything we do."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-16 h-1 bg-secondary rounded-full" />
              <div>
                <h4 className="font-heading font-bold text-primary-foreground text-lg">
                  James Wuyep
                </h4>
                <p className="text-primary-foreground/70">
                  Founder & CEO, RAC Logistics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
