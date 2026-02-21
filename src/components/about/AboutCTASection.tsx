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
          <h2 className="text-foreground mb-4">
            Ready to Partner with RAC Logistics?
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of businesses who trust us for their global shipping needs. 
            Let's discuss how we can help your business grow.
          </p>
          <div className="flex flex-row flex-wrap gap-3 justify-center items-center">
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 font-bold text-sm rounded-full transition-all duration-200 bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98] shadow-md"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/services"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 font-bold text-sm rounded-full transition-all duration-200 bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
            >
              View Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
