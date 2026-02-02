import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Package, Trash2, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Shipment {
  id: string;
  tracking_number: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  weight: number;
  service_type: string;
  status: string;
  created_at: string;
  estimated_delivery: string | null;
  price: number | null;
  payment_status: string;
  user_id: string;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "in_transit", label: "In Transit" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    processing: "bg-blue-500/10 text-blue-500",
    in_transit: "bg-purple-500/10 text-purple-500",
    out_for_delivery: "bg-warning/10 text-warning",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};

const AdminShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Price dialog state
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [settingPrice, setSettingPrice] = useState(false);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleStatusChange = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("shipments")
        .update({ status: newStatus })
        .eq("id", shipmentId);

      if (error) throw error;
      toast.success("Shipment status updated");
      fetchShipments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update shipment status");
    }
  };

  const handleDelete = async (shipmentId: string) => {
    if (!confirm("Are you sure you want to delete this shipment?")) return;

    try {
      const { error } = await supabase
        .from("shipments")
        .delete()
        .eq("id", shipmentId);

      if (error) throw error;
      toast.success("Shipment deleted");
      fetchShipments();
    } catch (error) {
      console.error("Error deleting shipment:", error);
      toast.error("Failed to delete shipment");
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination_city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openPriceDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setPriceInput(shipment.price?.toString() || "");
    setPriceDialogOpen(true);
  };

  const handleSetPrice = async () => {
    if (!selectedShipment) return;
    
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setSettingPrice(true);
    try {
      const { error } = await supabase
        .from("shipments")
        .update({ price })
        .eq("id", selectedShipment.id);

      if (error) throw error;
      
      toast.success("Price set successfully");
      setPriceDialogOpen(false);
      fetchShipments();
    } catch (error) {
      console.error("Error setting price:", error);
      toast.error("Failed to set price");
    } finally {
      setSettingPrice(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Shipment Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all customer shipments
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                All Shipments ({filteredShipments.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shipments..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading shipments...</p>
            ) : filteredShipments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No shipments found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-mono font-medium">
                          {shipment.tracking_number}
                        </TableCell>
                        <TableCell>
                          {shipment.origin_city}, {shipment.origin_country}
                        </TableCell>
                        <TableCell>
                          {shipment.destination_city}, {shipment.destination_country}
                        </TableCell>
                        <TableCell>{shipment.weight} kg</TableCell>
                        <TableCell className="capitalize">
                          {shipment.service_type.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          {shipment.price !== null ? (
                            <span className="font-medium">${Number(shipment.price).toFixed(2)}</span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPriceDialog(shipment)}
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Set Price
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={shipment.payment_status === "paid" ? "default" : "secondary"}
                            className={shipment.payment_status === "paid" ? "bg-green-500/20 text-green-600" : ""}
                          >
                            {shipment.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPriceDialog(shipment)}
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              {shipment.price !== null ? "Edit" : "Set"}
                            </Button>
                            <Select
                              value={shipment.status}
                              onValueChange={(value) =>
                                handleStatusChange(shipment.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(shipment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Set Price Dialog */}
        <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Shipment Price</DialogTitle>
              <DialogDescription>
                Set the price for shipment {selectedShipment?.tracking_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                  />
                </div>
              </div>
              {selectedShipment && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Route:</span> {selectedShipment.origin_city} → {selectedShipment.destination_city}</p>
                  <p><span className="text-muted-foreground">Weight:</span> {selectedShipment.weight} kg</p>
                  <p><span className="text-muted-foreground">Service:</span> {selectedShipment.service_type}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetPrice} disabled={settingPrice}>
                {settingPrice ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Set Price
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminShipments;
