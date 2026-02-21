import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: 'invoice_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch invoice with shipment and profile data
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (invError || !invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', invoice.shipment_id)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', invoice.user_id)
      .single();

    // Generate HTML invoice
    const html = generateInvoiceHTML(invoice, shipment, profile);

    // Store HTML as a file in storage bucket
    const fileName = `${invoice.user_id}/${invoice.invoice_number}.html`;
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, new Blob([html], { type: 'text/html' }), {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to store invoice' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update invoice with PDF URL
    const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(fileName);

    await supabase
      .from('invoices')
      .update({ pdf_url: fileName })
      .eq('id', invoice_id);

    return new Response(JSON.stringify({ success: true, file_path: fileName }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateInvoiceHTML(invoice: any, shipment: any, profile: any) {
  const date = new Date(invoice.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'N/A';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${invoice.invoice_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; }
  .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0a1628; padding-bottom: 20px; }
  .company h1 { font-size: 28px; color: #0a1628; font-weight: 800; }
  .company p { color: #666; font-size: 13px; margin-top: 4px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 32px; color: #0a1628; font-weight: 300; letter-spacing: 2px; }
  .invoice-meta .number { font-size: 16px; font-weight: 700; color: #c8a45a; margin-top: 4px; }
  .invoice-meta .date { font-size: 13px; color: #666; margin-top: 4px; }
  .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .party { flex: 1; }
  .party h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 8px; }
  .party p { font-size: 14px; line-height: 1.6; }
  .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  .details-table th { background: #0a1628; color: #fff; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .details-table td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
  .details-table tr:nth-child(even) { background: #f9f9fb; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
  .totals-table { width: 280px; }
  .totals-table tr td { padding: 8px 16px; font-size: 14px; }
  .totals-table tr td:last-child { text-align: right; font-weight: 600; }
  .totals-table .total-row { border-top: 2px solid #0a1628; }
  .totals-table .total-row td { font-size: 18px; font-weight: 700; color: #0a1628; padding-top: 12px; }
  .status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .status-unpaid { background: #fff3cd; color: #856404; }
  .status-paid { background: #d4edda; color: #155724; }
  .status-overdue { background: #f8d7da; color: #721c24; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
  .shipment-info { background: #f8f9fb; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
  .shipment-info h3 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #0a1628; }
  .shipment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .shipment-grid .label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
  .shipment-grid .value { font-size: 14px; font-weight: 500; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .invoice { padding: 20px; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="company">
      <h1>RAC Logistics</h1>
      <p>29b Osolo Way, Opposite Polaris Bank</p>
      <p>Ajao Estate, Isolo, Lagos State</p>
      <p>info@raclogistics.com</p>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <div class="number">${invoice.invoice_number}</div>
      <div class="date">Date: ${date}</div>
      <div class="date">Due: ${dueDate}</div>
      <div style="margin-top: 8px;">
        <span class="status status-${invoice.status}">${invoice.status}</span>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Bill To</h3>
      <p><strong>${profile?.full_name || 'Customer'}</strong></p>
      <p>${profile?.email || ''}</p>
      <p>${profile?.phone || ''}</p>
      <p>${profile?.address || ''}</p>
      <p>${profile?.city || ''}${profile?.country ? ', ' + profile.country : ''}</p>
    </div>
    <div class="party" style="text-align: right;">
      <h3>Payment Info</h3>
      <p>Reference: ${invoice.payment_reference || 'Pending'}</p>
      <p>Method: Wallet Balance</p>
    </div>
  </div>

  ${shipment ? `
  <div class="shipment-info">
    <h3>Shipment Details</h3>
    <div class="shipment-grid">
      <div><span class="label">Tracking Number</span><div class="value">${shipment.tracking_number}</div></div>
      <div><span class="label">Service Type</span><div class="value" style="text-transform: capitalize;">${shipment.service_type.replace(/[-_]/g, ' ')}</div></div>
      <div><span class="label">Origin</span><div class="value">${shipment.origin_city}, ${shipment.origin_country}</div></div>
      <div><span class="label">Destination</span><div class="value">${shipment.destination_city}, ${shipment.destination_country}</div></div>
      <div><span class="label">Weight</span><div class="value">${shipment.weight} KG</div></div>
      <div><span class="label">Status</span><div class="value" style="text-transform: capitalize;">${shipment.status.replace(/_/g, ' ')}</div></div>
    </div>
  </div>` : ''}

  <table class="details-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Service</th>
        <th>Weight</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Shipping Service - ${shipment?.tracking_number || 'N/A'}</td>
        <td style="text-transform: capitalize;">${shipment?.service_type?.replace(/[-_]/g, ' ') || 'N/A'}</td>
        <td>${shipment?.weight || 0} KG</td>
        <td style="text-align: right;">$${Number(invoice.amount).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table class="totals-table">
      <tr><td>Subtotal</td><td>$${Number(invoice.amount).toFixed(2)}</td></tr>
      <tr><td>Tax (0%)</td><td>$0.00</td></tr>
      <tr class="total-row"><td>Total</td><td>$${Number(invoice.amount).toFixed(2)}</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for choosing RAC Logistics</p>
    <p style="margin-top: 4px;">For questions about this invoice, contact us at info@raclogistics.com</p>
  </div>
</div>
</body>
</html>`;
}
