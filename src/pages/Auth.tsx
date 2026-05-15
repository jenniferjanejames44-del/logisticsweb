import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AuthRedirect from "@/components/AuthRedirect";
import { buildAuthCallbackUrl } from "@/lib/authUrls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import HeaderLogo from "@/components/layout/HeaderLogo";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2,
  Phone,
} from "lucide-react";
import { getPostAuthRedirectPath } from "@/lib/postAuthRedirect";

const AuthForm = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Capture ?ref=CODE for partner attribution and persist for the signup
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        localStorage.setItem("rac_referral_code", ref.trim().toUpperCase());
        setReferralCode(ref.trim().toUpperCase());
      } else {
        const stored = localStorage.getItem("rac_referral_code");
        if (stored) setReferralCode(stored);
      }
    } catch {}
  }, []);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthCallbackUrl("/reset-password"),
      });
      if (error) throw error;
      setResetEmailSent(true);
      toast({ title: "Reset email sent!", description: "Check your inbox for the password reset link." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send reset email", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address to resend verification.", variant: "destructive" });
      return;
    }
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: buildAuthCallbackUrl("/auth") },
      });
      if (error) throw error;
      toast({ title: "Verification email sent!", description: "Please check your inbox and spam folder." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to resend verification email", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  // Password strength meter
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: "Weak", color: "bg-destructive", text: "text-destructive", width: "w-1/4" };
    if (score === 3) return { label: "Fair", color: "bg-amber-500", text: "text-amber-600", width: "w-2/4" };
    if (score === 4) return { label: "Good", color: "bg-blue-500", text: "text-blue-600", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600", width: "w-full" };
  };
  const pwStrength = getPasswordStrength(password);
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowVerificationMessage(false);
    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setShowVerificationMessage(true);
            throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
          }
          throw error;
        }
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setShowVerificationMessage(true);
          throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
        }
        toast({ title: "Welcome back!", description: "You have been signed in successfully." });
        const redirectTo = await getPostAuthRedirectPath(data.user.id);
        navigate(redirectTo, { replace: true });
      } else {
        if (!firstName.trim()) throw new Error("Please enter your first name");
        if (!lastName.trim()) throw new Error("Please enter your last name");
        if (!phone.trim()) throw new Error("Please enter your phone number");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        if (password !== confirmPassword) throw new Error("Passwords do not match");

        const fullName = [firstName.trim(), middleName.trim(), lastName.trim()]
          .filter(Boolean)
          .join(" ");

        // Pre-signup duplicate check — Supabase silently "succeeds" for existing
        // emails without sending a verification email, so we block it explicitly.
        try {
          const { data: check, error: checkErr } = await supabase.functions.invoke(
            "check-email-exists",
            { body: { email: email.trim().toLowerCase() } },
          );
          if (!checkErr && check?.exists) {
            if (check.confirmed) {
              toast({
                title: "Email already registered",
                description: "This email is already in use. Please sign in or reset your password.",
                variant: "destructive",
              });
              setIsLogin(true);
              setShowVerificationMessage(false);
              return;
            } else {
              setShowVerificationMessage(true);
              toast({
                title: "Account exists but unverified",
                description: "We've already sent a verification link to this email. Please check your inbox or resend it below.",
              });
              return;
            }
          }
        } catch (preErr) {
          // Non-fatal: fall through to signUp and rely on the identities-empty fallback below
          console.warn("Pre-signup email check skipped:", preErr);
        }

        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildAuthCallbackUrl("/auth"),
            data: {
              full_name: fullName,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              middle_name: middleName.trim() || undefined,
              phone: phone.trim(),
              referral_code: referralCode.trim() || undefined,
            },
          },
        });
        if (error) throw error;

        // Belt-and-suspenders: Supabase returns identities=[] when the email
        // is already registered (silent duplicate). Catch that here too.
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          toast({
            title: "Email already registered",
            description: "This email is already in use. Please sign in or reset your password.",
            variant: "destructive",
          });
          setIsLogin(true);
          setShowVerificationMessage(false);
          return;
        }

        // clear stored code after successful signup
        try { localStorage.removeItem("rac_referral_code"); } catch {}
        setShowVerificationMessage(true);
        toast({ title: "Account created!", description: "Please check your email to verify your account before logging in." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setIsForgotPassword(false);
    setShowVerificationMessage(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
      <main className="w-full max-w-md">
        <div className="w-full">
            {/* Brand logo */}
            <Link
              to="/"
              aria-label="RAC Logistics — Home"
              className="mx-auto mb-6 flex items-center justify-center transition-transform hover:scale-[1.02]"
            >
              <HeaderLogo className="h-12 w-auto sm:h-14" />
            </Link>

            {/* Heading */}
            <div className="mb-7 text-center">
              <h2 className="text-2xl sm:text-[28px] font-bold text-foreground tracking-tight">
                {isForgotPassword ? "Reset your password" : isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isForgotPassword
                  ? "Enter your email and we'll send you a reset link."
                  : isLogin
                  ? "Sign in to continue managing your shipments."
                  : "Start shipping globally in just a few minutes."}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(6,16,67,0.06)] ring-1 ring-border/60">

            {/* Forgot password */}
            {isForgotPassword ? (
              resetEmailSent ? (
                <div className="text-center py-4">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold">Check your email</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); setEmail(""); }}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="resetEmail" type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" variant="navCta" size="sm" className="font-bold whitespace-nowrap px-6" disabled={isLoading}>
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (<>Send Reset Link <ArrowRight className="w-4 h-4 ml-2" /></>)}
                  </Button>
                  <button type="button" onClick={() => { setIsForgotPassword(false); setEmail(""); }}
                    className="block w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    ← Back to Sign In
                  </button>
                </form>
              )
            ) : (
              <>
                {showVerificationMessage && (
                  <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      {isLogin ? (
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">
                          {isLogin ? "Email Verification Required" : "Check Your Email"}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {isLogin
                            ? "Please verify your email before logging in. Check your inbox for the verification link."
                            : "We've sent a verification link to your email. Please verify your account before logging in."}
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={handleResendVerification} disabled={isResending} className="text-sm">
                          {isResending ? (
                            <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                          ) : (<Mail className="w-3 h-3 mr-2" />)}
                          Resend Verification Email
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium">First Name <span className="text-destructive">*</span></Label>
                          <Input id="firstName" type="text" placeholder="John" value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} className="h-11 rounded-lg" required={!isLogin} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium">Last Name <span className="text-destructive">*</span></Label>
                          <Input id="lastName" type="text" placeholder="Doe" value={lastName}
                            onChange={(e) => setLastName(e.target.value)} className="h-11 rounded-lg" required={!isLogin} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleName" className="text-sm font-medium">Middle Name <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Input id="middleName" type="text" placeholder="(Optional)" value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)} className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="phone" type="tel" placeholder="+234 800 000 0000" value={phone}
                            onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-lg pl-10" required={!isLogin} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      {isLogin && (
                        <button type="button" onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-primary hover:underline font-medium transition-colors">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-lg pl-10 pr-10" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!isLogin && password && (
                      <div className="space-y-1.5 pt-1">
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${pwStrength.color} ${pwStrength.width} transition-all duration-300`} />
                        </div>
                        <p className={`text-xs font-medium ${pwStrength.text}`}>
                          Password strength: {pwStrength.label}
                          {pwStrength.label === "Weak" && " — use 8+ chars with uppercase, numbers & symbols"}
                        </p>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`h-11 rounded-lg pl-10 pr-10 ${!passwordsMatch ? "border-destructive" : ""}`} required={!isLogin} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {!passwordsMatch && (
                        <p className="text-xs text-destructive">Passwords do not match</p>
                      )}
                    </div>
                  )}

                  <Button type="submit" variant="navCta" size="sm" className="mt-2 font-bold whitespace-nowrap px-6" disabled={isLoading}>
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (<>{isLogin ? "Log In" : "Join Now"} <ArrowRight className="w-4 h-4 ml-2" /></>)}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button type="button" onClick={() => switchMode(!isLogin)}
                    className="text-primary hover:underline font-semibold transition-colors">
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </>
            )}

            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to RAC Logistics' Terms & Privacy Policy.
            </p>
          </div>
      </main>
    </div>
  );
};

const Auth = () => (
  <AuthRedirect>
    <AuthForm />
  </AuthRedirect>
);

export default Auth;
