import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Package, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getShoppingOrderDisplayStatus,
  needsShoppingOrderPayment,
  SHOPPING_ORDER_PAYMENT_ROUTE,
  shoppingOrderStatusConfig,
} from "@/lib/shoppingOrders";

interface ShoppingOrder {
  id: string;
  user_id: string;
  order_number: string;
  product_name: string;
  quantity: number;
  item_value: number;
  processing_fee: number;
  total_cost: number;
  status: string;
  payment_status: string;
  created_at: string;
  item_description: string | null;
  additional_notes: string | null;
  product_image_url: string | null;
}

const ShoppingOrders = () => {
  const { user } = useAuth();
  const { formatUsd } = useCurrency();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ShoppingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ShoppingOrder | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("shopping_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  return (
    <DashboardLayout
      title="Shopping Orders"
      description="Track your personal shopping requests"
      action={
        <Button variant="default" size="sm" onClick={() => navigate("/personal-shopping/new")} className="h-9 text-[13px]">
          <Plus className="w-3.5 h-3.5" />
          New Request
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-2.5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border-border/50"><CardContent className="h-20" /></Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">No Shopping Orders Yet</h3>
            <p className="text-[12px] text-muted-foreground mb-4">Submit your first personal shopping request</p>
            <Button variant="default" size="sm" onClick={() => navigate("/personal-shopping/new")} className="h-9 text-[13px]">
              <Plus className="w-3.5 h-3.5" />
              Create Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2.5">
          {orders.map((order) => {
            const displayStatus = getShoppingOrderDisplayStatus(order.status, order.payment_status);
            const sc = shoppingOrderStatusConfig[displayStatus] || shoppingOrderStatusConfig.pending_payment;
            const showPayNow = needsShoppingOrderPayment(order.status, order.payment_status);
            return (
              <Card key={order.id} className="border-border/50 transition-all duration-200 hover:shadow-sm hover:border-border">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/6">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{order.product_name}</p>
                        <p className="text-[11px] text-muted-foreground">{order.order_number} • {format(new Date(order.created_at), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-foreground">{formatUsd(Number(order.total_cost))}</p>
                        <Badge variant={sc.variant} className="text-[9px]">{sc.label}</Badge>
                      </div>
                      {showPayNow && (
                        <Button size="sm" onClick={() => navigate(`${SHOPPING_ORDER_PAYMENT_ROUTE}?orderId=${order.id}`)} className="h-7 text-[11px] px-3">
                          Pay Now
                        </Button>
                      )}
                      <Button variant="ghost" size="iconSm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="text-base">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 p-5 pt-3 text-sm">
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                <span className="text-[12px] text-muted-foreground">Order #</span>
                <span className="text-[12px] font-medium">{selectedOrder.order_number}</span>
                <span className="text-[12px] text-muted-foreground">Product</span>
                <span className="text-[12px] font-medium">{selectedOrder.product_name}</span>
                <span className="text-[12px] text-muted-foreground">Quantity</span>
                <span className="text-[12px] font-medium">{selectedOrder.quantity}</span>
                <span className="text-[12px] text-muted-foreground">Item Value</span>
                <span className="text-[12px] font-medium">{formatUsd(Number(selectedOrder.item_value))}</span>
                <span className="text-[12px] text-muted-foreground">Processing Fee</span>
                <span className="text-[12px] font-medium">{formatUsd(Number(selectedOrder.processing_fee))}</span>
                <span className="text-[12px] text-muted-foreground">Total Cost</span>
                <span className="text-[12px] font-bold text-primary">{formatUsd(Number(selectedOrder.total_cost))}</span>
                <span className="text-[12px] text-muted-foreground">Status</span>
                <Badge variant={shoppingOrderStatusConfig[getShoppingOrderDisplayStatus(selectedOrder.status, selectedOrder.payment_status)]?.variant || "secondary"} className="text-[9px] w-fit">
                  {shoppingOrderStatusConfig[getShoppingOrderDisplayStatus(selectedOrder.status, selectedOrder.payment_status)]?.label || selectedOrder.status}
                </Badge>
                <span className="text-[12px] text-muted-foreground">Payment</span>
                <Badge variant={selectedOrder.payment_status === "paid" ? "default" : "destructive"} className="text-[9px] w-fit">
                  {selectedOrder.payment_status}
                </Badge>
              </div>
              {needsShoppingOrderPayment(selectedOrder.status, selectedOrder.payment_status) && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => navigate(`${SHOPPING_ORDER_PAYMENT_ROUTE}?orderId=${selectedOrder.id}`)} className="h-8 text-[12px]">Pay Now</Button>
                </div>
              )}
              {selectedOrder.item_description && (
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">Description</p>
                  <p className="text-[12px] text-foreground">{selectedOrder.item_description}</p>
                </div>
              )}
              {selectedOrder.additional_notes && (
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">Notes</p>
                  <p className="text-[12px] text-foreground">{selectedOrder.additional_notes}</p>
                </div>
              )}
              {selectedOrder.product_image_url && (
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-[11px] text-muted-foreground mb-1">Product Image</p>
                  <img src={selectedOrder.product_image_url} alt="Product" className="rounded-lg max-h-48 object-cover" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ShoppingOrders;
