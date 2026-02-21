import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
  Shield,
  Bell,
  FileText,
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Shipments", href: "/admin/shipments", icon: Package },
    { name: "Invoices", href: "/admin/invoices", icon: FileText },
    { name: "Payments", href: "/admin/payments", icon: DollarSign },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Pricing", href: "/admin/pricing", icon: Settings },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const NavContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-border/50">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center font-heading font-bold text-primary text-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
            R
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-foreground block">
              RAC Admin
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Control Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-4 py-2">
          Management
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                active
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="font-medium relative z-10">{item.name}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto relative z-10" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl py-3"
          asChild
        >
          <Link to="/">
            <Home className="w-5 h-5 mr-3" />
            Back to Site
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl py-3"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-card rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300 border border-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border/50 flex flex-col z-40 transition-transform shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
