import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import HeaderLogo from "./HeaderLogo";

const Footer = () => {
  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
  ];

  const quickLinks = [
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
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
    {
      name: "Facebook",
      href: "https://facebook.com/raclogistics",
      label: "Facebook",
      icon: Facebook,
      iconClassName: "text-primary-foreground",
      badgeClassName: "bg-[#1877F2]",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/raclogistics",
      label: "Instagram",
      icon: Instagram,
      iconClassName: "text-primary-foreground",
      badgeClassName: "bg-[linear-gradient(135deg,#F58529_0%,#DD2A7B_45%,#8134AF_70%,#515BD4_100%)]",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/raclogistics",
      label: "Twitter",
      icon: Twitter,
      iconClassName: "text-primary-foreground",
      badgeClassName: "bg-[#111111]",
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/raclogistics",
      label: "LinkedIn",
      icon: Linkedin,
      iconClassName: "text-primary-foreground",
      badgeClassName: "bg-[#0A66C2]",
    },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="section-container pb-10 pt-12 sm:pt-14 lg:pt-[60px]">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.15fr_0.82fr_0.95fr_1.08fr]">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center" aria-label="RAC Logistics home">
              <HeaderLogo className="h-16 sm:h-[70px] [&_g]:fill-white [&_text]:fill-white" />
            </Link>

            <p className="max-w-md text-[15px] leading-7 text-white/72">
              Your trusted partner for global logistics solutions. Delivering excellence across continents with speed, security, and reliability.
            </p>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Connect</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const SocialIcon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="group flex h-11 w-11 items-center justify-center rounded-full bg-white/8 shadow-[0_12px_28px_rgba(0,0,0,0.18)] ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-1 hover:bg-white/12"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${social.badgeClassName}`}>
                        <SocialIcon className={`h-[17px] w-[17px] ${social.iconClassName}`} />
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Company</h4>
            <ul className="space-y-3.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="group inline-flex items-center gap-2 text-[15px] text-white/72 transition-colors duration-200 hover:text-white">
                    <ArrowRight size={12} className="-ml-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" strokeWidth={2.5} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Services</h4>
            <ul className="space-y-3.5">
              {services.map((service) => (
                <li key={service.name}>
                  <Link to={service.href} className="group inline-flex items-center gap-2 text-[15px] text-white/72 transition-colors duration-200 hover:text-white">
                    <ArrowRight size={12} className="-ml-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" strokeWidth={2.5} />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 xl:grid-cols-1 xl:gap-10">
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Quick Links</h4>
              <ul className="space-y-3.5">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="group inline-flex items-center gap-2 text-[15px] text-white/72 transition-colors duration-200 hover:text-white">
                      <ArrowRight size={12} className="-ml-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" strokeWidth={2.5} />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-[18px] w-[18px] shrink-0 text-accent" strokeWidth={2.3} />
                  <div>
                    <p className="text-sm font-semibold text-white">Phone</p>
                    <a href="tel:+2348185956707" className="text-[15px] leading-7 text-white/72 transition-colors duration-200 hover:text-white">
                      +234 818 595 6707
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="mt-1 h-[18px] w-[18px] shrink-0 text-accent" strokeWidth={2.3} />
                  <div>
                    <p className="text-sm font-semibold text-white">Email</p>
                    <div className="space-y-0.5">
                      <a href="mailto:info@raclogistic.com" className="block text-[15px] leading-7 text-white/72 transition-colors duration-200 hover:text-white">
                        info@raclogistic.com
                      </a>
                      <a href="mailto:support@raclogistic.com" className="block text-[15px] leading-7 text-white/72 transition-colors duration-200 hover:text-white">
                        support@raclogistic.com
                      </a>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 h-[18px] w-[18px] shrink-0 text-accent" strokeWidth={2.3} />
                  <div>
                    <p className="text-sm font-semibold text-white">Office Address</p>
                    <p className="text-[15px] leading-7 text-white/72">
                      29b Osolo Way, Opposite Polaris Bank, Ajao Estate, Isolo, Lagos State
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row">
          <p className="text-center text-white/60 sm:text-left">© 2026 RAC Logistics. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm sm:justify-end">
            <Link to="/privacy" className="text-white/60 transition-colors duration-200 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 transition-colors duration-200 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
