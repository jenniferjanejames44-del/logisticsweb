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
    <div className="min-h-screen flex bg-[#f5f5f7] dark:bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 border-b border-border/40 bg-background">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-5 lg:px-6">
            <div className="flex items-center justify-between gap-3 h-16 lg:h-[68px]">
              <div className="min-w-0 pl-14 lg:pl-0">
                <h1 className="text-[15px] sm:text-base lg:text-lg font-bold text-foreground truncate leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-[12px] text-muted-foreground leading-tight truncate hidden sm:block">
                    {description}
                  </p>
                )}
              </div>
              {action && <div className="flex-shrink-0">{action}</div>}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
