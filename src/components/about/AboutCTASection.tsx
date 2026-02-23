import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const AboutCTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-muted">
      <div className="section-container">
        <div
          className={`bg-card rounded-xl p-8 md:p-12 shadow-lg text-center max-w-3xl mx-auto border border-border transition-all duration-500 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ready to Partner with RAC Logistics?
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of businesses who trust us for their global shipping needs. 
            Let's discuss how we can help your business grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-extrabold text-sm sm:text-base rounded-full shadow-lg transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] w-full sm:w-auto"
            >
              Contact Us
              <ArrowRight size={16} />
            </Link>
            <Link 
              to="/services"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-extrabold text-sm sm:text-base rounded-full shadow-sm transition-all duration-200 bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 active:scale-[0.98] w-full sm:w-auto"
            >
              View Services
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
