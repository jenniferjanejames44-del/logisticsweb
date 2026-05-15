import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_SIGNOUT_FLAG, useAuth } from "@/contexts/AuthContext";
import { getPostAuthRedirectPath } from "@/lib/postAuthRedirect";

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
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const isSigningOut = typeof window !== "undefined" && sessionStorage.getItem(AUTH_SIGNOUT_FLAG) === "true";

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (isSigningOut) {
        setIsChecking(false);
        setHasRedirected(false);
        return;
      }

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
        const redirectTo = await getPostAuthRedirectPath(user.id);
        setHasRedirected(true);
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error("AuthRedirect: Unexpected error:", err);
        setHasRedirected(true);
        navigate("/dashboard", { replace: true });
      }
    };

    checkRoleAndRedirect();
  }, [user, authLoading, navigate, hasRedirected, isSigningOut]);

  if (isSigningOut) {
    return <>{children}</>;
  }

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
