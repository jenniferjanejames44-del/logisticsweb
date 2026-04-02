import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Loader2, Wallet, Shield, ChevronRight, CheckCircle2 } from "lucide-react";

interface CustomerAddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

const CustomerAddFundsDialog = ({ open, onOpenChange }: CustomerAddFundsDialogProps) => {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();
  const { balance, loading: balanceLoading } = useWalletBalance(user?.id);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const parsedAmount = parseFloat(amount) || 0;
  const newBalance = balance + parsedAmount;

  const handleClose = () => {
    setAmount("");
    setLoading(false);
    onOpenChange(false);
  };

  const handleProceedToPayment = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      toast.error(`Minimum top-up amount is ${formatMoney(100, "USD")}`);
      return;
    }

    if (!user) {
      toast.error("Please log in to add funds");
      return;
    }

    setLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/dashboard/payment-callback?type=wallet_topup`;

      const { data, error } = await supabase.functions.invoke("paystack-wallet-topup", {
        body: {
          amount: numAmount,
          callback_url: callbackUrl,
        },
      });

      if (error) throw error;

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (error) {
      console.error("Error initializing wallet topup:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden rounded-xl border-border/60">
        {/* Clean Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Add Funds</h2>
              <p className="text-xs text-muted-foreground">Top up your wallet instantly</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Current Balance */}
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Balance</p>
            <p className="text-xl font-bold text-foreground mt-1">
              {balanceLoading ? "..." : formatMoney(balance, "USD")}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[13px] font-medium text-foreground mb-1.5 block">Enter Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                step="1"
                className="pl-9 h-12 text-lg font-semibold border-border/50"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">Minimum: $100.00</p>
          </div>

          {/* Quick Amounts */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Select</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  type="button"
                  onClick={() => setAmount(qa.toString())}
                  className={`h-9 rounded-lg border text-[13px] font-medium transition-all ${
                    amount === qa.toString()
                      ? "border-accent bg-accent/[0.06] text-accent"
                      : "border-border/50 text-foreground hover:border-border"
                  }`}
                >
                  ${qa.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* New Balance Preview */}
          {parsedAmount >= 100 && (
            <div className="flex items-center justify-between rounded-lg border border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-[13px] text-green-700 dark:text-green-400">New Balance</span>
              </div>
              <span className="text-base font-bold text-green-700 dark:text-green-400">
                {formatMoney(newBalance, "USD")}
              </span>
            </div>
          )}

          {/* Security */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span>Secured by Paystack. Credited instantly after payment.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1 flex gap-2.5">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceedToPayment}
            disabled={loading || !amount || parseFloat(amount) < 100}
            className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay Now
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAddFundsDialog;
