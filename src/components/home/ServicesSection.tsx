import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Express Delivery",
    description: "Express delivery worldwide with real-time tracking and priority handling for urgent shipments.",
    href: "/services/air-shipping",
    image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&q=80",
  },
  {
    title: "Ocean Shipping",
    description: "Cost-effective sea freight for large shipments across all major international ports.",
    href: "/services/ocean-shipping",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80",
  },
  {
    title: "Warehousing",
    description: "Secure storage facilities with advanced inventory management systems.",
    href: "/services/warehousing",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80",
  },
];

const ServicesSection = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)' }}>
      <div className="section-container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm uppercase tracking-wide mb-6 transition-all duration-600 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ 
              background: 'rgba(14, 165, 233, 0.1)', 
              border: '2px solid #0EA5E9', 
              color: '#0284C7',
              fontWeight: 700 
            }}
          >
            Our Services
          </span>
          <h2
            className={`mb-6 transition-all duration-600 delay-100 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: '#0C4A6E', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
          >
            Comprehensive Logistics <span className="gradient-text">Solutions</span>
          </h2>
          <p
            className={`text-lg transition-all duration-600 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: '#475569' }}
          >
            End-to-end logistics services tailored to your business needs with unmatched reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className={`overflow-hidden group transition-all duration-[400ms] ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ 
                transitionDelay: `${index * 100 + 200}ms`,
                background: '#FFFFFF',
                border: '2px solid #E0F2FE',
                borderRadius: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0EA5E9';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.15)';
                e.currentTarget.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E0F2FE';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Service Image with Overlay */}
              <div className="relative w-full h-[240px] overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)' }} />
              </div>

              {/* Content */}
              <div className="p-7">
                <h3 className="text-2xl mb-4" style={{ color: '#0C4A6E', fontWeight: 700 }}>
                  {service.title}
                </h3>
                <p className="leading-relaxed mb-6" style={{ color: '#64748B' }}>
                  {service.description}
                </p>
                <div 
                  className="inline-flex items-center gap-2 font-semibold group-hover:gap-4 transition-all duration-300"
                  style={{ color: '#0EA5E9' }}
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-16 transition-all duration-600 delay-500 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 group px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:-translate-y-1"
            style={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
              boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #E55A28 0%, #D94E1F 100%)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(229, 90, 40, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4)';
            }}
          >
            View All Services
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
