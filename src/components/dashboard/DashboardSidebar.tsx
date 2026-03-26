import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo";
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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Package, label: "Shipments", href: "/dashboard/shipments" },
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: MessageSquare, label: "Support", href: "/dashboard/support" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: ShoppingBag, label: "Shopping Orders", href: "/dashboard/shopping-orders" },
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-white border-r border-border transition-transform duration-300 lg:sticky ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link
            to="/"
            className="flex items-center"
            onClick={() => setIsMobileOpen(false)}
            aria-label="RAC Logistics home"
          >
            <Logo className="h-auto w-full max-w-[140px]" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <>
              <div className="my-3 border-t border-border" />
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin
              </p>
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/8"
              >
                <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                <span>Admin Dashboard</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-2">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
