import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Package, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_purchase: { label: "Pending Purchase", variant: "secondary" },
  purchased: { label: "Purchased", variant: "default" },
  arrived_warehouse: { label: "Arrived Warehouse", variant: "outline" },
  ready_for_shipment: { label: "Ready for Shipment", variant: "default" },
};

const ShoppingOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
    <DashboardLayout title="Shopping Orders" description="Track your personal shopping requests">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => navigate("/personal-shopping/new")} className="gap-2 rounded-lg">
            <Plus className="w-4 h-4" />
            New Shopping Request
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-border shadow-[0_4px_20px_rgba(0,0,0,0.04)]"><CardContent className="h-24" /></Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <h3 className="mb-2 text-foreground">No Shopping Orders Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Submit your first personal shopping request</p>
              <Button onClick={() => navigate("/personal-shopping/new")} className="gap-2 rounded-lg">
                <Plus className="w-4 h-4" />
                Create Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const sc = statusConfig[order.status] || statusConfig.pending_purchase;
              return (
                <Card key={order.id} className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{order.product_name}</p>
                          <p className="text-xs text-muted-foreground">{order.order_number} • {format(new Date(order.created_at), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-foreground">${Number(order.total_cost).toFixed(2)}</p>
                          <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md rounded-lg border border-border bg-background p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-foreground">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 px-6 pb-6 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <span className="text-muted-foreground">Order #</span>
                <span className="font-medium">{selectedOrder.order_number}</span>
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{selectedOrder.product_name}</span>
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{selectedOrder.quantity}</span>
                <span className="text-muted-foreground">Item Value</span>
                <span className="font-medium">${Number(selectedOrder.item_value).toFixed(2)}</span>
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">${Number(selectedOrder.processing_fee).toFixed(2)}</span>
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-bold text-primary">${Number(selectedOrder.total_cost).toFixed(2)}</span>
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusConfig[selectedOrder.status]?.variant || "secondary"}>
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
                <span className="text-muted-foreground">Payment</span>
                <Badge variant={selectedOrder.payment_status === "paid" ? "default" : "destructive"}>
                  {selectedOrder.payment_status}
                </Badge>
              </div>
              {selectedOrder.item_description && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{selectedOrder.item_description}</p>
                </div>
              )}
              {selectedOrder.additional_notes && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground">{selectedOrder.additional_notes}</p>
                </div>
              )}
              {selectedOrder.product_image_url && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-muted-foreground mb-1">Product Image</p>
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
