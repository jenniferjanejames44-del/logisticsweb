import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AuthRedirect from "@/components/AuthRedirect";
import { buildAuthCallbackUrl } from "@/lib/authUrls";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

const AuthForm = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
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
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthCallbackUrl("/reset-password"),
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to resend verification.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: buildAuthCallbackUrl("/auth"),
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and spam folder.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive",
      });
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
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
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
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      } else {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name");
        }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        
        setShowVerificationMessage(true);
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before logging in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-start justify-center bg-section-light px-4 pb-16 pt-24 sm:px-6 sm:pt-32">
        <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader className="p-6 pb-3 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary font-bold text-xl text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              R
            </div>
            <CardTitle className="text-foreground">
              {isForgotPassword 
                ? "Reset Password" 
                : isLogin 
                  ? "Welcome Back" 
                  : "Create Account"}
            </CardTitle>
            <CardDescription className="mx-auto max-w-sm text-sm leading-relaxed">
              {isForgotPassword
                ? "Enter your email to receive a reset link"
                : isLogin
                  ? "Sign in to access your dashboard"
                  : "Join RAC Logistics today"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {/* Forgot Password Form */}
            {isForgotPassword ? (
              <>
                {resetEmailSent ? (
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-foreground">Check Your Email</h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      We've sent a password reset link to <strong>{email}</strong>. 
                      Please check your inbox and spam folder.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetEmailSent(false);
                        setEmail("");
                      }}
                      className="w-full"
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="resetEmail"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 rounded-lg pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setEmail("");
                        }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        ← Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                {/* Email Verification Message */}
                {showVerificationMessage && (
                  <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-5">
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
                            : "We've sent a verification link to your email. Please verify your account before logging in."
                          }
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResending}
                          className="text-sm"
                        >
                          {isResending ? (
                            <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                          ) : (
                            <Mail className="w-3 h-3 mr-2" />
                          )}
                          Resend Verification Email
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-11 rounded-lg pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-lg pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-primary hover:underline font-medium transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
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

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary hover:underline font-medium transition-colors"
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>

                {isLogin && (
                  <div className="mt-4 text-center">
                    <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                      ← Back to Home
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

const Auth = () => {
  return (
    <AuthRedirect>
      <AuthForm />
    </AuthRedirect>
  );
};

export default Auth;
