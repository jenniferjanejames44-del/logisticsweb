import { useInView } from "@/hooks/useInView";

const CompanyStorySection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  const timeline = [
    { year: "2010", title: "Founded", description: "RAC Logistics was established with a vision to revolutionize global shipping." },
    { year: "2013", title: "Expansion", description: "Expanded operations to 50+ countries across 4 continents." },
    { year: "2016", title: "Innovation", description: "Launched our AI-powered tracking and route optimization system." },
    { year: "2019", title: "Recognition", description: "Awarded 'Best Logistics Company' by Global Trade Magazine." },
    { year: "2022", title: "Sustainability", description: "Committed to carbon-neutral operations by 2030." },
    { year: "2026", title: "Global Leader", description: "Serving 150+ countries with over 50,000 shipments delivered." },
  ];

  return (
    <section ref={ref} className="section-padding bg-muted">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 bg-accent text-accent-foreground transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            OUR JOURNEY
          </span>
          <h2
            className={`text-foreground mb-4 md:mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The RAC <span className="text-primary">Story</span>
          </h2>
          <p
            className={`text-base md:text-lg text-muted-foreground transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            From humble beginnings to becoming a global logistics leader, 
            our journey has been defined by innovation and dedication.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-4 sm:left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />
          <div className="space-y-6 md:space-y-8">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                className={`relative flex flex-row md:items-center gap-4 sm:gap-6 transition-all duration-700 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                } ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-accent rounded-full border-2 sm:border-4 border-background shadow-lg z-10 flex-shrink-0 md:hidden mt-2" />
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    <span className="text-primary font-bold text-base sm:text-lg">{item.year}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1 mb-2">{item.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-accent rounded-full border-4 border-background shadow-lg z-10 hidden md:block flex-shrink-0" />
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStorySection;
