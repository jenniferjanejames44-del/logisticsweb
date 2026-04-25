import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Phone, MapPin, Building2, Globe, Truck, ShieldCheck, ArrowLeft,
} from "lucide-react";

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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

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
      } else {
        if (!fullName.trim()) throw new Error("Please enter your full name");
        if (!phone.trim()) throw new Error("Please enter your phone number");
        const { error } = await signUp(email, password, fullName, {
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: stateRegion.trim(),
          country: country.trim(),
          company_name: companyName.trim(),
          referral_code: referralCode.trim() || undefined,
        });
        if (error) throw error;
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT — Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <HeaderLogo className="h-12 w-auto max-w-[200px] [&_g]:fill-white [&_text]:fill-white" />
          </Link>
          <Link to="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Ship Smarter.<br />
              <span className="text-accent">Deliver Faster.</span>
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80 leading-relaxed">
              Join thousands of businesses moving cargo across borders with RAC Logistics — fast clearance, real-time tracking, and trusted global partners.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: Globe, title: "Global Coverage", desc: "Air & ocean freight across 40+ countries." },
              { icon: Truck, title: "Real-time Tracking", desc: "Know where your shipment is, every step." },
              { icon: ShieldCheck, title: "Secure Payments", desc: "Pay safely in NGN, USD, or wallet credit." },
            ].map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
                  <Icon className="w-5 h-5 text-accent" />
                </span>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sm text-primary-foreground/70">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-primary-foreground/15">
          {[
            { v: "10K+", l: "Shipments" },
            { v: "40+", l: "Countries" },
            { v: "99%", l: "On-time" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl font-bold text-accent">{s.v}</div>
              <div className="text-xs text-primary-foreground/70 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT — Form panel */}
      <main className="flex flex-col min-h-screen">
        {/* Mobile brand strip */}
        <div className="lg:hidden bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <HeaderLogo className="h-9 w-auto max-w-[150px] [&_g]:fill-white [&_text]:fill-white" />
          </Link>
          <Link to="/" className="text-xs text-primary-foreground/80 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isForgotPassword ? "Reset your password" : isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {isForgotPassword
                  ? "Enter your email and we'll send you a reset link."
                  : isLogin
                  ? "Sign in to manage your shipments and wallet."
                  : "Start shipping globally in just a few minutes."}
              </p>
            </div>

            {/* Tab switcher (hidden on forgot-password view) */}
            {!isForgotPassword && (
              <div className="mb-6 inline-flex w-full rounded-xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

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
                  <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isLoading}>
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
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="fullName" type="text" placeholder="John Doe" value={fullName}
                            onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-lg pl-10" required={!isLogin} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
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
                  </div>

                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="address" type="text" placeholder="123 Main Street" value={address}
                            onChange={(e) => setAddress(e.target.value)} className="h-11 rounded-lg pl-10" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium">City</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="city" type="text" placeholder="Lagos" value={city}
                              onChange={(e) => setCity(e.target.value)} className="h-11 rounded-lg pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium">State / Region</Label>
                          <Input id="state" type="text" placeholder="Lagos State" value={stateRegion}
                            onChange={(e) => setStateRegion(e.target.value)} className="h-11 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                          <Input id="country" type="text" placeholder="Nigeria" value={country}
                            onChange={(e) => setCountry(e.target.value)} className="h-11 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-sm font-medium">Company (optional)</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="company" type="text" placeholder="Acme Inc." value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)} className="h-11 rounded-lg pl-10" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit" variant="accent" size="lg" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (<>{isLogin ? "Sign In" : "Create Account"} <ArrowRight className="w-4 h-4 ml-2" /></>)}
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

            <p className="mt-8 text-center text-xs text-muted-foreground">
              By continuing you agree to RAC Logistics' Terms & Privacy Policy.
            </p>
          </div>
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
