import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const CTASection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 sm:py-28 lg:py-36 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,hsl(45_100%_50%)_0%,transparent_40%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,hsl(45_100%_50%)_0%,transparent_40%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6 leading-tight">
            Ready to Ship with <span className="text-secondary">RAC</span>?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-12 leading-relaxed font-medium">
            Join thousands of businesses who trust RAC Logistics for their shipping needs. 
            Get a free quote today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="cta"
              size="xl"
              className="text-base sm:text-lg group"
              asChild
            >
              <Link to="/pricing">
                Get Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              className="text-base sm:text-lg"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
