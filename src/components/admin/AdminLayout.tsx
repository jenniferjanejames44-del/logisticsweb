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
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <Shield className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 flex">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 md:ml-72 pt-16 sm:pt-18 md:pt-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {title && (
            <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/50">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Admin Panel</span>
                <span>/</span>
                <span className="text-foreground font-medium truncate">{title}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg line-clamp-2">{description}</p>
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
