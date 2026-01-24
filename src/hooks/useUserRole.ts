import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "customer";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole("customer");
      } else {
        const fetchedRole = (data?.role as AppRole) || "customer";
        console.log("Fetched user role:", fetchedRole, "for user:", user.id);
        setRole(fetchedRole);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      setRole("customer");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Don't fetch until auth is done loading
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    fetchRole();
  }, [user?.id, authLoading, fetchRole]);

  const isAdmin = role === "admin";

  return { role, isAdmin, loading, refetch: fetchRole };
};
