import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AuthRedirect from "@/components/AuthRedirect";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

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
          // Check if it's an email not confirmed error
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setShowVerificationMessage(true);
            throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
          }
          throw error;
        }
        
        // Double-check email verification status
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
      <main className="flex-1 flex items-center justify-center py-32 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md border-border/30 shadow-2xl relative z-10 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center font-heading font-bold text-secondary-foreground text-2xl mx-auto mb-4 shadow-lg shadow-secondary/30 transition-transform duration-300 hover:scale-105">
              R
            </div>
            <CardTitle className="font-heading text-2xl tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Join RAC Logistics today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Email Verification Message */}
            {showVerificationMessage && (
              <div className="mb-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-start gap-3">
                  {isLogin ? (
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">
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
                      className="text-xs"
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors p-1 rounded-lg hover:bg-secondary/10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="cta"
                size="xl"
                className="w-full mt-2 shadow-lg shadow-secondary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-secondary hover:underline font-semibold transition-colors"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {isLogin && (
              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-muted-foreground hover:text-secondary transition-colors inline-flex items-center gap-1">
                  ← Back to Home
                </Link>
              </div>
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
