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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-foreground/95 backdrop-blur-lg py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-300 bg-secondary text-white group-hover:scale-105">
            R
          </div>
          <span className="font-semibold text-xl text-white">
            RAC <span className="text-secondary">Logistics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-medium text-white/80 hover:text-secondary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="font-medium text-white/80 hover:text-secondary transition-colors flex items-center gap-1">
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 p-2 bg-card border-border">
              <DropdownMenuItem asChild className="p-0 mb-1">
                <Link
                  to="/services"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/10 transition-colors w-full font-medium text-secondary"
                >
                  View All Services
                </Link>
              </DropdownMenuItem>
              {serviceLinks.map((service) => (
                <DropdownMenuItem key={service.name} asChild className="p-0">
                  <Link
                    to={service.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/10 transition-colors w-full"
                  >
                    <service.icon className="w-4 h-4 text-secondary" />
                    <span className="text-foreground">{service.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-medium text-white/80 hover:text-secondary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" className="text-white/80 hover:text-secondary hover:bg-white/10" asChild>
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="text-white/80 hover:text-secondary hover:bg-white/10" asChild>
                <Link to="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                className="px-6 py-2.5 rounded-xl font-medium bg-secondary text-white hover:scale-[1.02] transition-all"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-white/80 hover:text-secondary hover:bg-white/10" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button 
                className="px-6 py-2.5 rounded-xl font-medium bg-secondary text-white hover:scale-[1.02] transition-all group" 
                asChild
              >
                <Link to="/pricing">
                  Get Quote
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-y-0 right-0 w-full sm:w-80 bg-foreground transition-all duration-300 overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            className="p-2 rounded-lg text-white hover:bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="px-6 pb-6 flex flex-col gap-2">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-white hover:bg-secondary/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Services Accordion */}
          <div className="flex flex-col">
            <button
              className="flex items-center justify-between text-white hover:bg-secondary/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[400px]" : "max-h-0"}`}>
              <Link
                to="/services"
                className="flex items-center gap-3 text-secondary font-medium py-3 px-8 rounded-lg hover:bg-secondary/10 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                View All Services
              </Link>
              {serviceLinks.map((service) => (
                <Link
                  key={service.name}
                  to={service.href}
                  className="flex items-center gap-3 text-white/80 hover:bg-secondary/10 py-3 px-8 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <service.icon className="w-4 h-4" />
                  {service.name}
                </Link>
              ))}
            </div>
          </div>
          
          {navLinks.slice(2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-white hover:bg-secondary/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex flex-col items-center gap-3 pt-6 mt-4 border-t border-white/10">
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-6 py-3 text-white hover:bg-secondary/10 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-6 py-3 text-white hover:bg-secondary/10 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  className="w-full px-6 py-3 bg-secondary text-white font-medium rounded-xl hover:scale-[1.02] transition-all"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-6 py-3 bg-white text-foreground font-medium rounded-xl hover:scale-[1.02] transition-all text-center"
                >
                  Sign Up
                </Link>
                <Link 
                  to="/pricing" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-6 py-3 bg-secondary text-white font-medium rounded-xl hover:scale-[1.02] transition-all text-center"
                >
                  Get Quote
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[-1]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
