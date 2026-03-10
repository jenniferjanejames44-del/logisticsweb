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
              className="inline-flex h-11 w-full max-w-[220px] items-center justify-center gap-2.5 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-primary hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] sm:h-11 sm:w-auto sm:max-w-none sm:text-base"
            >
              Contact Us
              <ArrowRight size={16} />
            </Link>
            <Link 
              to="/services"
              className="inline-flex h-11 w-full max-w-[220px] items-center justify-center gap-2.5 rounded-lg border border-primary bg-white px-6 text-sm font-semibold text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] transition-all duration-200 hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] sm:h-11 sm:w-auto sm:max-w-none sm:text-base"
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
