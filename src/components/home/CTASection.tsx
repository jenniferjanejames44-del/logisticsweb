import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const CTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 sm:py-28 lg:py-36 bg-[hsl(230,60%,6%)] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(0,0%,100%) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[hsl(217,91%,60%)]/15 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Heading with gradient */}
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight mb-6 transition-all duration-700 delay-100 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <span className="text-white">Ready to Ship </span>
            <span 
              className="text-secondary"
              style={{ textShadow: '0 0 40px rgba(251,146,60,0.5)' }}
            >
              Globally?
            </span>
          </h2>
          
          <p className={`text-lg sm:text-xl text-[hsl(215,20%,70%)] mb-12 leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-200 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Button
              className="px-10 py-7 text-lg font-bold rounded-xl bg-gradient-to-r from-secondary to-[hsl(18,100%,55%)] text-white shadow-[0_10px_40px_rgba(251,146,60,0.5)] hover:shadow-[0_15px_50px_rgba(251,146,60,0.6)] hover:scale-105 transition-all duration-300 group"
              asChild
            >
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
            <Button
              className="px-10 py-7 text-lg font-bold rounded-xl bg-transparent border-2 border-white text-white hover:bg-white hover:text-[hsl(230,60%,10%)] hover:scale-105 transition-all duration-300 group"
              asChild
            >
              <Link to="/contact">
                Contact Sales
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
