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

  // Auto-open payment dialog if ?pay=shipmentId is in URL
  useEffect(() => {
    const payId = searchParams.get("pay");
    if (payId && shipments.length > 0) {
      const shipment = shipments.find((s) => s.id === payId);
      if (shipment && shipment.payment_status !== "paid") {
        setSelectedShipment(shipment);
        setPaymentDialogOpen(true);
        // Clear the param
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
    <DashboardLayout title="Shipments" description="Manage and track all your shipments">
      {/* Balance Card */}
      <Card className="mb-5 sm:mb-7 border-primary/15 bg-gradient-to-br from-primary/[0.07] via-primary/[0.03] to-transparent shadow-sm">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/15 to-primary/8 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border border-primary/10">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">Wallet Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-0.5">₦{balance.toFixed(2)}</p>
            </div>
          </div>
          <Button variant="dashOutline" size="dashSm" className="w-full sm:w-auto hover:bg-primary/5 hover:border-primary/40 transition-all duration-200" onClick={() => window.location.href = "/dashboard/wallet"}>
            Manage Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
          <Input
            placeholder="Search tracking or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-12 text-sm rounded-xl border-border/60 hover:border-primary/40 focus:border-primary transition-colors"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl border-border/60 hover:border-primary/40 font-medium transition-colors">
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

        <Button variant="dashAccent" size="dash" className="w-full sm:w-auto shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all duration-200" asChild>
          <a href="/shipping">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Shipment
          </a>
        </Button>
      </div>

      {/* Shipments List — Improved card layout */}
      {filteredShipments.length > 0 ? (
        <div className="grid gap-4">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="border-border transition-all duration-200 hover:border-border/80 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left side */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 shadow-sm">
                      <Package className="w-5 h-5 text-primary" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">{shipment.tracking_number || "Pending"}</h3>
                        <StatusBadge status={shipment.status} size="md" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {shipment.origin_country} → {shipment.destination_country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 flex-shrink-0" />
                          {shipment.weight} KG
                        </span>
                        {shipment.estimated_delivery && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            Est: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(shipment.created_at).toLocaleDateString()}
                        <span className="ml-2 capitalize">{shipment.service_type.replace("-", " ")}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right side — price + action */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 lg:gap-2 flex-shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-border/30 lg:min-w-[160px]">
                    {shipment.price !== null ? (
                      <p className="text-base sm:text-lg font-bold text-foreground">
                        {shipment.invoices?.[0]
                          ? formatConverted(Number(shipment.invoices[0].amount), shipment.invoices[0].currency || "USD")
                          : formatUsd(Number(shipment.price))}
                      </p>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Price Pending</Badge>
                    )}
                    {shipment.price !== null && (
                      shipment.payment_status === "paid" ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          Paid
                        </Badge>
                      ) : (
                        <Button
                          variant="dashAccent"
                          size="dashSm"
                          onClick={() => openPaymentDialog(shipment)}
                        >
                          <DollarSign className="w-4 h-4" />
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
              ? {
                  label: "Create Shipment",
                  href: "/shipping",
                }
              : undefined
          }
        />
      )}

      {/* Payment Dialog */}
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
