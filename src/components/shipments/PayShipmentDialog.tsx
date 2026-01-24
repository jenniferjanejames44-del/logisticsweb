import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Wallet, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PayShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentId: string;
  trackingNumber: string;
  price: number;
  userBalance: number;
  userId: string;
  onSuccess: () => void;
}

const PayShipmentDialog = ({
  open,
  onOpenChange,
  shipmentId,
  trackingNumber,
  price,
  userBalance,
  userId,
  onSuccess,
}: PayShipmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const hasSufficientFunds = userBalance >= price;
  const shortfall = price - userBalance;

  const handlePayment = async () => {
    if (!hasSufficientFunds) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      // Create debit transaction
      const { error: txnError } = await supabase.from("wallet_transactions").insert({
        user_id: userId,
        amount: price,
        type: "debit",
        description: `Payment for shipment ${trackingNumber}`,
        reference_id: shipmentId,
      });

      if (txnError) throw txnError;

      // Update shipment payment status
      const { error: shipmentError } = await supabase
        .from("shipments")
        .update({ payment_status: "paid" })
        .eq("id", shipmentId);

      if (shipmentError) throw shipmentError;

      toast.success("Payment successful!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay for Shipment</DialogTitle>
          <DialogDescription>
            Complete payment for shipment {trackingNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Shipment Price</span>
              <span className="font-semibold text-lg">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your Balance</span>
              <span className={`font-semibold ${hasSufficientFunds ? "text-green-600" : "text-orange-600"}`}>
                ${userBalance.toFixed(2)}
              </span>
            </div>
            {hasSufficientFunds && (
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Balance After Payment</span>
                <span className="font-semibold text-foreground">
                  ${(userBalance - price).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {!hasSufficientFunds && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Insufficient Balance</p>
                <p className="text-sm text-muted-foreground">
                  You need an additional ${shortfall.toFixed(2)} to complete this payment.
                  Please add funds to your wallet.
                </p>
              </div>
            </div>
          )}

          {hasSufficientFunds && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-600">Ready to Pay</p>
                <p className="text-sm text-muted-foreground">
                  You have sufficient balance to complete this payment.
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {hasSufficientFunds ? (
            <Button onClick={handlePayment} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Pay ${price.toFixed(2)}
                </>
              )}
            </Button>
          ) : (
            <Button variant="cta" onClick={() => {
              onOpenChange(false);
              window.location.href = "/dashboard/wallet";
            }}>
              <Wallet className="w-4 h-4 mr-2" />
              Go to Wallet
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayShipmentDialog;
