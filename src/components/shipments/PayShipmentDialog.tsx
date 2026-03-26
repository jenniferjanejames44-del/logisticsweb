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
import { Loader2, Wallet, AlertTriangle, CreditCard, Package, MapPin, Scale } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  currency: string;
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
  const { formatConverted } = useCurrency();
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
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-5 sm:p-6">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg text-white">Payment Checkout</DialogTitle>
            <DialogDescription className="text-white/70 text-sm">
              Shipment {trackingNumber}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Order Summary Card */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order Summary</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipment Price</span>
                <span className="font-semibold text-foreground">{formatConverted(price, priceCurrency)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paystack Amount (NGN)</span>
                {payableWithPaystack !== null ? (
                  <span className="font-semibold text-foreground">{formatConverted(payableWithPaystack, "NGN")}</span>
                ) : previewLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Calculating...
                  </span>
                ) : (
                  <span className="text-xs text-orange-600">Unavailable</span>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Due</span>
                <span className="text-lg font-bold text-primary">{formatConverted(price, priceCurrency)}</span>
              </div>
            </div>

            {invoiceNumber && (
              <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                Invoice: <span className="font-medium text-foreground">{invoiceNumber}</span>
              </p>
            )}
          </div>

          {/* Wallet Balance */}
          <div className={`flex items-center justify-between rounded-lg border p-3 ${hasSufficientFunds ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
            <div className="flex items-center gap-2">
              <Wallet className={`w-4 h-4 ${hasSufficientFunds ? "text-green-600" : "text-orange-600"}`} />
              <span className="text-sm text-muted-foreground">USD Wallet Balance</span>
            </div>
            <span className={`text-sm font-semibold ${hasSufficientFunds ? "text-green-600" : "text-orange-600"}`}>
              {formatConverted(walletBalance, "NGN")}
            </span>
          </div>

          {previewError && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200">
              {previewError} You can still continue with Paystack.
            </p>
          )}

          {/* Payment Methods */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Choose Payment Method</p>

            {/* Paystack */}
            <button
              onClick={handlePaystackPayment}
              disabled={paystackLoading || loading}
              className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-primary/20 bg-background p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/[0.02] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                  {paystackLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {paystackLoading ? "Redirecting..." : "Pay with Paystack"}
                  </p>
                  <p className="text-xs text-muted-foreground">Card, Bank Transfer, or USSD</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] flex-shrink-0">Recommended</Badge>
            </button>

            {/* Wallet */}
            {previewLoading && !walletPreview ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Calculating wallet payment...</p>
                  <p className="text-xs text-muted-foreground">Confirming the exact USD debit amount</p>
                </div>
              </div>
            ) : hasSufficientFunds ? (
              <button
                onClick={handleWalletPayment}
                disabled={loading || paystackLoading || !walletPreview}
                className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-border bg-background p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/30 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/8">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                    ) : (
                      <Wallet className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {loading ? "Processing..." : "Pay from Wallet"}
                    </p>
                    <p className="text-xs text-muted-foreground">Balance: {formatConverted(walletBalance, "NGN")}</p>
                  </div>
                </div>
              </button>
            ) : walletPreview ? (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Insufficient Wallet Balance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You need {formatConverted(shortfall, "NGN")} more, or pay via Paystack.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {walletPreview && hasSufficientFunds && (
              <Button variant="default" size="sm" className="flex-1" onClick={handleWalletPayment} disabled={loading || previewLoading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay Now"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayShipmentDialog;
