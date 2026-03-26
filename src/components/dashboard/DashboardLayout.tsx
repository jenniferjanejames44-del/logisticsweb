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
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[hsl(220,20%,97%)]">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 pt-16 sm:px-6 lg:px-8 lg:pt-8 lg:py-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
                {description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
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
