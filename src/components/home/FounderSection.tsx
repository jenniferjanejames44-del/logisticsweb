import { MessageSquareQuote } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import founderImage from "@/assets/founder-rex.jpg";

const FounderSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-background relative overflow-hidden">
      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-600 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
            }`}
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              {/* Image Container */}
              <div className="glass-card p-2.5 rounded-3xl">
                <img
                  src={founderImage}
                  alt="Offor Rex C.K - Founder & CEO"
                  className="w-full rounded-2xl"
                  loading="lazy"
                />
              </div>
              
              {/* Quote Badge */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquareQuote size={28} className="text-primary-foreground" />
              </div>
              
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 bg-accent text-accent-foreground">
              Leadership
            </span>
            <h2 className="text-foreground mb-7">
              A Message From Our <span className="text-primary">Founder</span>
            </h2>
            <blockquote className={`text-lg md:text-xl text-muted-foreground font-medium leading-relaxed mb-8 transition-all duration-600 delay-300 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              "At RAC Logistics, we don't just move packages—we build bridges between 
              businesses and opportunities worldwide. Our commitment to excellence, 
              innovation, and customer satisfaction drives everything we do."
            </blockquote>
            <div className={`flex items-center gap-4 mb-10 transition-all duration-600 delay-400 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="w-14 h-1 bg-primary rounded-full" />
              <div>
                <h4 className="font-extrabold text-foreground text-lg">
                  Offor Rex C.K
                </h4>
                <p className="text-muted-foreground">
                  Founder & CEO, RAC Logistics
                </p>
              </div>
            </div>
            
            <Link 
              to="/about"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 font-bold text-sm sm:text-base rounded-full transition-all duration-300 ease-out bg-accent text-accent-foreground shadow-lg hover:shadow-xl hover:bg-accent/90 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md group"
            >
              Learn More
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
