import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, User, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-primary shadow-xl py-3"
          : "bg-primary/95 backdrop-blur-md py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center font-heading font-extrabold text-primary text-xl transition-transform group-hover:scale-110 shadow-lg">
            R
          </div>
          <span className="font-heading font-bold text-xl text-white">
            RAC <span className="text-secondary">Logistics</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-white/90 hover:text-secondary font-semibold transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full rounded-full" />
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" className="text-white hover:text-secondary hover:bg-white/10" asChild>
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="text-white hover:text-secondary hover:bg-white/10" asChild>
                <Link to="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                variant="heroOutline"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-white hover:text-secondary hover:bg-white/10 font-semibold" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button variant="cta" size="lg" asChild>
                <Link to="/pricing">Get Quote</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-primary border-t border-white/10 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-[500px] py-6" : "max-h-0"
        }`}
      >
        <nav className="container mx-auto px-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-white/90 hover:text-secondary hover:bg-white/5 font-semibold py-3 px-4 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-white/10">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" className="text-white hover:text-secondary justify-start" asChild>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" className="text-white hover:text-secondary justify-start" asChild>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  variant="cta" 
                  className="w-full"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="heroOutline" className="w-full" asChild>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button variant="cta" className="w-full" asChild>
                  <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Get Quote</Link>
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
