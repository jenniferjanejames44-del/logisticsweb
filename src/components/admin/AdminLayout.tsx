import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import AdminSidebar from "./AdminSidebar";
import { Shield } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const AdminLayout = ({ children, title, description }: AdminLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <Shield className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top,rgba(223,81,1,0.05),transparent_18%),linear-gradient(180deg,hsl(var(--section-light))_0%,hsl(var(--background))_28%)]">
      <AdminSidebar />
      <main className="flex-1 ml-0 md:ml-72 overflow-auto">
        <div className="section-container animate-fade-in-soft py-6 pb-10 pt-16 md:py-8 md:pt-8">
          {title && (
            <div className="page-header-surface mb-8 p-6 sm:mb-10 sm:p-8">
              <div className="relative z-10 mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
                <span className="text-primary/40">/</span>
                <span>{title}</span>
              </div>
              <h1 className="relative z-10">{title}</h1>
              {description && (
                <p className="relative z-10 mt-2 text-base leading-relaxed text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
