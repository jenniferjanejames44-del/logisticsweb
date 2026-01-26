import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Package, label: "Shipments", href: "/dashboard/shipments" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Menu Button - Enhanced */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-2.5 sm:p-3 bg-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[280px] sm:w-72 bg-gradient-to-b from-primary via-primary to-primary/95 text-primary-foreground flex flex-col z-50 transition-transform duration-300 shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group" onClick={() => setIsMobileOpen(false)}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-xl flex items-center justify-center font-heading font-bold text-primary text-xl sm:text-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
              R
            </div>
            <div>
              <span className="font-heading font-bold text-lg sm:text-xl block">
                RAC <span className="text-secondary">Logistics</span>
              </span>
              <span className="text-[10px] sm:text-xs text-primary-foreground/60">Customer Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-[10px] sm:text-xs font-medium text-primary-foreground/40 uppercase tracking-wider px-3 sm:px-4 py-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden touch-target ${
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-lg"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent" />
                )}
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 flex-shrink-0 ${isActive ? "text-secondary-foreground" : ""}`} />
                <span className="font-medium relative z-10 text-sm sm:text-base">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto relative z-10 flex-shrink-0" />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-3 sm:my-4 border-t border-primary-foreground/10" />
              <p className="text-[10px] sm:text-xs font-medium text-primary-foreground/40 uppercase tracking-wider px-3 sm:px-4 py-2">
                Administration
              </p>
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="group flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/30 touch-target"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Admin Dashboard</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            </>
          )}
        </nav>

        {/* User Section & Logout */}
        <div className="p-3 sm:p-4 border-t border-primary-foreground/10 space-y-2 sm:space-y-3 safe-area-bottom">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-foreground/5 rounded-xl">
            <p className="text-xs sm:text-sm font-medium text-primary-foreground">Welcome back!</p>
            <p className="text-[10px] sm:text-xs text-primary-foreground/60">Manage your shipments</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 sm:gap-3 text-primary-foreground/70 hover:text-primary-foreground hover:bg-destructive/20 rounded-xl py-2.5 sm:py-3 touch-target"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
