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
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.14)] transition-all duration-200 group-hover:-translate-y-px group-hover:shadow-[0_14px_28px_rgba(6,16,67,0.18)]">
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
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
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
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[0.875rem] transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold shadow-[0_10px_24px_rgba(6,16,67,0.12)]"
                        : "font-medium text-muted-foreground hover:-translate-y-px hover:bg-white hover:text-foreground hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                    }`}
                  >
                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${active ? "bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" : "bg-muted/70 shadow-[0_4px_12px_rgba(15,23,42,0.04)] group-hover:bg-primary/5"}`}>
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2.5} />
                    </span>
                    <span>{item.name}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" strokeWidth={2.5} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-border/50 px-3 py-4">
        <div className="rounded-xl border border-border bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--section-light))_100%)] px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <p className="text-[13px] font-semibold text-foreground">Admin control center</p>
          <p className="text-[11px] text-muted-foreground">Manage operations, pricing, and customer activity.</p>
        </div>
        <Button
          variant="ghost"
          className="h-11 w-full justify-start rounded-lg px-4 text-[0.875rem] font-medium text-muted-foreground hover:-translate-y-px hover:bg-white hover:text-foreground"
          asChild
        >
          <Link to="/" onClick={() => setIsMobileOpen(false)}>
            <Home className="w-[18px] h-[18px] mr-3 flex-shrink-0" />
            Back to Site
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="h-11 w-full justify-start rounded-lg px-4 text-[0.875rem] font-medium text-muted-foreground hover:-translate-y-px hover:bg-destructive/10 hover:text-destructive"
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
        className="fixed left-3 top-3 z-50 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.16)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(6,16,67,0.18)] active:scale-95 md:hidden"
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
        className={`fixed top-0 left-0 z-40 flex h-full w-[288px] flex-col border-r border-border/50 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--section-light))_100%)] shadow-[18px_0_40px_rgba(6,16,67,0.08)] backdrop-blur-xl transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
