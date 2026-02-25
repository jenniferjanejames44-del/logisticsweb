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
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 ml-0 md:ml-72 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pt-16 sm:pt-18 md:pt-8">
          {title && (
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 tracking-wide uppercase font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
                <span className="text-border">/</span>
                <span className="text-foreground">{title}</span>
              </div>
              <h1 className="text-[1.75rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-foreground tracking-tight leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-1.5 text-[0.9375rem] leading-relaxed">{description}</p>
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
