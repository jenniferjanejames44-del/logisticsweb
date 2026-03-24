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

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const confirmAuth = async () => {
      const tokenHash = searchParams.get("token_hash");
      const authType = searchParams.get("type");
      const fallbackPath = defaultPathByType[authType ?? ""] ?? "/auth";
      const nextPath = getSafeAuthReturnPath(searchParams.get("next"), fallbackPath);

      if (!tokenHash || !authType || !allowedEmailTypes.has(authType as EmailOtpType)) {
        window.location.replace("/auth");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: authType as EmailOtpType,
      });

      if (error) {
        window.location.replace("/auth");
        return;
      }

      window.location.replace(nextPath);
    };

    void confirmAuth();
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

export default AuthConfirm;