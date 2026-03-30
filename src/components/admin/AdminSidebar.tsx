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
  Shield,
  Bell,
  FileText,
  ShoppingBag,
  Warehouse,
  Calculator,
  Route,
  Truck,
  MessageSquare,
  RefreshCw,
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
      { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
      { name: "Refunds", href: "/admin/refunds", icon: RefreshCw },
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
      <div className="border-b border-border/50 px-5 py-5">
        <Link to="/admin" className="flex items-center gap-3 group" onClick={() => setIsMobileOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
            R
          </div>
          <div>
            <span className="font-bold text-[15px] text-foreground block leading-tight">RAC Admin</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 leading-none">
              <Shield className="w-3 h-3" />
              Control Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] px-3 pb-1.5">
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
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all duration-150 ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={2} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-border/50 px-3 py-3">
        <Button
          variant="ghost"
          className="h-10 w-full justify-start rounded-lg px-3 text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          asChild
        >
          <Link to="/" onClick={() => setIsMobileOpen(false)}>
            <Home className="w-4 h-4 mr-3 flex-shrink-0" />
            Back to Site
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="h-10 w-full justify-start rounded-lg px-3 text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all duration-200 active:scale-95 md:hidden"
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
        className={`fixed top-0 left-0 z-40 flex h-full w-[272px] flex-col border-r border-border/60 bg-white transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
