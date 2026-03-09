import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";
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
    {
      name: "Facebook",
      href: "https://facebook.com/raclogistics",
      label: "Facebook",
      icon: SiFacebook,
      iconClassName: "text-white",
      badgeClassName: "bg-[#1877F2]",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/raclogistics",
      label: "Instagram",
      icon: SiInstagram,
      iconClassName: "text-white",
      badgeClassName: "bg-[linear-gradient(135deg,#F58529_0%,#DD2A7B_45%,#8134AF_70%,#515BD4_100%)]",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/raclogistics",
      label: "Twitter",
      icon: SiX,
      iconClassName: "text-white",
      badgeClassName: "bg-[#111111]",
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/raclogistics",
      label: "LinkedIn",
      icon: SiLinkedin,
      iconClassName: "text-white",
      badgeClassName: "bg-[#0A66C2]",
    },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="section-container px-4 pb-8 pt-16 sm:px-6 md:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.2fr_0.8fr_0.95fr_1fr] lg:gap-10">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <Logo className="h-16 sm:h-16 md:h-18 text-white" />
            </Link>

            <p className="max-w-md text-[15px] leading-7 text-white/72">
              Your trusted partner for global logistics solutions. Delivering excellence across continents with speed, security, and reliability.
            </p>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">Connect</p>
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
                      className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/10 p-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.04] hover:bg-white/15"
                    >
                      <span
                        className={`flex h-full w-full items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] ${social.badgeClassName}`}
                      >
                        <SocialIcon className={`h-[18px] w-[18px] ${social.iconClassName}`} />
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/55">Pages</h4>
            <ul className="space-y-3.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="group inline-flex items-center gap-2 text-[15px] text-white/72 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight size={12} className="opacity-0 -ml-4 transition-all group-hover:ml-0 group-hover:opacity-100" strokeWidth={2.5} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/55">Services</h4>
            <ul className="space-y-3.5">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.href}
                    className="group inline-flex items-center gap-2 text-[15px] text-white/72 transition-colors duration-200 hover:text-white"
                  >
                    <ArrowRight size={12} className="opacity-0 -ml-4 transition-all group-hover:ml-0 group-hover:opacity-100" strokeWidth={2.5} />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/55">Contact</h4>
            <div className="space-y-4">
              <a href="mailto:info@raclogistics.com" className="group flex items-start gap-3 text-white/72 transition-colors duration-200 hover:text-white">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/90 transition-colors duration-200 group-hover:bg-white/14">
                  <Mail size={15} strokeWidth={2.3} />
                </span>
                <span className="text-[15px] leading-6">info@raclogistics.com</span>
              </a>

              <a href="tel:+2348185956707" className="group flex items-start gap-3 text-white/72 transition-colors duration-200 hover:text-white">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/90 transition-colors duration-200 group-hover:bg-white/14">
                  <Phone size={15} strokeWidth={2.3} />
                </span>
                <span className="text-[15px] leading-6">+234 818 595 6707</span>
              </a>

              <div className="flex items-start gap-3 text-white/72">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/90">
                  <MapPin size={15} strokeWidth={2.3} />
                </span>
                <span className="text-[15px] leading-6">29b Osolo Way, Opposite Polaris Bank, Ajao Estate, Isolo, Lagos State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 py-6 text-sm sm:flex-row">
          <p className="text-center text-white/60 sm:text-left">
            © 2026 RAC Logistics. All rights reserved.
          </p>
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
