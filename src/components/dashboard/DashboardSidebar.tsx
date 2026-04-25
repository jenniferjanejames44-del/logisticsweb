import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

import HeaderLogo from "@/components/layout/HeaderLogo";
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
  Wallet,
  FileText,
  ShoppingBag,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Plus,
  List,
  Handshake,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const mainNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: ShoppingBag, label: "Shopping Orders", href: "/dashboard/shopping-orders" },
];

const shipmentChildren = [
  { icon: List, label: "View Shipments", href: "/dashboard/shipments" },
  { icon: Plus, label: "Create Shipment", href: "/dashboard/shipments/new" },
];

const managementNav = [
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
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
    <div className="mb-1">
      <p className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 first:pt-0">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[252px] flex-col bg-white border-r border-border/60 transition-transform duration-300 lg:sticky ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-border/40">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setIsMobileOpen(false)}
            aria-label="RAC Logistics home"
          >
            <HeaderLogo className="h-auto w-full max-w-[150px]" />
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="px-3 py-3 border-b border-border/40">
          <Link
            to="/dashboard/profile"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {profileName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {renderNavGroup("Main", mainNav)}

          {/* Shipments expandable group */}
          <div className="mb-1">
            <button
              type="button"
              onClick={() => setShipmentsOpen((o) => !o)}
              className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isShipmentsRoute
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
              aria-expanded={shipmentsOpen}
            >
              <Package className="w-4 h-4 flex-shrink-0" strokeWidth={isShipmentsRoute ? 2.2 : 1.8} />
              <span className="flex-1 text-left">Shipments</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${shipmentsOpen ? "rotate-0" : "-rotate-90"}`}
              />
            </button>
            {shipmentsOpen && (
              <div className="mt-0.5 ml-3 space-y-0.5 border-l border-border/40 pl-2.5">
                {shipmentChildren.map((child) => {
                  const isChildActive = location.pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                        isChildActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      <child.icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={isChildActive ? 2.4 : 1.8} />
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
            <div className="mb-1">
              <div className="my-2 border-t border-border/40" />
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                Admin
              </p>
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/5 transition-colors"
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/40 p-3">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
