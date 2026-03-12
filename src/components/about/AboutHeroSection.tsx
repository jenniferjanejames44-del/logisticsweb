import { Award, Rocket } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import teamHeroImage from "@/assets/team-hero.jpg";

const AboutHeroSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="pt-32 pb-20 md:pt-40 md:pb-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white to-transparent" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div
            className={`text-center lg:text-left transition-all duration-700 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 text-white/90 backdrop-blur-sm border border-white/20 rounded-full text-sm font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              About RAC Logistics
            </span>
            <h1 className="text-white mb-5 sm:mb-6 leading-tight">
              Your Trusted Global Partner
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-medium leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Since 2017, RAC Logistics has been at the forefront of international 
              shipping and logistics. We've built our reputation on reliability, 
              innovation, and an unwavering commitment to customer satisfaction.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-accent-foreground sm:w-6 sm:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xl sm:text-2xl font-bold text-white">15+</p>
                  <p className="text-xs sm:text-sm text-white/70">Years of Excellence</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Rocket size={20} className="text-accent-foreground sm:w-6 sm:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xl sm:text-2xl font-bold text-white">50K+</p>
                  <p className="text-xs sm:text-sm text-white/70">Deliveries Completed</p>
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
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <img src={teamHeroImage} alt="RAC Logistics Team" className="w-full rounded-2xl shadow-2xl" loading="lazy" />
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <p className="text-2xl sm:text-3xl font-bold text-primary">150+</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Countries Served</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSection;
