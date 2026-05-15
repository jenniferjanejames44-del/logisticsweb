import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

import HeaderLogo from "@/components/layout/HeaderLogo";
import {
  LayoutDashboard,
  Package,
  User,
  Bell,
  LogOut,
  Shield,
  FileText,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Plus,
  List,
  Handshake,
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
];

const shipmentChildren = [
  { icon: List, label: "View Shipments", href: "/dashboard/shipments" },
  { icon: Plus, label: "Create Shipment", href: "/dashboard/shipments/new" },
];

const managementNav = [
  { icon: ShoppingBag, label: "Shop For Me", href: "/dashboard/shopping-orders" },
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: MessageSquare, label: "Support", href: "/dashboard/support" },
];

const accountNav = [
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Handshake, label: "Partner Program", href: "/dashboard/partner" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileName, setProfileName] = useState<string>("");
  const isShipmentsRoute = location.pathname.startsWith("/dashboard/shipments");
  const [shipmentsOpen, setShipmentsOpen] = useState(isShipmentsRoute);

  useEffect(() => {
    if (isShipmentsRoute) setShipmentsOpen(true);
  }, [isShipmentsRoute]);

  // Allow other components (e.g. DashboardHero) to open the mobile sidebar
  useEffect(() => {
    const handler = () => setIsMobileOpen((v) => !v);
    window.addEventListener("dashboard-sidebar:toggle", handler);
    return () => window.removeEventListener("dashboard-sidebar:toggle", handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setProfileName(data.full_name);
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const renderNavGroup = (label: string, items: typeof mainNav) => (
    <div className="mb-2">
      <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/55 first:pt-1">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary/[0.06] text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent"
                />
              )}
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.7} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col bg-card border-r border-border/50 transition-transform duration-300 lg:sticky ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-border/30 py-5 pl-20 pr-5 lg:px-7">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setIsMobileOpen(false)}
            aria-label="RAC Logistics home"
          >
            <HeaderLogo className="h-auto w-full max-w-[150px]" />
          </Link>
        </div>

        {/* Shipping mode */}
        <div className="border-b border-border/40 px-5 py-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-foreground">Shipping Mode</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/dashboard/shipments/new"
              onClick={() => setIsMobileOpen(false)}
              className="flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-lg bg-accent px-2 text-center text-[12px] font-semibold leading-tight text-accent-foreground shadow-sm"
            >
              <Package className="h-5 w-5" strokeWidth={2.3} />
              Ship to Nigeria
            </Link>
            <Link
              to="/dashboard/shipments/new"
              onClick={() => setIsMobileOpen(false)}
              className="flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 text-center text-[12px] font-semibold leading-tight text-foreground hover:border-accent/50 hover:text-accent"
            >
              <Package className="h-5 w-5" strokeWidth={2.1} />
              Ship from Nigeria
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {renderNavGroup("Main", mainNav)}

          {/* Shipments expandable group */}
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setShipmentsOpen((o) => !o)}
              className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150 ${
                isShipmentsRoute
                  ? "bg-primary/[0.06] text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              aria-expanded={shipmentsOpen}
            >
              {isShipmentsRoute && (
                <span aria-hidden className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent" />
              )}
              <Package className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isShipmentsRoute ? 2.2 : 1.7} />
              <span className="flex-1 text-left">Shipments</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${shipmentsOpen ? "rotate-0" : "-rotate-90"}`}
              />
            </button>
            {shipmentsOpen && (
              <div className="mt-1 ml-[18px] space-y-1 border-l border-border/40 pl-3">
                {shipmentChildren.map((child) => {
                  const isChildActive = location.pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${
                        isChildActive
                          ? "bg-primary/[0.06] text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <child.icon className="w-4 h-4 flex-shrink-0" strokeWidth={isChildActive ? 2.2 : 1.7} />
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {renderNavGroup("Management", managementNav)}
          {renderNavGroup("Account", accountNav)}

          {isAdmin && (
            <div className="mb-2">
              <div className="my-3 border-t border-border/40" />
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/55">
                Admin
              </p>
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-accent hover:bg-accent/5 transition-colors"
              >
                <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/30 p-3">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
