import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AuthRedirectProps {
  children: React.ReactNode;
}

/**
 * This component handles post-login redirection based on user role.
 * It fetches the role directly (not via hook) to avoid race conditions.
 */
const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // No user = stay on auth page
      if (!user) {
        setIsChecking(false);
        return;
      }

      // Already redirected in this session
      if (hasRedirected) {
        return;
      }

      try {
        console.log("AuthRedirect: Fetching role for user:", user.id);
        
        // Fetch role directly from database
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("AuthRedirect: Error fetching role:", error);
          // Default to customer on error
          setHasRedirected(true);
          navigate("/dashboard", { replace: true });
          return;
        }

        const role = data?.role || "customer";
        console.log("AuthRedirect: Role fetched:", role);

        setHasRedirected(true);

        if (role === "admin") {
          console.log("AuthRedirect: Redirecting to /admin");
          navigate("/admin", { replace: true });
        } else {
          // Check if there's a pending shipment - redirect to shipments page
          const hasPending = localStorage.getItem("pending_shipment_data");
          const redirectTo = hasPending ? "/dashboard/shipments" : "/dashboard";
          console.log("AuthRedirect: Redirecting to", redirectTo);
          navigate(redirectTo, { replace: true });
        }
      } catch (err) {
        console.error("AuthRedirect: Unexpected error:", err);
        setHasRedirected(true);
        navigate("/dashboard", { replace: true });
      }
    };

    checkRoleAndRedirect();
  }, [user, authLoading, navigate, hasRedirected]);

  // Show loading state while checking auth/role
  if (authLoading || (user && isChecking && !hasRedirected)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    );
  }

  // User is logged in and we've already started redirect - show loading
  if (user && hasRedirected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // No user - show the auth form
  return <>{children}</>;
};

export default AuthRedirect;
