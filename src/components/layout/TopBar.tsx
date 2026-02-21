import { Mail, Phone } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 hidden md:block">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left - Contact Info */}
        <div className="flex items-center gap-6 text-sm">
          <a 
            href="mailto:info@raclogistics.com" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Mail size={14} />
            <span>info@raclogistics.com</span>
          </a>
          <a 
            href="tel:+2348185956707" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Phone size={14} />
            <span>+234 818 595 6707</span>
          </a>
        </div>

        {/* Right - Social Links */}
        <div className="flex items-center gap-3">
          {[
            { name: "in", href: "#", label: "LinkedIn" },
            { name: "𝕏", href: "#", label: "Twitter" },
            { name: "f", href: "#", label: "Facebook" },
            { name: "📷", href: "#", label: "Instagram" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-[hsl(0,0%,13%)] bg-[hsl(45,100%,51%)] hover:bg-white hover:text-primary transition-all duration-200"
            >
              {social.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
