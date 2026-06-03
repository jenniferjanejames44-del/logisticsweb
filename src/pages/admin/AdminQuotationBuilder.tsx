import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, Loader2, Save, Eye, Printer, Download,
  MessageCircle, Mail, FileText,
} from "lucide-react";
import { formatMoney, type Quotation, type QuoteLineItem } from "@/lib/quotations";
import PdfPreviewDialog from "@/components/admin/quotations/PdfPreviewDialog";
import WhatsAppShareDialog from "@/components/admin/quotations/WhatsAppShareDialog";

const newId = () => Math.random().toString(36).slice(2, 10);

const blankRow = (): QuoteLineItem => ({
  id: newId(),
  description: "",
  quantity: 1,
  unit_price: 0,
  length_cm: null,
  width_cm: null,
  height_cm: null,
});

const defaultRows: QuoteLineItem[] = [blankRow()];

const defaults = {
  customer_name: "",
  customer_company: "",
  customer_email: "",
  customer_phone: "",
  customer_address: "",
  shipment_type: "import" as "import" | "export",
  origin_country: "",
  destination_country: "Nigeria",
  shipping_method: "air",
  description: "",
  notes: "",
  terms:
    "Above information is not an invoice and only an estimate of services described above. " +
    "Payment is required prior to provision of services. Quotation is valid for 7 days from the issue date.",
  currency: "USD",
  vat_percent: "7.5",
  vat_enabled: true,
  discount: "0",
  freight: "0",
  handling: "0",
  customs: "0",
  insurance: "0",
  valid_until: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  weight_kg: "0",
};

const AdminQuotationBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(defaults);
  const [rows, setRows] = useState<QuoteLineItem[]>(defaultRows);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [savedQuote, setSavedQuote] = useState<Quotation | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isEdit || loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("quotations").select("*").eq("id", id).single();
      if (error || !data) { toast.error("Quote not found"); navigate("/admin/quotations"); return; }
      const q = data as Quotation;
      setSavedQuote(q);
      const snap = (q.pricing_snapshot as any) || {};
      setForm({
        customer_name: q.customer_name || "",
        customer_company: q.customer_company || "",
        customer_email: q.customer_email || "",
        customer_phone: q.customer_phone || "",
        customer_address: q.customer_address || "",
        shipment_type: (q.shipment_type as any) || "import",
        origin_country: q.origin_country || "",
        destination_country: q.destination_country || "Nigeria",
        shipping_method: q.shipping_method || "air",
        description: q.description || "",
        notes: q.notes || "",
        terms: q.terms || defaults.terms,
        currency: q.currency || "USD",
        vat_percent: String(q.subtotal ? ((Number(q.vat) / Number(q.subtotal)) * 100).toFixed(2) : "7.5"),
        vat_enabled: Number(q.vat) > 0,
        discount: String(q.discount || 0),
        freight: String(snap.freight ?? 0),
        handling: String(q.handling_fee || 0),
        customs: String(q.customs_fee || 0),
        insurance: String(q.insurance || 0),
        valid_until: q.valid_until,
        weight_kg: String(q.weight_kg || 0),
      });
      const items = Array.isArray(q.line_items) && q.line_items.length ? q.line_items : defaultRows;
      setRows(items);
      setLoading(false);
    })();
  }, [id, isEdit, navigate]);

  const upd = <K extends keyof typeof defaults>(k: K, v: (typeof defaults)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const totals = useMemo(() => {
    const itemsSubtotal = rows.reduce(
      (s, r) => s + Number(r.quantity || 0) * Number(r.unit_price || 0),
      0
    );
    const freight = Number(form.freight) || 0;
    const handling = Number(form.handling) || 0;
    const customs = Number(form.customs) || 0;
    const insurance = Number(form.insurance) || 0;
    const charges = freight + handling + customs + insurance;
    const preDiscount = itemsSubtotal + charges;
    const discount = Math.min(Number(form.discount) || 0, preDiscount);
    const taxable = Math.max(preDiscount - discount, 0);
    const vat = form.vat_enabled ? +(taxable * (Number(form.vat_percent) || 0) / 100).toFixed(2) : 0;
    const total = +(taxable + vat).toFixed(2);
    return {
      itemsSubtotal: +itemsSubtotal.toFixed(2),
      freight, handling, customs, insurance,
      discount, vat, total,
    };
  }, [rows, form.discount, form.vat_enabled, form.vat_percent, form.freight, form.handling, form.customs, form.insurance]);

  const addRow = () => setRows((r) => [...r, blankRow()]);
  const removeRow = (rid: string) => setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== rid) : r));
  const updateRow = (rid: string, patch: Partial<QuoteLineItem>) =>
    setRows((r) => r.map((x) => (x.id === rid ? { ...x, ...patch } : x)));

  const validate = () => {
    if (!form.customer_name.trim()) { toast.error("Customer name is required"); return false; }
    if (!rows.some((r) => r.description.trim())) {
      toast.error("Add at least one item / box description"); return false;
    }
    return true;
  };

  const buildPayload = (status?: string) => ({
    customer_name: form.customer_name.trim(),
    customer_company: form.customer_company.trim() || null,
    customer_email: form.customer_email.trim() || null,
    customer_phone: form.customer_phone.trim() || null,
    customer_address: form.customer_address.trim() || null,
    shipment_type: form.shipment_type,
    origin_country: form.origin_country || "—",
    destination_country: form.destination_country || "—",
    shipping_method: form.shipping_method,
    description: form.description || null,
    notes: form.notes || null,
    terms: form.terms || null,
    currency: form.currency,
    weight_kg: Number(form.weight_kg) || 0,
    declared_value: 0,
    line_items: rows
      .filter((r) => r.description.trim() || Number(r.unit_price) > 0 || Number(r.quantity) > 0)
      .map((r) => ({
        id: r.id,
        description: r.description,
        quantity: Number(r.quantity) || 0,
        unit_price: Number(r.unit_price) || 0,
        length_cm: r.length_cm != null && r.length_cm !== ("" as any) ? Number(r.length_cm) : null,
        width_cm: r.width_cm != null && r.width_cm !== ("" as any) ? Number(r.width_cm) : null,
        height_cm: r.height_cm != null && r.height_cm !== ("" as any) ? Number(r.height_cm) : null,
      })),
    subtotal: totals.itemsSubtotal,
    discount: totals.discount,
    handling_fee: totals.handling,
    customs_fee: totals.customs,
    insurance: totals.insurance,
    vat: totals.vat,
    total: totals.total,
    pricing_snapshot: {
      manual_builder: true,
      totals,
      freight: totals.freight,
      vat_percent: Number(form.vat_percent) || 0,
    },
    valid_until: form.valid_until,
    ...(status ? { status } : {}),
  });

  const save = async (status?: "draft" | "sent") => {
    if (!validate()) return null;
    setSaving(true);
    try {
      const payload = buildPayload(status);
      let saved: Quotation;
      if (isEdit && id) {
        const { data, error } = await (supabase as any)
          .from("quotations").update(payload).eq("id", id).select().single();
        if (error) throw error;
        saved = data as Quotation;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await (supabase as any)
          .from("quotations").insert({ ...payload, created_by: user?.id }).select().single();
        if (error) throw error;
        saved = data as Quotation;
        navigate(`/admin/quotations/${saved.id}/edit`, { replace: true });
      }
      setSavedQuote(saved);
      toast.success(status === "sent" ? "Quotation marked as sent" : "Quotation saved");
      return saved;
    } catch (e: any) {
      toast.error(e.message || "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    const q = savedQuote || (await save());
    if (q) setPdfOpen(true);
  };

  const handleWhatsApp = async () => {
    const q = savedQuote || (await save("sent"));
    if (q) setWaOpen(true);
  };

  const handleEmail = async () => {
    if (!form.customer_email) { toast.error("Add a customer email first"); return; }
    const q = savedQuote || (await save("sent"));
    if (!q) return;
    setEmailing(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-quotation-email", {
        body: { quotation_id: q.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Quotation email sent");
    } catch (e: any) {
      toast.error(e.message || "Failed to send email");
    } finally {
      setEmailing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Quotation Builder">
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? `Edit Quotation ${savedQuote?.quote_number || ""}` : "New Quotation"}
      description="Build a professional, printable quotation with custom line items"
    >
      <div className="space-y-5">
        {/* Top action bar */}
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
            <Button variant="ghost" onClick={() => navigate("/admin/quotations")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Quotations
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => save("draft")} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </Button>
              <Button variant="outline" onClick={handlePreview} disabled={saving} className="gap-2">
                <Eye className="w-4 h-4" /> Preview
              </Button>
              <Button variant="outline" onClick={handleEmail} disabled={saving || emailing} className="gap-2">
                {emailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Email
              </Button>
              <Button onClick={handleWhatsApp} disabled={saving} className="gap-2">
                <MessageCircle className="w-4 h-4" /> Send via WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <div className="space-y-5">
            {/* Customer */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <SectionTitle icon={<FileText className="w-4 h-4" />}>Customer Details</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Customer Name *">
                    <Input value={form.customer_name} onChange={(e) => upd("customer_name", e.target.value)} placeholder="Full name" />
                  </Field>
                  <Field label="Company">
                    <Input value={form.customer_company} onChange={(e) => upd("customer_company", e.target.value)} placeholder="Company name (optional)" />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={form.customer_email} onChange={(e) => upd("customer_email", e.target.value)} placeholder="customer@example.com" />
                  </Field>
                  <Field label="Phone (with country code)">
                    <Input value={form.customer_phone} onChange={(e) => upd("customer_phone", e.target.value)} placeholder="+2348012345678" />
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <Textarea rows={2} value={form.customer_address} onChange={(e) => upd("customer_address", e.target.value)} placeholder="Street, City, State, Country" />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* Quote description */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <SectionTitle>Quote / Shipment Description</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Type">
                    <Select value={form.shipment_type} onValueChange={(v: any) => upd("shipment_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="import">Import</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Method">
                    <Select value={form.shipping_method} onValueChange={(v) => upd("shipping_method", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="air">Air</SelectItem>
                        <SelectItem value="ocean">Ocean / Sea</SelectItem>
                        <SelectItem value="road">Road</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Weight (kg)">
                    <Input type="number" min="0" step="0.1" value={form.weight_kg} onChange={(e) => upd("weight_kg", e.target.value)} />
                  </Field>
                  <Field label="Origin Country">
                    <Input value={form.origin_country} onChange={(e) => upd("origin_country", e.target.value)} placeholder="e.g. China" />
                  </Field>
                  <Field label="Destination Country">
                    <Input value={form.destination_country} onChange={(e) => upd("destination_country", e.target.value)} placeholder="e.g. Nigeria" />
                  </Field>
                  <Field label="Valid Until">
                    <Input type="date" value={form.valid_until} onChange={(e) => upd("valid_until", e.target.value)} />
                  </Field>
                </div>
                <Field label="Shipment / Project Description">
                  <Textarea rows={3} value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="Brief explanation of the shipment, route, and service to be provided…" />
                </Field>
              </CardContent>
            </Card>

            {/* Line items */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <SectionTitle>Items / Boxes Being Picked Up</SectionTitle>
                  <Button size="sm" variant="outline" onClick={addRow} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Box / Item
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Describe each physical box / item separately. Freight, customs, handling, VAT and insurance go in the Cost Breakdown section below.
                </p>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full text-sm min-w-[860px]">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b">
                        <th className="text-left font-semibold py-2 px-2 w-[34%]">Description / Contents</th>
                        <th className="text-left font-semibold py-2 px-2 w-[20%]">Dimensions (L×W×H cm)</th>
                        <th className="text-right font-semibold py-2 px-2 w-[10%]">Qty</th>
                        <th className="text-right font-semibold py-2 px-2 w-[14%]">Unit Price</th>
                        <th className="text-right font-semibold py-2 px-2 w-[14%]">Amount</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const amount = Number(r.quantity || 0) * Number(r.unit_price || 0);
                        return (
                          <tr key={r.id} className="border-b last:border-0">
                            <td className="py-2 px-2">
                              <Input value={r.description} onChange={(e) => updateRow(r.id, { description: e.target.value })} placeholder="e.g. Box 1 — clothes & shoes" />
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                <Input type="number" min="0" step="0.1" value={r.length_cm ?? ""} onChange={(e) => updateRow(r.id, { length_cm: e.target.value === "" ? null : Number(e.target.value) })} placeholder="L" className="text-center px-2" />
                                <span className="text-muted-foreground">×</span>
                                <Input type="number" min="0" step="0.1" value={r.width_cm ?? ""} onChange={(e) => updateRow(r.id, { width_cm: e.target.value === "" ? null : Number(e.target.value) })} placeholder="W" className="text-center px-2" />
                                <span className="text-muted-foreground">×</span>
                                <Input type="number" min="0" step="0.1" value={r.height_cm ?? ""} onChange={(e) => updateRow(r.id, { height_cm: e.target.value === "" ? null : Number(e.target.value) })} placeholder="H" className="text-center px-2" />
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <Input type="number" min="0" step="1" value={r.quantity} onChange={(e) => updateRow(r.id, { quantity: Number(e.target.value) })} className="text-right" />
                            </td>
                            <td className="py-2 px-2">
                              <Input type="number" min="0" step="0.01" value={r.unit_price} onChange={(e) => updateRow(r.id, { unit_price: Number(e.target.value) })} className="text-right" />
                            </td>
                            <td className="py-2 px-2 text-right font-semibold tabular-nums">
                              {formatMoney(amount, form.currency)}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <Button variant="ghost" size="iconSm" onClick={() => removeRow(r.id)} disabled={rows.length === 1}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Notes & terms */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <SectionTitle>Notes &amp; Terms</SectionTitle>
                <Field label="Special Notes &amp; Instructions">
                  <Textarea rows={3} value={form.notes} onChange={(e) => upd("notes", e.target.value)} placeholder="Delivery instructions, payment terms, customs notes…" />
                </Field>
                <Field label="Terms / Validity Statement">
                  <Textarea rows={3} value={form.terms} onChange={(e) => upd("terms", e.target.value)} />
                </Field>
              </CardContent>
            </Card>
          </div>

          {/* Totals sidebar */}
          <div className="space-y-5">
            <Card className="lg:sticky lg:top-6">
              <CardContent className="p-5 space-y-4">
                <SectionTitle>Cost Breakdown</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Currency">
                    <Select value={form.currency} onValueChange={(v) => upd("currency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Freight / Shipping">
                    <Input type="number" min="0" step="0.01" value={form.freight} onChange={(e) => upd("freight", e.target.value)} />
                  </Field>
                  <Field label="Customs Clearance">
                    <Input type="number" min="0" step="0.01" value={form.customs} onChange={(e) => upd("customs", e.target.value)} />
                  </Field>
                  <Field label="Handling Fee">
                    <Input type="number" min="0" step="0.01" value={form.handling} onChange={(e) => upd("handling", e.target.value)} />
                  </Field>
                  <Field label="Insurance">
                    <Input type="number" min="0" step="0.01" value={form.insurance} onChange={(e) => upd("insurance", e.target.value)} />
                  </Field>
                  <Field label="Discount">
                    <Input type="number" min="0" value={form.discount} onChange={(e) => upd("discount", e.target.value)} />
                  </Field>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div className="text-sm">
                    <p className="font-semibold">Apply VAT</p>
                    <p className="text-xs text-muted-foreground">Tax on subtotal + charges − discount</p>
                  </div>
                  <Switch checked={form.vat_enabled} onCheckedChange={(v) => upd("vat_enabled", v)} />
                </div>
                {form.vat_enabled && (
                  <Field label="VAT %">
                    <Input type="number" min="0" step="0.1" value={form.vat_percent} onChange={(e) => upd("vat_percent", e.target.value)} />
                  </Field>
                )}
                <div className="space-y-2 border-t pt-4 text-sm">
                  <Row label="Items Subtotal" value={formatMoney(totals.itemsSubtotal, form.currency)} />
                  {totals.freight > 0 && <Row label="Freight / Shipping" value={formatMoney(totals.freight, form.currency)} />}
                  {totals.customs > 0 && <Row label="Customs Clearance" value={formatMoney(totals.customs, form.currency)} />}
                  {totals.handling > 0 && <Row label="Handling Fee" value={formatMoney(totals.handling, form.currency)} />}
                  {totals.insurance > 0 && <Row label="Insurance" value={formatMoney(totals.insurance, form.currency)} />}
                  {totals.discount > 0 && <Row label="Discount" value={`− ${formatMoney(totals.discount, form.currency)}`} />}
                  {form.vat_enabled && <Row label={`VAT (${form.vat_percent}%)`} value={formatMoney(totals.vat, form.currency)} />}
                  <div className="flex items-center justify-between rounded-md bg-primary px-3 py-2.5 text-primary-foreground">
                    <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
                    <span className="text-lg font-extrabold tabular-nums">{formatMoney(totals.total, form.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PdfPreviewDialog open={pdfOpen} onOpenChange={setPdfOpen} quote={savedQuote} onUpdated={() => { /* refresh handled by edit page */ }} />
      <WhatsAppShareDialog open={waOpen} onOpenChange={setWaOpen} quote={savedQuote} onSent={() => { /* no-op */ }} />
    </AdminLayout>
  );
};

const SectionTitle = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    {icon}
    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{children}</h2>
  </div>
);

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</Label>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold tabular-nums">{value}</span>
  </div>
);

export default AdminQuotationBuilder;