import { useInView } from "@/hooks/useInView";

const partners = [
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "FedEx", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/FedEx_Corporation_-_2016_Logo.svg" },
  { name: "DHL", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg" },
  { name: "UPS", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/United_Parcel_Service_logo_2014.svg" },
  { name: "Maersk", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Maersk_Group_Logo.svg" },
  { name: "Alibaba", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Alibaba-Logo.svg" },
];

const PartnersSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className={`inline-block bg-secondary/10 text-secondary font-bold text-sm tracking-widest uppercase px-5 py-2.5 rounded-full mb-5 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Our Partners
          </span>
          <h3
            className={`text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground transition-all duration-700 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Trusted by Leading Companies Worldwide
          </h3>
        </div>

        {/* Partners Grid */}
        <div className="relative overflow-hidden py-6">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-muted/80 via-muted/50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-muted/80 via-muted/50 to-transparent z-10" />
          
          <div className="flex animate-marquee">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-12 sm:mx-16 lg:mx-20 flex items-center justify-center h-20 logo-gray hover:scale-110 transition-all duration-500 cursor-pointer"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 md:h-14 lg:h-16 object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;