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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto ml-0 lg:ml-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pt-16 lg:pt-8">
          {/* Page Header - Clean & Spacious */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 tracking-wide uppercase font-medium">
              <span>Dashboard</span>
              <span className="text-border">/</span>
              <span className="text-foreground">{title}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[1.75rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-foreground tracking-tight leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground mt-1.5 text-[0.9375rem] leading-relaxed">{description}</p>
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
