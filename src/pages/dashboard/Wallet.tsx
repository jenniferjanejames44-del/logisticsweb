import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
        <Button variant="dashAccent" size="dash" onClick={() => setAddFundsOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      }
    >
      {loading ? (
        <WalletSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-transparent shadow-sm shadow-primary/[0.04]">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 font-medium">Current Balance</p>
                    <p className="text-2xl sm:text-[2rem] font-bold text-foreground truncate tracking-tight">
                      ₦{balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-[60px] sm:h-[60px] bg-primary/12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                    <WalletIcon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Deposits</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                      +₦{totalCredits.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ArrowUpCircle className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600 truncate">
                      -₦{totalDebits.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ArrowDownCircle className="w-5 h-5 sm:w-7 sm:h-7 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="border-border/40 bg-muted/30">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Fund Your Wallet Instantly</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click "Add Funds" to top up your wallet via Paystack. Pay securely with card, 
                    bank transfer, or USSD. Your balance updates instantly after payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="border-border/40">
            <CardHeader className="p-5 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-[1.0625rem] sm:text-lg font-semibold flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/8 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6">
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-[0.875rem]">No transactions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-3.5 border-b border-border/25 last:border-0 gap-3 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            transaction.type === "credit"
                              ? "bg-green-500/10"
                              : "bg-orange-500/10"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
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
                            transaction.type === "credit" ? "text-green-600" : "text-orange-600"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}₦{Number(transaction.amount).toFixed(2)}
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
