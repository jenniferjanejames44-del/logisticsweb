import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

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

  const socialLinks = [
    { name: "in", href: "#", label: "LinkedIn" },
    { name: "𝕏", href: "#", label: "Twitter" },
    { name: "f", href: "#", label: "Facebook" },
    { name: "📷", href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-navy">
      {/* Main Footer */}
      <div className="section-container px-4 sm:px-6 pt-16 md:pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Side - Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-primary group-hover:scale-105 transition-transform gradient-yellow">
                R
              </div>
              <span className="font-semibold text-xl text-white">
                RAC <span className="text-secondary">Logistics</span>
              </span>
            </Link>
            <p className="text-white/70 leading-relaxed max-w-md">
              Your trusted partner for global logistics solutions. Delivering excellence across continents with speed, security, and reliability.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.label}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white/60 hover:text-primary bg-white/10 hover:bg-secondary transition-all duration-300 hover:-translate-y-1"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side - Links & Contact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="inline-flex items-center gap-2 group transition-colors duration-300 text-white/70 hover:text-secondary"
                    >
                      <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-secondary" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Services</h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      to={service.href}
                      className="inline-flex items-center gap-2 group transition-colors duration-300 text-white/70 hover:text-secondary"
                    >
                      <ArrowRight size={14} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-secondary" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-semibold text-lg mb-6 text-white">Contact</h4>
              <div className="space-y-4">
                <a href="mailto:info@raclogistics.com" className="flex items-center gap-3 transition-colors duration-300 group text-white/70 hover:text-white">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors bg-white/10">
                    <Mail size={18} className="text-secondary" />
                  </div>
                  <span className="text-sm">info@raclogistics.com</span>
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-3 transition-colors duration-300 group text-white/70 hover:text-white">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10">
                    <Phone size={18} className="text-secondary" />
                  </div>
                  <span className="text-sm">+1 (234) 567-890</span>
                </a>
                <div className="flex items-start gap-3 text-white/70">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
                    <MapPin size={18} className="text-secondary" />
                  </div>
                  <span className="text-sm">123 Logistics Way, New York, NY 10001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-center sm:text-left text-white/70">
            © 2026 RAC Logistics. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link 
              to="/privacy" 
              className="transition-colors duration-300 text-white/70 hover:text-secondary"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="transition-colors duration-300 text-white/70 hover:text-secondary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
