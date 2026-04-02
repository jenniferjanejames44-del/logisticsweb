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
  Package, Plus, Search, Truck, Clock, CheckCircle, AlertCircle,
  MapPin, Calendar, DollarSign, Wallet,
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
  invoices?: {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string | null;
    status: string;
  }[] | null;
}

const Shipments = () => {
  const { user } = useAuth();
  const { formatConverted, formatUsd } = useCurrency();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
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
        <Button variant="default" size="sm" asChild className="h-9 text-[13px]">
          <a href="/shipping">
            <Plus className="w-3.5 h-3.5" />
            New Shipment
          </a>
        </Button>
      }
    >
      {/* Wallet Balance Bar */}
      <Card className="mb-5 bg-primary border-0">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Wallet Balance</p>
              <p className="text-lg font-bold text-white sm:text-xl">{formatConverted(balance, "NGN")}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/15 text-white border-0 hover:bg-white/25 h-8 text-[12px]"
            onClick={() => window.location.href = "/dashboard/wallet"}
          >
            Manage Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 text-[13px] border-border/60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 text-[13px] border-border/60">
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
        <div className="grid gap-2.5">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="border-border/50 transition-all duration-200 hover:shadow-sm hover:border-border">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/6">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[13px] font-semibold text-foreground">{shipment.tracking_number || "Pending"}</h3>
                        <StatusBadge status={shipment.status} size="md" />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shipment.origin_country} → {shipment.destination_country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {shipment.weight} KG
                        </span>
                        {shipment.estimated_delivery && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Est: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground/70">
                        Created {new Date(shipment.created_at).toLocaleDateString()}
                        <span className="ml-2 capitalize">{shipment.service_type.replace("-", " ")}</span>
                      </p>
                    </div>
                  </div>

                  {/* Price + Action */}
                  <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:gap-1.5 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/30 lg:min-w-[140px]">
                    {shipment.price !== null ? (
                      <p className="text-sm font-bold text-foreground">
                        {shipment.invoices?.[0]
                          ? formatConverted(Number(shipment.invoices[0].amount), shipment.invoices[0].currency || "USD")
                          : formatUsd(Number(shipment.price))}
                      </p>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Price Pending</Badge>
                    )}
                    {shipment.price !== null && (
                      shipment.payment_status === "paid" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[10px]">Paid</Badge>
                      ) : (
                        <Button variant="default" size="sm" onClick={() => openPaymentDialog(shipment)} className="h-7 text-[11px] px-3">
                          <DollarSign className="w-3 h-3" />
                          Pay Now
                        </Button>
                      )
                    )}
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
              ? { label: "Create Shipment", href: "/shipping" }
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
        />
      )}
    </DashboardLayout>
  );
};

export default Shipments;
