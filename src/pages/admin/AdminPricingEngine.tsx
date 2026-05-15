import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, PackageOpen, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import type { PricingRuleV2, ShipmentType } from "@/lib/pricingEngineV2";

const CURRENCIES = ["USD", "GBP", "EUR", "NGN", "CNY"] as const;
const METHODS = [
  { id: "air", label: "Air" },
  { id: "ocean", label: "Ocean" },
  { id: "road", label: "Road" },
];
const SERVICE_TYPES = [
  { id: "", label: "Any" },
  { id: "express", label: "Express" },
  { id: "standard", label: "Standard" },
];

type FormState = {
  name: string;
  origin_country: string;
  warehouse_country: string;
  destination_country: string;
  shipping_method: string;
  service_type: string;
  min_weight_kg: string;
  max_weight_kg: string;
  flat_price: string;
  flat_weight_threshold_kg: string;
  price_per_kg: string;
  handling_fee: string;
  customs_fee: string;
  vat_percent: string;
  insurance_percent: string;
  currency: string;
  estimated_days_min: string;
  estimated_days_max: string;
  priority: string;
  is_active: boolean;
};

const emptyForm = (type: ShipmentType): FormState => ({
  name: "",
  origin_country: type === "export" ? "Nigeria" : "",
  warehouse_country: "",
  destination_country: type === "import" ? "Nigeria" : "",
  shipping_method: "air",
  service_type: "",
  min_weight_kg: "",
  max_weight_kg: "",
  flat_price: "0",
  flat_weight_threshold_kg: "0",
  price_per_kg: "0",
  handling_fee: "0",
  customs_fee: "0",
  vat_percent: "0",
  insurance_percent: "0",
  currency: type === "export" ? "USD" : "USD",
  estimated_days_min: "",
  estimated_days_max: "",
  priority: "0",
  is_active: true,
});

