import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Button } from "@/components/ui/button";

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
    <section ref={ref} className="py-20 sm:py-28 lg:py-36 bg-[hsl(210,40%,98%)] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-5">
        <Quote size={400} className="text-[hsl(215,28%,17%)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-sm tracking-widest uppercase mb-4 px-5 py-2 rounded-full transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Testimonials
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-[hsl(215,28%,17%)] mb-6 transition-all duration-700 delay-100 leading-tight ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            What Our{" "}
            <span className="text-secondary">
              Clients Say
            </span>
          </h2>
        </div>

        {/* Testimonials Slider */}
        <div className={`relative max-w-5xl mx-auto transition-all duration-700 delay-300 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-16 z-10 bg-white shadow-lg border-2 border-[hsl(214,32%,91%)] hover:bg-secondary hover:text-white hover:border-secondary w-12 h-12 lg:w-14 lg:h-14 rounded-xl transition-all"
          >
            <ChevronLeft size={24} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-16 z-10 bg-white shadow-lg border-2 border-[hsl(214,32%,91%)] hover:bg-secondary hover:text-white hover:border-secondary w-12 h-12 lg:w-14 lg:h-14 rounded-xl transition-all"
          >
            <ChevronRight size={24} />
          </Button>

          {/* Slides */}
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-3xl p-8 sm:p-10 md:p-14 shadow-xl text-center border border-[hsl(214,32%,91%)]">
                    {/* Quote Icon */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center mb-8">
                      <Quote size={32} className="text-secondary sm:w-9 sm:h-9" />
                    </div>

                    {/* Content */}
                    <p className="text-lg sm:text-xl md:text-2xl text-[hsl(215,28%,17%)] leading-relaxed mb-10 font-light">
                      "{testimonial.content}"
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center gap-1.5 mb-8">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className="text-secondary fill-secondary"
                        />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4 sm:gap-5">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-secondary shadow-lg"
                        loading="lazy"
                      />
                      <div className="text-left">
                        <h4 className="font-heading font-bold text-[hsl(215,28%,17%)] text-lg sm:text-xl">
                          {testimonial.name}
                        </h4>
                        <p className="text-[hsl(215,16%,47%)] font-medium text-sm">
                          {testimonial.role}
                        </p>
                        <p className="text-secondary font-semibold text-sm">
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
          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "bg-secondary w-10"
                    : "bg-[hsl(214,32%,91%)] hover:bg-secondary/50 w-3"
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
