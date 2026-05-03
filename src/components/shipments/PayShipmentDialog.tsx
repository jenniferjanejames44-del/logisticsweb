import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CreditCard, Shield, Building2, MessageCircle, X, Package, MapPin, Weight } from "lucide-react";
import { toast } from "sonner";

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
  const { convertUsdAmount } = useCurrency();
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

  const usdAmount = Number(price) || 0;
  const payableWithPaystack = walletPreview?.charged_amount ?? null;
  const ngnAmount = payableWithPaystack ?? convertUsdAmount(usdAmount, "NGN");

  const usdFormatted = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(usdAmount);
  const ngnFormatted = new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(ngnAmount);

  const handleBankTransfer = () => {
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
      `*Amount (USD):* ${usdFormatted}`,
      `*Amount (NGN):* ${ngnFormatted}`,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="[&>button]:hidden p-0 gap-0 border-0 sm:border bg-[#f5f5f7] dark:bg-background flex flex-col w-screen h-[100dvh] max-w-none rounded-none sm:w-[calc(100%-1rem)] sm:max-w-[480px] sm:h-auto sm:max-h-[92dvh] sm:rounded-2xl"
      >
        <DialogTitle className="sr-only">Payment Checkout</DialogTitle>
        <DialogDescription className="sr-only">Pay for shipment {trackingNumber}</DialogDescription>

        {/* HEADER */}
        <header className="flex items-center justify-between gap-3 border-b border-border/40 bg-background px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-base font-bold text-foreground leading-tight">Payment Checkout</h2>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">Shipment {trackingNumber}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5 space-y-5">
          <section className="rounded-xl bg-background p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-border/40">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Shipment Summary</h3>
            <dl className="space-y-2.5 text-sm">
              {serviceType && (
                <SummaryRow icon={<Package className="h-3.5 w-3.5" />} label="Service Type"
                  value={serviceType.replace(/[-_]/g, " ")} valueClass="capitalize" />
              )}
              {destination && (
                <SummaryRow icon={<MapPin className="h-3.5 w-3.5" />} label="Destination" value={destination} />
              )}
              {weight != null && (
                <SummaryRow icon={<Weight className="h-3.5 w-3.5" />} label="Weight" value={`${weight} KG`} />
              )}
              {!serviceType && !destination && weight == null && (
                <p className="text-xs text-muted-foreground">Tracking #{trackingNumber}</p>
              )}
            </dl>
          </section>

          <section className="rounded-xl bg-background p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-border/40">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Cost Breakdown</h3>
            <div className="space-y-2.5 text-sm">
              <CostRow label="Shipment Total (USD)" value={usdFormatted} />
              {invoiceNumber && (<CostRow label="Invoice" value={invoiceNumber} muted />)}
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-border/60 space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-foreground">Total (USD)</span>
                <span className="text-lg font-bold text-foreground tabular-nums">{usdFormatted}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-muted-foreground">Equivalent (NGN)</span>
                {previewLoading && payableWithPaystack === null ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Calculating…
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-accent tabular-nums">{ngnFormatted}</span>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-background p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-border/40">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Method</h3>
            <div className="space-y-2.5">
              <MethodCard
                selected={selectedMethod === "paystack"}
                onClick={() => setSelectedMethod("paystack")}
                icon={<CreditCard className="h-4 w-4 text-accent" />}
                iconBg="bg-accent/10"
                title="Pay with Paystack"
                subtitle="Card · Bank Transfer · USSD"
                badge="Recommended"
              />
              <MethodCard
                selected={selectedMethod === "bank_transfer"}
                onClick={() => setSelectedMethod("bank_transfer")}
                icon={<Building2 className="h-4 w-4 text-green-600" />}
                iconBg="bg-green-500/10"
                title="Bank Transfer"
                subtitle="Chat on WhatsApp for account details"
                rightIcon={<MessageCircle className="h-4 w-4 text-green-600" />}
              />
            </div>
            {previewError && (
              <p className="mt-3 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                {previewError} You can still pay via Paystack.
              </p>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              <span>Secured & encrypted. PCI-DSS compliant.</span>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-border/40 bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              variant="outline"
              className="h-[52px] flex-1 rounded-[10px] border-[#061043] text-[#061043] hover:bg-[#061043]/5 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="h-[52px] flex-[1.4] rounded-[10px] bg-[#DF5101] hover:bg-[#DF5101]/90 text-white border-0 font-semibold text-[15px] shadow-sm"
            >
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              ) : selectedMethod === "paystack" ? (
                <>Pay Now · {usdFormatted}</>
              ) : (
                <><MessageCircle className="h-4 w-4" /> Continue on WhatsApp</>
              )}
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

function SummaryRow({
  icon, label, value, valueClass = "",
}: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className="text-accent">{icon}</span>
        <span className="text-[12px]">{label}</span>
      </span>
      <span className={`font-semibold text-foreground text-[13px] text-right truncate ${valueClass}`}>{value}</span>
    </div>
  );
}

function CostRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground text-[12px]">{label}</span>
      <span className={`font-semibold tabular-nums text-[13px] ${muted ? "text-muted-foreground" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function MethodCard({
  selected, onClick, icon, iconBg, title, subtitle, badge, rightIcon,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  rightIcon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
        selected ? "border-accent bg-accent/5 shadow-sm" : "border-border/60 bg-background hover:border-border"
      }`}
    >
      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
        selected ? "border-accent bg-accent" : "border-muted-foreground/30"
      }`}>
        {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      {badge && (
        <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded flex-shrink-0">{badge}</span>
      )}
      {rightIcon}
    </button>
  );
}

export default PayShipmentDialog;
