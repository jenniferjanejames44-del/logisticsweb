import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Package, label: "Shipments", href: "/dashboard/shipments" },
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-primary text-primary-foreground rounded-lg shadow-md transition-all duration-200 active:scale-95"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen min-h-screen w-[272px] bg-primary text-primary-foreground flex flex-col z-50 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileOpen(false)}>
            <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center font-bold text-lg">
              R
            </div>
            <div>
              <span className="font-bold text-base block leading-tight">
                RAC <span className="text-accent">Logistics</span>
              </span>
              <span className="text-[11px] text-primary-foreground/50 leading-none">Customer Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[11px] font-bold text-primary-foreground/60 uppercase tracking-widest px-3 pb-2 pt-1">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[0.9375rem] ${
                  isActive
                    ? "bg-accent text-accent-foreground font-bold"
                    : "text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground font-semibold"
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-accent-foreground" : ""}`} strokeWidth={2.5} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" strokeWidth={2.5} />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-primary-foreground/10" />
              <p className="text-[11px] font-bold text-primary-foreground/60 uppercase tracking-widest px-3 pb-2 pt-1">
                Administration
              </p>
              <Link
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 bg-accent/15 text-accent hover:bg-accent/25 border border-accent/20 text-[0.875rem] font-medium"
              >
                <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                <span>Admin Dashboard</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-primary-foreground/10 space-y-2">
          <div className="px-3 py-2.5 bg-primary-foreground/5 rounded-lg">
            <p className="text-[13px] font-semibold text-primary-foreground">Welcome back!</p>
            <p className="text-[11px] text-primary-foreground/70">Manage your shipments</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-destructive/20 rounded-lg py-2.5 h-auto text-[0.9375rem] font-semibold"
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
