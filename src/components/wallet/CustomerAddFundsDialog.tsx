import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreditCard, Loader2, Wallet, Shield, ArrowRight } from "lucide-react";

interface CustomerAddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

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
      toast.error(`Minimum top-up amount is ${formatMoney(100, "NGN")}`);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Add Funds to Wallet
          </DialogTitle>
          <DialogDescription>
            Fund your NGN wallet instantly via Paystack. Pay with card, bank transfer, or USSD.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Balance Indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Current Balance (NGN)</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              {balanceLoading ? "..." : formatMoney(balance, "NGN")}
            </span>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="topup-amount">Amount (NGN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
              <Input
                id="topup-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                step="1"
                className="pl-8 h-12 text-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum: {formatMoney(100, "NGN")}</p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick select</Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  type="button"
                  variant={amount === qa.toString() ? "default" : "outline"}
                  size="sm"
                  className="h-10"
                  onClick={() => setAmount(qa.toString())}
                >
                  {formatMoney(qa, "NGN")}
                </Button>
              ))}
            </div>
          </div>

          {/* New Balance Preview */}
          {parsedAmount >= 100 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-muted-foreground">New Balance</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {formatMoney(newBalance, "NGN")}
              </span>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Payments are processed securely via Paystack. Your wallet will be credited instantly after successful payment.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="cta"
            onClick={handleProceedToPayment}
            disabled={loading || !amount || parseFloat(amount) < 100}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerAddFundsDialog;
