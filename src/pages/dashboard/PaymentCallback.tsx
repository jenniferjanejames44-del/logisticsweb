import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Wallet, ArrowRight, Shield } from "lucide-react";

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
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border/50 bg-white overflow-hidden">
          {/* Status Icon Area */}
          <div className="px-6 pt-8 pb-5 text-center">
            {status === "verifying" && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Verifying Payment</h2>
                  <p className="text-sm text-muted-foreground mt-1">Please wait while we confirm your transaction…</p>
                </div>
              </div>
            )}
            {status === "success" && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20">
                  {isWalletTopup ? (
                    <Wallet className="h-7 w-7 text-green-600" />
                  ) : (
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {isWalletTopup ? "Wallet Funded!" : isShoppingOrder ? "Order Paid!" : "Payment Successful!"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{message}</p>
                </div>
              </div>
            )}
            {status === "failed" && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/[0.06]">
                  <XCircle className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Payment Failed</h2>
                  <p className="text-sm text-muted-foreground mt-1">{message}</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Wallet balance card on success */}
            {status === "success" && isWalletTopup && !balanceLoading && (
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Updated Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatConverted(balance, "NGN")}
                </p>
              </div>
            )}

            {/* Security badge */}
            {status === "success" && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>Transaction verified and secured by Paystack.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 sm:flex-row">
              {status === "success" && (
                <>
                  {isWalletTopup ? (
                    <>
                      <Button
                        className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white border-0"
                        onClick={() => navigate("/dashboard/wallet")}
                      >
                        View Wallet
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button variant="outline" className="flex-1 h-11" onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </Button>
                    </>
                  ) : isShoppingOrder ? (
                    <>
                      <Button
                        className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white border-0"
                        onClick={() => navigate("/dashboard/shopping-orders")}
                      >
                        View Orders
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button variant="outline" className="flex-1 h-11" onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white border-0"
                        onClick={() => navigate("/dashboard/invoices")}
                      >
                        View Invoices
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button variant="outline" className="flex-1 h-11" onClick={() => navigate("/dashboard/shipments")}>
                        View Shipments
                      </Button>
                    </>
                  )}
                </>
              )}
              {status === "failed" && (
                <>
                  <Button
                    className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white border-0"
                    onClick={() => navigate(
                      isWalletTopup ? "/dashboard/wallet"
                        : isShoppingOrder && orderId ? `/dashboard/shopping-orders/pay?orderId=${orderId}`
                        : isShoppingOrder ? "/dashboard/shopping-orders"
                        : "/dashboard/shipments"
                    )}
                  >
                    {isWalletTopup ? "Back to Wallet" : isShoppingOrder ? "Back to Orders" : "Back to Shipments"}
                  </Button>
                  <Button variant="outline" className="flex-1 h-11" onClick={() => navigate("/contact")}>
                    Contact Support
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCallback;
