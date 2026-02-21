import { Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import founderImage from "@/assets/founder-rex.jpg";

const FounderSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-background relative overflow-hidden">
      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-600 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
            }`}
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              {/* Image Container */}
              <div className="glass-card p-2 rounded-3xl">
                <img
                  src={founderImage}
                  alt="Offor Rex C.K - Founder & CEO"
                  className="w-full rounded-2xl"
                  loading="lazy"
                />
              </div>
              
              {/* Quote Badge */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Quote size={28} className="text-primary-foreground" />
              </div>
              
              {/* Badge */}
              <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm border border-border px-4 py-2 rounded-full">
                <span className="text-primary font-semibold text-sm">🚢 Ocean Shipping</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 bg-[hsl(45,100%,51%)]/15 text-[hsl(45,100%,40%)]">
              Leadership
            </span>
            <h2 className="text-foreground mb-6">
              A Message From Our <span className="text-primary">Founder</span>
            </h2>
            <blockquote className={`text-lg md:text-xl text-muted-foreground font-medium leading-relaxed mb-8 transition-all duration-600 delay-300 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              "At RAC Logistics, we don't just move packages—we build bridges between 
              businesses and opportunities worldwide. Our commitment to excellence, 
              innovation, and customer satisfaction drives everything we do."
            </blockquote>
            <div className={`flex items-center gap-4 mb-8 transition-all duration-600 delay-400 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="w-12 h-1 bg-primary rounded-full" />
              <div>
                <h4 className="font-semibold text-foreground text-lg">
                  Offor Rex C.K
                </h4>
                <p className="text-muted-foreground">
                  Founder & CEO, RAC Logistics
                </p>
              </div>
            </div>
            
            <Link 
              to="/about"
              className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-7 font-bold text-sm rounded-full transition-all duration-200 bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:-translate-y-0.5 active:scale-[0.98] group w-full sm:w-auto"
            >
              Learn More
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
