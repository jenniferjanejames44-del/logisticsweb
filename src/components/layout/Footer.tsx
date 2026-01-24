import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Track Shipment", href: "/#track" },
    { name: "Contact", href: "/contact" },
  ];

  const services = [
    { name: "Air Shipping", href: "/services/air" },
    { name: "Ocean Shipping", href: "/services/ocean" },
    { name: "Personal Shopping", href: "/services/personal-shopping" },
    { name: "Procurement", href: "/services/procurement" },
    { name: "Warehousing", href: "/services/warehousing" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-heading font-bold text-primary text-xl">
                R
              </div>
              <span className="font-heading font-bold text-xl">
                RAC <span className="text-secondary">Logistics</span>
              </span>
            </Link>
            <p className="text-primary-foreground/80 leading-relaxed text-sm sm:text-base">
              Your trusted partner for global logistics solutions. Delivering excellence across continents with speed and security.
            </p>
            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300 hover:scale-110"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4 sm:mb-6 text-secondary">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors inline-flex items-center gap-2 group text-sm sm:text-base"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-secondary transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4 sm:mb-6 text-secondary">Our Services</h4>
            <ul className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.href}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors inline-flex items-center gap-2 group text-sm sm:text-base"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-secondary transition-all" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1">
            <h4 className="font-heading font-bold text-lg mb-4 sm:mb-6 text-secondary">Contact Us</h4>
            <div className="space-y-3 sm:space-y-4">
              <a href="mailto:info@raclogistics.com" className="flex items-center gap-3 text-primary-foreground/80 hover:text-secondary transition-colors text-sm sm:text-base">
                <Mail size={18} className="text-secondary flex-shrink-0" />
                info@raclogistics.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 text-primary-foreground/80 hover:text-secondary transition-colors text-sm sm:text-base">
                <Phone size={18} className="text-secondary flex-shrink-0" />
                +1 (234) 567-890
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80 text-sm sm:text-base">
                <MapPin size={18} className="text-secondary flex-shrink-0 mt-1" />
                123 Logistics Way, New York, NY 10001
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-2 sm:pt-4">
              <h5 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Subscribe to Newsletter</h5>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
                />
                <Button variant="cta" size="icon">
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-primary-foreground/60 text-xs sm:text-sm text-center sm:text-left">
            © 2026 RAC Logistics. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link to="/privacy" className="text-primary-foreground/60 hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/60 hover:text-secondary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
