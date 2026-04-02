import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2, Wallet, AlertTriangle, CreditCard, Shield, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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

type PaymentMethod = "paystack" | "wallet";

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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("paystack");
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
      setSelectedMethod("paystack");
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
          setPreviewError(data?.message || "Unable to load wallet quote.");
        }
      } catch (error) {
        console.error("Error loading wallet preview:", error);
        if (!isActive) return;
        setWalletPreview(null);
        setPreviewError("Unable to load wallet quote right now.");
      } finally {
        if (isActive) setPreviewLoading(false);
      }
    };

    loadWalletPreview();
    return () => { isActive = false; };
  }, [open, shipmentId, invoiceId]);

  const payableWithPaystack = walletPreview?.charged_amount ?? null;
  const walletBalance = walletPreview?.wallet_balance ?? userBalance;
  const hasSufficientFunds = walletPreview?.has_sufficient_funds ?? false;
  const shortfall = walletPreview ? Math.max(walletPreview.charged_amount - walletPreview.wallet_balance, 0) : 0;

  const handleWalletPayment = async () => {
    if (!walletPreview) {
      toast.error("Still loading the exact wallet debit. Please wait.");
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

  const handlePay = () => {
    if (selectedMethod === "paystack") {
      handlePaystackPayment();
    } else {
      handleWalletPayment();
    }
  };

  const isProcessing = loading || paystackLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-xl">
        {/* Header */}
        <div className="bg-primary px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Payment Checkout</h2>
              <p className="text-xs text-white/60">Shipment {trackingNumber}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Order Summary */}
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Order Summary</p>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipment Price</span>
                <span className="font-semibold text-foreground">{formatConverted(price, priceCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount (₦)</span>
                {payableWithPaystack !== null ? (
                  <span className="font-semibold text-foreground">{formatConverted(payableWithPaystack, "NGN")}</span>
                ) : previewLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Calculating…
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Total Due</span>
                <span className="text-lg font-bold text-primary">{formatConverted(price, priceCurrency)}</span>
              </div>
            </div>
            {invoiceNumber && (
              <p className="text-[11px] text-muted-foreground">
                Invoice: <span className="font-medium text-foreground">{invoiceNumber}</span>
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Select Payment Method</p>

            {/* Paystack Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod("paystack")}
              className={`flex w-full items-center gap-3.5 rounded-lg border-2 p-3.5 text-left transition-all ${
                selectedMethod === "paystack"
                  ? "border-primary bg-primary/[0.03] shadow-sm"
                  : "border-border/60 bg-background hover:border-border"
              }`}
            >
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
                selectedMethod === "paystack" ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {selectedMethod === "paystack" && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 flex-shrink-0">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">Pay with Paystack</p>
                <p className="text-[11px] text-muted-foreground">Card, Bank Transfer, or USSD</p>
              </div>
              <span className="text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full flex-shrink-0">
                Recommended
              </span>
            </button>

            {/* Wallet Option */}
            {previewLoading && !walletPreview ? (
              <div className="flex items-center gap-3.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                <div className="h-5 w-5 flex-shrink-0" />
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">Loading wallet…</p>
                  <p className="text-[11px] text-muted-foreground">Checking balance</p>
                </div>
              </div>
            ) : hasSufficientFunds ? (
              <button
                type="button"
                onClick={() => setSelectedMethod("wallet")}
                className={`flex w-full items-center gap-3.5 rounded-lg border-2 p-3.5 text-left transition-all ${
                  selectedMethod === "wallet"
                    ? "border-primary bg-primary/[0.03] shadow-sm"
                    : "border-border/60 bg-background hover:border-border"
                }`}
              >
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
                  selectedMethod === "wallet" ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}>
                  {selectedMethod === "wallet" && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/8 flex-shrink-0">
                  <Wallet className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">Pay from Wallet</p>
                  <p className="text-[11px] text-muted-foreground">
                    Balance: {formatConverted(walletBalance, "NGN")}
                  </p>
                </div>
              </button>
            ) : walletPreview ? (
              <div className="flex items-center gap-3.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5">
                <div className="h-5 w-5 flex-shrink-0" />
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/8 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-destructive">Insufficient Wallet Balance</p>
                  <p className="text-[11px] text-muted-foreground">
                    Need {formatConverted(shortfall, "NGN")} more
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {previewError && (
            <p className="text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/60">
              {previewError} You can still pay via Paystack.
            </p>
          )}

          {/* Security badge */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Secured by Paystack. All transactions are encrypted.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-2.5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePay}
            disabled={isProcessing || (selectedMethod === "wallet" && !hasSufficientFunds)}
            className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white border-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                {selectedMethod === "paystack" ? (
                  <CreditCard className="w-4 h-4" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
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

export default PayShipmentDialog;
