import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Wallet } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatConverted } = useCurrency();
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useWalletBalance(user?.id);
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentType, setPaymentType] = useState<string | null>(null);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const type = searchParams.get("type");
    setPaymentType(type);
    
    if (!reference || !user) return;

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("paystack-verify", {
          body: { reference },
        });

        if (error) throw error;

        if (data.status === "success") {
          setStatus("success");
          if (data.type === "wallet_topup") {

            setPaymentType("wallet_topup");
            setMessage(data.message || "Your wallet has been funded successfully!");
            refetchBalance();
          } else if (data.type === "shopping_order") {
            setPaymentType("shopping_order");
            setMessage(data.message || "Payment successful! Your shopping order has been marked as paid.");
          } else {
            setMessage(data.message || "Payment successful! Your invoice has been marked as paid.");
          }
        } else {
          setStatus("failed");
          setMessage(data.message || "Payment could not be verified. Please contact support.");

          // Send payment failed email
          try {
            await supabase.functions.invoke("send-notification-email", {
              body: {
                type: "payment_failed",
                data: {
                  user_email: user.email,
                  user_name: "",
                  amount: data.amount || 0,
                  reference,
                  tracking_number: data.tracking_number || "",
                },
              },
            });
          } catch (emailErr) {
            console.error("Failed to send payment failed email:", emailErr);
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
        setMessage("An error occurred while verifying your payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams, user]);

  const isWalletTopup = paymentType === "wallet_topup";
  const isShoppingOrder = paymentType === "shopping_order" || searchParams.get("type") === "shopping_order";

  useEffect(() => {
    if (status !== "success" || !isShoppingOrder) return;

    const timer = window.setTimeout(() => {
      navigate("/dashboard/shopping-orders", { replace: true });
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [status, isShoppingOrder, navigate]);

  return (
    <DashboardLayout title="Payment Status" description="Payment verification result">
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-xl border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardContent className="space-y-6 p-8 text-center">
            {status === "verifying" && (
              <>
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                <h2 className="text-foreground">Verifying Payment</h2>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}
            {status === "success" && (
              <>
                {isWalletTopup ? (
                  <Wallet className="mx-auto h-16 w-16 text-green-500" />
                ) : (
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                )}
                <h2 className="text-foreground">
                  {isWalletTopup ? "Wallet Funded!" : isShoppingOrder ? "Shopping Order Paid!" : "Payment Successful!"}
                </h2>
                <p className="text-muted-foreground">{message}</p>
                {isWalletTopup && !balanceLoading && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-5">
                    <p className="mb-2 text-sm text-muted-foreground">Updated Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatConverted(balance, "NGN")}
                    </p>
                  </div>
                )}
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  {isWalletTopup ? (
                    <>
                      <Button variant="cta" onClick={() => navigate("/dashboard/wallet")}>
                        View Wallet
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                      </Button>
                    </>
                  ) : isShoppingOrder ? (
                    <>
                      <Button onClick={() => navigate("/dashboard/shopping-orders")}>
                        View Shopping Orders
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate("/dashboard/invoices")}>
                        View Invoices
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/dashboard/shipments")}>
                        View Shipments
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
            {status === "failed" && (
              <>
                <XCircle className="mx-auto h-16 w-16 text-destructive" />
                <h2 className="text-foreground">Payment Failed</h2>
                <p className="text-muted-foreground">{message}</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button onClick={() => navigate(isWalletTopup ? "/dashboard/wallet" : isShoppingOrder && orderId ? `/dashboard/shopping-orders/pay?orderId=${orderId}` : isShoppingOrder ? "/dashboard/shopping-orders" : "/dashboard/shipments")}>
                    {isWalletTopup ? "Back to Wallet" : isShoppingOrder ? "Back to Shopping Orders" : "Back to Shipments"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/contact")}>
                    Contact Support
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCallback;
