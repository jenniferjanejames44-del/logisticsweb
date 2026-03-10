import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  invoiceId?: string;
  invoiceNumber?: string;
  trackingNumber: string;
  price: number;
  priceCurrency?: string | null;
  userBalance: number;
  userId: string;
  onSuccess: () => void;
}

interface WalletPaymentPreview {
  status: "preview";
  charged_amount: number;
  currency: "NGN";
  wallet_balance: number;
  has_sufficient_funds: boolean;
  invoice_number?: string;
  base_amount?: number;
  base_currency?: string;
}

const PayShipmentDialog = ({
  open,
  onOpenChange,
  shipmentId,
  invoiceId,
  invoiceNumber,
  trackingNumber,
  price,
  priceCurrency = "USD",
  userBalance,
  userId,
  onSuccess,
}: PayShipmentDialogProps) => {
  const { formatConverted, formatMoney } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [walletPreview, setWalletPreview] = useState<WalletPaymentPreview | null>(null);

  useEffect(() => {
    if (!open) {
      setPreviewLoading(false);
      setPreviewError(null);
      setWalletPreview(null);
      return;
    }

    let isActive = true;

    const loadWalletPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const { data, error } = await supabase.functions.invoke("wallet-pay-shipment", {
          body: { shipment_id: shipmentId, invoice_id: invoiceId, preview_only: true },
        });

        if (error) throw error;
        if (!isActive) return;

        if (data?.status === "preview") {
          setWalletPreview(data as WalletPaymentPreview);
        } else {
          setWalletPreview(null);
          setPreviewError(data?.message || "Unable to load exact wallet quote.");
        }
      } catch (error) {
        console.error("Error loading wallet preview:", error);
        if (!isActive) return;
        setWalletPreview(null);
        setPreviewError("Unable to load exact wallet quote right now.");
      } finally {
        if (isActive) setPreviewLoading(false);
      }
    };

    loadWalletPreview();

    return () => {
      isActive = false;
    };
  }, [open, shipmentId, invoiceId]);

  const payableWithPaystack = walletPreview?.charged_amount ?? null;
  const walletBalance = walletPreview?.wallet_balance ?? userBalance;
  const hasSufficientFunds = walletPreview?.has_sufficient_funds ?? false;
  const shortfall = walletPreview ? Math.max(walletPreview.charged_amount - walletPreview.wallet_balance, 0) : 0;

  const handleWalletPayment = async () => {
    if (!walletPreview) {
      toast.error("Still loading the exact wallet debit. Please wait a moment.");
      return;
    }

    if (!hasSufficientFunds) {
      toast.error("Insufficient balance");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("wallet-pay-shipment", {
        body: { shipment_id: shipmentId, invoice_id: invoiceId },
      });
      if (error) throw error;

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
      let activeInvoiceId = invoiceId;
      let invoiceStatus: string | undefined;

      if (!activeInvoiceId) {
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

        activeInvoiceId = invoice.id;
        invoiceStatus = invoice.status;
      }

      if (invoiceStatus === "paid") {
        toast.info("This invoice is already paid");
        return;
      }

      const callbackUrl = `${window.location.origin}/dashboard/payment-callback`;
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: { invoice_id: activeInvoiceId, callback_url: callbackUrl },
      });
      if (error) throw error;

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (error) {
      console.error("Error initializing Paystack:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initialize payment.");
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
              <span className="font-bold text-lg text-foreground">{formatConverted(price, priceCurrency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Base invoice currency</span>
              <span className="font-medium text-foreground">{formatMoney(price, priceCurrency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Paystack checkout</span>
              {payableWithPaystack !== null ? (
                <span className="font-semibold text-primary">{formatMoney(payableWithPaystack, "NGN")}</span>
              ) : previewLoading ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating...
                </span>
              ) : (
                <span className="text-sm font-medium text-orange-700">
                  Exact quote unavailable
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">NGN Wallet Balance</span>
              <span className={`font-semibold ${hasSufficientFunds ? "text-green-600" : "text-orange-600"}`}>
                {formatMoney(walletBalance, "NGN")}
              </span>
            </div>
            {walletPreview && hasSufficientFunds && (
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Wallet balance after payment</span>
                <span className="font-semibold text-foreground">{formatMoney(walletPreview.wallet_balance - walletPreview.charged_amount, "NGN")}</span>
              </div>
            )}
            {invoiceNumber && (
              <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                Invoice: <span className="font-medium text-foreground">{invoiceNumber}</span>
              </div>
            )}
            {previewError && (
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-xs text-orange-700">
                {previewError} You can still continue with Paystack.
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">Payment Method</p>

            <Button
              variant="dashPrimary"
              size="dash"
              className="w-full justify-start gap-3 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
              onClick={handlePaystackPayment}
              disabled={paystackLoading || loading}
            >
              {paystackLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {paystackLoading ? "Redirecting..." : "Pay with Paystack"}
              <Badge variant="secondary" className="ml-auto text-[10px]">Card / Bank / USSD</Badge>
            </Button>

            {previewLoading && !walletPreview ? (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Syncing exact wallet quote</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We’re confirming the precise NGN debit amount before enabling wallet payment.
                  </p>
                </div>
              </div>
            ) : hasSufficientFunds ? (
              <Button
                variant="dashOutline"
                size="dash"
                className="w-full justify-start gap-3"
                onClick={handleWalletPayment}
                disabled={loading || paystackLoading || !walletPreview}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 text-primary" />
                )}
                {loading ? "Processing..." : "Pay from Wallet"}
                <span className="ml-auto text-xs text-muted-foreground">{formatMoney(walletBalance, "NGN")}</span>
              </Button>
            ) : walletPreview ? (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Insufficient Wallet Balance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You need {formatMoney(shortfall, "NGN")} more, or pay via Paystack.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="dashOutline" size="dash" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {walletPreview && hasSufficientFunds && (
            <Button variant="dashAccent" size="dash" className="flex-1" onClick={handleWalletPayment} disabled={loading || previewLoading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay Now"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayShipmentDialog;
