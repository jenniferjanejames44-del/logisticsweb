import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutSummaryCard from "@/components/checkout/CheckoutSummaryCard";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, Shield, CreditCard, ChevronRight, Building2, MessageCircle, Lock, BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

export interface QuoteData {
  destination_country: string;
  destination_code: string;
  weight: string;
  service_type: string;
  service_name: string;
  delivery_estimate: string;
  calculated_price: number;
  base_rate: number;
  base_shipping_cost: number;
  handling_fee: number;
  insurance_fee: number;
  route_rate: number | null;
}

type PaymentMethod = "paystack" | "bank_transfer";
const WHATSAPP_NUMBER = "2348185956707";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { formatUsd, exchangeRates, convertUsdAmount } = useCurrency();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("paystack");

  useEffect(() => {
    const raw = localStorage.getItem("pricing_quote_data");
    if (raw) {
      try { setQuote(JSON.parse(raw)); } catch { navigate("/pricing"); }
    } else {
      navigate("/pricing");
    }
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem("post_auth_redirect", "/checkout");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleEditQuote = () => navigate("/pricing");

  const formatNgn = (usdAmount: number) => {
    const ngnAmount = convertUsdAmount(usdAmount, "NGN");
    return new Intl.NumberFormat("en-NG", {
      style: "currency", currency: "NGN", minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(ngnAmount);
  };

  const createShipment = async () => {
    if (!user || !quote) throw new Error("Missing data");
    const enginePrice = await calculateShipmentPrice(quote.service_type, parseFloat(quote.weight));
    const finalPrice = enginePrice ?? quote.calculated_price;
    const estimatedDays = quote.service_type.includes("express") ? 3 :
      quote.service_type.includes("ocean") ? 25 : 7;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

    const { data: shipment, error } = await supabase.from("shipments").insert({
      user_id: user.id,
      origin_country: "Nigeria",
      origin_city: "Lagos",
      destination_country: quote.destination_country,
      destination_city: quote.destination_country,
      weight: parseFloat(quote.weight),
      service_type: quote.service_type,
      description: `${quote.service_name} shipment to ${quote.destination_country}`,
      status: "shipment_created",
      estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
      tracking_number: "",
      price: finalPrice,
    }).select("id, tracking_number").single();
    if (error) throw error;

    const { data: invoice } = await supabase
      .from("invoices").select("id, invoice_number").eq("shipment_id", shipment.id).single();

    return { shipment, invoice };
  };

  const handlePay = async () => {
    if (!user || !quote) return;
    setProcessing(true);
    try {
      const { shipment, invoice } = await createShipment();
      localStorage.removeItem("pricing_quote_data");

      if (selectedMethod === "paystack") {
        if (!invoice) throw new Error("Invoice not generated");
        const callbackUrl = `${window.location.origin}/dashboard/payment-callback`;
        const { data, error } = await supabase.functions.invoke("paystack-initialize", {
          body: { invoice_id: invoice.id, callback_url: callbackUrl },
        });
        if (error) throw error;
        if (data?.authorization_url) {
          window.location.href = data.authorization_url;
        } else throw new Error("Payment gateway error");
      } else {
        const usdFmt = formatUsd(quote.calculated_price);
        const ngnFmt = formatNgn(quote.calculated_price);
        const lines = [
          `Hello RAC Logistics,`,
          ``,
          `I would like to pay for my shipment via *Bank Transfer*.`,
          ``,
          `*Tracking Number:* ${shipment.tracking_number}`,
          invoice ? `*Invoice:* ${invoice.invoice_number}` : null,
          `*Service:* ${quote.service_name}`,
          `*Destination:* ${quote.destination_country}`,
          `*Weight:* ${quote.weight} KG`,
          ``,
          `*Amount (USD):* ${usdFmt}`,
          `*Amount (NGN):* ${ngnFmt}`,
          ``,
          `Please share your bank account details so I can complete the transfer. Thank you.`,
        ].filter(Boolean).join("\n");
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        toast.success("Shipment created. Continue on WhatsApp to complete payment.");
        navigate("/dashboard/shipments");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading checkout…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7fa] dark:bg-background">
      <Header />

      <main className="flex-1">
        <div className="border-b border-border/40 bg-background">
          <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
            <button
              onClick={handleEditQuote}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Quote
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-green-600" />
              Secure Checkout
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-10 pb-32 sm:pb-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Confirm & Pay</h1>
            <p className="text-muted-foreground text-sm mt-1">Review your shipment and choose how you'd like to pay.</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">
            {/* Left: Summary */}
            <div>
              <CheckoutSummaryCard
                quote={quote}
                formatUsd={formatUsd}
                formatNgn={formatNgn}
                exchangeRates={exchangeRates}
              />
            </div>

            {/* Right: Payment panel */}
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-foreground">Payment Method</h2>
                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 px-2 py-1 rounded-md inline-flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  <MethodOption
                    selected={selectedMethod === "paystack"}
                    onClick={() => setSelectedMethod("paystack")}
                    icon={<CreditCard className="w-4 h-4 text-accent" />}
                    iconBg="bg-accent/10"
                    title="Pay with Paystack"
                    subtitle="Card · Bank · USSD · Transfer"
                    badge="Instant"
                  />
                  <MethodOption
                    selected={selectedMethod === "bank_transfer"}
                    onClick={() => setSelectedMethod("bank_transfer")}
                    icon={<Building2 className="w-4 h-4 text-green-600" />}
                    iconBg="bg-green-50 dark:bg-green-950/30"
                    title="Bank Transfer"
                    subtitle="Get account details on WhatsApp"
                    rightIcon={<MessageCircle className="w-4 h-4 text-green-600" />}
                  />
                </div>

                <div className="mt-5 pt-5 border-t border-border/40">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-sm text-muted-foreground">You pay</span>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground tabular-nums">{formatUsd(quote.calculated_price)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatNgn(quote.calculated_price)}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-white border-0 text-[15px] font-semibold rounded-xl shadow-sm"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing…
                      </>
                    ) : selectedMethod === "paystack" ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay {formatUsd(quote.calculated_price)}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        Continue on WhatsApp
                      </>
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span>256-bit SSL encrypted · PCI-DSS compliant</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/30 p-4 text-[11px] text-muted-foreground leading-relaxed">
                By proceeding, you agree to RAC Logistics' Terms of Service and Refund Policy. Payments are processed securely via Paystack.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border/60 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs text-muted-foreground">Total</span>
          <div className="text-right">
            <p className="text-base font-bold text-foreground tabular-nums">{formatUsd(quote.calculated_price)}</p>
            <p className="text-[10px] text-muted-foreground">{formatNgn(quote.calculated_price)}</p>
          </div>
        </div>
        <Button
          onClick={handlePay}
          disabled={processing}
          className="w-full h-12 bg-accent hover:bg-accent/90 text-white border-0 text-[15px] font-semibold rounded-xl"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
          ) : selectedMethod === "paystack" ? (
            <><Lock className="w-4 h-4" /> Pay {formatUsd(quote.calculated_price)}</>
          ) : (
            <><MessageCircle className="w-4 h-4" /> Continue on WhatsApp</>
          )}
        </Button>
      </div>
    </div>
  );
};

function MethodOption({
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
      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
        selected
          ? "border-accent bg-accent/[0.04] ring-1 ring-accent/30 shadow-sm"
          : "border-border/60 hover:border-border bg-background"
      }`}
    >
      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-colors ${
        selected ? "border-accent bg-accent" : "border-muted-foreground/30"
      }`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      {badge && (
        <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded flex-shrink-0">
          {badge}
        </span>
      )}
      {rightIcon}
    </button>
  );
}

export default Checkout;
