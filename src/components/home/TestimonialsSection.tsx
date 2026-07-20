import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    name: "Ego Maxwell",
    role: "CEO, TechCorp",
    company: "TechCorp International",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    content: "RAC Logistics has transformed our supply chain. Their reliability and speed are unmatched. We've reduced delivery times by 40% since partnering with them.",
    rating: 5,
  },
  {
    name: "Chukwuma Okoro",
    role: "Operations Director",
    company: "GlobalTrade Solutions",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    content: "The tracking system is incredibly detailed. We can monitor our shipments in real-time, which has improved our customer satisfaction significantly.",
    rating: 5,
  },
  {
    name: "Daniel Ajigini",
    role: "Founder",
    company: "Luxe Imports Co.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    content: "From personal shopping to customs clearance, RAC handles everything seamlessly. Their team is professional and always goes the extra mile.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="section-padding bg-muted relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 lg:mb-16">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 transition-all duration-600 bg-accent text-accent-foreground shadow-sm ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Testimonials
          </span>
          <h2
            className={`text-foreground mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          <p
            className={`text-muted-foreground text-lg md:text-xl font-medium leading-relaxed transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Trusted by businesses worldwide for reliable shipping solutions.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className={`relative max-w-4xl mx-auto transition-all duration-600 delay-200 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          {/* Slides */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <div className="bg-card border border-border/50 rounded-2xl p-8 sm:p-10 md:p-14 text-center shadow-sm">
                    {/* Quote Icon */}
                    <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center mb-10 shadow-md">
                      <Quote size={28} className="text-accent-foreground" />
                    </div>

                    {/* Content */}
                    <p className="text-lg sm:text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                      "{testimonial.content}"
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center gap-1.5 mb-8">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={22} className="text-accent fill-accent" />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="mx-auto max-w-sm space-y-1 text-center">
                        <h4 className="font-extrabold text-foreground text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {testimonial.role}
                        </p>
                        <p className="text-primary text-sm font-bold">
                          {testimonial.company}
                        </p>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary w-10"
                    : "bg-border hover:bg-primary/40 w-3"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