function RulesTab({ shipmentType }: { shipmentType: ShipmentType }) {
  const [rules, setRules] = useState<PricingRuleV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRuleV2 | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(shipmentType));

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("pricing_rules")
      .select("*")
      .eq("shipment_type", shipmentType)
      .order("priority", { ascending: false })
      .order("origin_country");
    if (error) toast.error(error.message);
    setRules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, [shipmentType]);

  const openDialog = (rule?: PricingRuleV2) => {
    if (rule) {
      setEditing(rule);
      setForm({
        name: rule.name,
        origin_country: rule.origin_country,
        warehouse_country: rule.warehouse_country || "",
        destination_country: rule.destination_country,
        shipping_method: rule.shipping_method,
        service_type: rule.service_type || "",
        min_weight_kg: rule.min_weight_kg?.toString() || "",
        max_weight_kg: rule.max_weight_kg?.toString() || "",
        flat_price: String(rule.flat_price),
        flat_weight_threshold_kg: String(rule.flat_weight_threshold_kg),
        price_per_kg: String(rule.price_per_kg),
        handling_fee: String(rule.handling_fee),
        customs_fee: String(rule.customs_fee),
        vat_percent: String(rule.vat_percent),
        insurance_percent: String(rule.insurance_percent),
        currency: rule.currency,
        estimated_days_min: rule.estimated_days_min?.toString() || "",
        estimated_days_max: rule.estimated_days_max?.toString() || "",
        priority: String(rule.priority || 0),
        is_active: rule.is_active,
      });
    } else {
      setEditing(null);
      setForm(emptyForm(shipmentType));
    }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin_country.trim() || !form.destination_country.trim() || !form.shipping_method || !form.currency) {
      toast.error("Origin, destination, method and currency are required.");
      return;
    }
    if (shipmentType === "import" && !form.warehouse_country.trim()) {
      toast.error("Warehouse country is required for import rules.");
      return;
    }
    const flat = parseFloat(form.flat_price) || 0;
    const perKg = parseFloat(form.price_per_kg) || 0;
    if (flat <= 0 && perKg <= 0) {
      toast.error("Provide a flat rate or per-kg rate.");
      return;
    }
    const payload: any = {
      shipment_type: shipmentType,
      name: form.name.trim() || `${shipmentType === "import" ? "Import from" : "Export to"} ${shipmentType === "import" ? form.origin_country : form.destination_country}`,
      origin_country: form.origin_country.trim(),
      warehouse_country: shipmentType === "import" ? form.warehouse_country.trim() : null,
      destination_country: form.destination_country.trim(),
      shipping_method: form.shipping_method,
      service_type: form.service_type || null,
      min_weight_kg: form.min_weight_kg ? parseFloat(form.min_weight_kg) : null,
      max_weight_kg: form.max_weight_kg ? parseFloat(form.max_weight_kg) : null,
      flat_price: flat,
      flat_weight_threshold_kg: parseFloat(form.flat_weight_threshold_kg) || 0,
      price_per_kg: perKg,
      handling_fee: parseFloat(form.handling_fee) || 0,
      customs_fee: parseFloat(form.customs_fee) || 0,
      vat_percent: parseFloat(form.vat_percent) || 0,
      insurance_percent: parseFloat(form.insurance_percent) || 0,
      currency: form.currency,
      estimated_days_min: form.estimated_days_min ? parseInt(form.estimated_days_min, 10) : null,
      estimated_days_max: form.estimated_days_max ? parseInt(form.estimated_days_max, 10) : null,
      priority: parseInt(form.priority, 10) || 0,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await (supabase as any).from("pricing_rules").update(payload).eq("id", editing.id)
      : await (supabase as any).from("pricing_rules").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Rule updated" : "Rule created");
    setOpen(false);
    fetchRules();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("pricing_rules").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Rule deleted");
    fetchRules();
  };

  const toggleActive = async (rule: PricingRuleV2) => {
    const { error } = await (supabase as any).from("pricing_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    if (error) { toast.error(error.message); return; }
    fetchRules();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {shipmentType === "import"
            ? "Rules used when shipping TO Nigeria from abroad."
            : "Rules used when shipping FROM Nigeria to other countries."}
        </p>
        <Button onClick={() => openDialog()} className="rounded-[10px]">
          <Plus className="w-4 h-4 mr-1.5" /> Add {shipmentType === "import" ? "Import" : "Export"} Rule
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0 sm:p-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Loading…</p>
          ) : rules.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">No {shipmentType} rules yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Fees / Tax</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-xs">
                        {r.origin_country} → {r.destination_country}
                        {r.warehouse_country && <div className="text-muted-foreground">via {r.warehouse_country}</div>}
                      </TableCell>
                      <TableCell className="capitalize text-xs">{r.shipping_method}{r.service_type ? ` · ${r.service_type}` : ""}</TableCell>
                      <TableCell className="text-xs">
                        ≤{r.flat_weight_threshold_kg}kg: {r.currency} {Number(r.flat_price).toFixed(2)}
                        <div className="text-muted-foreground">above: {r.currency} {Number(r.price_per_kg).toFixed(2)}/kg</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        H {Number(r.handling_fee).toFixed(0)} · C {Number(r.customs_fee).toFixed(0)}
                        <div className="text-muted-foreground">VAT {r.vat_percent}% · Ins {r.insurance_percent}%</div>
                      </TableCell>
                      <TableCell>{r.currency}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleActive(r)}>
                          <Badge variant={r.is_active ? "default" : "secondary"} className="cursor-pointer">
                            {r.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 justify-end">
                          <Button variant="ghost" size="iconSm" onClick={() => openDialog(r)}><Edit2 className="w-4 h-4" /></Button>
                          <DeleteConfirmDialog
                            title="Delete Pricing Rule"
                            description={`Delete "${r.name}"? This cannot be undone.`}
                            onConfirm={() => remove(r.id)}
                          />
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit Rule` : `Add ${shipmentType === "import" ? "Import" : "Export"} Rule`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Rule name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={`e.g. ${shipmentType === "import" ? "USA → Nigeria Air" : "Nigeria → UK Air"}`} />
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Route</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Origin country</Label>
                  <Input value={form.origin_country} onChange={(e) => setForm({ ...form, origin_country: e.target.value })} required disabled={shipmentType === "export"} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Destination country</Label>
                  <Input value={form.destination_country} onChange={(e) => setForm({ ...form, destination_country: e.target.value })} required disabled={shipmentType === "import"} />
                </div>
                {shipmentType === "import" && (
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Warehouse country</Label>
                    <Input value={form.warehouse_country} onChange={(e) => setForm({ ...form, warehouse_country: e.target.value })} placeholder="Where the goods are dropped off (usually same as origin)" required />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Shipping method</Label>
                  <Select value={form.shipping_method} onValueChange={(v) => setForm({ ...form, shipping_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{METHODS.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Service type</Label>
                  <Select value={form.service_type || "any"} onValueChange={(v) => setForm({ ...form, service_type: v === "any" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight & Pricing</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Min weight (kg)</Label>
                  <Input type="number" step="0.1" value={form.min_weight_kg} onChange={(e) => setForm({ ...form, min_weight_kg: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max weight (kg)</Label>
                  <Input type="number" step="0.1" value={form.max_weight_kg} onChange={(e) => setForm({ ...form, max_weight_kg: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Flat price (≤ threshold)</Label>
                  <Input type="number" step="0.01" value={form.flat_price} onChange={(e) => setForm({ ...form, flat_price: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Threshold (kg)</Label>
                  <Input type="number" step="0.1" value={form.flat_weight_threshold_kg} onChange={(e) => setForm({ ...form, flat_weight_threshold_kg: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Per kg (above threshold)</Label>
                  <Input type="number" step="0.01" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fees & Tax</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Handling fee</Label>
                  <Input type="number" step="0.01" value={form.handling_fee} onChange={(e) => setForm({ ...form, handling_fee: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customs fee</Label>
                  <Input type="number" step="0.01" value={form.customs_fee} onChange={(e) => setForm({ ...form, customs_fee: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">VAT %</Label>
                  <Input type="number" step="0.01" value={form.vat_percent} onChange={(e) => setForm({ ...form, vat_percent: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Insurance %</Label>
                  <Input type="number" step="0.01" value={form.insurance_percent} onChange={(e) => setForm({ ...form, insurance_percent: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority (higher = used first)</Label>
                  <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Est. days min</Label>
                  <Input type="number" value={form.estimated_days_min} onChange={(e) => setForm({ ...form, estimated_days_min: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Est. days max</Label>
                  <Input type="number" value={form.estimated_days_max} onChange={(e) => setForm({ ...form, estimated_days_max: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
              <Label>Active</Label>
            </div>

            <Button type="submit" className="w-full">{editing ? "Update Rule" : "Create Rule"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  is_active: boolean;
}

function ExchangeRatesTab() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeRate | null>(null);
  const [form, setForm] = useState({ from_currency: "USD", to_currency: "NGN", rate: "", is_active: true });

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("exchange_rates").select("*").order("from_currency");
    if (error) toast.error(error.message);
    setRates(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openDialog = (r?: ExchangeRate) => {
    if (r) {
      setEditing(r);
      setForm({ from_currency: r.from_currency, to_currency: r.to_currency, rate: String(r.rate), is_active: r.is_active });
    } else {
      setEditing(null);
      setForm({ from_currency: "USD", to_currency: "NGN", rate: "", is_active: true });
    }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(form.rate);
    if (!rate || rate <= 0) { toast.error("Rate must be > 0"); return; }
    const payload = { from_currency: form.from_currency, to_currency: form.to_currency, rate, is_active: form.is_active };
    const { error } = editing
      ? await (supabase as any).from("exchange_rates").update(payload).eq("id", editing.id)
      : await (supabase as any).from("exchange_rates").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false);
    fetch();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("exchange_rates").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Used at checkout to convert foreign-currency invoices to NGN for Paystack.</p>
        <Button onClick={() => openDialog()} className="rounded-[10px]"><Plus className="w-4 h-4 mr-1.5" /> Add Rate</Button>
      </div>
      <Card className="border-border/50">
        <CardContent className="p-0 sm:p-3">
          {loading ? <p className="text-center text-muted-foreground py-10 text-sm">Loading…</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Rate</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.from_currency}</TableCell>
                    <TableCell>{r.to_currency}</TableCell>
                    <TableCell>{Number(r.rate).toFixed(4)}</TableCell>
                    <TableCell><Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="ghost" size="iconSm" onClick={() => openDialog(r)}><Edit2 className="w-4 h-4" /></Button>
                        <DeleteConfirmDialog title="Delete rate" description={`Delete ${r.from_currency} → ${r.to_currency}?`} onConfirm={() => remove(r.id)} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Rate" : "Add Exchange Rate"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From</Label>
                <Select value={form.from_currency} onValueChange={(v) => setForm({ ...form, from_currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>To</Label>
                <Select value={form.to_currency} onValueChange={(v) => setForm({ ...form, to_currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Rate (1 {form.from_currency} = ? {form.to_currency})</Label>
              <Input type="number" step="0.0001" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
              <Label>Active</Label>
            </div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const AdminPricingEngine = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pricing Engine</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage Import and Export pricing rules independently. Changes apply to new shipments instantly.
          </p>
        </div>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="import"><PackageOpen className="w-4 h-4 mr-2" /> Import Pricing</TabsTrigger>
            <TabsTrigger value="export"><Send className="w-4 h-4 mr-2" /> Export Pricing</TabsTrigger>
            <TabsTrigger value="fx"><RefreshCw className="w-4 h-4 mr-2" /> Exchange Rates</TabsTrigger>
          </TabsList>
          <TabsContent value="import" className="mt-5"><RulesTab shipmentType="import" /></TabsContent>
          <TabsContent value="export" className="mt-5"><RulesTab shipmentType="export" /></TabsContent>
          <TabsContent value="fx" className="mt-5"><ExchangeRatesTab /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPricingEngine;
