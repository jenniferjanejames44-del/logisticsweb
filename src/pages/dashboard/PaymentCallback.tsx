import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Wallet } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentType, setPaymentType] = useState<string | null>(null);

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
          } else {
            setMessage(data.message || "Payment successful! Your invoice has been marked as paid.");
          }
        } else {
          setStatus("failed");
          setMessage(data.message || "Payment could not be verified. Please contact support.");
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

  return (
    <DashboardLayout title="Payment Status" description="Payment verification result">
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="border-border/50 max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            {status === "verifying" && (
              <>
                <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                <h2 className="text-xl font-semibold text-foreground">Verifying Payment</h2>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}
            {status === "success" && (
              <>
                {isWalletTopup ? (
                  <Wallet className="w-16 h-16 text-green-500 mx-auto" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                )}
                <h2 className="text-xl font-semibold text-foreground">
                  {isWalletTopup ? "Wallet Funded!" : "Payment Successful!"}
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {isWalletTopup ? (
                    <>
                      <Button variant="cta" onClick={() => navigate("/dashboard/wallet")}>
                        View Wallet
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
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <h2 className="text-xl font-semibold text-foreground">Payment Failed</h2>
                <p className="text-muted-foreground">{message}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate(isWalletTopup ? "/dashboard/wallet" : "/dashboard/shipments")}>
                    {isWalletTopup ? "Back to Wallet" : "Back to Shipments"}
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
