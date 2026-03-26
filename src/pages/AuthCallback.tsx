import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSafeAuthReturnPath } from "@/lib/authUrls";

const allowedEmailTypes = new Set<EmailOtpType>([
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
  "email",
]);

const defaultPathByType: Record<string, string> = {
  signup: "/auth",
  recovery: "/reset-password",
  invite: "/auth",
  magiclink: "/dashboard",
  email_change: "/dashboard/profile",
  email: "/auth",
};

const AuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const completeAuth = async () => {
      const queryParams = new URLSearchParams(searchParams);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const authType = queryParams.get("type") ?? hashParams.get("type");
      const fallbackPath = defaultPathByType[authType ?? ""] ?? "/dashboard";
      const explicitNext = queryParams.get("next") ?? hashParams.get("next");
      const redirectTarget = getSafeAuthReturnPath(
        queryParams.get("redirect_to") ?? hashParams.get("redirect_to"),
        fallbackPath,
      );
      const nextPath = explicitNext
        ? getSafeAuthReturnPath(explicitNext, fallbackPath)
        : redirectTarget.startsWith("/auth/callback") || redirectTarget.startsWith("/auth/confirm")
          ? fallbackPath
          : redirectTarget;

      const tokenHash = queryParams.get("token_hash") ?? hashParams.get("token_hash");
      if (tokenHash && authType && allowedEmailTypes.has(authType as EmailOtpType)) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: authType as EmailOtpType,
        });

        window.location.replace(error ? "/auth" : nextPath);
        return;
      }

      const accessToken = queryParams.get("access_token") ?? hashParams.get("access_token");
      const refreshToken = queryParams.get("refresh_token") ?? hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        window.location.replace(error ? "/auth" : nextPath);
        return;
      }

      const authCode = queryParams.get("code");
      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);
        window.location.replace(error ? "/auth" : nextPath);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      window.location.replace(session ? nextPath : "/auth");
    };

    void completeAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-section-light px-4 py-32 sm:px-6">
        <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader className="p-6 pb-3 text-center">
            <CardTitle className="text-foreground">Confirming your access</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Please wait while we securely redirect you to RAC Logistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mx-auto h-8 w-8 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AuthCallback;