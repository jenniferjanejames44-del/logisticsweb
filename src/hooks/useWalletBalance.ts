import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWalletBalance = (userId: string | undefined) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("amount, type")
        .eq("user_id", userId);

      if (error) throw error;

      const calculatedBalance = (data || []).reduce((acc, txn) => {
        return txn.type === "credit" ? acc + Number(txn.amount) : acc - Number(txn.amount);
      }, 0);

      setBalance(calculatedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refetch: fetchBalance };
};
