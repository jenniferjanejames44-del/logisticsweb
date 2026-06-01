import { supabase } from "@/integrations/supabase/client";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

export interface Quotation {
  id: string;
  quote_number: string;
  user_id: string | null;
  created_by: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipment_type: "import" | "export";
  origin_country: string;
  origin_city: string | null;
  destination_country: string;
  destination_city: string | null;
  warehouse_country: string | null;
  shipping_method: string;
  service_type: string | null;
  weight_kg: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  chargeable_weight: number | null;
  description: string | null;
  declared_value: number;
  pricing_rule_id: string | null;
  currency: string;
  subtotal: number;
  handling_fee: number;
  customs_fee: number;
  vat: number;
  insurance: number;
  total: number;
  pricing_snapshot: any;
  ngn_total: number | null;
  status: QuoteStatus;
  valid_until: string;
  pdf_url: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  converted_at: string | null;
  converted_shipment_id: string | null;
  converted_invoice_id: string | null;
  notes: string | null;
  terms?: string | null;
  customer_company?: string | null;
  customer_address?: string | null;
  discount?: number;
  line_items?: QuoteLineItem[];
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
}

export const QUOTE_STATUSES: QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "converted",
];

export const formatMoney = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "USD").toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export const formatNgn = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const normalizePhone = (phone?: string | null) =>
  (phone || "").replace(/[^\d]/g, "");

export function buildWhatsAppMessage(q: Quotation, pdfLink?: string) {
  const totalLine = `${q.currency.toUpperCase()} ${Number(q.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const ngnLine =
    q.ngn_total && q.currency.toUpperCase() !== "NGN"
      ? `\n≈ ${formatNgn(q.ngn_total)} (Paystack)`
      : "";
  const link = pdfLink || q.pdf_url || "";
  const linkLine = link ? `\n\nView your quotation: ${link}` : "";
  const validUntil = new Date(q.valid_until).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `Hello ${q.customer_name},

Your RAC Logistics quotation is ready.

Quote No: ${q.quote_number}
Shipment: ${q.origin_country} → ${q.destination_country}
Total: ${totalLine}${ngnLine}
Valid Until: ${validUntil}${linkLine}

Thank you,
RAC Logistics`;
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = normalizePhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export async function getQuotationPdfSignedUrl(pdfPath: string) {
  const { data, error } = await supabase.storage
    .from("invoices")
    .createSignedUrl(pdfPath, 60 * 60 * 24 * 7);
  if (error) throw error;
  return data.signedUrl;
}

/** Convert a quote to a shipment. Returns new shipment id. */
export async function convertQuoteToShipment(q: Quotation, userId: string) {
  const { data: shipment, error } = await (supabase as any)
    .from("shipments")
    .insert({
      user_id: userId,
      origin_country: q.origin_country,
      origin_city: q.origin_city || "",
      destination_country: q.destination_country,
      destination_city: q.destination_city || "",
      weight: q.weight_kg,
      actual_weight: q.weight_kg,
      chargeable_weight: q.chargeable_weight || q.weight_kg,
      length_cm: q.length_cm,
      width_cm: q.width_cm,
      height_cm: q.height_cm,
      service_type: q.service_type || q.shipping_method,
      description: q.description,
      price: q.total,
      package_price: q.declared_value || 0,
      warehouse_location: q.warehouse_country,
      receiver_name: q.customer_name,
      receiver_phone: q.customer_phone,
      sender_name: q.customer_name,
      payment_status: "unpaid",
      status: "shipment_created",
      items_json: { pricing: q.pricing_snapshot, source_quote_id: q.id },
    })
    .select()
    .single();
  if (error) throw error;

  await (supabase as any)
    .from("quotations")
    .update({
      status: "converted",
      converted_at: new Date().toISOString(),
      converted_shipment_id: shipment.id,
    })
    .eq("id", q.id);

  return shipment.id as string;
}

/** Convert directly to an invoice (no shipment). */
export async function convertQuoteToInvoice(q: Quotation, userId: string) {
  // Requires a shipment_id (invoices table not-null). Create a stub shipment first.
  const shipmentId = await convertQuoteToShipment(q, userId);
  // The auto_create_invoice trigger creates the invoice. Find it and link.
  const { data: invoice } = await (supabase as any)
    .from("invoices")
    .select("id")
    .eq("shipment_id", shipmentId)
    .maybeSingle();
  if (invoice?.id) {
    await (supabase as any)
      .from("quotations")
      .update({ converted_invoice_id: invoice.id })
      .eq("id", q.id);
  }
  return invoice?.id as string | undefined;
}
