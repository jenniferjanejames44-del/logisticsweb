import { Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import founderImage from "@/assets/founder.jpg";

const FounderSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 sm:py-28 lg:py-36 relative overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${founderImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/85" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-700 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              <img
                src={founderImage}
                alt="James Wuyep - Founder & CEO"
                className="w-full rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 sm:w-24 sm:h-24 bg-secondary rounded-2xl flex items-center justify-center shadow-yellow">
                <Quote size={36} className="text-primary sm:w-10 sm:h-10" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <span className="inline-block text-secondary font-bold text-sm tracking-widest uppercase mb-4">
              LEADERSHIP
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-8 leading-tight">
              A Message From Our <span className="text-secondary">Founder</span>
            </h2>
            <blockquote className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-10 italic font-light">
              "At RAC Logistics, we don't just move packages—we build bridges between 
              businesses and opportunities worldwide. Our commitment to excellence, 
              innovation, and customer satisfaction drives everything we do."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-16 h-1.5 bg-secondary rounded-full" />
              <div>
                <h4 className="font-heading font-bold text-white text-lg sm:text-xl">
                  James Wuyep
                </h4>
                <p className="text-white/70 font-medium">
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
