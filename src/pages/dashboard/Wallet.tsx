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
  CreditCard,
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
  const { formatMoney } = useCurrency();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      // Fetch transactions
      const { data: txns, error: txnError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txnError) throw txnError;

      setTransactions(txns || []);

      // Calculate balance from transactions
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
        <Button variant="dashAccent" size="dash" className="w-full max-w-[220px] sm:w-auto sm:max-w-none" onClick={() => setAddFundsOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      }
    >
      {loading ? (
        <WalletSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
            <Card className="relative overflow-hidden border-primary/20 bg-[linear-gradient(135deg,rgba(6,16,67,0.14),rgba(255,255,255,0.98),rgba(223,81,1,0.09))] shadow-[0_22px_48px_rgba(15,23,42,0.1)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/[0.1]" />
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/80">Current Balance (NGN)</p>
                    <p className="text-2xl sm:text-[2rem] font-bold text-foreground truncate tracking-tight">
                      {formatMoney(balance, "NGN")}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary shadow-lg shadow-primary/20 sm:h-[60px] sm:w-[60px]">
                    <WalletIcon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm text-muted-foreground">Total Deposits</p>
                    <p className="text-xl sm:text-2xl font-bold text-success truncate">
                      +{formatMoney(totalCredits, "NGN")}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-success/20 bg-success/10 sm:h-14 sm:w-14">
                    <ArrowUpCircle className="w-5 h-5 sm:w-7 sm:h-7 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-2 text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-xl sm:text-2xl font-bold text-warning truncate">
                      -{formatMoney(totalDebits, "NGN")}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 sm:h-14 sm:w-14">
                    <ArrowDownCircle className="w-5 h-5 sm:w-7 sm:h-7 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.92))] shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
            <CardContent className="p-6">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/8 shadow-[0_10px_20px_rgba(6,16,67,0.08)]">
                  <CreditCard className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">Fund Your Wallet Instantly</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Funds" to top up your wallet via Paystack. Pay securely with card, 
                    bank transfer, or USSD. Your balance updates instantly after payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="border-border/70 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 shadow-[0_10px_20px_rgba(6,16,67,0.08)]">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-muted/60">
                    <Clock className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-[0.875rem]">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-white/85 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-primary/15 hover:bg-primary/[0.025]"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            transaction.type === "credit"
                              ? "bg-success/10 border-success/20"
                              : "bg-warning/10 border-warning/20"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">
                            {transaction.description || (transaction.type === "credit" ? "Deposit" : "Payment")}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`font-semibold text-sm sm:text-base ${
                            transaction.type === "credit" ? "text-success" : "text-warning"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}{formatMoney(Number(transaction.amount), "NGN")}
                        </p>
                        <Badge
                          variant={transaction.type === "credit" ? "outline" : "secondary"}
                          className="text-[10px] sm:text-xs"
                        >
                          {transaction.type}
                        </Badge>
                      </div>
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
