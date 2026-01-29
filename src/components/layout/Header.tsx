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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 bg-white shadow-sm ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white transition-transform duration-300 group-hover:scale-105 gradient-blue">
            R
          </div>
          <span className="font-semibold text-xl text-primary">
            RAC <span className="text-secondary">Logistics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-medium transition-colors duration-300 text-muted-foreground hover:text-secondary"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="font-medium transition-colors duration-300 flex items-center gap-1 hover:text-secondary text-muted-foreground"
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 p-2 bg-card border-border shadow-lg">
              <DropdownMenuItem asChild className="p-0 mb-1">
                <Link
                  to="/services"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors w-full font-medium text-accent"
                >
                  View All Services
                </Link>
              </DropdownMenuItem>
              {serviceLinks.map((service) => (
                <DropdownMenuItem key={service.name} asChild className="p-0">
                  <Link
                    to={service.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors w-full text-muted-foreground hover:text-primary"
                  >
                    <service.icon className="w-4 h-4 text-accent" />
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
              className="font-medium transition-colors duration-300 text-muted-foreground hover:text-secondary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Link 
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2.5 font-semibold transition-colors text-muted-foreground hover:text-primary"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 font-semibold transition-colors text-muted-foreground hover:text-primary"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl transition-all duration-300 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary hover:-translate-y-0.5 group"
              >
                Get Quote
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
              >
                Sign Up
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-accent/10 text-accent"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-y-0 right-0 w-full sm:w-80 transition-all duration-300 overflow-y-auto bg-navy ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-6 pb-6 flex flex-col gap-2">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-white/80 hover:text-secondary hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center justify-between text-white/80 hover:text-secondary hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[400px]" : "max-h-0"}`}>
              <Link
                to="/services"
                className="flex items-center gap-3 font-medium py-3 px-8 rounded-lg hover:bg-white/10 transition-all text-secondary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                View All Services
              </Link>
              {serviceLinks.map((service) => (
                <Link
                  key={service.name}
                  to={service.href}
                  className="flex items-center gap-3 text-white/60 hover:text-secondary hover:bg-white/10 py-3 px-8 rounded-lg transition-all"
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
              className="text-white/80 hover:text-secondary hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-white/10">
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 text-white bg-white/5 hover:bg-white/10 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3.5 text-white bg-white/5 hover:bg-white/10 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 border border-white/20"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  className="w-full py-3.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white"
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
                  to="/pricing" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white group"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 bg-white/10 text-white border border-white/30 hover:bg-white/20 group"
                >
                  Sign Up
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
