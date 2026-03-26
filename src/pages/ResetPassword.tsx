import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isActive = true;

    const checkSession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search);
      const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!isActive) {
        return;
      }

      setHasSession(Boolean(session));
      setIsCheckingLink(false);
    };
    
    void checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) {
        return;
      }

      setHasSession(event === 'PASSWORD_RECOVERY' ? true : Boolean(session));
      setIsCheckingLink(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Password updated!",
        description: "Your password has been reset successfully.",
      });

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingLink) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-section-light px-4 py-32 sm:px-6">
          <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-6 pb-3 text-center">
              <CardTitle className="text-foreground">Verifying your reset link</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Please wait while we securely prepare your password reset.
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
  }

  if (!hasSession && !isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-section-light px-4 py-32 sm:px-6">
          <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-6 pb-3 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary font-bold text-xl text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                R
              </div>
              <CardTitle className="text-foreground">Invalid Link</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                This password reset link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Button
                variant="default"
                size="lg"
                className="w-full rounded-lg"
                onClick={() => navigate("/auth")}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-section-light px-4 py-32 sm:px-6">
          <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardHeader className="p-6 pb-3 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <CardTitle className="text-foreground">Password Reset!</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Your password has been updated successfully. Redirecting to login...
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-section-light px-4 py-32 sm:px-6">
        <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader className="p-6 pb-3 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary font-bold text-xl text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              R
            </div>
            <CardTitle className="text-foreground">Reset Password</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-lg pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 rounded-lg pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="mt-2 w-full rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
