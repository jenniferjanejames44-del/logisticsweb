import { Award, Rocket } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import teamHeroImage from "@/assets/team-hero.jpg";

const AboutHeroSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="pt-32 pb-20 md:pt-40 md:pb-24 bg-gradient-to-br from-[hsl(222,47%,11%)] via-[hsl(222,40%,15%)] to-[hsl(222,47%,11%)] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary to-transparent" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div
            className={`transition-all duration-700 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <span className="inline-block text-secondary font-semibold mb-4 uppercase tracking-wider text-sm">
              About RAC Logistics
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-primary-foreground mb-6 leading-tight">
              Your Trusted <span className="text-secondary">Global Partner</span>
            </h1>
            <p className="text-lg text-[hsl(215,20%,80%)] leading-relaxed mb-8">
              Since 2010, RAC Logistics has been at the forefront of international 
              shipping and logistics. We've built our reputation on reliability, 
              innovation, and an unwavering commitment to customer satisfaction.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Award size={24} className="text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-primary-foreground">15+</p>
                  <p className="text-sm text-[hsl(215,20%,70%)]">Years of Excellence</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Rocket size={24} className="text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-primary-foreground">50K+</p>
                  <p className="text-sm text-[hsl(215,20%,70%)]">Deliveries Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative">
              <img
                src={teamHeroImage}
                alt="RAC Logistics Team"
                className="w-full rounded-2xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 bg-secondary rounded-2xl p-6 shadow-lg">
                <p className="text-3xl font-heading font-bold text-secondary-foreground">150+</p>
                <p className="text-sm text-secondary-foreground/80">Countries Served</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSection;
