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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin, Package, Truck, DollarSign, ArrowRight, ArrowLeft,
  CheckCircle, Loader2, Shield,
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
  const { formatUsd } = useCurrency();
  const { balance, refetch: refetchBalance } = useWalletBalance(user?.id);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [createdShipmentId, setCreatedShipmentId] = useState<string | null>(null);
  const [createdTrackingNumber, setCreatedTrackingNumber] = useState<string>("");
  const [createdInvoice, setCreatedInvoice] = useState<{ id: string; invoice_number: string } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Load quote from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("pricing_quote_data");
    if (raw) {
      try {
        setQuote(JSON.parse(raw));
      } catch {
        navigate("/pricing");
      }
    } else {
      navigate("/pricing");
    }
  }, [navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem("post_auth_redirect", "/checkout");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleEditQuote = () => {
    navigate("/pricing");
  };

  const handleProceedToPayment = async () => {
    if (!user || !quote) return;

    setCreatingShipment(true);
    try {
      // Calculate price using the pricing engine
      const enginePrice = await calculateShipmentPrice(quote.service_type, parseFloat(quote.weight));
      const finalPrice = enginePrice ?? quote.calculated_price;

      const estimatedDays = quote.service_type.includes("express") ? 3 :
        quote.service_type.includes("ocean") ? 25 : 7;
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

      // Create shipment
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

      // Fetch the auto-created invoice
      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, invoice_number")
        .eq("shipment_id", shipment.id)
        .single();

      if (invoice) {
        setCreatedInvoice(invoice);
      }

      // Clear stored quote
      localStorage.removeItem("pricing_quote_data");

      // Open payment dialog
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

  if (authLoading || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="page-hero" style={{ minHeight: "220px" }}>
          <div
            className="page-hero-media"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80)',
            }}
          />
          <div className="page-hero-overlay" />
          <div className="section-container relative z-10">
            <div className="page-hero-shell">
              <h1 className="text-white mb-2 leading-tight">Checkout</h1>
              <p className="hero-subtext max-w-xl mx-auto text-base leading-relaxed md:text-lg">
                Review your shipment details and proceed to payment.
              </p>
            </div>
          </div>
        </section>

        {/* Checkout Content */}
        <section className="section-padding bg-[radial-gradient(circle_at_top,rgba(6,16,67,0.04),transparent_38%)]">
          <div className="section-container">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Shipment Summary */}
              <Card className="border-border/70 shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-[0_10px_20px_rgba(6,16,67,0.2)]">
                      <Package className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Shipment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Destination</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{quote.destination_country}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <Package className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Weight</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{quote.weight} KG</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <Truck className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Service</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{quote.service_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{quote.delivery_estimate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/[0.05] border border-primary/15">
                      <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estimated Price</p>
                        <p className="text-xl font-bold text-primary mt-1">{formatUsd(quote.calculated_price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Base Rate ({quote.weight} KG × {formatUsd(quote.base_rate)}/KG{quote.route_rate ? " (route)" : ""})</span>
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
                    <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border/50">
                      <span>Total</span>
                      <span>{formatUsd(quote.calculated_price)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security note */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800/40">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  Your payment is secured via Paystack. You can also pay from your wallet balance.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                <Button variant="outline" size="lg" onClick={handleEditQuote}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Edit Quote
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={creatingShipment || !!createdShipmentId}
                  className="shadow-[0_12px_24px_rgba(223,81,1,0.2)]"
                >
                  {creatingShipment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Shipment...
                    </>
                  ) : createdShipmentId ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Shipment Created
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Payment Dialog */}
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

export default Checkout;
