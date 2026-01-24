import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "customer";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [fetchedForUserId, setFetchedForUserId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchRole = useCallback(async (userId: string) => {
    setIsFetching(true);
    
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole("customer");
      } else {
        const fetchedRole = (data?.role as AppRole) || "customer";
        console.log("Fetched user role:", fetchedRole, "for user:", userId);
        setRole(fetchedRole);
      }
      setFetchedForUserId(userId);
    } catch (err) {
      console.error("Error fetching user role:", err);
      setRole("customer");
      setFetchedForUserId(userId);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setRole(null);
      setFetchedForUserId(null);
      return;
    }

    // Only fetch if we haven't fetched for this user yet
    if (fetchedForUserId !== user.id) {
      fetchRole(user.id);
    }
  }, [user?.id, authLoading, fetchedForUserId, fetchRole]);

  // Loading is true if:
  // 1. Auth is still loading, OR
  // 2. We have a user but haven't fetched their role yet, OR
  // 3. We're currently fetching
  const loading = useMemo(() => {
    if (authLoading) return true;
    if (!user) return false;
    if (fetchedForUserId !== user.id) return true;
    if (isFetching) return true;
    return false;
  }, [authLoading, user, fetchedForUserId, isFetching]);

  const isAdmin = role === "admin";

  return { role, isAdmin, loading, refetch: () => user && fetchRole(user.id) };
};
