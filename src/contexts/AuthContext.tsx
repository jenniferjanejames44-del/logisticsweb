import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { buildAuthCallbackUrl } from "@/lib/authUrls";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, metadata?: { phone?: string; address?: string; city?: string; state?: string; country?: string; zip_code?: string; company_name?: string; referral_code?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AUTH_SIGNOUT_FLAG = "rac-auth-signing-out";

const NOOP_AUTH: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: new Error("AuthProvider not mounted") }),
  signIn: async () => ({ error: new Error("AuthProvider not mounted") }),
  signOut: async () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This typically only happens during Vite HMR when AuthContext.tsx is
    // hot-replaced and a stale consumer module briefly holds a different
    // context reference than the live AuthProvider. Returning a safe no-op
    // default avoids tearing down the whole tree; the next render after HMR
    // settles will receive the real context.
    if (typeof window !== "undefined" && import.meta.env.DEV) {
      console.warn(
        "[useAuth] Called outside AuthProvider — returning no-op default. " +
          "This usually indicates a stale HMR boundary; reload the preview if it persists.",
      );
    }
    return NOOP_AUTH;
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clearSignOutFlag = () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(AUTH_SIGNOUT_FLAG);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "SIGNED_OUT" || !session) {
          clearSignOutFlag();
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        clearSignOutFlag();
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, metadata?: { phone?: string; address?: string; city?: string; state?: string; country?: string; zip_code?: string; company_name?: string; referral_code?: string }) => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_SIGNOUT_FLAG);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildAuthCallbackUrl("/auth"),
        data: {
          full_name: fullName,
          ...(metadata || {}),
        },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_SIGNOUT_FLAG);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(AUTH_SIGNOUT_FLAG, "true");
    }

    setSession(null);
    setUser(null);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }

    window.location.replace("/auth");
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
