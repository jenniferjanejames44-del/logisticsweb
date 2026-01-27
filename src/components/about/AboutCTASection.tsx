import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const AboutCTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-muted">
      <div className="section-container">
        <div
          className={`bg-card rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl text-center max-w-4xl mx-auto border border-border transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Ready to Partner with <span className="text-secondary">RAC Logistics?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of businesses who trust us for their global shipping needs. 
            Let's discuss how we can help your business grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/contact"
              className="btn btn-primary w-full sm:w-auto"
            >
              Contact Us
              <ArrowRight size={18} />
            </Link>
            <Link 
              to="/services"
              className="btn bg-[#0C4A6E] text-white hover:bg-[#0C4A6E]/90 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              View Services
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
