import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { WalletSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CustomerAddFundsDialog from "@/components/wallet/CustomerAddFundsDialog";
import {
  Wallet as WalletIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

const Wallet = () => {
  const { user } = useAuth();
  const { formatConverted } = useCurrency();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addFundsOpen, setAddFundsOpen] = useState(false);

  useEffect(() => {
    if (user) fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;
    try {
      const { data: txns, error: txnError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txnError) throw txnError;
      setTransactions(txns || []);
      const calculatedBalance = (txns || []).reduce((acc, txn) => {
        return txn.type === "credit" ? acc + Number(txn.amount) : acc - Number(txn.amount);
      }, 0);
      setBalance(calculatedBalance);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <DashboardLayout
      title="Wallet"
      description="Manage your account balance and view transactions"
      action={
        <Button variant="default" size="sm" onClick={() => setAddFundsOpen(true)} className="h-9">
          <Plus className="w-4 h-4" />
          Add Funds
        </Button>
      }
    >
      {loading ? (
        <WalletSkeleton />
      ) : (
        <div className="space-y-5">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="bg-primary border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Current Balance</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {formatConverted(balance, "NGN")}
                    </p>
                  </div>
                  <WalletIcon className="w-6 h-6 text-white/40" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Deposits</p>
                    <p className="mt-1 text-xl font-bold text-green-600">
                      +{formatConverted(totalCredits, "NGN")}
                    </p>
                  </div>
                  <ArrowUpCircle className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="mt-1 text-xl font-bold text-orange-600">
                      -{formatConverted(totalDebits, "NGN")}
                    </p>
                  </div>
                  <ArrowDownCircle className="w-5 h-5 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="mx-auto mb-3 w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                            transaction.type === "credit" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowUpCircle className="w-4 h-4" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {transaction.description || (transaction.type === "credit" ? "Deposit" : "Payment")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold flex-shrink-0 ${transaction.type === "credit" ? "text-green-600" : "text-orange-600"}`}>
                        {transaction.type === "credit" ? "+" : "-"}{formatConverted(Number(transaction.amount), "NGN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <CustomerAddFundsDialog open={addFundsOpen} onOpenChange={setAddFundsOpen} />
    </DashboardLayout>
  );
};

export default Wallet;
