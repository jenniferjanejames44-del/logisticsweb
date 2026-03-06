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
  ShoppingBag,
  Warehouse,
  Calculator,
  Route,
} from "lucide-react";

interface NavSection {
  label: string;
  items: { name: string; href: string; icon: any }[];
}

const navSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Shipments", href: "/admin/shipments", icon: Package },
      { name: "Invoices", href: "/admin/invoices", icon: FileText },
      { name: "Payments", href: "/admin/payments", icon: DollarSign },
      { name: "Shopping Orders", href: "/admin/shopping-orders", icon: ShoppingBag },
    ],
  },
  {
    label: "Logistics",
    items: [
      { name: "Shipping Routes", href: "/admin/shipping-routes", icon: Route },
      { name: "Warehouses", href: "/admin/warehouses", icon: Warehouse },
      { name: "Packaging", href: "/admin/packaging", icon: Package },
      { name: "Delivery Methods", href: "/admin/delivery-methods", icon: Truck },
    ],
  },
  {
    label: "Pricing",
    items: [
      { name: "Pricing Plans", href: "/admin/pricing", icon: Settings },
      { name: "Pricing Engine", href: "/admin/pricing-engine", icon: Calculator },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/50">
        <Link to="/admin" className="flex items-center gap-3 group" onClick={() => setIsMobileOpen(false)}>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary text-lg">
            R
          </div>
          <div>
            <span className="font-bold text-base text-foreground block leading-tight">RAC Admin</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 leading-none">
              <Shield className="w-3 h-3" />
              Control Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 pb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[0.875rem] ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>{item.name}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border/50 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg py-2.5 h-auto text-[0.875rem] font-medium"
          asChild
        >
          <Link to="/" onClick={() => setIsMobileOpen(false)}>
            <Home className="w-[18px] h-[18px] mr-3 flex-shrink-0" />
            Back to Site
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg py-2.5 h-auto text-[0.875rem] font-medium"
          onClick={() => signOut()}
        >
          <LogOut className="w-[18px] h-[18px] mr-3 flex-shrink-0" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-primary text-primary-foreground rounded-lg shadow-md transition-all duration-200 active:scale-95"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[272px] bg-card border-r border-border/50 flex flex-col z-40 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
