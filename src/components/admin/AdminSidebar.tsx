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
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Shipments", href: "/admin/shipments", icon: Package },
    { name: "Payments", href: "/admin/payments", icon: DollarSign },
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
      <div className="p-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-heading font-bold text-primary text-xl">
            R
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-foreground block">
              RAC Admin
            </span>
            <span className="text-xs text-muted-foreground">Control Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/">
            <Home className="w-5 h-5 mr-3" />
            Back to Site
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-lg shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col z-40 transition-transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
