import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechCorp",
    company: "TechCorp International",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    content: "RAC Logistics has transformed our supply chain. Their reliability and speed are unmatched. We've reduced delivery times by 40% since partnering with them.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Operations Director",
    company: "GlobalTrade Solutions",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    content: "The tracking system is incredibly detailed. We can monitor our shipments in real-time, which has improved our customer satisfaction significantly.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
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

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="section-padding bg-section-blue relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`badge-blue mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Testimonials
          </span>
          <h2
            className={`text-primary transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
        </div>

        {/* Testimonials Slider */}
        <div className={`relative max-w-4xl mx-auto transition-all duration-600 delay-200 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-12 z-10 w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-accent/50 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-12 z-10 w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-accent/50 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slides */}
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="glass-card p-6 md:p-10 text-center">
                    {/* Quote Icon */}
                    <div className="w-12 h-12 mx-auto gradient-blue rounded-lg flex items-center justify-center mb-6 shadow-sm">
                      <Quote size={24} className="text-white" />
                    </div>

                    {/* Content */}
                    <p className="text-base md:text-lg text-foreground leading-relaxed mb-6">
                      "{testimonial.content}"
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={18} className="text-secondary fill-secondary" />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-lg object-cover border border-accent/20"
                        loading="lazy"
                      />
                      <div className="text-left">
                        <h4 className="font-semibold text-primary">
                          {testimonial.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {testimonial.role}
                        </p>
                        <p className="gradient-text text-sm font-medium">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "gradient-blue w-6"
                    : "bg-border hover:bg-accent/30 w-2"
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
