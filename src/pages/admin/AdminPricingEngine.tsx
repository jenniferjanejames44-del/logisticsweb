import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Globe, Calculator } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import { type CountryPricingRule, formatPriceInCurrency, SUPPORTED_PRICING_CURRENCIES } from "@/lib/pricingEngine";

const emptyForm = {
  country: "",
  currency: "USD",
  flat_price: "",
  flat_weight_threshold_kg: "",
  price_per_kg: "",
  handling_fee: "0",
  vat_percent: "0",
  insurance_percent: "0",
  is_active: true,
};

const AdminPricingEngine = () => {
  const [rules, setRules] = useState<CountryPricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CountryPricingRule | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("country_pricing_rules")
      .select("*")
      .order("country", { ascending: true });
    if (error) toast.error(error.message);
    setRules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const openDialog = (rule?: CountryPricingRule) => {
    if (rule) {
      setEditing(rule);
      setForm({
        country: rule.country,
        currency: rule.currency,
        flat_price: String(rule.flat_price),
        flat_weight_threshold_kg: String(rule.flat_weight_threshold_kg),
        price_per_kg: String(rule.price_per_kg),
        handling_fee: String(rule.handling_fee),
        vat_percent: String(rule.vat_percent),
        insurance_percent: String(rule.insurance_percent),
        is_active: rule.is_active,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      country: form.country.trim(),
      currency: form.currency,
      flat_price: parseFloat(form.flat_price) || 0,
      flat_weight_threshold_kg: parseFloat(form.flat_weight_threshold_kg) || 0,
      price_per_kg: parseFloat(form.price_per_kg) || 0,
      handling_fee: parseFloat(form.handling_fee) || 0,
      vat_percent: parseFloat(form.vat_percent) || 0,
      insurance_percent: parseFloat(form.insurance_percent) || 0,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await (supabase as any).from("country_pricing_rules").update(payload).eq("id", editing.id)
      : await (supabase as any).from("country_pricing_rules").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Rule updated" : "Country rule created");
    setOpen(false);
    fetchRules();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("country_pricing_rules").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Rule deleted");
    fetchRules();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Country Pricing Engine</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage per-country shipping rules. Changes apply instantly to new shipments.
            </p>
          </div>
          <Button onClick={() => openDialog()} className="rounded-[10px]">
            <Plus className="w-4 h-4 mr-1.5" /> Add Country
          </Button>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4" /> Active Rules ({rules.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-10 text-sm">Loading…</p>
            ) : rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calculator className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">No country rules yet. Click "Add Country" to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Flat Rule</TableHead>
                      <TableHead>Per-KG (above)</TableHead>
                      <TableHead>Handling</TableHead>
                      <TableHead>VAT</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.country}</TableCell>
                        <TableCell>{r.currency}</TableCell>
                        <TableCell>{formatPriceInCurrency(Number(r.flat_price), r.currency)} ≤ {r.flat_weight_threshold_kg}kg</TableCell>
                        <TableCell>{formatPriceInCurrency(Number(r.price_per_kg), r.currency)}/kg</TableCell>
                        <TableCell>{formatPriceInCurrency(Number(r.handling_fee), r.currency)}</TableCell>
                        <TableCell>{r.vat_percent}%</TableCell>
                        <TableCell>{r.insurance_percent}%</TableCell>
                        <TableCell>{r.is_active ? "Active" : "Inactive"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5 justify-end">
                            <Button variant="ghost" size="iconSm" onClick={() => openDialog(r)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <DeleteConfirmDialog
                              title="Delete Country Rule"
                              description={`Remove pricing rule for ${r.country}? This cannot be undone.`}
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
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.country}` : "Add Country Rule"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. United Kingdom"
                  required
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_PRICING_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight Pricing</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Flat price (≤ threshold)</Label>
                  <Input type="number" step="0.01" value={form.flat_price}
                    onChange={(e) => setForm({ ...form, flat_price: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Threshold (kg)</Label>
                  <Input type="number" step="0.1" value={form.flat_weight_threshold_kg}
                    onChange={(e) => setForm({ ...form, flat_weight_threshold_kg: e.target.value })} required />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Price per KG (above threshold)</Label>
                  <Input type="number" step="0.01" value={form.price_per_kg}
                    onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} required />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional Charges</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Handling fee</Label>
                  <Input type="number" step="0.01" value={form.handling_fee}
                    onChange={(e) => setForm({ ...form, handling_fee: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">VAT %</Label>
                  <Input type="number" step="0.01" value={form.vat_percent}
                    onChange={(e) => setForm({ ...form, vat_percent: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Insurance %</Label>
                  <Input type="number" step="0.01" value={form.insurance_percent}
                    onChange={(e) => setForm({ ...form, insurance_percent: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
              <Label>Active (visible to customers)</Label>
            </div>

            <Button type="submit" className="w-full">{editing ? "Update Rule" : "Create Rule"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPricingEngine;
