import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, Eye, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  canAdvanceShoppingOrder,
  getShoppingOrderDisplayStatus,
  shoppingOrderStatusConfig,
  shoppingOrderStatusOptions,
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
  product_link: string | null;
}

interface OrderProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const AdminShoppingOrders = () => {
  const { formatUsd } = useCurrency();
  const [orders, setOrders] = useState<ShoppingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ShoppingOrder | null>(null);
  const [profiles, setProfiles] = useState<Record<string, OrderProfile>>({});

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("shopping_orders")
      .select("*")
      .order("created_at", { ascending: false });

    const ordersList = data || [];
    setOrders(ordersList);

    // Fetch profiles for all user_ids
    const userIds = [...new Set(ordersList.map((order: ShoppingOrder) => order.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
      const map: Record<string, OrderProfile> = {};
      profilesData?.forEach((profile) => { map[profile.user_id] = profile; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (order: ShoppingOrder, newStatus: string) => {
    if (!canAdvanceShoppingOrder(newStatus, order.payment_status)) {
      toast({
        title: "Payment required",
        description: "This shopping order must be paid before it can move beyond pending payment.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("shopping_orders")
      .update({ status: newStatus })
      .eq("id", order.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: newStatus } : o));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Shopping Orders
            </h1>
            <p className="text-muted-foreground text-sm">Manage personal shopping requests</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Item Value</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No shopping orders yet</TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const profile = profiles[order.user_id];
                      const displayStatus = getShoppingOrderDisplayStatus(order.status, order.payment_status);
                      const sc = shoppingOrderStatusConfig[displayStatus] || shoppingOrderStatusConfig.pending_payment;
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{profile?.full_name || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">{profile?.email || ""}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.product_name}</TableCell>
                          <TableCell>{formatUsd(Number(order.item_value))}</TableCell>
                          <TableCell>{formatUsd(Number(order.processing_fee))}</TableCell>
                          <TableCell className="font-semibold">{formatUsd(Number(order.total_cost))}</TableCell>
                          <TableCell>
                            <Badge variant={order.payment_status === "paid" ? "default" : "destructive"} className="text-xs">
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select value={displayStatus} onValueChange={(val) => updateStatus(order, val)}>
                              <SelectTrigger className="w-[160px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {shoppingOrderStatusOptions.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details — {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{profiles[selectedOrder.user_id]?.full_name || "N/A"}</span>
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{selectedOrder.product_name}</span>
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{selectedOrder.quantity}</span>
                <span className="text-muted-foreground">Item Value</span>
                <span className="font-medium">{formatUsd(Number(selectedOrder.item_value))}</span>
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">{formatUsd(Number(selectedOrder.processing_fee))}</span>
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">{formatUsd(Number(selectedOrder.total_cost))}</span>
              </div>
              {selectedOrder.product_link && (
                <div>
                  <p className="text-muted-foreground mb-1">Product Link</p>
                  <a href={selectedOrder.product_link} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs break-all">
                    {selectedOrder.product_link}
                  </a>
                </div>
              )}
              {selectedOrder.item_description && (
                <div>
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{selectedOrder.item_description}</p>
                </div>
              )}
              {selectedOrder.additional_notes && (
                <div>
                  <p className="text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground">{selectedOrder.additional_notes}</p>
                </div>
              )}
              {selectedOrder.product_image_url && (
                <div>
                  <p className="text-muted-foreground mb-1">Product Image</p>
                  <img src={selectedOrder.product_image_url} alt="Product" className="rounded-lg max-h-48 object-cover" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Created: {format(new Date(selectedOrder.created_at), "MMM dd, yyyy HH:mm")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminShoppingOrders;
