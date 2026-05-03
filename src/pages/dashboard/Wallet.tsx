import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { WalletSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Button
          onClick={() => setAddFundsOpen(true)}
          className="h-11 sm:h-12 px-4 sm:px-5 text-sm font-semibold bg-accent hover:bg-accent/90 text-white rounded-lg"
        >
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
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Current Balance</p>
                    <p className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
                      {formatConverted(balance, "NGN")}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <WalletIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Total Deposits</p>
                    <p className="mt-1.5 text-xl font-bold text-green-600">
                      +{formatConverted(totalCredits, "NGN")}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/8">
                    <ArrowUpCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Total Spent</p>
                    <p className="mt-1.5 text-xl font-bold text-accent">
                      -{formatConverted(totalDebits, "NGN")}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/8">
                    <ArrowDownCircle className="w-4 h-4 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 px-4 sm:px-5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="mx-auto mb-3 w-10 h-10 text-muted-foreground/20" />
                  <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
                  <p className="mt-1 text-[12px] text-muted-foreground/70">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                            transaction.type === "credit" ? "bg-green-50 text-green-600" : "bg-accent/8 text-accent"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">
                            {transaction.description || (transaction.type === "credit" ? "Deposit" : "Payment")}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(transaction.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <p className={`text-[13px] font-semibold flex-shrink-0 ${transaction.type === "credit" ? "text-green-600" : "text-accent"}`}>
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
