import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const CTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding relative overflow-hidden bg-primary">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-15">
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" 
          alt="Cargo logistics"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="section-container relative z-10">
        <div
          className={`text-center max-w-2xl mx-auto transition-all duration-500 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Heading */}
          <h2 
            className={`text-white mb-4 transition-all duration-500 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Ready to Ship Globally?
          </h2>
          
          <p 
            className={`text-lg text-white/80 mb-8 leading-relaxed max-w-xl mx-auto transition-all duration-500 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-3 justify-center items-center transition-all duration-500 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 bg-white text-primary hover:bg-white/90 active:scale-[0.98]"
            >
              Get Quote
              <ArrowRight size={16} />
            </Link>
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 bg-transparent text-white border border-white/50 hover:bg-white/10 hover:border-white active:scale-[0.98]"
            >
              Contact Us
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
