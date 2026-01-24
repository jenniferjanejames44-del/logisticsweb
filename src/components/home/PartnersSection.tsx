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
    <section ref={ref} className="py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <p
          className={`text-center text-muted-foreground font-medium mb-10 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          TRUSTED BY LEADING COMPANIES WORLDWIDE
        </p>

        {/* Partners Marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex animate-marquee">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-12 flex items-center justify-center h-16 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 md:h-10 object-contain"
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
