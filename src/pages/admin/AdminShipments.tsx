import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Package, Trash2, DollarSign, Loader2, MapPin, Scale, Ruler, Phone, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface Shipment {
  id: string;
  tracking_number: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  weight: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  service_type: string;
  status: string;
  created_at: string;
  estimated_delivery: string | null;
  price: number | null;
  payment_status: string;
  user_id: string;
  sender_name: string | null;
  sender_phone: string | null;
  sender_alt_phone: string | null;
  sender_address: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_alt_phone: string | null;
  receiver_address: string | null;
}

const formatPhoneForWhatsApp = (phone: string) => phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");

const ContactActions = ({ phone, altPhone, name, label }: { phone: string | null; altPhone: string | null; name: string | null; label: string }) => {
  if (!phone && !altPhone) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3" strokeWidth={2.5} />{label}</p>
      {name && <p className="text-foreground font-medium text-sm">{name}</p>}
      {phone && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            <Phone className="w-3 h-3" />{phone}
          </a>
          <a href={`https://wa.me/${formatPhoneForWhatsApp(phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline font-medium">
            <MessageCircle className="w-3 h-3" />WhatsApp
          </a>
        </div>
      )}
      {altPhone && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <a href={`tel:${altPhone}`} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline">
            <Phone className="w-2.5 h-2.5" />Alt: {altPhone}
          </a>
          <a href={`https://wa.me/${formatPhoneForWhatsApp(altPhone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-green-600 hover:underline">
            <MessageCircle className="w-2.5 h-2.5" />WA
          </a>
        </div>
      )}
    </div>
  );
};

