import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, User, Shield, ChevronDown, Plane, Ship, ShoppingBag, Package, Globe, Warehouse, FileCheck, ArrowRight } from "lucide-react";
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
    { name: "Air Shipping", href: "/services/air-shipping", icon: Plane },
    { name: "Ocean Shipping", href: "/services/ocean-shipping", icon: Ship },
    { name: "Personal Shopping", href: "/services/personal-shopping", icon: ShoppingBag },
    { name: "Procurement", href: "/services/procurement", icon: Package },
    { name: "Import/Export", href: "/services/import-export", icon: Globe },
    { name: "Warehousing", href: "/services/warehousing", icon: Warehouse },
    { name: "Customs Clearance", href: "/services/customs-clearance", icon: FileCheck },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 bg-background border-b border-border ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-primary-foreground transition-transform duration-200 group-hover:scale-105 bg-primary">
            R
          </div>
          <span className="font-semibold text-lg text-foreground">
            RAC <span className="text-primary">Logistics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-bold text-sm transition-colors duration-200 text-muted-foreground hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="font-bold text-sm transition-colors duration-200 flex items-center gap-1 hover:text-primary text-muted-foreground"
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 p-2 bg-background border-border shadow-lg">
              <DropdownMenuItem asChild className="p-0 mb-1">
                <Link
                  to="/services"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors w-full font-medium text-primary"
                >
                  View All Services
                </Link>
              </DropdownMenuItem>
              {serviceLinks.map((service) => (
                <DropdownMenuItem key={service.name} asChild className="p-0">
                  <Link
                    to={service.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors w-full text-muted-foreground hover:text-foreground"
                  >
                    <service.icon className="w-4 h-4 text-primary" />
                    <span>{service.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-bold text-sm transition-colors duration-200 text-muted-foreground hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link 
                  to="/admin"
                   className="flex items-center gap-2 px-4 py-2 font-bold text-sm transition-colors text-muted-foreground hover:text-primary"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 font-bold text-sm transition-colors text-muted-foreground hover:text-primary"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <Button 
                onClick={() => signOut()}
                variant="default"
                size="sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="secondary" size="sm" className="gap-2">
                  Login
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors bg-muted text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50"
          style={{ zIndex: 9998 }}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-screen w-[85%] max-w-xs transition-all duration-300 overflow-y-auto bg-background border-l border-border shadow-xl ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <span className="font-semibold text-lg text-foreground">Menu</span>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-5 flex flex-col gap-1">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-foreground hover:text-primary hover:bg-muted font-bold text-sm py-3 px-4 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Services Accordion */}
          <div className="flex flex-col">
            <button
              className="flex items-center justify-between text-foreground hover:text-primary hover:bg-muted font-bold text-sm py-3 px-4 rounded-lg transition-colors"
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[400px]" : "max-h-0"}`}>
              <div className="pl-3 py-2 space-y-1">
                <Link
                  to="/services"
                  className="flex items-center gap-3 font-semibold text-sm py-3 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  View All Services
                </Link>
                {serviceLinks.map((service) => (
                  <Link
                    key={service.name}
                    to={service.href}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground text-sm py-3 px-4 rounded-lg hover:bg-muted transition-colors"
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
            <Link
              key={link.name}
              to={link.href}
              className="text-foreground hover:text-primary hover:bg-muted font-bold text-sm py-3 px-4 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-5 mt-4 border-t border-border">
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-foreground bg-muted hover:bg-muted/80 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 text-foreground bg-muted hover:bg-muted/80 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                   className="w-full py-3 font-extrabold text-sm rounded-full transition-colors flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)]"
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
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 font-extrabold text-sm rounded-full transition-colors flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)]"
                >
                  Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 font-extrabold text-sm rounded-full transition-colors flex items-center justify-center gap-2 bg-transparent text-primary border border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
