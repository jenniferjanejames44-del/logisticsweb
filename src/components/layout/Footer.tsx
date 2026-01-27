import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Heart
} from "lucide-react";

const Footer = () => {
  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const services = [
    { name: "Air Shipping", href: "/services/air-shipping" },
    { name: "Ocean Shipping", href: "/services/ocean-shipping" },
    { name: "Personal Shopping", href: "/services/personal-shopping" },
    { name: "Procurement", href: "/services/procurement" },
    { name: "Warehousing", href: "/services/warehousing" },
    { name: "Customs Clearance", href: "/services/customs-clearance" },
  ];


  return (
    <footer className="bg-gradient-to-b from-[hsl(230,60%,6%)] to-[hsl(230,60%,4%)] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[hsl(217,91%,60%)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1 - Company */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center font-heading font-bold text-white text-xl group-hover:scale-110 transition-transform shadow-[0_4px_20px_rgba(251,146,60,0.4)]">
                R
              </div>
              <span className="font-heading font-bold text-2xl text-white">
                RAC <span className="text-secondary">Logistics</span>
              </span>
            </Link>
            <p className="text-[hsl(215,20%,65%)] leading-relaxed text-base">
              Your trusted partner for global logistics solutions. Delivering excellence across continents with speed, security, and reliability.
            </p>
            
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-xl mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[hsl(215,20%,65%)] hover:text-secondary transition-colors inline-flex items-center gap-2 group text-base"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-secondary" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Services */}
          <div>
            <h4 className="font-heading font-bold text-xl mb-6 text-white">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.href}
                    className="text-[hsl(215,20%,65%)] hover:text-secondary transition-colors inline-flex items-center gap-2 group text-base"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-secondary" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <h4 className="font-heading font-bold text-xl mb-6 text-white">Contact Us</h4>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <a href="mailto:info@raclogistics.com" className="flex items-center gap-3 text-[hsl(215,20%,65%)] hover:text-secondary transition-colors text-base group">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center group-hover:bg-secondary transition-colors">
                  <Mail size={18} className="text-secondary group-hover:text-white" />
                </div>
                info@raclogistics.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 text-[hsl(215,20%,65%)] hover:text-secondary transition-colors text-base group">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center group-hover:bg-secondary transition-colors">
                  <Phone size={18} className="text-secondary group-hover:text-white" />
                </div>
                +1 (234) 567-890
              </a>
              <div className="flex items-start gap-3 text-[hsl(215,20%,65%)] text-base">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-secondary" />
                </div>
                123 Logistics Way, New York, NY 10001
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[hsl(230,50%,15%)] relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[hsl(215,20%,50%)] text-sm text-center sm:text-left">
            © 2026 RAC Logistics. All rights reserved.
          </p>
          <p className="text-[hsl(215,20%,50%)] text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-secondary fill-secondary" /> by RAC Team
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-[hsl(215,20%,50%)] hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[hsl(215,20%,50%)] hover:text-secondary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
