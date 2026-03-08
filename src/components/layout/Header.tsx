import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, User, Shield, ChevronDown, PlaneTakeoff, Anchor, ShoppingBag, Package, Earth, Container, FileCheck, ArrowRight } from "lucide-react";
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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const serviceLinks = [
    { name: "Air Shipping", href: "/services/air-shipping", icon: PlaneTakeoff },
    { name: "Ocean Shipping", href: "/services/ocean-shipping", icon: Anchor },
    { name: "Personal Shopping", href: "/services/personal-shopping", icon: ShoppingBag },
    { name: "Procurement", href: "/services/procurement", icon: Package },
    { name: "Import/Export", href: "/services/import-export", icon: Earth },
    { name: "Warehousing", href: "/services/warehousing", icon: Container },
    { name: "Customs Clearance", href: "/services/customs-clearance", icon: FileCheck },
  ];

  const isServicesRoute = location.pathname === "/services" || location.pathname.startsWith("/services/");
  const navItemClass = (isActive: boolean) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200",
      isActive
        ? "bg-primary/5 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "h-[76px] border-b border-border/80 bg-background/92 shadow-[0_12px_30px_rgba(6,16,67,0.06)] backdrop-blur-xl"
          : "h-20 border-b border-border/70 bg-background/95"
      }`}
    >
      <div className="section-container flex h-full items-center justify-between gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center group text-foreground">
          <Logo className="h-14 sm:h-14 md:h-16" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          {navLinks.slice(0, 2).map((link) => (
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
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200",
                  isServicesRoute
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-60 rounded-2xl border border-border/80 bg-background p-2 shadow-[0_16px_40px_rgba(6,16,67,0.12)]">
              <DropdownMenuItem asChild className="p-0 mb-1">
                <Link
                  to="/services"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  View All Services
                </Link>
              </DropdownMenuItem>
              {serviceLinks.map((service) => (
                <DropdownMenuItem key={service.name} asChild className="p-0">
                  <Link
                    to={service.href}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <service.icon className="w-4 h-4 text-primary" />
                    <span className="font-medium">{service.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.slice(2).map((link) => (
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
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.16)] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm"
          style={{ zIndex: 9998 }}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-screen w-[86%] max-w-sm overflow-y-auto border-l border-border/70 bg-background shadow-[0_24px_60px_rgba(6,16,67,0.14)] transition-all duration-300 ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between border-b border-border/70 p-5">
          <div>
            <span className="block text-lg font-extrabold text-foreground">Menu</span>
            <span className="text-sm text-muted-foreground">Navigate RAC Logistics</span>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-5">
          {navLinks.slice(0, 2).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-colors",
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-foreground hover:bg-muted hover:text-primary",
                )
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
          
          {/* Services Accordion */}
          <div className="flex flex-col">
            <button
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-colors",
                isServicesRoute
                  ? "bg-primary/5 text-primary"
                  : "text-foreground hover:bg-muted hover:text-primary",
              )}
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[400px]" : "max-h-0"}`}>
              <div className="space-y-1 py-2 pl-3">
                <Link
                  to="/services"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
                    isServicesRoute
                      ? "bg-primary/10 text-primary"
                      : "bg-primary/5 text-primary hover:bg-primary/10",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  View All Services
                </Link>
                {serviceLinks.map((service) => (
                  <Link
                    key={service.name}
                    to={service.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                      location.pathname === service.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <service.icon className="w-4 h-4 text-primary" />
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {navLinks.slice(2).map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-4 py-3.5 text-[15px] font-semibold transition-colors",
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-foreground hover:bg-muted hover:text-primary",
                )
              }
              onClick={() => setIsMobileMenuOpen(false)}
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
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <Button asChild variant="secondary" className="w-full justify-center">
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <button 
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 py-3.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Log In
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="default" className="w-full justify-center">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
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
