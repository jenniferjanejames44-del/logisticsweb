import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CreditCard, Shield, ChevronRight, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  clearPendingShoppingOrder,
  getPendingShoppingOrder,
  getShoppingOrderDisplayStatus,
  needsShoppingOrderPayment,
  SHOPPING_ORDER_PAYMENT_ROUTE,
  shoppingOrderStatusConfig,
} from "@/lib/shoppingOrders";

interface ShoppingOrder {
  id: string;
  order_number: string;
  product_name: string;
  quantity: number;
  item_value: number;
  processing_fee: number;
  total_cost: number;
  status: string;
  payment_status: string;
}

const ShoppingOrderPayment = () => {
  const { user, loading: authLoading } = useAuth();
  const { formatUsd } = useCurrency();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [order, setOrder] = useState<ShoppingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const orderId = searchParams.get("orderId");
  const displayStatus = useMemo(
    () => getShoppingOrderDisplayStatus(order?.status || "pending_payment", order?.payment_status || "unpaid"),
    [order],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      localStorage.setItem("post_auth_redirect", `${SHOPPING_ORDER_PAYMENT_ROUTE}${orderId ? `?orderId=${orderId}` : ""}`);
      navigate("/auth", { replace: true });
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      let activeOrderId = orderId;

      if (!activeOrderId) {
        const pending = getPendingShoppingOrder();
        if (!pending) {
          toast({ title: "No order ready for payment", description: "Create a shopping request first.", variant: "destructive" });
          navigate("/dashboard/shopping-orders", { replace: true });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from("shopping_orders").insert({
          user_id: user.id,
          order_number: "",
          product_name: pending.productName,
          product_link: pending.productLink || null,
          item_description: pending.itemDescription,
          item_value: pending.itemValue,
          quantity: pending.quantity,
          processing_fee: pending.processingFee,
          total_cost: pending.totalCost,
          additional_notes: pending.additionalNotes || null,
          status: "pending_payment",
          payment_status: "unpaid",
        }).select("id").single();

        if (error || !data) {
          toast({ title: "Unable to create order", description: error?.message || "Please try again.", variant: "destructive" });
          setLoading(false);
          return;
        }

        clearPendingShoppingOrder();
        activeOrderId = data.id;
        setSearchParams(new URLSearchParams({ orderId: data.id }), { replace: true });
      }

      const { data: orderData, error: orderError } = await supabase
        .from("shopping_orders")
        .select("id, order_number, product_name, quantity, item_value, processing_fee, total_cost, status, payment_status")
        .eq("id", activeOrderId)
        .eq("user_id", user.id)
        .single();

      if (orderError || !orderData) {
        toast({ title: "Order not found", description: orderError?.message || "Please try again.", variant: "destructive" });
        navigate("/dashboard/shopping-orders", { replace: true });
      } else {
        setOrder(orderData);
      }
      setLoading(false);
    };

    loadOrder();
  }, [user, authLoading, navigate, orderId, setSearchParams]);

  const handlePaystackPayment = async () => {
    if (!order) return;
    if (!needsShoppingOrderPayment(order.status, order.payment_status)) {
      toast({ title: "Order already settled", description: "This shopping order no longer requires payment." });
      navigate("/dashboard/shopping-orders", { replace: true });
      return;
    }

    setPaying(true);
    try {
      const callbackUrl = `${window.location.origin}/dashboard/payment-callback?type=shopping_order&orderId=${order.id}`;
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: { shopping_order_id: order.id, callback_url: callbackUrl },
      });

      if (error) throw error;
      if (!data?.authorization_url) throw new Error("No authorization URL returned");

      window.location.href = data.authorization_url;
    } catch (error) {
      toast({
        title: "Unable to start payment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  const statusBadge = shoppingOrderStatusConfig[displayStatus] || shoppingOrderStatusConfig.pending_payment;

  return (
    <DashboardLayout title="Shopping Order Payment" description="Complete payment for your shopping request">
      <div className="mx-auto max-w-md">
        <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
          {/* Clean Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Checkout</h2>
                <p className="text-xs text-muted-foreground">Complete your shopping order payment</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading order…</p>
              </div>
            ) : !order ? null : (
              <>
                {/* Order Info */}
                <div className="flex items-start justify-between gap-3 rounded-lg border border-border/50 p-4">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{order.product_name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{order.order_number}</p>
                  </div>
                  <Badge variant={statusBadge.variant} className="flex-shrink-0 text-[10px]">{statusBadge.label}</Badge>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 rounded-lg border border-border/50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item value</span>
                    <span className="font-medium text-foreground">{formatUsd(Number(order.item_value))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span className="font-medium text-foreground">{formatUsd(Number(order.processing_fee))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium text-foreground">{order.quantity}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Due</span>
                    <span className="text-lg font-bold text-accent">{formatUsd(Number(order.total_cost))}</span>
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span>Secured checkout via Paystack. Encrypted transaction.</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5">
                  <Button variant="outline" className="flex-1 h-11" onClick={() => navigate("/dashboard/shopping-orders")}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-11 bg-accent hover:bg-accent/90 text-white border-0"
                    onClick={handlePaystackPayment}
                    disabled={paying || !needsShoppingOrderPayment(order.status, order.payment_status)}
                  >
                    {paying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </>
                    ) : needsShoppingOrderPayment(order.status, order.payment_status) ? (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      "Already Paid"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShoppingOrderPayment;
