import { Quote, Star } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    quote: "RAC Logistics transformed our supply chain operations. Their reliability and professionalism are unmatched in the industry.",
    author: "James Anderson",
    role: "CEO, TechFlow Industries",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop",
    rating: 5,
  },
  {
    quote: "We've reduced shipping costs by 30% while improving delivery times. The team at RAC truly understands global logistics.",
    author: "Maria Santos",
    role: "Operations Director, Global Retail Co.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
    rating: 5,
  },
  {
    quote: "Their customs clearance expertise saved us weeks of delays. Highly recommend for any international shipping needs.",
    author: "David Kim",
    role: "Founder, AsiaConnect Trading",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    rating: 5,
  },
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
    <section ref={ref} className="py-16 md:py-24 bg-primary relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span
            className={`inline-block text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            TRUSTED WORLDWIDE
          </span>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What Our Clients Say
          </h2>
          <p
            className={`text-base md:text-lg text-white/80 transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Join thousands of businesses that trust RAC Logistics for their global shipping needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <Quote size={20} className="text-white md:w-6 md:h-6" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-white fill-white" />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/30"
                  loading="lazy"
                />
                <div>
                  <h4 className="text-white font-semibold text-sm md:text-base">
                    {testimonial.author}
                  </h4>
                  <p className="text-white/60 text-xs md:text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trusted Logos */}
        <div
          className={`transition-all duration-700 delay-500 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-center text-white/60 text-sm mb-6 md:mb-8 uppercase tracking-wider">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
            {trustedLogos.map((logo, index) => (
              <div
                key={logo.name}
                className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <span className="text-white/70 font-heading font-bold text-lg md:text-xl">
                  {logo.initial}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
