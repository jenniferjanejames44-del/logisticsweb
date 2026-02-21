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
          className={`text-center max-w-3xl mx-auto transition-all duration-500 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Heading */}
          <h2 
            className={`text-white mb-6 transition-all duration-500 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Ready to Ship Globally?
          </h2>
          
          <p 
            className={`text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto transition-all duration-500 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-500 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-extrabold text-sm sm:text-base rounded-full shadow-lg transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Get Quote
              <ArrowRight size={18} />
            </Link>
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-extrabold text-sm sm:text-base rounded-full shadow-sm transition-all duration-200 bg-white text-primary hover:bg-white/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Contact Us
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
