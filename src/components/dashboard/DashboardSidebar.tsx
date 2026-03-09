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
  ChevronRight,
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
        className="lg:hidden fixed left-3 top-3 z-50 rounded-md bg-primary p-2.5 text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.18)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(6,16,67,0.22)] active:scale-95"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 flex h-screen min-h-screen w-[280px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#071343_0%,#0b1f63_100%)] text-primary-foreground transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-primary-foreground/10 px-5 py-6">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileOpen(false)}>
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
              <Logo className="h-7 text-white" />
            </div>
            <div>
              <span className="block text-base font-bold leading-tight">
                RAC <span className="text-accent">Logistics</span>
              </span>
              <span className="text-[11px] leading-none text-primary-foreground/60">Customer Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 text-[0.9375rem] ${
                  isActive
                    ? "bg-accent text-accent-foreground font-bold shadow-[0_12px_24px_rgba(223,81,1,0.22)]"
                    : "font-semibold text-primary-foreground/90 hover:-translate-y-px hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${isActive ? "bg-white/16" : "bg-white/8 group-hover:bg-white/12"}`}>
                  <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-accent-foreground" : ""}`} strokeWidth={2.5} />
                </span>
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" strokeWidth={2.5} />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-primary-foreground/10" />
              <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                Administration
              </p>
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="group flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/12 px-4 py-3 text-[0.875rem] font-medium text-accent transition-all duration-200 hover:-translate-y-px hover:bg-accent/20"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                </span>
                <span>Admin Dashboard</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="space-y-3 border-t border-primary-foreground/10 px-4 py-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[13px] font-semibold text-primary-foreground">Welcome back!</p>
            <p className="text-[11px] text-primary-foreground/70">Manage your shipments in one place</p>
          </div>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-[0.9375rem] font-semibold text-primary-foreground/80 hover:-translate-y-px hover:bg-white/10 hover:text-primary-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
