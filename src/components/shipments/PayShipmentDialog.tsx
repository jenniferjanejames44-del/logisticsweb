import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal-shell";
import { Loader2, CreditCard, Shield, ChevronRight, Building2, MessageCircle } from "lucide-react";
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
  /** Optional display-only details — improves the summary, no backend impact */
  serviceType?: string;
  destination?: string;
  weight?: number | null;
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

type PaymentMethod = "paystack" | "bank_transfer";

const WHATSAPP_NUMBER = "2348185956707";

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
  serviceType,
  destination,
  weight,
}: PayShipmentDialogProps) => {
  const { formatConverted, convertUsdAmount } = useCurrency();
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
  const ngnAmount = payableWithPaystack ?? convertUsdAmount(Number(price) || 0, "NGN");

  const handleBankTransfer = () => {
    const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price) || 0);
    const ngnFmt = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(ngnAmount);
    const lines = [
      `Hello RAC Logistics,`,
      ``,
      `I would like to pay for my shipment via *Bank Transfer*.`,
      ``,
      `*Tracking Number:* ${trackingNumber}`,
      invoiceNumber ? `*Invoice:* ${invoiceNumber}` : null,
      serviceType ? `*Service:* ${serviceType.replace(/[-_]/g, " ")}` : null,
      destination ? `*Destination:* ${destination}` : null,
      weight != null ? `*Weight:* ${weight} KG` : null,
      ``,
      `*Amount (USD):* ${usdFmt}`,
      `*Amount (NGN):* ${ngnFmt}`,
      ``,
      `Please share your bank account details so I can complete the transfer. Thank you.`,
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
      handleBankTransfer();
    }
  };

  const isProcessing = loading || paystackLoading;

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      ariaTitle="Payment Checkout"
      ariaDescription={`Pay for shipment ${trackingNumber}`}
    >
      <ModalHeader
        title="Payment Checkout"
        subtitle={`Shipment ${trackingNumber}`}
        icon={<CreditCard className="w-5 h-5" />}
      />
      <ModalBody className="space-y-5">
          {/* Shipment Summary */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shipment Summary</p>
            <div className="rounded-xl border border-border/60 p-5 space-y-3 text-sm bg-muted/20">
              {serviceType && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Service Type</span>
                  <span className="font-semibold text-foreground capitalize text-right">{serviceType.replace(/[-_]/g, " ")}</span>
                </div>
              )}
              {destination && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-semibold text-foreground text-right">{destination}</span>
                </div>
              )}
              {weight != null && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-semibold text-foreground">{weight} KG</span>
                </div>
              )}
              {(serviceType || destination || weight != null) && (
                <Separator className="my-1" />
              )}
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Total Price (USD)</span>
                <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price) || 0)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Equivalent (NGN)</span>
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
              <div className="flex justify-between items-center pt-1">
                <span className="text-base font-bold text-foreground">Total Due</span>
                <span className="text-xl font-bold text-accent">{formatConverted(price, priceCurrency)}</span>
              </div>
            </div>
            {invoiceNumber && (
              <p className="text-xs text-muted-foreground">
                Invoice: <span className="font-medium text-foreground">{invoiceNumber}</span>
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Select Payment Method</p>

            {/* Paystack Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod("paystack")}
              className={`flex w-full items-center gap-3.5 rounded-lg border p-3.5 text-left transition-all ${
                selectedMethod === "paystack"
                  ? "border-accent bg-accent/[0.04] ring-1 ring-accent/20"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <div className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
                selectedMethod === "paystack" ? "border-accent bg-accent" : "border-muted-foreground/25"
              }`}>
                {selectedMethod === "paystack" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/8 flex-shrink-0">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">Pay with Paystack</p>
                <p className="text-[11px] text-muted-foreground">Card, Bank Transfer, or USSD</p>
              </div>
              <span className="text-[10px] font-semibold text-accent bg-accent/8 px-2 py-0.5 rounded flex-shrink-0">
                Recommended
              </span>
            </button>

            {/* Wallet Option */}
            {previewLoading && !walletPreview ? (
              <div className="flex items-center gap-3.5 rounded-lg border border-border/50 p-3.5">
                <div className="h-4.5 w-4.5 flex-shrink-0" />
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 flex-shrink-0">
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
                className={`flex w-full items-center gap-3.5 rounded-lg border p-3.5 text-left transition-all ${
                  selectedMethod === "wallet"
                    ? "border-accent bg-accent/[0.04] ring-1 ring-accent/20"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <div className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
                  selectedMethod === "wallet" ? "border-accent bg-accent" : "border-muted-foreground/25"
                }`}>
                  {selectedMethod === "wallet" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
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
              <div className="flex items-center gap-3.5 rounded-lg border border-destructive/20 bg-destructive/[0.03] p-3.5">
                <div className="h-4.5 w-4.5 flex-shrink-0" />
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
            <p className="text-[11px] text-muted-foreground bg-muted/20 rounded-lg px-3 py-2 border border-border/50">
              {previewError} You can still pay via Paystack.
            </p>
          )}

          {/* Security badge */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span>Secured by Paystack. All transactions are encrypted.</span>
          </div>
      </ModalBody>
      <ModalFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial sm:px-6 h-11 sm:h-12"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePay}
            disabled={isProcessing || (selectedMethod === "wallet" && !hasSufficientFunds)}
            className="flex-[2] h-11 sm:h-12 font-semibold"
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
      </ModalFooter>
    </ModalShell>
  );
};

export default PayShipmentDialog;
