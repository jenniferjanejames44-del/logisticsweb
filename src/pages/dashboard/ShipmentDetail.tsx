import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/shipments/StatusBadge";
import PayShipmentDialog from "@/components/shipments/PayShipmentDialog";
import { useToast } from "@/hooks/use-toast";
import { calculateShippingCost } from "@/lib/pricingEngine";
import {
  ArrowLeft, Pencil, Save, X, DollarSign, MapPin, Package,
  Truck, User, Phone, Mail, Warehouse, FileText, Calendar, Lock,
} from "lucide-react";

type Shipment = {
  id: string;
  user_id: string;
  tracking_number: string;
  service_type: string;
  status: string;
  payment_status: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  weight: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  description: string | null;
  warehouse_location: string | null;
  sender_name: string | null;
  sender_phone: string | null;
  sender_alt_phone: string | null;
  sender_address: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  receiver_alt_phone: string | null;
  receiver_address: string | null;
  price: number | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  invoices?: { id: string; invoice_number: string; amount: number; currency: string | null; status: string }[] | null;
};

const NV = ({ v }: { v?: string | number | null }) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-muted-foreground italic">Not provided</span>
  ) : (
    <span className="text-foreground">{v}</span>
  );

const Row = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) => (
  <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
    {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3">
      <div className="text-xs font-medium text-muted-foreground sm:col-span-1">{label}</div>
      <div className="text-sm sm:col-span-2 break-words">{value}</div>
    </div>
  </div>
);

const isExportShipment = (s: Shipment) =>
  (s.origin_country || "").toLowerCase() === "nigeria";

const canEditShipment = (s: Shipment) => {
  const editableStatuses = ["draft", "pending", "shipment_created", "awaiting_warehouse"];
  const editablePayment = ["unpaid", "pending"];
  return editableStatuses.includes(s.status) && editablePayment.includes(s.payment_status);
};

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { formatConverted, formatUsd } = useCurrency();
  const { balance, refetch: refetchBalance } = useWalletBalance(user?.id);
  const { toast } = useToast();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [form, setForm] = useState<Partial<Shipment>>({});

  const load = async () => {
    if (!user || !id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("shipments")
      .select("*, invoices(id, invoice_number, amount, currency, status)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Shipment not found", variant: "destructive" });
      navigate("/dashboard/shipments");
      return;
    }
    setShipment(data as Shipment);
    setForm(data as Shipment);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user?.id]);

  useEffect(() => {
    if (shipment && searchParams.get("edit") === "1" && canEditShipment(shipment)) {
      setEditing(true);
    }
  }, [shipment, searchParams]);

  const editable = useMemo(() => (shipment ? canEditShipment(shipment) : false), [shipment]);

  const startEdit = () => {
    if (!shipment) return;
    if (!editable) {
      toast({
        title: "Cannot edit",
        description: "This shipment can no longer be edited because it has already been processed or paid for.",
        variant: "destructive",
      });
      return;
    }
    setForm(shipment);
    setEditing(true);
  };

  const cancelEdit = () => {
    if (shipment) setForm(shipment);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!shipment || !user) return;
    setSaving(true);
    try {
      const weight = Number(form.weight ?? shipment.weight) || shipment.weight;
      let newPrice = shipment.price;
      try {
        const breakdown = await calculateShippingCost(
          form.destination_country || shipment.destination_country,
          weight,
          [],
          0,
        );
        newPrice = breakdown.total;
      } catch {
        // keep existing price if pricing rule not available
      }

      const update = {
        sender_name: form.sender_name ?? null,
        sender_phone: form.sender_phone ?? null,
        sender_alt_phone: form.sender_alt_phone ?? null,
        sender_address: form.sender_address ?? null,
        receiver_name: form.receiver_name ?? null,
        receiver_phone: form.receiver_phone ?? null,
        receiver_alt_phone: form.receiver_alt_phone ?? null,
        receiver_address: form.receiver_address ?? null,
        description: form.description ?? null,
        weight,
        length_cm: form.length_cm ? Number(form.length_cm) : null,
        width_cm: form.width_cm ? Number(form.width_cm) : null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        warehouse_location: isExportShipment(shipment) ? null : (form.warehouse_location ?? null),
        price: newPrice,
      };

      const { error } = await supabase
        .from("shipments")
        .update(update)
        .eq("id", shipment.id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Shipment updated successfully" });
      setEditing(false);
      await load();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Could not update shipment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !shipment) {
    return (
      <DashboardLayout title="Shipment Details">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const isExport = isExportShipment(shipment);
  const invoice = shipment.invoices?.[0];
  const displayPrice = invoice
    ? formatConverted(Number(invoice.amount), invoice.currency || "USD")
    : shipment.price !== null
    ? formatUsd(Number(shipment.price))
    : "—";

  const setF = (k: keyof Shipment, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <DashboardLayout
      title={shipment.tracking_number || "Shipment"}
      description={`${isExport ? "Export" : "Import"} • ${shipment.origin_country} → ${shipment.destination_country}`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/shipments")} className="h-10 sm:h-11">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {!editing && editable && (
            <Button onClick={startEdit} className="h-10 sm:h-11 bg-primary text-white hover:bg-primary/90">
              <Pencil className="w-4 h-4" /> Edit Shipment
            </Button>
          )}
          {!editing && shipment.payment_status !== "paid" && shipment.price !== null && (
            <Button onClick={() => setPayOpen(true)} className="h-10 sm:h-11 bg-accent text-white hover:bg-accent/90">
              <DollarSign className="w-4 h-4" /> Pay Now
            </Button>
          )}
        </div>
      }
    >
      {!editable && !editing && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-900">
              This shipment can no longer be edited because it has already been processed or paid for.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Overview */}
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">{isExport ? "Export" : "Import"}</Badge>
                <Badge variant="outline" className="text-xs">{isExport ? "From Nigeria" : "To Nigeria"}</Badge>
                <StatusBadge status={shipment.status} />
                {shipment.payment_status === "paid" ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Unpaid</Badge>
                )}
              </div>
              <Row label="Shipment ID" value={<NV v={shipment.id} />} icon={FileText} />
              <Row label="Tracking ID" value={<NV v={shipment.tracking_number} />} icon={Truck} />
              <Row label="Service" value={<NV v={shipment.service_type} />} icon={Package} />
              <Row label="Created" value={<NV v={new Date(shipment.created_at).toLocaleString()} />} icon={Calendar} />
              {shipment.estimated_delivery && (
                <Row label="Estimated delivery" value={new Date(shipment.estimated_delivery).toLocaleDateString()} icon={Calendar} />
              )}
            </CardContent>
          </Card>

          {/* Sender */}
          <Card>
            <CardContent className="p-5 sm:p-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Sender Details</h3>
              {editing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" value={form.sender_name} onChange={(v) => setF("sender_name", v)} />
                  <Field label="Phone" value={form.sender_phone} onChange={(v) => setF("sender_phone", v)} />
                  <Field label="Alt Phone" value={form.sender_alt_phone} onChange={(v) => setF("sender_alt_phone", v)} />
                  <Field label="Address" value={form.sender_address} onChange={(v) => setF("sender_address", v)} className="sm:col-span-2" />
                </div>
              ) : (
                <div>
                  <Row label="Name" value={<NV v={shipment.sender_name} />} />
                  <Row label="Phone" value={<NV v={shipment.sender_phone} />} icon={Phone} />
                  <Row label="Alt Phone" value={<NV v={shipment.sender_alt_phone} />} icon={Phone} />
                  <Row label="Country" value={<NV v={shipment.origin_country} />} icon={MapPin} />
                  <Row label="City" value={<NV v={shipment.origin_city} />} />
                  <Row label="Address" value={<NV v={shipment.sender_address} />} icon={MapPin} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receiver */}
          <Card>
            <CardContent className="p-5 sm:p-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Receiver Details</h3>
              {editing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" value={form.receiver_name} onChange={(v) => setF("receiver_name", v)} />
                  <Field label="Phone" value={form.receiver_phone} onChange={(v) => setF("receiver_phone", v)} />
                  <Field label="Alt Phone" value={form.receiver_alt_phone} onChange={(v) => setF("receiver_alt_phone", v)} />
                  <Field label="Address" value={form.receiver_address} onChange={(v) => setF("receiver_address", v)} className="sm:col-span-2" />
                </div>
              ) : (
                <div>
                  <Row label="Name" value={<NV v={shipment.receiver_name} />} />
                  <Row label="Phone" value={<NV v={shipment.receiver_phone} />} icon={Phone} />
                  <Row label="Alt Phone" value={<NV v={shipment.receiver_alt_phone} />} icon={Phone} />
                  <Row label="Country" value={<NV v={shipment.destination_country} />} icon={MapPin} />
                  <Row label="City" value={<NV v={shipment.destination_city} />} />
                  <Row label="Address" value={<NV v={shipment.receiver_address} />} icon={MapPin} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package */}
          <Card>
            <CardContent className="p-5 sm:p-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Package Details</h3>
              {editing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Description" value={form.description} onChange={(v) => setF("description", v)} className="sm:col-span-2" textarea />
                  <Field label="Weight (kg)" type="number" value={form.weight as any} onChange={(v) => setF("weight", v)} />
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    <Field label="L (cm)" type="number" value={form.length_cm as any} onChange={(v) => setF("length_cm", v)} />
                    <Field label="W (cm)" type="number" value={form.width_cm as any} onChange={(v) => setF("width_cm", v)} />
                    <Field label="H (cm)" type="number" value={form.height_cm as any} onChange={(v) => setF("height_cm", v)} />
                  </div>
                </div>
              ) : (
                <div>
                  <Row label="Description" value={<NV v={shipment.description} />} />
                  <Row label="Weight" value={`${shipment.weight} kg`} />
                  <Row label="Dimensions" value={
                    shipment.length_cm || shipment.width_cm || shipment.height_cm
                      ? `${shipment.length_cm || "?"} × ${shipment.width_cm || "?"} × ${shipment.height_cm || "?"} cm`
                      : <NV />
                  } />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warehouse - import only */}
          {!isExport && (
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Warehouse className="w-4 h-4" /> Warehouse</h3>
                {editing ? (
                  <Field label="Warehouse" value={form.warehouse_location} onChange={(v) => setF("warehouse_location", v)} />
                ) : (
                  <Row label="Warehouse" value={<NV v={shipment.warehouse_location} />} />
                )}
              </CardContent>
            </Card>
          )}

          {editing && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={cancelEdit} disabled={saving} className="h-11">
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="h-11 bg-primary text-white hover:bg-primary/90">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar - pricing */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <h3 className="text-sm font-bold mb-3">Pricing</h3>
              <div className="text-2xl font-bold text-foreground">{displayPrice}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {invoice ? `Invoice ${invoice.invoice_number}` : "Quoted total"}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Payment</span>
                  <span className="font-medium capitalize">{shipment.payment_status}</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{shipment.status.replace(/_/g, " ")}</span>
                </div>
              </div>
              {shipment.payment_status !== "paid" && shipment.price !== null && (
                <Button onClick={() => setPayOpen(true)} className="w-full mt-4 h-11 bg-accent text-white hover:bg-accent/90">
                  <DollarSign className="w-4 h-4" /> Pay Now
                </Button>
              )}
              {shipment.tracking_number && (
                <Button variant="outline" onClick={() => navigate(`/track?tracking=${shipment.tracking_number}`)} className="w-full mt-2 h-11">
                  <Truck className="w-4 h-4" /> Track
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {shipment.price !== null && (
        <PayShipmentDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          shipmentId={shipment.id}
          invoiceId={invoice?.id}
          invoiceNumber={invoice?.invoice_number}
          trackingNumber={shipment.tracking_number}
          price={Number(invoice?.amount ?? shipment.price)}
          priceCurrency={invoice?.currency ?? "USD"}
          userBalance={balance}
          userId={user?.id || ""}
          onSuccess={() => { load(); refetchBalance(); }}
          serviceType={shipment.service_type}
          destination={shipment.destination_country}
          weight={shipment.weight}
        />
      )}
    </DashboardLayout>
  );
};

const Field = ({
  label, value, onChange, type = "text", className = "", textarea = false,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  textarea?: boolean;
}) => (
  <div className={className}>
    <Label className="text-xs">{label}</Label>
    {textarea ? (
      <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1" rows={3} />
    ) : (
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    )}
  </div>
);

export default ShipmentDetail;