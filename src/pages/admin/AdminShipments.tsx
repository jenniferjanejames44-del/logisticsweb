import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Package, Trash2, DollarSign, Loader2, MapPin, Scale, CalendarDays, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  { value: "shipment_created", label: "Shipment Created" },
  { value: "awaiting_warehouse", label: "Awaiting Warehouse Arrival" },
  { value: "received_warehouse", label: "Received at Warehouse" },
  { value: "processing", label: "Processing Shipment" },
  { value: "in_transit", label: "In Transit" },
  { value: "arrived_nigeria", label: "Arrived Nigeria" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    shipment_created: "bg-primary/10 text-primary",
    awaiting_warehouse: "bg-warning/10 text-warning",
    received_warehouse: "bg-primary/10 text-primary",
    processing: "bg-primary/10 text-primary",
    in_transit: "bg-primary/10 text-primary",
    arrived_nigeria: "bg-warning/10 text-warning",
    ready_for_pickup: "bg-warning/10 text-warning",
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
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [settingPrice, setSettingPrice] = useState(false);
  const isMobile = useIsMobile();

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from("shipments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const handleStatusChange = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("shipments").update({ status: newStatus }).eq("id", shipmentId);
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
      const { error } = await supabase.from("shipments").delete().eq("id", shipmentId);
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
    if (isNaN(price) || price < 0) { toast.error("Please enter a valid price"); return; }
    setSettingPrice(true);
    try {
      const { error } = await supabase.from("shipments").update({ price }).eq("id", selectedShipment.id);
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
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Shipment Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track and manage all customer shipments</p>
        </div>

        <Card className="border-border/50 shadow-sm shadow-primary/[0.03]">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </span>
                All Shipments ({filteredShipments.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search shipments..." className="pl-10 h-11 rounded-[10px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 h-11 rounded-[10px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading shipments...</p>
            ) : filteredShipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No shipments found</p>
              </div>
            ) : isMobile ? (
              /* Mobile Card View */
              <div className="space-y-3">
                {filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="border border-border/40 rounded-2xl p-4 space-y-3 bg-card shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-mono font-semibold text-sm text-foreground truncate">{shipment.tracking_number}</span>
                      </div>
                      <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" />Origin</p>
                        <p className="text-foreground">{shipment.origin_city}, {shipment.origin_country}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" />Destination</p>
                        <p className="text-foreground">{shipment.destination_city}, {shipment.destination_country}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3" />Weight</p>
                        <p className="text-foreground">{shipment.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><DollarSign className="w-3 h-3" />Price</p>
                        <p className="text-foreground font-semibold">
                          {shipment.price !== null ? `₦${Number(shipment.price).toFixed(2)}` : "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                      <Button variant="dashAccent" className="flex-1 h-11 rounded-[10px] shadow-sm shadow-accent/20 hover:shadow-md hover:shadow-accent/25" onClick={() => openPriceDialog(shipment)}>
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        {shipment.price !== null ? "Edit Price" : "Set Price"}
                      </Button>
                      <Select value={shipment.status} onValueChange={(v) => handleStatusChange(shipment.id, v)}>
                        <SelectTrigger className="flex-1 h-11 rounded-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-11 w-11 flex-shrink-0" onClick={() => handleDelete(shipment.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="overflow-x-auto -mx-6">
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
                        <TableCell className="font-mono font-medium">{shipment.tracking_number}</TableCell>
                        <TableCell>{shipment.origin_city}, {shipment.origin_country}</TableCell>
                        <TableCell>{shipment.destination_city}, {shipment.destination_country}</TableCell>
                        <TableCell>{shipment.weight} kg</TableCell>
                        <TableCell className="capitalize">{shipment.service_type.replace("_", " ")}</TableCell>
                        <TableCell>
                          {shipment.price !== null ? (
                            <span className="font-medium">₦{Number(shipment.price).toFixed(2)}</span>
                          ) : (
                            <Button variant="dashAccent" size="dashSm" className="rounded-[10px]" onClick={() => openPriceDialog(shipment)}>
                              <DollarSign className="w-3 h-3 mr-1" />Set Price
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={shipment.payment_status === "paid" ? "default" : "secondary"}
                            className={shipment.payment_status === "paid" ? "bg-success/10 text-success" : ""}>
                            {shipment.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge className={getStatusColor(shipment.status)}>{shipment.status.replace(/_/g, " ")}</Badge></TableCell>
                        <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="dashAccent" size="dashSm" className="rounded-[10px]" onClick={() => openPriceDialog(shipment)}>
                              <DollarSign className="w-3 h-3 mr-1" />{shipment.price !== null ? "Edit" : "Set"}
                            </Button>
                            <Select value={shipment.status} onValueChange={(v) => handleStatusChange(shipment.id, v)}>
                              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(shipment.id)}>
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Shipment Price</DialogTitle>
              <DialogDescription>Set the price for shipment {selectedShipment?.tracking_number}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" className="pl-10"
                    value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
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
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setPriceDialogOpen(false)} className="w-full sm:w-auto h-11 sm:h-12">Cancel</Button>
              <Button onClick={handleSetPrice} disabled={settingPrice} className="w-full sm:w-auto h-11 sm:h-12">
                {settingPrice ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting...</> : <><DollarSign className="w-4 h-4 mr-2" />Set Price</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminShipments;
