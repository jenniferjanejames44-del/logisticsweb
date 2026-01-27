import { Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import founderImage from "@/assets/founder-rex.jpg";

const FounderSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 md:py-24 lg:py-32 bg-foreground relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-600 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
            }`}
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              <img
                src={founderImage}
                alt="James Wuyep - Founder & CEO"
                className="w-full rounded-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-secondary rounded-xl flex items-center justify-center">
                <Quote size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
            }`}
          >
            <span className="inline-block text-secondary font-semibold text-sm tracking-wide uppercase mb-4">
              Leadership
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-8 leading-tight">
              A Message From Our <span className="text-secondary">Founder</span>
            </h2>
            <blockquote className={`text-lg md:text-xl text-white/80 leading-relaxed mb-8 transition-all duration-600 delay-300 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              "At RAC Logistics, we don't just move packages—we build bridges between 
              businesses and opportunities worldwide. Our commitment to excellence, 
              innovation, and customer satisfaction drives everything we do."
            </blockquote>
            <div className={`flex items-center gap-4 transition-all duration-600 delay-400 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="w-12 h-1 bg-secondary rounded-full" />
              <div>
                <h4 className="font-semibold text-white text-lg">
                  Offor Rex C.K
                </h4>
                <p className="text-white/60">
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
