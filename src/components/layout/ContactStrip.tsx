import { Mail, Phone, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

const phones = [
  { label: "0903 399 4545", href: "tel:+2349033994545" },
  { label: "0813 860 3860", href: "tel:+2348138603860" },
  { label: "0818 000 6321", href: "tel:+2348180006321" },
];

const socials = [
  { name: "Facebook", href: "https://facebook.com/raclogistics", Icon: Facebook },
  { name: "Instagram", href: "https://instagram.com/raclogistics", Icon: Instagram },
  { name: "Twitter", href: "https://twitter.com/raclogistics", Icon: Twitter },
  { name: "LinkedIn", href: "https://linkedin.com/company/raclogistics", Icon: Linkedin },
];

interface ContactStripProps {
  variant?: "header" | "footer";
  className?: string;
}

const ContactStrip = ({ variant = "header", className }: ContactStripProps) => {
  const surface =
    variant === "header"
      ? "bg-primary text-white"
      : "bg-primary/95 text-white border-b border-white/10";

  return (
    <div className={cn("hidden w-full lg:block", surface, className)}>
      <div className="section-container flex h-9 items-center justify-between gap-3 sm:h-10">
        {/* Left: email + phones — horizontal scroll on small screens */}
        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto whitespace-nowrap text-[12px] font-medium leading-none sm:gap-6 sm:text-[12.5px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <a
            href="mailto:info@raclogistic.com"
            className="inline-flex shrink-0 items-center gap-1.5 transition-colors hover:text-accent"
          >
            <Mail className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
            <span>info@raclogistic.com</span>
          </a>
          {phones.map((p) => (
            <a
              key={p.href}
              href={p.href}
              className="inline-flex shrink-0 items-center gap-1.5 transition-colors hover:text-accent"
            >
              <Phone className="h-3.5 w-3.5 text-accent" strokeWidth={2.4} />
              <span>{p.label}</span>
            </a>
          ))}
        </div>

        {/* Right: social icons */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {socials.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white transition-transform duration-200 hover:scale-110 sm:h-7 sm:w-7"
            >
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.2} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactStrip;