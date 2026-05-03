import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import HeaderLogo from "@/components/layout/HeaderLogo";
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  Bell,
  FileText,
  ShoppingBag,
  Warehouse,
  Calculator,
  Route,
  MessageSquare,
  RefreshCw,
  Settings,
  ChevronRight,
  Handshake,
} from "lucide-react";

interface NavSection {
  label: string;
  items: { name: string; href: string; icon: any }[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
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
      { name: "Partners", href: "/admin/partners", icon: Handshake },
    ],
  },
  {
    label: "Logistics",
    items: [
      { name: "Shipping Routes", href: "/admin/shipping-routes", icon: Route },
      { name: "Warehouses", href: "/admin/warehouses", icon: Warehouse },
      { name: "Packaging", href: "/admin/packaging", icon: Package },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "Pricing Plans", href: "/admin/pricing", icon: Settings },
      { name: "Pricing Engine", href: "/admin/pricing-engine", icon: Calculator },
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
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="border-b border-border/30 py-4 pl-20 pr-5 lg:px-5">
        <Link to="/admin" className="flex flex-col items-start gap-1" onClick={() => setIsMobileOpen(false)}>
          <HeaderLogo className="h-auto w-full max-w-[160px]" />
          <span className="text-[11px] text-muted-foreground/70 leading-none pl-1">Admin Console</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.18em] px-3 mb-1.5">
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
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200 ${
                      active
                        ? "bg-primary/[0.08] text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                    )}
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : ""}`} strokeWidth={active ? 2.2 : 1.8} />
                    <span className="flex-1">{item.name}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-primary/50" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/30 px-3 py-3 space-y-0.5">
        <Button
          variant="ghost"
          className="h-9 w-full justify-start rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          asChild
        >
          <Link to="/" onClick={() => setIsMobileOpen(false)}>
            <Home className="w-4 h-4 mr-3 flex-shrink-0" strokeWidth={1.8} />
            Back to Website
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="h-9 w-full justify-start rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-3 flex-shrink-0" strokeWidth={1.8} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed left-4 top-4 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-all duration-200 active:scale-95 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/15 z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-full w-[260px] flex-col bg-white border-r border-border/40 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
