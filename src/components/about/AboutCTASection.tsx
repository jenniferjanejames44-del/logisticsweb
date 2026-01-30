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
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-7 py-3.5 sm:py-3 font-bold text-base rounded-xl transition-all duration-300 ease-out bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground shadow-lg hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 group w-full sm:w-auto"
            >
              Contact Us
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/services"
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-7 py-3.5 sm:py-3 font-bold text-base rounded-xl transition-all duration-300 ease-out bg-primary text-primary-foreground shadow-md hover:bg-[hsl(200,70%,28%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 group w-full sm:w-auto"
            >
              View Services
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
