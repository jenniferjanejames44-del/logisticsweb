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
import { Loader2, Wallet, AlertTriangle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
  const [paystackLoading, setPaystackLoading] = useState(false);
  const hasSufficientFunds = userBalance >= price;
  const shortfall = price - userBalance;

  const handleWalletPayment = async () => {
    if (!hasSufficientFunds) {
      toast.error("Insufficient balance");
      return;
    }
    setLoading(true);
    try {
      const { error: txnError } = await supabase.from("wallet_transactions").insert({
        user_id: userId,
        amount: price,
        type: "debit",
        description: `Payment for shipment ${trackingNumber}`,
        reference_id: shipmentId,
      });
      if (txnError) throw txnError;

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

  const handlePaystackPayment = async () => {
    setPaystackLoading(true);
    try {
      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .select("id, status")
        .eq("shipment_id", shipmentId)
        .eq("user_id", userId)
        .single();

      if (invError || !invoice) {
        toast.error("Invoice not found for this shipment");
        return;
      }
      if (invoice.status === "paid") {
        toast.info("This invoice is already paid");
        return;
      }

      const callbackUrl = `${window.location.origin}/dashboard/payment-callback`;
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: { invoice_id: invoice.id, callback_url: callbackUrl },
      });
      if (error) throw error;

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (error: any) {
      console.error("Error initializing Paystack:", error);
      toast.error(error.message || "Failed to initialize payment.");
    } finally {
      setPaystackLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Pay for Shipment</DialogTitle>
          <DialogDescription>
            Complete payment for shipment <span className="font-medium text-foreground">{trackingNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Price Summary */}
          <div className="rounded-xl bg-muted/50 border border-border/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Shipment Price</span>
              <span className="font-bold text-lg text-foreground">₦{price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Wallet Balance</span>
              <span className={`font-semibold ${hasSufficientFunds ? "text-green-600" : "text-orange-600"}`}>
                ₦{userBalance.toFixed(2)}
              </span>
            </div>
            {hasSufficientFunds && (
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">After Payment</span>
                <span className="font-semibold text-foreground">₦{(userBalance - price).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">Payment Method</p>

            <Button
              variant="dashOutline"
              size="dash"
              className="w-full justify-start gap-3"
              onClick={handlePaystackPayment}
              disabled={paystackLoading || loading}
            >
              {paystackLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 text-primary" />
              )}
              {paystackLoading ? "Redirecting..." : "Pay with Paystack"}
              <Badge variant="secondary" className="ml-auto text-[10px]">Card / Bank / USSD</Badge>
            </Button>

            {hasSufficientFunds ? (
              <Button
                variant="dashOutline"
                size="dash"
                className="w-full justify-start gap-3"
                onClick={handleWalletPayment}
                disabled={loading || paystackLoading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 text-primary" />
                )}
                {loading ? "Processing..." : "Pay from Wallet"}
                <span className="ml-auto text-xs text-muted-foreground">₦{userBalance.toFixed(2)}</span>
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Insufficient Wallet Balance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You need ₦{shortfall.toFixed(2)} more, or pay via Paystack.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="dashOutline" size="dash" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {hasSufficientFunds && (
            <Button variant="dashAccent" size="dash" className="flex-1" onClick={handleWalletPayment} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay Now"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayShipmentDialog;
