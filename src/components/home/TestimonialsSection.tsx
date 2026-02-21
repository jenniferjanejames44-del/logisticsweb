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
    <section ref={ref} className="section-padding bg-muted relative overflow-hidden">
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide mb-6 transition-all duration-600 bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] shadow-sm ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Testimonials
          </span>
          <h2
            className={`text-foreground mb-3 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          {/* Underline accent */}
          <div className={`w-16 h-1 bg-primary mx-auto mb-5 rounded-full transition-all duration-500 delay-150 ${
            isInView ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
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
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-2 lg:-translate-x-14 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-card border-2 border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-2 lg:translate-x-14 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-card border-2 border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slides */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-sm">
                    {/* Quote Icon - Yellow */}
                    <div className="w-14 h-14 mx-auto bg-[hsl(45,100%,51%)] rounded-xl flex items-center justify-center mb-8 shadow-md">
                      <Quote size={26} className="text-[hsl(0,0%,13%)]" />
                    </div>

                    {/* Content */}
                    <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed mb-6 sm:mb-8 font-medium">
                      "{testimonial.content}"
                    </p>

                    {/* Rating - Yellow stars */}
                    <div className="flex justify-center gap-1.5 mb-8">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={20} className="text-[hsl(45,100%,51%)] fill-[hsl(45,100%,51%)]" />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-primary/30 shadow-sm"
                        loading="lazy"
                      />
                      <div className="text-left">
                        <h4 className="font-bold text-foreground text-lg">
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
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-border hover:bg-primary/40 w-2.5"
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
