import { Link } from "react-router-dom";
import { Mail, Phone, Facebook, Instagram, Twitter, Linkedin, MessageCircle } from "lucide-react";
import HeaderLogo from "./HeaderLogo";

const Footer = () => {
  const pageLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
  ];

  const linkLinks = [
    { name: "Help Center", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Partners", href: "/partners" },
    { name: "Track Shipment", href: "/tracking" },
    { name: "Get a Quote", href: "/pricing" },
  ];

  const phones = [
    { label: "0903 399 4545", href: "tel:+2349033994545" },
    { label: "0813 860 3860", href: "tel:+2348138603860" },
    { label: "0809 666 6337", href: "tel:+2348096666337" },
  ];

  const socials = [
    { name: "Facebook", href: "https://facebook.com/raclogistics", Icon: Facebook, badge: "bg-[#1877F2]" },
    {
      name: "Instagram",
      href: "https://instagram.com/raclogistics",
      Icon: Instagram,
      badge: "bg-[linear-gradient(135deg,#F58529_0%,#DD2A7B_45%,#8134AF_70%,#515BD4_100%)]",
    },
    { name: "Twitter", href: "https://twitter.com/raclogistics", Icon: Twitter, badge: "bg-[#111111]" },
    { name: "LinkedIn", href: "https://linkedin.com/company/raclogistics", Icon: Linkedin, badge: "bg-[#0A66C2]" },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="section-container py-12 sm:py-14 lg:py-[60px]">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr_1fr_1.2fr_auto] lg:gap-12">
          {/* Logo card */}
          <div className="flex justify-center lg:justify-start">
            <Link
              to="/"
              aria-label="RAC Logistics home"
              className="inline-flex items-center justify-center rounded-xl bg-white p-2 shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
            >
              <HeaderLogo className="h-9 w-auto sm:h-10" />
            </Link>
          </div>

          {/* Pages */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Pages</h4>
            <ul className="space-y-2.5">
              {pageLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[15px] font-medium text-white/85 transition-colors duration-200 hover:text-accent"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Links</h4>
            <ul className="space-y-2.5">
              {linkLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[15px] font-medium text-white/85 transition-colors duration-200 hover:text-accent"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Connect</h4>

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white">Work Hours</p>
              <p className="mt-1 text-[15px] text-white/85">9am – 6pm (Mon–Sat)</p>
            </div>

            <a
              href="mailto:info@raclogistic.com"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-white/90 transition-colors hover:text-accent"
            >
              <Mail className="h-4 w-4 text-accent" strokeWidth={2.3} />
              info@raclogistic.com
            </a>

            <Link
              to="/contact"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(223,81,1,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
              Chat Us
            </Link>

            <ul className="space-y-2 pt-1">
              {phones.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-white/85 transition-colors hover:text-accent"
                  >
                    <Phone className="h-4 w-4 text-accent" strokeWidth={2.3} />
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials — vertical on desktop, horizontal on mobile */}
          <div className="flex flex-row items-center justify-center gap-3 lg:flex-col lg:justify-start lg:gap-4">
            {socials.map(({ name, href, Icon, badge }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-110 ${badge}`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
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
