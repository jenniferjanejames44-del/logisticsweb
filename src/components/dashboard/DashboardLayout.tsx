import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "./DashboardSidebar";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const DashboardLayout = ({ children, title, description, action }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-accent/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-muted/30 via-background to-muted/50">
      <DashboardSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto ml-0 lg:ml-0">
        <div className="max-w-7xl mx-auto pt-14 lg:pt-0">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-foreground font-medium truncate">{title}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg line-clamp-2">{description}</p>
                )}
              </div>
              {action && <div className="flex-shrink-0">{action}</div>}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
