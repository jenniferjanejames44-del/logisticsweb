import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import Logo from "./Logo";

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
    <footer className="bg-primary">
      {/* Main Footer */}
      <div className="section-container px-4 sm:px-6 pt-20 md:pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* Left Side - Company Info */}
          <div className="space-y-7">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="h-14 sm:h-16 md:h-18 text-white" />
            </Link>
            <p className="text-white/75 leading-relaxed max-w-md text-[15px]">
              Your trusted partner for global logistics solutions. Delivering excellence across continents with speed, security, and reliability.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.label}
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-accent-foreground bg-accent hover:bg-white hover:text-primary transition-all duration-200"
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
              <h4 className="font-extrabold text-base mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3.5">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="inline-flex items-center gap-2 group transition-colors duration-200 text-white/65 hover:text-white text-[15px]"
                    >
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-extrabold text-base mb-6 text-white">Services</h4>
              <ul className="space-y-3.5">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      to={service.href}
                      className="inline-flex items-center gap-2 group transition-colors duration-200 text-white/65 hover:text-white text-[15px]"
                    >
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-extrabold text-base mb-6 text-white">Contact</h4>
              <div className="space-y-4">
                <a href="mailto:info@raclogistics.com" className="flex items-center gap-3 transition-colors duration-200 text-white/65 hover:text-white">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                    <Mail size={16} className="text-white" />
                  </div>
                  <span className="text-[15px]">info@raclogistics.com</span>
                </a>
                <a href="tel:+2348185956707" className="flex items-center gap-3 transition-colors duration-200 text-white/65 hover:text-white">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                    <Phone size={16} className="text-white" />
                  </div>
                  <span className="text-[15px]">+234 818 595 6707</span>
                </a>
                <div className="flex items-start gap-3 text-white/65">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <span className="text-[15px]">29b Osolo Way, Opposite Polaris Bank, Ajao Estate, Isolo, Lagos State</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-center sm:text-left text-white/60">
            © 2026 RAC Logistics. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link 
              to="/privacy" 
              className="transition-colors duration-200 text-white/60 hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="transition-colors duration-200 text-white/60 hover:text-white"
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
