import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
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
    { name: "Facebook", href: "https://facebook.com/raclogistics", label: "Facebook", icon: Facebook },
    { name: "Twitter", href: "https://twitter.com/raclogistics", label: "Twitter", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com/company/raclogistics", label: "LinkedIn", icon: Linkedin },
    { name: "Instagram", href: "https://instagram.com/raclogistics", label: "Instagram", icon: Instagram },
  ];

  return (
    <footer className="bg-primary">
      {/* Main Footer */}
      <div className="section-container px-4 pb-12 pt-20 sm:px-6 md:pt-24">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2">
          {/* Left Side - Company Info */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="h-16 sm:h-16 md:h-18 text-white" />
            </Link>
            <p className="max-w-md text-[15px] leading-relaxed text-white/75">
              Your trusted partner for global logistics solutions. Delivering excellence across continents with speed, security, and reliability.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-white/12 bg-white/8 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent hover:text-accent-foreground"
                  >
                    <SocialIcon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Side - Links & Contact */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {/* Quick Links */}
            <div>
              <h4 className="mb-6 text-base font-extrabold text-white">Quick Links</h4>
              <ul className="space-y-3.5">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="group inline-flex items-center gap-2 text-[15px] text-white/65 transition-colors duration-200 hover:text-white"
                    >
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" strokeWidth={2.5} />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-6 text-base font-extrabold text-white">Services</h4>
              <ul className="space-y-3.5">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      to={service.href}
                      className="group inline-flex items-center gap-2 text-[15px] text-white/65 transition-colors duration-200 hover:text-white"
                    >
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" strokeWidth={2.5} />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-6 text-base font-extrabold text-white">Contact</h4>
              <div className="space-y-4">
                <a href="mailto:info@raclogistics.com" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-white/70 transition-colors duration-200 hover:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                    <Mail size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px]">info@raclogistics.com</span>
                </a>
                <a href="tel:+2348185956707" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-white/70 transition-colors duration-200 hover:text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                    <Phone size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px]">+234 818 595 6707</span>
                </a>
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-white/70">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-white/10">
                    <MapPin size={16} className="text-white" strokeWidth={2.5} />
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
        <div className="section-container flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
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