const calcVolWeight = (l: number | null, w: number | null, h: number | null) => {
  if (l && w && h && l > 0 && w > 0 && h > 0) return (l * w * h) / 5000;
  return 0;
};
const calcChargeableWeight = (actual: number, l: number | null, w: number | null, h: number | null) => {
  return Math.max(actual, calcVolWeight(l, w, h));
};

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
  const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [dimInputs, setDimInputs] = useState({ weight: "", length_cm: "", width_cm: "", height_cm: "" });
  const [settingDims, setSettingDims] = useState(false);
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
      // Get current shipment data before updating
      const shipment = shipments.find(s => s.id === shipmentId);
      const oldStatus = shipment?.status || "unknown";

      const { error } = await supabase.from("shipments").update({ status: newStatus }).eq("id", shipmentId);
      if (error) throw error;
      toast.success("Shipment status updated");

      // Send status update email notification
      if (shipment) {
        try {
          // Get user profile for email
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", shipment.user_id)
            .single();

          // Get shipment notification subscribers
          const { data: subscribers } = await supabase
            .from("shipment_notifications")
            .select("email")
            .eq("tracking_number", shipment.tracking_number)
            .eq("is_active", true);

          await supabase.functions.invoke("send-notification-email", {
            body: {
              type: "shipment_status_update",
              data: {
                tracking_number: shipment.tracking_number,
                old_status: oldStatus,
                new_status: newStatus,
                user_name: profile?.full_name || "",
                user_email: profile?.email || "",
                estimated_delivery: shipment.estimated_delivery,
                subscriber_emails: (subscribers || []).map(s => s.email),
              },
            },
          });
        } catch (emailErr) {
          console.error("Failed to send status update email:", emailErr);
        }
      }

      fetchShipments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update shipment status");
    }
  };

  const handleDelete = async (shipmentId: string) => {
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

  const openDimensionDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDimInputs({
      weight: shipment.weight.toString(),
      length_cm: shipment.length_cm?.toString() || "",
      width_cm: shipment.width_cm?.toString() || "",
      height_cm: shipment.height_cm?.toString() || "",
    });
    setDimensionDialogOpen(true);
  };

  const handleSaveDimensions = async () => {
    if (!selectedShipment) return;
    const weight = parseFloat(dimInputs.weight);
    if (isNaN(weight) || weight <= 0) { toast.error("Please enter a valid weight"); return; }
    setSettingDims(true);
    try {
      const { error } = await supabase.from("shipments").update({
        weight,
        length_cm: parseFloat(dimInputs.length_cm) || null,
        width_cm: parseFloat(dimInputs.width_cm) || null,
        height_cm: parseFloat(dimInputs.height_cm) || null,
      } as any).eq("id", selectedShipment.id);
      if (error) throw error;
      toast.success("Dimensions updated successfully");
      setDimensionDialogOpen(false);
      fetchShipments();
    } catch (error) {
      console.error("Error updating dimensions:", error);
      toast.error("Failed to update dimensions");
    } finally {
      setSettingDims(false);
    }
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
    <AdminLayout title="Shipment Management" description="Track and manage all customer shipments">
      <div className="space-y-5">
        <Card className="border-border/60 bg-white shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-border/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" strokeWidth={2} />
                All Shipments ({filteredShipments.length})
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative sm:w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
                  <Input
                    placeholder="Search by tracking number, city..."
                    className="h-9 rounded-lg border-border/80 bg-muted/30 pl-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-muted/30 text-sm sm:w-44">
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
          <CardContent className="p-3 sm:p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-3 rounded-lg border border-border bg-card p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                      <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-lg bg-muted" />
                      <div className="h-12 rounded-lg bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No shipments found</p>
              </div>
            ) : isMobile ? (
              /* Mobile Card View */
              <div className="space-y-3">
                {filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="space-y-3 rounded-xl border border-border/70 bg-white/95 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-primary/20 hover:shadow-[0_16px_32px_rgba(15,23,42,0.07)]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shadow-sm">
                          <Package className="w-4 h-4 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-base text-foreground truncate block">{shipment.tracking_number}</span>
                          <span className="text-xs text-muted-foreground">{new Date(shipment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(shipment.status)} font-semibold capitalize`}>{shipment.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={2.5} />Origin</p>
                        <p className="text-foreground font-medium">{shipment.origin_city}, {shipment.origin_country}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={2.5} />Destination</p>
                        <p className="text-foreground font-medium">{shipment.destination_city}, {shipment.destination_country}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3" strokeWidth={2.5} />Weight</p>
                        <p className="text-foreground font-medium">{shipment.weight} kg</p>
                        {calcVolWeight(shipment.length_cm, shipment.width_cm, shipment.height_cm) > 0 && (
                          <p className="text-[10px] text-muted-foreground">Vol: {calcVolWeight(shipment.length_cm, shipment.width_cm, shipment.height_cm).toFixed(2)} kg | Chg: {calcChargeableWeight(shipment.weight, shipment.length_cm, shipment.width_cm, shipment.height_cm).toFixed(2)} kg</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Ruler className="w-3 h-3" strokeWidth={2.5} />Dimensions</p>
                        <p className="text-foreground font-medium">
                          {shipment.length_cm && shipment.width_cm && shipment.height_cm
                            ? `${shipment.length_cm}×${shipment.width_cm}×${shipment.height_cm} cm`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    {/* Contact Details */}
                    {(shipment.sender_phone || shipment.receiver_phone) && (
                      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/[0.18] p-4">
                        <ContactActions phone={shipment.sender_phone} altPhone={shipment.sender_alt_phone} name={shipment.sender_name} label="Sender" />
                        <ContactActions phone={shipment.receiver_phone} altPhone={shipment.receiver_alt_phone} name={shipment.receiver_name} label="Receiver" />
                      </div>
                    )}
                    <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><DollarSign className="w-3 h-3" strokeWidth={2.5} />Price</p>
                      <p className={`font-bold text-lg mt-1 ${shipment.price !== null ? "text-primary" : "text-muted-foreground"}`}>
                        {shipment.price !== null ? `$${Number(shipment.price).toLocaleString()}` : "Not set"}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-2 border-t border-border/50">
                      <Button
                        variant="dashAccent"
                        className="h-11 flex-1 rounded-lg font-semibold transition-all duration-200"
                        onClick={() => openPriceDialog(shipment)}
                      >
                        <DollarSign className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                        {shipment.price !== null ? "Edit Price" : "Set Price"}
                      </Button>
                      <Button
                        variant="dashOutline"
                        className="h-11 flex-1 rounded-lg font-semibold transition-all duration-200"
                        onClick={() => openDimensionDialog(shipment)}
                      >
                        <Ruler className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                        Edit Dims
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={shipment.status} onValueChange={(v) => handleStatusChange(shipment.id, v)}>
                        <SelectTrigger className="h-11 flex-1 rounded-xl border-border/80 bg-white font-medium shadow-[0_6px_16px_rgba(15,23,42,0.04)] transition-colors hover:border-primary/35"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <DeleteConfirmDialog
                        title="Delete Shipment"
                        description={`Are you sure you want to delete shipment ${shipment.tracking_number}? This action cannot be undone.`}
                        onConfirm={() => handleDelete(shipment.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredShipments.map((shipment) => (
                  <Card key={shipment.id} className="border-border/70 bg-white/95 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-primary/20 hover:shadow-[0_18px_38px_rgba(15,23,42,0.07)]">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shadow-sm">
                            <Package className="w-5 h-5 text-primary" strokeWidth={2.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono font-bold text-base text-foreground truncate">{shipment.tracking_number}</p>
                            <p className="text-xs text-muted-foreground">{new Date(shipment.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(shipment.status)} font-semibold capitalize`}>{shipment.status.replace(/_/g, " ")}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={2.5} />Origin</p>
                          <p className="text-foreground font-medium mt-1">{shipment.origin_city}, {shipment.origin_country}</p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={2.5} />Destination</p>
                          <p className="text-foreground font-medium mt-1">{shipment.destination_city}, {shipment.destination_country}</p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Scale className="w-3 h-3" strokeWidth={2.5} />Weight</p>
                          <p className="text-foreground font-medium mt-1">{shipment.weight} kg</p>
                          {calcVolWeight(shipment.length_cm, shipment.width_cm, shipment.height_cm) > 0 && (
                            <p className="text-[10px] text-muted-foreground">Vol: {calcVolWeight(shipment.length_cm, shipment.width_cm, shipment.height_cm).toFixed(2)} kg | Chg: {calcChargeableWeight(shipment.weight, shipment.length_cm, shipment.width_cm, shipment.height_cm).toFixed(2)} kg</p>
                          )}
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Ruler className="w-3 h-3" strokeWidth={2.5} />Dimensions</p>
                          <p className="text-foreground font-medium mt-1">
                            {shipment.length_cm && shipment.width_cm && shipment.height_cm
                              ? `${shipment.length_cm}×${shipment.width_cm}×${shipment.height_cm} cm`
                              : "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/[0.18] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><DollarSign className="w-3 h-3" strokeWidth={2.5} />Price</p>
                          <p className={`font-bold text-lg mt-1 ${shipment.price !== null ? "text-primary" : "text-muted-foreground"}`}>
                            {shipment.price !== null ? `$${Number(shipment.price).toLocaleString()}` : "Not set"}
                          </p>
                        </div>
                      </div>

                      {/* Contact Details */}
                      {(shipment.sender_phone || shipment.receiver_phone) && (
                        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/70 bg-muted/[0.18] p-4">
                          <ContactActions phone={shipment.sender_phone} altPhone={shipment.sender_alt_phone} name={shipment.sender_name} label="Sender" />
                          <ContactActions phone={shipment.receiver_phone} altPhone={shipment.receiver_alt_phone} name={shipment.receiver_name} label="Receiver" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                        <Button
                          variant="dashAccent"
                          size="dashSm"
                          className="h-11 rounded-lg px-4 font-semibold transition-all duration-200"
                          onClick={() => openPriceDialog(shipment)}
                        >
                          <DollarSign className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                          {shipment.price !== null ? "Edit Price" : "Set Price"}
                        </Button>
                        <Button
                          variant="dashOutline"
                          size="dashSm"
                          className="h-11 rounded-lg px-4 font-semibold transition-all duration-200"
                          onClick={() => openDimensionDialog(shipment)}
                        >
                          <Ruler className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                          Edit Dims
                        </Button>
                        <Select value={shipment.status} onValueChange={(v) => handleStatusChange(shipment.id, v)}>
                          <SelectTrigger className="h-11 flex-1 rounded-xl border-border/80 bg-white font-medium shadow-[0_6px_16px_rgba(15,23,42,0.04)] transition-colors hover:border-primary/35"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <DeleteConfirmDialog
                          title="Delete Shipment"
                          description={`Are you sure you want to delete shipment ${shipment.tracking_number}? This action cannot be undone.`}
                          onConfirm={() => handleDelete(shipment.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Set Price Dialog */}
        <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border border-border/70 bg-white/95 p-0 backdrop-blur-sm">
            <DialogHeader className="border-b border-border/60 px-6 py-6 pr-16">
              <DialogTitle className="text-foreground">Set Shipment Price</DialogTitle>
              <DialogDescription>Set the price for shipment {selectedShipment?.tracking_number}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" className="h-11 rounded-xl border-border/80 bg-white pl-10 shadow-[0_6px_16px_rgba(15,23,42,0.04)]"
                    value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
                </div>
              </div>
              {selectedShipment && (
                <div className="space-y-1 rounded-xl border border-border/70 bg-muted/[0.18] p-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <p><span className="text-muted-foreground">Route:</span> {selectedShipment.origin_city} → {selectedShipment.destination_city}</p>
                  <p><span className="text-muted-foreground">Weight:</span> {selectedShipment.weight} kg</p>
                  <p><span className="text-muted-foreground">Service:</span> {selectedShipment.service_type}</p>
                </div>
              )}
            </div>
            <DialogFooter className="border-t border-border/60 px-6 py-5">
              <Button variant="outline" onClick={() => setPriceDialogOpen(false)} className="h-11 w-full rounded-xl sm:w-auto">Cancel</Button>
              <Button onClick={handleSetPrice} disabled={settingPrice} className="h-11 w-full rounded-xl sm:w-auto">
                {settingPrice ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting...</> : <><DollarSign className="w-4 h-4 mr-2" />Set Price</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Dimensions Dialog */}
        <Dialog open={dimensionDialogOpen} onOpenChange={setDimensionDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border border-border/70 bg-white/95 p-0 backdrop-blur-sm">
            <DialogHeader className="border-b border-border/60 px-6 py-6 pr-16">
              <DialogTitle className="text-foreground">Edit Dimensions</DialogTitle>
              <DialogDescription>Update dimensions for {selectedShipment?.tracking_number}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Weight (kg) *</Label>
                  <Input type="number" min="0.1" step="0.1" className="h-11 rounded-xl border-border/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]" value={dimInputs.weight} onChange={(e) => setDimInputs(p => ({ ...p, weight: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Length (cm)</Label>
                  <Input type="number" min="0" step="0.1" className="h-11 rounded-xl border-border/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]" value={dimInputs.length_cm} onChange={(e) => setDimInputs(p => ({ ...p, length_cm: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Width (cm)</Label>
                  <Input type="number" min="0" step="0.1" className="h-11 rounded-xl border-border/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]" value={dimInputs.width_cm} onChange={(e) => setDimInputs(p => ({ ...p, width_cm: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" min="0" step="0.1" className="h-11 rounded-xl border-border/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]" value={dimInputs.height_cm} onChange={(e) => setDimInputs(p => ({ ...p, height_cm: e.target.value }))} />
                </div>
              </div>
              {(() => {
                const l = parseFloat(dimInputs.length_cm);
                const w = parseFloat(dimInputs.width_cm);
                const h = parseFloat(dimInputs.height_cm);
                const wt = parseFloat(dimInputs.weight);
                const vol = (l > 0 && w > 0 && h > 0) ? (l * w * h) / 5000 : 0;
                const chg = Math.max(wt || 0, vol);
                if (vol > 0) return (
                  <div className="space-y-1 rounded-xl border border-border/70 bg-muted/[0.18] p-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <p><span className="text-muted-foreground">Actual Weight:</span> {(wt || 0).toFixed(2)} kg</p>
                    <p><span className="text-muted-foreground">Volumetric Weight:</span> {vol.toFixed(2)} kg</p>
                    <p className="font-semibold"><span className="text-muted-foreground">Chargeable Weight:</span> {chg.toFixed(2)} kg</p>
                  </div>
                );
                return null;
              })()}
            </div>
            <DialogFooter className="border-t border-border/60 px-6 py-5">
              <Button variant="outline" onClick={() => setDimensionDialogOpen(false)} className="h-11 w-full rounded-xl sm:w-auto">Cancel</Button>
              <Button onClick={handleSaveDimensions} disabled={settingDims} className="h-11 w-full rounded-xl sm:w-auto">
                {settingDims ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Ruler className="w-4 h-4 mr-2" />Save Dimensions</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminShipments;
