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
        <Button variant="cta" onClick={() => setAddFundsOpen(true)}>
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
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-foreground">
                      ₦{balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                    <WalletIcon className="w-7 h-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Deposits</p>
                    <p className="text-2xl font-bold text-green-600">
                      +₦{totalCredits.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <ArrowUpCircle className="w-7 h-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-orange-600">
                      -₦{totalDebits.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <ArrowDownCircle className="w-7 h-7 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Fund Your Wallet Instantly</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Funds" to top up your wallet via Paystack. Pay securely with card, 
                    bank transfer, or USSD. Your balance updates instantly after payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "credit"
                              ? "bg-green-500/10"
                              : "bg-orange-500/10"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description || (transaction.type === "credit" ? "Deposit" : "Payment")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "credit" ? "text-green-600" : "text-orange-600"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}₦{Number(transaction.amount).toFixed(2)}
                        </p>
                        <Badge
                          variant={transaction.type === "credit" ? "outline" : "secondary"}
                          className="text-xs"
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
