import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="xl" className="w-full sm:w-auto group" asChild>
              <Link to="/contact">
                Contact Us Today
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="secondary" size="xl" className="w-full sm:w-auto group" asChild>
              <Link to="/services">
                Explore Services
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTASection;
