import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-5">
            <h2 className="text-lg font-bold text-white">Checkout</h2>
            <p className="text-sm text-white/70">Complete your shopping order payment</p>
          </div>

          <CardContent className="p-5 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading order...
              </div>
            ) : !order ? null : (
              <>
                {/* Order Info */}
                <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">{order.order_number}</p>
                  </div>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 rounded-lg border border-border p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item value</span>
                    <span className="font-medium">{formatUsd(Number(order.item_value))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span className="font-medium">{formatUsd(Number(order.processing_fee))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{order.quantity}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total Due</span>
                    <span className="text-primary">{formatUsd(Number(order.total_cost))}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/dashboard/shopping-orders")}>
                    Back to Orders
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={handlePaystackPayment}
                    disabled={paying || !needsShoppingOrderPayment(order.status, order.payment_status)}
                  >
                    {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    {needsShoppingOrderPayment(order.status, order.payment_status) ? "Pay Now" : "Already Paid"}
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

export default ShoppingOrderPayment;
