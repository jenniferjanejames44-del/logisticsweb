import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, User, Shield, ChevronDown, PlaneTakeoff, Anchor, ShoppingBag, Earth, Container, FileCheck, ArrowRight, Send } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavLinks = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const serviceGroups = [
    {
      heading: "Shipping Services",
      links: [
        { name: "Import Shipping", href: "/services/import", icon: Earth },
        { name: "Export Shipping", href: "/services/export", icon: Send },
        { name: "Air Freight", href: "/services/air-shipping", icon: PlaneTakeoff },
        { name: "Ocean Freight", href: "/services/ocean-shipping", icon: Anchor },
      ],
    },
    {
      heading: "Logistics Services",
      links: [
        { name: "Warehousing", href: "/services/warehousing", icon: Container },
        { name: "Customs Clearance", href: "/services/customs-clearance", icon: FileCheck },
      ],
    },
    {
      heading: "Shopping Assistance",
      links: [
        { name: "Buy For Me / Procurement", href: "/services/procurement", icon: ShoppingBag },
      ],
    },
  ];

  const isServicesRoute = location.pathname === "/services" || location.pathname.startsWith("/services/");
  const navItemClass = (isActive: boolean) =>
    cn(
      "font-display relative rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-px after:absolute after:bottom-1.5 after:left-3 after:h-0.5 after:w-[calc(100%-24px)] after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-200",
      isActive
        ? "bg-muted text-primary after:scale-x-100"
        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:after:scale-x-100",
    );
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 border-b bg-white transition-all duration-300 ${
        isScrolled
          ? "border-border/80 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          : "border-border/70 shadow-[0_4px_14px_rgba(15,23,42,0.04)]"
      }`}
    >
      <div className="section-container flex h-full items-center justify-between gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center group text-foreground">
          <Logo className="h-14 sm:h-14 md:h-16" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {mainNavLinks.slice(0, 1).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) => navItemClass(isActive)}
            >
              {link.name}
            </NavLink>
          ))}

          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className={cn(
                  "font-display flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-px",
                  isServicesRoute
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="animate-fade-in-soft w-[320px] rounded-xl border border-border/80 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
              <div className="space-y-1">
                {serviceGroups.map((group, groupIndex) => (
                  <div
                    key={group.heading}
                    className={cn(
                      "rounded-lg px-1 py-2",
                      groupIndex > 0 && "border-t border-border/60 pt-3",
                    )}
                  >
                    <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
                      {group.heading}
                    </div>
                    {group.links.map((service) => (
                      <DropdownMenuItem key={service.name} asChild className="p-0">
                        <Link
                          to={service.href}
                          className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-all duration-200 hover:-translate-y-px hover:bg-muted/70 hover:text-foreground"
                        >
                          <span className="icon-surface h-9 w-9 transition-all duration-200 group-hover:border-primary/15 group-hover:bg-primary/5">
                            <service.icon className="w-4 h-4 text-primary" />
                          </span>
                          <span className="font-medium">{service.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {mainNavLinks.slice(1).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) => navItemClass(isActive)}
            >
              {link.name}
            </NavLink>
          ))}

        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button asChild variant="secondary" size="sm">
                <Link to="/dashboard">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                onClick={() => signOut()}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" className="font-semibold text-[15px]">
                <Link to="/auth">Log In</Link>
              </Button>
              <Button asChild variant="navCta" size="sm" className="font-bold">
                <Link to="/auth">
                  Join Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.14)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(6,16,67,0.18)]"
          onClick={() => (isMobileMenuOpen ? closeMobileMenu() : setIsMobileMenuOpen(true))}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/28 backdrop-blur-sm transition-opacity duration-300"
          style={{ zIndex: 9998 }}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-screen w-[88%] max-w-sm overflow-y-auto border-l border-border/70 bg-background shadow-[0_24px_60px_rgba(6,16,67,0.14)] transition-all duration-300 ease-out ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex justify-end border-b border-border/70 px-4 py-4 sm:px-5">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-px hover:rotate-90 hover:bg-muted/70 hover:text-foreground"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
          {mainNavLinks.slice(0, 1).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "font-display rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-px",
                  isActive
                    ? "bg-muted text-primary"
                    : "text-foreground hover:bg-muted/80 hover:text-primary",
                )
              }
              onClick={closeMobileMenu}
            >
              {link.name}
            </NavLink>
          ))}

          {/* Services Accordion */}
          <div className="flex flex-col">
            <button
              className={cn(
                "font-display flex items-center justify-between rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-px",
                isServicesRoute
                  ? "bg-muted text-primary"
                  : "text-foreground hover:bg-muted/80 hover:text-primary",
              )}
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[560px]" : "max-h-0"}`}>
              <div className="space-y-3 py-2 pl-3">
                {serviceGroups.map((group, groupIndex) => (
                  <div
                    key={group.heading}
                    className={cn(
                      "rounded-lg px-1",
                      groupIndex > 0 && "border-t border-border/60 pt-3",
                    )}
                  >
                    <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
                      {group.heading}
                    </div>
                    {group.links.map((service) => (
                      <Link
                        key={service.name}
                        to={service.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200 hover:-translate-y-px",
                          location.pathname === service.href
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                        )}
                        onClick={closeMobileMenu}
                      >
                        <span className="icon-surface h-8 w-8 transition-all duration-200 group-hover:border-primary/15 group-hover:bg-primary/5">
                          <service.icon className="w-4 h-4 text-primary" />
                        </span>
                        {service.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {mainNavLinks.slice(1).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "font-display rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-px",
                  isActive
                    ? "bg-muted text-primary"
                    : "text-foreground hover:bg-muted/80 hover:text-primary",
                )
              }
              onClick={closeMobileMenu}
            >
              {link.name}
            </NavLink>
          ))}
          
          {/* CTA Buttons */}
          <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-5">
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link to="/admin" onClick={closeMobileMenu}>
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <Button asChild variant="secondary" className="w-full justify-center">
                  <Link to="/dashboard" onClick={closeMobileMenu}>
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <button 
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 py-3.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    signOut();
                    closeMobileMenu();
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link to="/auth" onClick={closeMobileMenu}>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="navCta" className="w-full justify-center">
                  <Link to="/auth" onClick={closeMobileMenu}>
                    Join Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
