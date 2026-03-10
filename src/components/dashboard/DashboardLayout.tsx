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
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top,rgba(223,81,1,0.05),transparent_18%),linear-gradient(180deg,hsl(var(--section-light))_0%,hsl(var(--background))_28%)]">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="section-container animate-fade-in-soft py-6 pb-10 pt-20 lg:py-8 lg:pt-8">
          {/* Page Header - Clean & Spacious */}
          <div className="page-header-surface mb-8 p-6 sm:mb-10 sm:p-8">
            <div className="relative z-10 mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span>Dashboard</span>
              <span className="text-primary/40">/</span>
              <span>{title}</span>
            </div>
            <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <h1>{title}</h1>
                {description && (
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
                )}
              </div>
              {action && <div className="flex flex-shrink-0 flex-wrap items-center gap-3 self-start sm:self-auto">{action}</div>}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
