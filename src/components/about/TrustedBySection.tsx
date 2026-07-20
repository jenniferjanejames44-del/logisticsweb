import { Quote, Star } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  { quote: "RAC Logistics transformed our supply chain operations. Their reliability and professionalism are unmatched in the industry.", author: "Ego Maxwell", role: "CEO, TechFlow Industries", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop", rating: 5 },
  { quote: "We've reduced shipping costs by 30% while improving delivery times. The team at RAC truly understands global logistics.", author: "Chukwuma Okoro", role: "Operations Director, Global Retail Co.", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop", rating: 5 },
  { quote: "Their customs clearance expertise saved us weeks of delays. Highly recommend for any international shipping needs.", author: "Daniel Ajigini", role: "Founder, AsiaConnect Trading", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop", rating: 5 },
];

const trustedLogos = [
  { name: "TechFlow", initial: "TF" },
  { name: "GlobalRetail", initial: "GR" },
  { name: "AsiaConnect", initial: "AC" },
  { name: "EuroTrade", initial: "ET" },
  { name: "AmeriShip", initial: "AS" },
  { name: "PacificCargo", initial: "PC" },
];

const TrustedBySection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="section-padding bg-primary relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            TRUSTED WORLDWIDE
          </span>
          <h2
            className={`text-white mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What Our Clients Say
          </h2>
          <p
            className={`hero-subtext text-base md:text-lg transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Join thousands of businesses that trust RAC Logistics for their global shipping needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <Quote size={20} className="text-accent md:w-6 md:h-6" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-accent fill-accent" />
                ))}
              </div>
              <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
              <div className="text-center">
                  <h4 className="text-white font-semibold text-sm md:text-base">{testimonial.author}</h4>
                  <p className="text-white/60 text-xs md:text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TrustedBySection;
