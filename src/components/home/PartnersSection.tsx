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
    <section ref={ref} className="py-12 md:py-16 gradient-dark relative overflow-hidden">
      <div className="section-container px-4 sm:px-6 relative">
        {/* Partners Marquee */}
        <div className={`relative overflow-hidden py-6 transition-all duration-600 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[#0a0e1a] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[#0a0e1a] to-transparent z-10" />
          
          <div className="flex animate-marquee">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 md:mx-12 lg:mx-16 flex items-center justify-center h-12 md:h-14 opacity-40 hover:opacity-100 hover:scale-105 transition-all duration-300"
                style={{ filter: 'brightness(0) invert(1)' }}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 md:h-10 lg:h-12 object-contain"
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
