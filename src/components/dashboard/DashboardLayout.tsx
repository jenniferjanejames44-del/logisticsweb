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
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl animate-fade-in-soft px-4 py-6 pb-12 pt-20 sm:px-6 lg:px-8 lg:py-10 lg:pt-10">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <p className="mb-1.5 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard / {title}
            </p>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {action && <div className="flex flex-shrink-0 flex-wrap items-center gap-3">{action}</div>}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
