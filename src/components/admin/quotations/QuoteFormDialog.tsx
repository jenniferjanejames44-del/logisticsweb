import { useEffect, useState } from "react";
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { matchPricingRule, toLegacyRule, getNgnRate } from "@/lib/pricingEngineV2";
import { computeShipmentTotals } from "@/lib/pricingEngine";
import { formatMoney, formatNgn, type Quotation } from "@/lib/quotations";
import { toast } from "sonner";
import { Loader2, FileText, Calculator } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Quotation | null;
  onSaved: () => void;
}

const defaultForm = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  shipment_type: "import" as "import" | "export",
  origin_country: "",
  origin_city: "",
  destination_country: "Nigeria",
  destination_city: "",
  warehouse_country: "",
  shipping_method: "air",
  service_type: "",
  weight_kg: "1",
  length_cm: "",
  width_cm: "",
  height_cm: "",
  description: "",
  declared_value: "0",
  valid_until: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  notes: "",
};

const QuoteFormDialog = ({ open, onOpenChange, initial, onSaved }: Props) => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [calc, setCalc] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [ngnTotal, setNgnTotal] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          customer_name: initial.customer_name,
          customer_email: initial.customer_email || "",
          customer_phone: initial.customer_phone || "",
          shipment_type: initial.shipment_type,
          origin_country: initial.origin_country,
          origin_city: initial.origin_city || "",
          destination_country: initial.destination_country,
          destination_city: initial.destination_city || "",
          warehouse_country: initial.warehouse_country || "",
          shipping_method: initial.shipping_method,
          service_type: initial.service_type || "",
          weight_kg: String(initial.weight_kg),
          length_cm: initial.length_cm?.toString() || "",
          width_cm: initial.width_cm?.toString() || "",
          height_cm: initial.height_cm?.toString() || "",
          description: initial.description || "",
          declared_value: String(initial.declared_value || 0),
          valid_until: initial.valid_until,
          notes: initial.notes || "",
        });
      } else {
        setForm(defaultForm);
      }
      setCalc(null);
      setNgnTotal(null);
    }
  }, [open, initial]);

  const upd = (k: keyof typeof defaultForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const computeChargeable = () => {
    const w = Number(form.weight_kg) || 0;
    const l = Number(form.length_cm) || 0;
    const wd = Number(form.width_cm) || 0;
    const h = Number(form.height_cm) || 0;
    const vol = (l * wd * h) / 5000;
    return Math.max(w, vol);
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const chargeable = computeChargeable();
      const rule = await matchPricingRule({
        shipmentType: form.shipment_type,
        originCountry: form.shipment_type === "import" ? form.origin_country : "Nigeria",
        destinationCountry: form.shipment_type === "import" ? "Nigeria" : form.destination_country,
        warehouseCountry: form.shipment_type === "import" ? form.warehouse_country || form.origin_country : null,
        shippingMethod: form.shipping_method,
        serviceType: form.service_type || undefined,
        chargeableWeight: chargeable,
      });
      if (!rule) {
        toast.error("No pricing rule found for this route");
        setCalc(null);
        return;
      }
      const totals = computeShipmentTotals({
        rule: toLegacyRule(rule),
        packageDims: {
          length_cm: Number(form.length_cm) || 0,
          width_cm: Number(form.width_cm) || 0,
          height_cm: Number(form.height_cm) || 0,
        },
        items: [{ quantity: 1, weightKg: Number(form.weight_kg) || 0, declaredValue: Number(form.declared_value) || 0 }],
        declaredValue: Number(form.declared_value) || 0,
      });
      const ngnRate = await getNgnRate(rule.currency);
      const ngn = ngnRate ? Math.round(totals.total * ngnRate) : null;
      setCalc({ rule, totals, chargeable });
      setNgnTotal(ngn);
    } catch (e: any) {
      toast.error(e.message || "Calculation failed");
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!form.customer_name || !form.origin_country || !form.destination_country) {
      toast.error("Customer, origin and destination are required");
      return;
    }
    if (!calc) {
      toast.error("Please calculate pricing first");
      return;
    }
    setSaving(true);
    try {
      const { rule, totals, chargeable } = calc;
      const payload: any = {
        customer_name: form.customer_name,
        customer_email: form.customer_email || null,
        customer_phone: form.customer_phone || null,
        shipment_type: form.shipment_type,
        origin_country: form.origin_country,
        origin_city: form.origin_city || null,
        destination_country: form.destination_country,
        destination_city: form.destination_city || null,
        warehouse_country: form.shipment_type === "import" ? form.warehouse_country || null : null,
        shipping_method: form.shipping_method,
        service_type: form.service_type || null,
        weight_kg: Number(form.weight_kg) || 0,
        length_cm: Number(form.length_cm) || null,
        width_cm: Number(form.width_cm) || null,
        height_cm: Number(form.height_cm) || null,
        chargeable_weight: chargeable,
        description: form.description || null,
        declared_value: Number(form.declared_value) || 0,
        pricing_rule_id: rule.id,
        currency: rule.currency,
        subtotal: totals.shippingCost + (totals as any).packagingCost,
        handling_fee: rule.handling_fee,
        customs_fee: rule.customs_fee,
        vat: totals.vat,
        insurance: totals.insurance,
        total: totals.total,
        pricing_snapshot: { rule, totals, chargeable },
        ngn_total: ngnTotal,
        valid_until: form.valid_until,
        notes: form.notes || null,
      };
      if (initial?.id) {
        const { error } = await (supabase as any).from("quotations").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Quotation updated");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await (supabase as any).from("quotations").insert({ ...payload, created_by: user?.id });
        if (error) throw error;
        toast.success("Quotation created");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      ariaTitle={initial ? "Edit Quotation" : "Create Quotation"}
    >
      <ModalHeader
        title={initial ? "Edit Quotation" : "Create Quotation"}
        subtitle="Build a quote with auto-calculated pricing"
        icon={<FileText className="w-5 h-5" />}
      />
      <ModalBody>
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Name *</Label>
              <Input value={form.customer_name} onChange={(e) => upd("customer_name", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.customer_email} onChange={(e) => upd("customer_email", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Phone (with country code)</Label>
              <Input value={form.customer_phone} onChange={(e) => upd("customer_phone", e.target.value)} placeholder="+2348012345678" />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shipment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Type *</Label>
              <Select value={form.shipment_type} onValueChange={(v) => upd("shipment_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="import">Import (to Nigeria)</SelectItem>
                  <SelectItem value="export">Export (from Nigeria)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Method *</Label>
              <Select value={form.shipping_method} onValueChange={(v) => upd("shipping_method", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="ocean">Ocean / Sea</SelectItem>
                  <SelectItem value="road">Road</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origin Country *</Label>
              <Input value={form.origin_country} onChange={(e) => upd("origin_country", e.target.value)} />
            </div>
            <div>
              <Label>Origin City</Label>
              <Input value={form.origin_city} onChange={(e) => upd("origin_city", e.target.value)} />
            </div>
            <div>
              <Label>Destination Country *</Label>
              <Input value={form.destination_country} onChange={(e) => upd("destination_country", e.target.value)} />
            </div>
            <div>
              <Label>Destination City</Label>
              <Input value={form.destination_city} onChange={(e) => upd("destination_city", e.target.value)} />
            </div>
            {form.shipment_type === "import" && (
              <div className="sm:col-span-2">
                <Label>Warehouse Country (origin warehouse)</Label>
                <Input value={form.warehouse_country} onChange={(e) => upd("warehouse_country", e.target.value)} placeholder="e.g. United States" />
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Package</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label>Weight (kg) *</Label>
              <Input type="number" min="0" step="0.1" value={form.weight_kg} onChange={(e) => upd("weight_kg", e.target.value)} />
            </div>
            <div>
              <Label>L (cm)</Label>
              <Input type="number" min="0" value={form.length_cm} onChange={(e) => upd("length_cm", e.target.value)} />
            </div>
            <div>
              <Label>W (cm)</Label>
              <Input type="number" min="0" value={form.width_cm} onChange={(e) => upd("width_cm", e.target.value)} />
            </div>
            <div>
              <Label>H (cm)</Label>
              <Input type="number" min="0" value={form.height_cm} onChange={(e) => upd("height_cm", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Declared Value (USD)</Label>
              <Input type="number" min="0" value={form.declared_value} onChange={(e) => upd("declared_value", e.target.value)} />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input type="date" value={form.valid_until} onChange={(e) => upd("valid_until", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => upd("description", e.target.value)} />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pricing</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleCalculate} disabled={calculating}>
              {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              {calc ? "Recalculate" : "Calculate"}
            </Button>
          </div>
          {calc ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Rule</span><span className="font-medium">{calc.rule.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Chargeable Weight</span><span>{calc.chargeable.toFixed(2)} kg</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatMoney(calc.totals.shippingCost, calc.rule.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Handling + Customs</span><span>{formatMoney(Number(calc.rule.handling_fee) + Number(calc.rule.customs_fee), calc.rule.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span>{formatMoney(calc.totals.vat, calc.rule.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span>{formatMoney(calc.totals.insurance, calc.rule.currency)}</span></div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-base"><span>Total</span><span>{formatMoney(calc.totals.total, calc.rule.currency)}</span></div>
              {ngnTotal && calc.rule.currency.toUpperCase() !== "NGN" && (
                <div className="flex justify-between text-xs text-muted-foreground"><span>≈ NGN</span><span>{formatNgn(ngnTotal)}</span></div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Click Calculate to compute pricing from the active rules.</p>
          )}
        </section>

        <section>
          <Label>Internal Notes</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
        </section>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !calc} className="sm:flex-1">
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {initial ? "Save Changes" : "Create Quotation"}
        </Button>
      </ModalFooter>
    </ModalShell>
  );
};

export default QuoteFormDialog;