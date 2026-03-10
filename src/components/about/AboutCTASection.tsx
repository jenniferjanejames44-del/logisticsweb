import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
            <Button asChild className="w-full max-w-[208px] sm:w-auto sm:max-w-none">
              <Link to="/contact">
                Contact Us
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full max-w-[208px] sm:w-auto sm:max-w-none">
              <Link to="/services">
                View Services
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
