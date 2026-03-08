import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "./DashboardSidebar";

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
    <div className="min-h-screen flex bg-section-light">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto ml-0 lg:ml-0">
        <div className="section-container px-4 py-6 pt-20 sm:px-6 sm:py-8 lg:py-10 lg:pt-8">
          {/* Page Header - Clean & Spacious */}
          <div className="mb-8 rounded-2xl border border-border/70 bg-background p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] sm:mb-10 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span>Dashboard</span>
              <span className="text-primary/40">/</span>
              <span>{title}</span>
            </div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <h1 className="text-[1.875rem] font-bold leading-tight tracking-tight text-foreground sm:text-[2.125rem] lg:text-[2.25rem]">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
                )}
              </div>
              {action && <div className="flex-shrink-0 self-start sm:self-auto">{action}</div>}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
