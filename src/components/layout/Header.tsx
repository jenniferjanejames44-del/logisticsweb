import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, User, Shield, ChevronDown, PlaneTakeoff, Anchor, ShoppingBag, Earth, Container, FileCheck, ArrowRight, Send } from "lucide-react";
import HeaderLogo from "@/components/layout/HeaderLogo";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  
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
        { name: "Global Pickup", href: "/services/global-pickup", icon: Container },
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
      "font-display relative px-3 py-2 text-sm font-semibold text-primary transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200",
      isActive
        ? "text-accent after:scale-x-100"
        : "hover:bg-transparent hover:text-primary hover:after:scale-x-100",
    );
  const mobileNavItemClass = (isActive: boolean) =>
    cn(
      "font-display block py-2.5 text-[15px] font-semibold text-primary transition-all duration-200",
      isActive
        ? "text-accent"
        : "hover:text-accent",
    );
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[76px] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-300 sm:h-20"
    >
      <div className="section-container flex h-full items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
        {/* Logo */}
        <Link to="/" className="group flex max-w-[calc(100%-3.5rem)] shrink-0 items-center lg:max-w-none">
          <HeaderLogo className="block h-10 w-auto max-w-[172px] sm:h-11 sm:max-w-[210px] md:h-[50px] md:max-w-[240px]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
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
                  "font-display relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200",
                  isServicesRoute
                    ? "text-accent after:scale-x-100"
                    : "hover:bg-transparent hover:text-primary hover:after:scale-x-100",
                )}
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="animate-fade-in-soft w-[340px] rounded-none border border-border/40 bg-white p-3 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
              <div className="space-y-3">
                {serviceGroups.map((group, groupIndex) => (
                  <div
                    key={group.heading}
                    className={cn(
                      "px-0 py-1",
                      groupIndex > 0 && "border-t border-border/60 pt-3",
                    )}
                  >
                    <div className="pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
                      {group.heading}
                    </div>
                    {group.links.map((service) => (
                      <DropdownMenuItem key={service.name} asChild className="p-0 focus:bg-transparent focus:text-inherit">
                        <Link
                          to={service.href}
                          className="group flex w-full items-center gap-3 py-2.5 text-primary transition-all duration-200 hover:bg-transparent hover:text-accent"
                        >
                          <span className="flex h-8 w-8 items-center justify-center text-primary transition-colors duration-200 group-hover:text-accent">
                            <service.icon className="h-4 w-4" />
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
        <div className="hidden lg:flex items-center gap-2.5">
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
              <Button asChild variant="nav" size="sm">
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
              <Button asChild variant="outline" size="sm" className="font-semibold text-[15px] whitespace-nowrap px-5">
                <Link to="/auth">Log In</Link>
              </Button>
              <Button asChild variant="navCta" size="sm" className="font-bold whitespace-nowrap px-5">
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
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,hsl(var(--primary))_0%,hsl(var(--primary-hover))_100%)] text-primary-foreground shadow-[0_14px_30px_rgba(6,16,67,0.18)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_18px_34px_rgba(6,16,67,0.22)] sm:h-12 sm:w-12 lg:hidden"
          onClick={() => (isMobileMenuOpen ? closeMobileMenu() : setIsMobileMenuOpen(true))}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/18 backdrop-blur-sm transition-opacity duration-300"
          style={{ zIndex: 9998 }}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-screen w-[94%] max-w-[408px] overflow-y-auto overscroll-contain border-l border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,248,250,0.98)_100%)] shadow-[0_28px_64px_rgba(6,16,67,0.18)] transition-all duration-300 ease-out isolate ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,248,250,0.98)_100%)]" aria-hidden="true" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-5">
          <Link to="/" onClick={closeMobileMenu} className="flex items-center">
            <HeaderLogo className="block h-9 w-auto max-w-[164px]" />
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.04] text-primary shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-px hover:rotate-90 hover:border-primary/15 hover:bg-primary/[0.08] hover:text-primary"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="relative z-10 flex min-h-[calc(100vh-73px)] flex-col bg-transparent px-4 pb-5 pt-3 sm:px-5 sm:pb-6">
          {mainNavLinks.slice(0, 1).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) => mobileNavItemClass(isActive)}
              onClick={closeMobileMenu}
            >
              {link.name}
            </NavLink>
          ))}

          {/* Services Accordion */}
          <div className="flex flex-col">
            <button
              className={cn(
                "font-display flex items-center justify-between py-2.5 text-[15px] font-semibold text-primary transition-all duration-200",
                isServicesRoute
                  ? "text-accent"
                  : "hover:text-accent",
              )}
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              aria-expanded={isMobileServicesOpen}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="mt-1 space-y-2 pl-3.5">
                {serviceGroups.map((group, groupIndex) => (
                  <div
                    key={group.heading}
                    className="px-0"
                  >
                    <div className="pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/65">
                      {group.heading}
                    </div>
                    {group.links.map((service) => (
                      <Link
                        key={service.name}
                        to={service.href}
                        className={cn(
                          "group flex items-center gap-3 py-2 text-sm text-primary transition-all duration-200 hover:text-accent",
                          location.pathname === service.href
                            ? "text-accent"
                            : "",
                        )}
                        onClick={closeMobileMenu}
                      >
                        <span className="flex h-7 w-7 items-center justify-center text-primary transition-colors duration-200 group-hover:text-accent">
                          <service.icon className="w-4 h-4" />
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
              className={({ isActive }) => mobileNavItemClass(isActive)}
              onClick={closeMobileMenu}
            >
              {link.name}
            </NavLink>
          ))}
          
          {/* CTA Buttons */}
          <div className="mt-auto flex flex-col items-start gap-2.5 border-t border-border/70 pt-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild variant="outline" className="button-balance-mobile justify-center">
                    <Link to="/admin" onClick={closeMobileMenu}>
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <Button asChild variant="nav" className="button-balance-mobile justify-center">
                  <Link to="/dashboard" onClick={closeMobileMenu}>
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <button 
                  className="button-balance-mobile inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-[22px] py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
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
                <Button asChild variant="outline" className="button-balance-mobile justify-center">
                  <Link to="/auth" onClick={closeMobileMenu}>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="navCta" className="button-balance-mobile justify-center">
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
