import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="cta-band section-padding relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-15">
        <img
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80"
          alt="Global logistics network"
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
            className={`mb-6 max-w-2xl text-[1.02rem] leading-relaxed text-white/82 transition-all duration-500 delay-200 sm:text-[1.1rem] ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          
          <div className={`cta-actions transition-all duration-500 delay-300 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <Button asChild variant="heroPrimary" size="lg">
              <Link to="/pricing">
                Get Quote
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="heroSecondary" size="lg">
              <Link to="/contact">
                Contact Us
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
