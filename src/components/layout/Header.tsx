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
          ? "bg-[hsl(230,60%,6%)]/95 backdrop-blur-xl shadow-lg shadow-black/10 py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-heading font-extrabold text-lg md:text-xl transition-all duration-300 shadow-[0_4px_20px_rgba(251,146,60,0.4)] bg-secondary text-white group-hover:scale-110">
            R
          </div>
          <span className="font-heading font-bold text-xl transition-colors duration-300 text-white">
            RAC <span className="text-secondary">Logistics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-semibold text-base transition-colors relative group text-[hsl(215,20%,85%)] hover:text-secondary"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full rounded-full bg-secondary" />
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="font-semibold text-base transition-colors relative group flex items-center gap-1 text-[hsl(215,20%,85%)] hover:text-secondary"
              >
                Services
                <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full rounded-full bg-secondary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="center" 
              className="w-64 p-2 bg-card/95 backdrop-blur-xl border-border shadow-xl"
            >
              <DropdownMenuItem asChild className="p-0 mb-2">
                <Link
                  to="/services"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/10 transition-colors w-full font-semibold text-secondary"
                >
                  View All Services
                </Link>
              </DropdownMenuItem>
              {serviceLinks.map((service) => (
                <DropdownMenuItem key={service.name} asChild className="p-0">
                  <Link
                    to={service.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/10 transition-colors w-full"
                  >
                    <service.icon className="w-4 h-4 text-secondary" />
                    <span className="font-medium text-foreground">{service.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-semibold text-base transition-colors relative group text-[hsl(215,20%,85%)] hover:text-secondary"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full rounded-full bg-secondary" />
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" className="text-[hsl(215,20%,85%)] hover:text-secondary hover:bg-white/10 font-semibold" asChild>
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="text-[hsl(215,20%,85%)] hover:text-secondary hover:bg-white/10 font-semibold" asChild>
                <Link to="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                className="px-6 py-2.5 rounded-lg font-bold bg-secondary text-white shadow-[0_4px_20px_rgba(251,146,60,0.4)] hover:shadow-[0_8px_30px_rgba(251,146,60,0.5)] hover:bg-[hsl(18,100%,55%)] transition-all"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="font-semibold text-[hsl(215,20%,85%)] hover:text-secondary hover:bg-white/10" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button 
                className="px-6 py-2.5 rounded-lg font-bold bg-secondary text-white shadow-[0_4px_20px_rgba(251,146,60,0.4)] hover:shadow-[0_8px_30px_rgba(251,146,60,0.5)] hover:bg-[hsl(18,100%,55%)] transition-all group" 
                asChild
              >
                <Link to="/pricing">
                  Get Quote
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            className="p-2 rounded-lg transition-colors text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide from right */}
      <div
        className={`lg:hidden fixed inset-y-0 right-0 w-full sm:w-80 bg-[hsl(222,47%,11%)] transition-all duration-300 overflow-y-auto shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{ top: '0' }}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            className="p-2 rounded-lg transition-colors text-white hover:bg-secondary hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
        </div>

        <nav className="px-6 pb-6 flex flex-col gap-2">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-white hover:bg-secondary hover:text-white font-semibold py-4 px-4 rounded-xl transition-all min-h-[48px] flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Services Accordion */}
          <div className="flex flex-col">
            <button
              className="flex items-center justify-between text-white hover:bg-secondary hover:text-white font-semibold py-4 px-4 rounded-xl transition-all min-h-[48px]"
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[500px]" : "max-h-0"}`}>
              <Link
                to="/services"
                className="flex items-center gap-3 text-secondary font-semibold py-3 px-8 rounded-lg hover:bg-secondary hover:text-white transition-all min-h-[44px]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                View All Services
              </Link>
              {serviceLinks.map((service) => (
                <Link
                  key={service.name}
                  to={service.href}
                  className="flex items-center gap-3 text-white hover:bg-secondary hover:text-white py-3 px-8 rounded-lg transition-all min-h-[44px]"
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
              className="text-white hover:bg-secondary hover:text-white font-semibold py-4 px-4 rounded-xl transition-all min-h-[48px] flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex flex-col items-center gap-3 pt-6 mt-4 border-t border-white/20">
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-auto px-6 py-3 text-white hover:bg-secondary hover:text-white font-bold uppercase text-sm rounded-lg transition-all flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    ADMIN
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-auto px-6 py-3 text-white hover:bg-secondary hover:text-white font-bold uppercase text-sm rounded-lg transition-all flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  DASHBOARD
                </Link>
                <button 
                  className="w-auto px-6 py-3 bg-secondary text-white font-bold uppercase text-sm rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-auto px-6 py-3 bg-white text-[hsl(222,47%,11%)] font-bold uppercase text-sm rounded-lg hover:scale-105 transition-all duration-300"
                >
                  SIGN UP
                </Link>
                <Link 
                  to="/pricing" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-auto px-6 py-3 bg-secondary text-white font-bold uppercase text-sm rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  GET QUOTE
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
