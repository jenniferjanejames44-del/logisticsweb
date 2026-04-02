import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateShipmentPrice } from "@/lib/pricing";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PayShipmentDialog from "@/components/shipments/PayShipmentDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Package, Truck, ArrowLeft,
  CheckCircle, Loader2, Shield, CreditCard, Edit3, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface QuoteData {
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

const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { formatUsd, exchangeRates, convertUsdAmount } = useCurrency();
  const { balance, refetch: refetchBalance } = useWalletBalance(user?.id);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [createdShipmentId, setCreatedShipmentId] = useState<string | null>(null);
  const [createdTrackingNumber, setCreatedTrackingNumber] = useState<string>("");
  const [createdInvoice, setCreatedInvoice] = useState<{ id: string; invoice_number: string } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

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

  const handleProceedToPayment = async () => {
    if (!user || !quote) return;
    setCreatingShipment(true);
    try {
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

      setCreatedShipmentId(shipment.id);
      setCreatedTrackingNumber(shipment.tracking_number);

      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, invoice_number")
        .eq("shipment_id", shipment.id)
        .single();

      if (invoice) setCreatedInvoice(invoice);

      localStorage.removeItem("pricing_quote_data");
      setPaymentDialogOpen(true);
    } catch (err) {
      console.error("Error creating shipment:", err);
      toast.error("Failed to create shipment. Please try again.");
    } finally {
      setCreatingShipment(false);
    }
  };

  const handlePaymentSuccess = () => {
    refetchBalance();
    toast.success("Payment successful! Your shipment is now being processed.");
    navigate("/dashboard/shipments");
  };

  const formatNgn = (usdAmount: number) => {
    const ngnAmount = convertUsdAmount(usdAmount, "NGN");
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(ngnAmount);
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 overflow-y-auto">
        {/* Back */}
        <div className="w-full bg-muted/30 border-b border-border/50">
          <div className="max-w-2xl mx-auto px-4 py-3 sm:px-6">
            <button
              onClick={handleEditQuote}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Quote
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-6">
          {/* Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Confirm & Pay</h1>
            <p className="text-muted-foreground text-sm">Review your shipment details before payment.</p>
          </div>

          {/* Summary Card */}
          <div className="rounded-xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
              <h2 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Shipment Summary
              </h2>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow icon={<MapPin className="w-4 h-4" />} label="Destination" value={quote.destination_country} />
                <DetailRow icon={<Package className="w-4 h-4" />} label="Weight" value={`${quote.weight} KG`} />
                <DetailRow icon={<Truck className="w-4 h-4" />} label="Service" value={quote.service_name} subtitle={quote.delivery_estimate} />
              </div>

              {/* Cost breakdown */}
              <div className="rounded-lg bg-muted/20 border border-border/50 p-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Rate ({quote.weight} KG × {formatUsd(quote.base_rate)}/KG)</span>
                  <span>{formatUsd(quote.base_shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Handling Fee</span>
                  <span>{formatUsd(quote.handling_fee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Insurance (2%)</span>
                  <span>{formatUsd(quote.insurance_fee)}</span>
                </div>
              </div>

              {/* Total section */}
              <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Shipping Cost (USD)</p>
                    <p className="text-2xl font-bold text-foreground">{formatUsd(quote.calculated_price)}</p>
                  </div>
                  <Separator orientation="vertical" className="hidden sm:block h-12" />
                  <div className="sm:text-right">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Naira Equivalent</p>
                    <p className="text-xl font-bold text-accent">{formatNgn(quote.calculated_price)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Rate: $1 = ₦{exchangeRates.NGN.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-[13px] text-green-700 dark:text-green-300">
              Secured checkout via Paystack. Your payment is encrypted.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
            <Button
              onClick={handleProceedToPayment}
              disabled={creatingShipment || !!createdShipmentId}
              className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white border-0 text-[15px] font-semibold shadow-[0_8px_20px_rgba(223,81,1,0.2)]"
            >
              {creatingShipment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Shipment…
                </>
              ) : createdShipmentId ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Shipment Created
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay with Paystack
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleEditQuote}
              className="sm:w-auto h-12"
            >
              <Edit3 className="w-4 h-4" />
              Edit Quote
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {createdShipmentId && (
        <PayShipmentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          shipmentId={createdShipmentId}
          invoiceId={createdInvoice?.id}
          invoiceNumber={createdInvoice?.invoice_number}
          trackingNumber={createdTrackingNumber}
          price={quote.calculated_price}
          userBalance={balance}
          userId={user!.id}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

function DetailRow({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-muted/20 border border-border/40">
      <span className="text-primary mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-[13px] font-semibold text-foreground mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default Checkout;
