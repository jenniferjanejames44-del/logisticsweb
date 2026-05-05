import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateShipmentPrice, getPendingShipment, clearPendingShipment } from "@/lib/pricing";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ShipmentsListSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import PayShipmentDialog from "@/components/shipments/PayShipmentDialog";
import StatusBadge from "@/components/shipments/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import {
  Package, Plus, Search,
  MapPin, Calendar, DollarSign, Wallet, Phone, MessageCircle, Eye, Pencil,
} from "lucide-react";

interface Shipment {
  id: string;
  tracking_number: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  weight: number;
  service_type: string;
  status: string;
  estimated_delivery: string | null;
  description: string | null;
  created_at: string;
  price: number | null;
  payment_status: string;
  sender_name: string | null;
  sender_phone: string | null;
  sender_alt_phone: string | null;
  sender_address: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_alt_phone: string | null;
  receiver_address: string | null;
  invoices?: {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string | null;
    status: string;
  }[] | null;
}

const formatPhoneWA = (phone: string) => phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");

const Shipments = () => {
  const { user } = useAuth();
  const { formatConverted, formatUsd } = useCurrency();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  // navigation handled via anchors / window.location for simplicity
  const { balance, refetch: refetchBalance } = useWalletBalance(user?.id);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    const payId = searchParams.get("pay");
    if (payId && shipments.length > 0) {
      const shipment = shipments.find((s) => s.id === payId);
      if (shipment && shipment.payment_status !== "paid") {
        setSelectedShipment(shipment);
        setPaymentDialogOpen(true);
        searchParams.delete("pay");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [shipments, searchParams]);

  useEffect(() => {
    if (user) {
      const createPendingShipment = async () => {
        const pending = getPendingShipment();
        if (pending && pending.origin_country && pending.service_type && pending.weight) {
          clearPendingShipment();
          const estimatedDays = pending.service_type.includes("express") ? 3 :
            pending.service_type.includes("ocean") ? 25 : 7;
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);
          const calculatedPrice = await calculateShipmentPrice(pending.service_type, parseFloat(pending.weight));
          const { error } = await supabase.from("shipments").insert({
            user_id: user.id,
            origin_country: pending.origin_country,
            origin_city: pending.origin_city,
            destination_country: pending.destination_country,
            destination_city: pending.destination_city,
            weight: parseFloat(pending.weight),
            service_type: pending.service_type,
            description: pending.description || null,
            status: "shipment_created",
            estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
            tracking_number: "",
            price: calculatedPrice,
          });
          if (!error) {
            toast({ title: "Shipment Created!", description: "Your saved shipment has been created." });
          }
        }
        fetchShipments();
      };
      createPendingShipment();
    }
  }, [user]);

  const fetchShipments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("shipments")
      .select("*, invoices(id, invoice_number, amount, currency, status)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Failed to fetch shipments", variant: "destructive" });
    } else {
      setShipments(data || []);
    }
    setLoading(false);
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch = shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination_country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openPaymentDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchShipments();
    refetchBalance();
  };

  if (loading) {
    return (
      <DashboardLayout title="Shipments" description="Manage and track all your shipments">
        <ShipmentsListSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Shipments"
      description="Manage and track all your shipments"
      action={
        <Button asChild className="h-11 sm:h-12 px-4 sm:px-5 text-sm font-semibold bg-accent hover:bg-accent/90 text-white rounded-lg">
          <a href="/dashboard/shipments/new">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Shipment</span>
            <span className="sm:hidden">New</span>
          </a>
        </Button>
      }
    >
      {/* Wallet Balance Bar */}
      <Card className="mb-6 bg-primary border-0 rounded-xl">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-white/60 uppercase tracking-wide">Wallet Balance</p>
              <p className="mt-0.5 text-xl font-bold text-white sm:text-2xl">{formatConverted(balance, "NGN")}</p>
            </div>
          </div>
          <Button
            className="bg-white text-primary hover:bg-white/90 border-0 h-10 px-4 text-sm font-semibold rounded-lg"
            onClick={() => window.location.href = "/dashboard/wallet"}
          >
            Manage Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 text-sm border-border/60 rounded-lg"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 text-sm border-border/60 rounded-lg">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="shipment_created">Shipment Created</SelectItem>
            <SelectItem value="awaiting_warehouse">Awaiting Warehouse</SelectItem>
            <SelectItem value="received_warehouse">Received at Warehouse</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="arrived_nigeria">Arrived Nigeria</SelectItem>
            <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shipments List */}
      {filteredShipments.length > 0 ? (
        <div className="grid gap-3">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="rounded-xl border-border/60 transition-all duration-200 hover:shadow-md hover:border-accent/30">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/8">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{shipment.tracking_number || "Pending"}</h3>
                        <StatusBadge status={shipment.status} size="md" />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {shipment.origin_country} → {shipment.destination_country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {shipment.weight} KG
                        </span>
                        {shipment.estimated_delivery && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Est: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {/* Contact summary */}
                      {(shipment.sender_phone || shipment.receiver_phone) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          {shipment.sender_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              Sender: <a href={`tel:${shipment.sender_phone}`} className="text-primary hover:underline">{shipment.sender_phone}</a>
                              <a href={`https://wa.me/${formatPhoneWA(shipment.sender_phone)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline ml-1"><MessageCircle className="w-3.5 h-3.5 inline" /></a>
                            </span>
                          )}
                          {shipment.receiver_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              Receiver: <a href={`tel:${shipment.receiver_phone}`} className="text-primary hover:underline">{shipment.receiver_phone}</a>
                              <a href={`https://wa.me/${formatPhoneWA(shipment.receiver_phone)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline ml-1"><MessageCircle className="w-3.5 h-3.5 inline" /></a>
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground/80">
                        Created {new Date(shipment.created_at).toLocaleDateString()}
                        <span className="ml-2 capitalize">{shipment.service_type.replace("-", " ")}</span>
                      </p>
                    </div>
                  </div>

                  {/* Price + Action */}
                  <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:gap-2 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/40 lg:min-w-[150px]">
                    {shipment.price !== null ? (
                      <p className="text-base font-bold text-foreground">
                        {shipment.invoices?.[0]
                          ? formatConverted(Number(shipment.invoices[0].amount), shipment.invoices[0].currency || "USD")
                          : formatUsd(Number(shipment.price))}
                      </p>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">Price Pending</Badge>
                    )}
                    {shipment.price !== null && (
                      shipment.payment_status === "paid" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-2.5 py-1">Paid</Badge>
                      ) : (
                        <Button
                          onClick={() => openPaymentDialog(shipment)}
                          className="h-11 px-4 text-sm bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold"
                        >
                          <DollarSign className="w-4 h-4" />
                          Pay Now
                        </Button>
                      )
                    )}
                    <div className="flex gap-2 w-full lg:w-auto lg:justify-end">
                      <Button asChild variant="outline" className="h-10 px-3 text-xs flex-1 lg:flex-none rounded-lg">
                        <a href={`/dashboard/shipments/${shipment.id}`}>
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      </Button>
                      {["unpaid","pending"].includes(shipment.payment_status) &&
                       ["draft","pending","shipment_created","awaiting_warehouse"].includes(shipment.status) && (
                        <Button asChild variant="outline" className="h-10 px-3 text-xs flex-1 lg:flex-none rounded-lg">
                          <a href={`/dashboard/shipments/${shipment.id}?edit=1`}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No Shipments Found"
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Create your first shipment to start tracking your deliveries and managing your logistics."
          }
          action={
            !searchQuery && statusFilter === "all"
              ? { label: "Create Shipment", href: "/dashboard/shipments/new" }
              : undefined
          }
        />
      )}

      {selectedShipment && selectedShipment.price !== null && (
        <PayShipmentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          shipmentId={selectedShipment.id}
          invoiceId={selectedShipment.invoices?.[0]?.id}
          invoiceNumber={selectedShipment.invoices?.[0]?.invoice_number}
          trackingNumber={selectedShipment.tracking_number}
          price={Number(selectedShipment.invoices?.[0]?.amount ?? selectedShipment.price)}
          priceCurrency={selectedShipment.invoices?.[0]?.currency ?? "USD"}
          userBalance={balance}
          userId={user?.id || ""}
          onSuccess={handlePaymentSuccess}
          serviceType={selectedShipment.service_type}
          destination={selectedShipment.destination_country}
          weight={selectedShipment.weight}
        />
      )}
    </DashboardLayout>
  );
};

export default Shipments;
