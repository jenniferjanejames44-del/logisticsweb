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
    <section ref={ref} className="py-20 bg-background relative overflow-hidden">
      {/* Top and bottom borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <p
          className={`text-center text-muted-foreground font-semibold text-sm tracking-widest uppercase mb-12 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Trusted by Leading Companies Worldwide
        </p>

        {/* Partners Marquee */}
        <div className="relative overflow-hidden py-4">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />
          
          <div className="flex animate-marquee">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-16 flex items-center justify-center h-16 logo-gray hover:scale-110 transition-all duration-400 cursor-pointer"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-10 md:h-12 object-contain"
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