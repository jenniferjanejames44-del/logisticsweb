import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Globe2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Direction = "import" | "export";

interface ZoneRate {
  id: string;
  zone_id: string;
  zone_number: number;
  direction: Direction;
  shipping_method: string;
  service_type: string | null;
  currency: string;
  price_0_2: number;
  price_3: number;
  price_4: number;
  price_5: number;
  price_6: number;
  price_7: number;
  price_8: number;
  price_9: number;
  price_10: number;
  above_10_rate_per_kg: number;
  handling_fee: number;
  customs_fee: number;
  vat_percent: number;
  insurance_percent: number;
  weight_rounding: string;
  is_active: boolean;
}

const WEIGHT_FIELDS = [
  { key: "price_0_2", label: "0–2 KG" },
  { key: "price_3", label: "3 KG" },
  { key: "price_4", label: "4 KG" },
  { key: "price_5", label: "5 KG" },
  { key: "price_6", label: "6 KG" },
  { key: "price_7", label: "7 KG" },
  { key: "price_8", label: "8 KG" },
  { key: "price_9", label: "9 KG" },
  { key: "price_10", label: "10 KG" },
] as const;

const ZoneRatesTab = () => {
  const [rates, setRates] = useState<ZoneRate[]>([]);
  const [zoneNames, setZoneNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<Direction>("import");
  const [editing, setEditing] = useState<ZoneRate | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: rateRows, error }, { data: zoneRows }] = await Promise.all([
      (supabase as any).from("zone_pricing_rates").select("*").order("zone_number").order("direction"),
      supabase.from("shipping_zones").select("zone_number, name"),
    ]);
    if (error) toast.error(error.message);
    setRates((rateRows || []) as ZoneRate[]);
    const names: Record<number, string> = {};
    (zoneRows || []).forEach((z: any) => { names[z.zone_number] = z.name; });
    setZoneNames(names);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(
    () => rates.filter((r) => r.direction === direction),
    [rates, direction],
  );

  const openEdit = (rate: ZoneRate) => {
    setEditing(rate);
    setForm({
      ...Object.fromEntries(WEIGHT_FIELDS.map((f) => [f.key, String((rate as any)[f.key])])),
      above_10_rate_per_kg: String(rate.above_10_rate_per_kg),
      handling_fee: String(rate.handling_fee),
      customs_fee: String(rate.customs_fee),
      vat_percent: String(rate.vat_percent),
      insurance_percent: String(rate.insurance_percent),
      currency: rate.currency,
      shipping_method: rate.shipping_method,
      service_type: rate.service_type || "",
      weight_rounding: rate.weight_rounding,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const numeric = [
      ...WEIGHT_FIELDS.map((f) => f.key),
      "above_10_rate_per_kg", "handling_fee", "customs_fee", "vat_percent", "insurance_percent",
    ];
    const payload: Record<string, unknown> = {
      currency: form.currency || "USD",
      shipping_method: form.shipping_method || "air",
      service_type: form.service_type ? form.service_type : null,
      weight_rounding: form.weight_rounding || "ceil",
    };
    numeric.forEach((k) => { payload[k] = Number(form[k]) || 0; });

    const { error } = await (supabase as any)
      .from("zone_pricing_rates")
      .update(payload)
      .eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Zone ${editing.zone_number} ${editing.direction} prices saved`);
    setEditing(null);
    load();
  };

  const toggleActive = async (rate: ZoneRate, active: boolean) => {
    const { error } = await (supabase as any)
      .from("zone_pricing_rates")
      .update({ is_active: active })
      .eq("id", rate.id);
    if (error) { toast.error(error.message); return; }
    setRates((prev) => prev.map((r) => (r.id === rate.id ? { ...r, is_active: active } : r)));
  };

  const money = (v: number, c: string) => `${c === "USD" ? "$" : ""}${Number(v).toFixed(0)}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe2 className="h-4 w-4" /> Zone tariff (Zone 1–8)
        </CardTitle>
        <Select value={direction} onValueChange={(v) => setDirection(v as Direction)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="import">Import</SelectItem>
            <SelectItem value="export">Export</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          The customer picks a country; the backend resolves its zone and uses the row below.
          Weights above 10 KG are charged as <strong>total weight × the above-10 KG rate</strong>.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading zone prices…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Service</TableHead>
                  {WEIGHT_FIELDS.map((f) => <TableHead key={f.key}>{f.label}</TableHead>)}
                  <TableHead>{">"}10 KG /kg</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      Zone {r.zone_number}
                      <span className="block text-xs text-muted-foreground">{zoneNames[r.zone_number]}</span>
                    </TableCell>
                    <TableCell className="capitalize">{r.shipping_method}</TableCell>
                    <TableCell className="capitalize">{r.service_type || "Any"}</TableCell>
                    {WEIGHT_FIELDS.map((f) => (
                      <TableCell key={f.key}>{money((r as any)[f.key], r.currency)}</TableCell>
                    ))}
                    <TableCell className="font-medium">{money(r.above_10_rate_per_kg, r.currency)}</TableCell>
                    <TableCell>{r.currency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={r.is_active} onCheckedChange={(v) => toggleActive(r, v)} />
                        <Badge variant={r.is_active ? "default" : "secondary"}>
                          {r.is_active ? "Active" : "Off"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!visible.length && (
                  <TableRow>
                    <TableCell colSpan={15} className="py-10 text-center text-sm text-muted-foreground">
                      No zone prices configured for {direction}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Zone {editing?.zone_number} — {editing?.direction} prices
            </DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[65vh] gap-4 overflow-y-auto p-1 sm:grid-cols-3">
            {WEIGHT_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input
                  type="number" step="0.01" min="0"
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Above 10 KG (per KG)</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.above_10_rate_per_kg ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, above_10_rate_per_kg: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Handling fee</Label>
              <Input type="number" step="0.01" min="0" value={form.handling_fee ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, handling_fee: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Customs fee</Label>
              <Input type="number" step="0.01" min="0" value={form.customs_fee ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, customs_fee: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>VAT %</Label>
              <Input type="number" step="0.01" min="0" value={form.vat_percent ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, vat_percent: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Insurance %</Label>
              <Input type="number" step="0.01" min="0" value={form.insurance_percent ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, insurance_percent: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input value={form.currency ?? ""} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={form.shipping_method} onValueChange={(v) => setForm((p) => ({ ...p, shipping_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="road">Road</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Service (blank = any)</Label>
              <Input value={form.service_type ?? ""} placeholder="standard / express"
                onChange={(e) => setForm((p) => ({ ...p, service_type: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Part-kilo rounding</Label>
              <Select value={form.weight_rounding} onValueChange={(v) => setForm((p) => ({ ...p, weight_rounding: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceil">Round up to next KG</SelectItem>
                  <SelectItem value="nearest">Round to nearest KG</SelectItem>
                  <SelectItem value="none">Use exact weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save prices"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ZoneRatesTab;
