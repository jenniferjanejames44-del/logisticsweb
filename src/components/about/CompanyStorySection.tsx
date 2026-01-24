import { useInView } from "@/hooks/useInView";

const CompanyStorySection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  const timeline = [
    {
      year: "2010",
      title: "Founded",
      description: "RAC Logistics was established with a vision to revolutionize global shipping.",
    },
    {
      year: "2013",
      title: "Expansion",
      description: "Expanded operations to 50+ countries across 4 continents.",
    },
    {
      year: "2016",
      title: "Innovation",
      description: "Launched our AI-powered tracking and route optimization system.",
    },
    {
      year: "2019",
      title: "Recognition",
      description: "Awarded 'Best Logistics Company' by Global Trade Magazine.",
    },
    {
      year: "2022",
      title: "Sustainability",
      description: "Committed to carbon-neutral operations by 2030.",
    },
    {
      year: "2026",
      title: "Global Leader",
      description: "Serving 150+ countries with over 50,000 shipments delivered.",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`inline-block text-secondary font-semibold mb-4 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            OUR JOURNEY
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The RAC <span className="text-secondary">Story</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            From humble beginnings to becoming a global logistics leader, 
            our journey has been defined by innovation and dedication.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                className={`relative flex flex-col md:flex-row items-center gap-6 transition-all duration-700 ${
                  isInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                } ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    <span className="text-secondary font-heading font-bold text-lg">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-heading font-bold text-foreground mt-1 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Dot */}
                <div className="w-4 h-4 bg-secondary rounded-full border-4 border-background shadow-lg z-10 hidden md:block" />

                {/* Spacer */}
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
