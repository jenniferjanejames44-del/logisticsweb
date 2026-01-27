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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 ${
        isScrolled
          ? "bg-white border-b shadow-sm"
          : "bg-transparent"
      }`}
      style={{ 
        borderColor: isScrolled ? '#E5E7EB' : 'transparent',
        boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white transition-transform duration-300 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)' }}>
            R
          </div>
          <span className="font-semibold text-xl" style={{ color: isScrolled ? '#0C4A6E' : 'white' }}>
            RAC <span style={{ color: '#FF6B35' }}>Logistics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-medium transition-colors duration-300"
              style={{ color: isScrolled ? '#475569' : 'rgba(255,255,255,0.8)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = isScrolled ? '#0EA5E9' : 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = isScrolled ? '#475569' : 'rgba(255,255,255,0.8)'}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="font-medium transition-colors duration-300 flex items-center gap-1"
                style={{ color: isScrolled ? '#475569' : 'rgba(255,255,255,0.8)' }}
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 p-2 bg-white border border-gray-100 shadow-lg">
              <DropdownMenuItem asChild className="p-0 mb-1">
                <Link
                  to="/services"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full font-medium"
                  style={{ color: '#0EA5E9' }}
                >
                  View All Services
                </Link>
              </DropdownMenuItem>
              {serviceLinks.map((service) => (
                <DropdownMenuItem key={service.name} asChild className="p-0">
                  <Link
                    to={service.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full"
                  >
                    <service.icon className="w-4 h-4" style={{ color: '#0EA5E9' }} />
                    <span style={{ color: '#475569' }}>{service.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="font-medium transition-colors duration-300"
              style={{ color: isScrolled ? '#475569' : 'rgba(255,255,255,0.8)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = isScrolled ? '#0EA5E9' : 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = isScrolled ? '#475569' : 'rgba(255,255,255,0.8)'}
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
                <Link 
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 transition-colors"
                  style={{ color: isScrolled ? '#475569' : 'rgba(255,255,255,0.8)' }}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 transition-colors"
                style={{ color: isScrolled ? '#475569' : 'rgba(255,255,255,0.8)' }}
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/pricing"
                className="flex items-center gap-2 group px-6 py-2.5 rounded-xl font-bold text-white transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)'
                }}
              >
                Get Quote
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/auth"
                className="flex items-center gap-2 group px-6 py-2.5 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  background: '#FFFFFF',
                  color: '#0EA5E9',
                  border: '2px solid white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0EA5E9';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = '#0EA5E9';
                }}
              >
                Sign Up
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ 
            background: isScrolled ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.1)',
            color: isScrolled ? '#0EA5E9' : 'white'
          }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-y-0 right-0 w-full sm:w-80 transition-all duration-300 overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #075985 100%)' }}
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
              className="text-white/80 hover:text-white hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center justify-between text-white/80 hover:text-white hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMobileServicesOpen ? "max-h-[400px]" : "max-h-0"}`}>
              <Link
                to="/services"
                className="flex items-center gap-3 font-medium py-3 px-8 rounded-lg hover:bg-white/10 transition-all"
                style={{ color: '#0EA5E9' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                View All Services
              </Link>
              {serviceLinks.map((service) => (
                <Link
                  key={service.name}
                  to={service.href}
                  className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/10 py-3 px-8 rounded-lg transition-all"
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
              className="text-white/80 hover:text-white hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-all"
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
                    className="w-full px-6 py-3 text-white hover:bg-white/10 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-6 py-3 text-white hover:bg-white/10 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  className="w-full btn-primary"
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
                  className="w-full text-center flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                    boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)'
                  }}
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
                  style={{ 
                    background: '#FFFFFF',
                    color: '#0EA5E9',
                    border: '2px solid white'
                  }}
                >
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
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
