import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
}

const Shipments = () => {
  const { user } = useAuth();
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
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Failed to fetch shipments", variant: "destructive" });
    } else {
      setShipments(data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      shipment_created: { variant: "secondary", icon: Package },
      awaiting_warehouse: { variant: "secondary", icon: Clock },
      received_warehouse: { variant: "default", icon: Package },
      processing: { variant: "default", icon: Clock },
      in_transit: { variant: "default", icon: Truck },
      arrived_nigeria: { variant: "secondary", icon: MapPin },
      ready_for_pickup: { variant: "outline", icon: CheckCircle },
      delivered: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.shipment_created;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1 capitalize">
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
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
      <Card className="mb-4 sm:mb-6 border-border/50 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Wallet Balance</p>
              <p className="text-lg sm:text-xl font-bold text-foreground">₦{balance.toFixed(2)}</p>
            </div>
          </div>
          <Button variant="dashOutline" size="dashSm" className="w-full sm:w-auto" onClick={() => window.location.href = "/dashboard/wallet"}>
            Manage Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-12 text-sm rounded-[10px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-[10px]">
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

        <Button variant="dashAccent" size="dash" className="w-full sm:w-auto" asChild>
          <a href="/shipping">
            <Plus className="w-4 h-4" />
            New Shipment
          </a>
        </Button>
      </div>

      {/* Shipments List — Improved card layout */}
      {filteredShipments.length > 0 ? (
        <div className="grid gap-3 sm:gap-4">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left side */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">{shipment.tracking_number || "Pending"}</h3>
                        {getStatusBadge(shipment.status)}
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
                      <p className="text-base sm:text-lg font-bold text-foreground">₦{Number(shipment.price).toFixed(2)}</p>
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
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Shipments Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first shipment to get started"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button variant="dashAccent" size="dash" asChild>
                <a href="/shipping">
                  <Plus className="w-5 h-5" />
                  Create Shipment
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      {selectedShipment && selectedShipment.price !== null && (
        <PayShipmentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          shipmentId={selectedShipment.id}
          trackingNumber={selectedShipment.tracking_number}
          price={Number(selectedShipment.price)}
          userBalance={balance}
          userId={user?.id || ""}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default Shipments;
