import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claims } = await userClient.auth.getClaims(token);
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const callerId = claims.claims.sub as string;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { quotation_id } = await req.json();
    if (!quotation_id) {
      return new Response(JSON.stringify({ error: 'quotation_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: quote, error } = await supabase.from('quotations').select('*').eq('id', quotation_id).single();
    if (error || !quote) {
      return new Response(JSON.stringify({ error: 'Quotation not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (quote.user_id !== callerId) {
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: callerId, _role: 'admin' });
      if (!isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const html = renderHTML(quote);
    const filePath = `quotations/${quote.quote_number}.html`;
    const { error: upErr } = await supabase.storage.from('invoices').upload(filePath, new Blob([html], { type: 'text/html' }), { contentType: 'text/html', upsert: true });
    if (upErr) {
      return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    await supabase.from('quotations').update({ pdf_url: filePath }).eq('id', quotation_id);

    return new Response(JSON.stringify({ success: true, file_path: filePath }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to generate quotation' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function fmt(n: number, c: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: (c || 'USD').toUpperCase(), minimumFractionDigits: 2 }).format(Number(n || 0));
}

function renderHTML(q: any) {
  const created = new Date(q.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  const valid = new Date(q.valid_until).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  const ngnLine = q.ngn_total && (q.currency || '').toUpperCase() !== 'NGN'
    ? `<div class="row"><span>NGN equivalent</span><span>₦${Number(q.ngn_total).toLocaleString('en-NG')}</span></div>` : '';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Quotation ${q.quote_number}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;color:#0f172a;background:#f5f5f7;padding:24px;}
.doc{max-width:780px;margin:0 auto;background:#fff;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.06);border-radius:12px;}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #061043;padding-bottom:20px;margin-bottom:24px;}
.brand h1{font-size:24px;color:#061043;letter-spacing:-.5px;}
.brand p{font-size:11px;color:#64748b;margin-top:4px;letter-spacing:.5px;text-transform:uppercase;}
.doc-meta{text-align:right;}
.doc-meta .tag{display:inline-block;background:#DF5101;color:#fff;padding:6px 14px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
.doc-meta h2{font-size:18px;margin-top:8px;color:#061043;}
.doc-meta p{font-size:12px;color:#64748b;margin-top:4px;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;}
.card h3{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:10px;}
.card p{font-size:13px;line-height:1.7;color:#1e293b;}
.card p strong{color:#0f172a;}
table{width:100%;border-collapse:collapse;margin-bottom:24px;}
thead{background:#061043;color:#fff;}
th{text-align:left;padding:12px 14px;font-size:11px;text-transform:uppercase;letter-spacing:.8px;font-weight:700;}
th.r,td.r{text-align:right;}
td{padding:12px 14px;font-size:13px;border-bottom:1px solid #e2e8f0;}
tr:last-child td{border-bottom:none;}
.totals{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-left:auto;max-width:340px;}
.row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569;}
.row.total{border-top:2px solid #061043;margin-top:8px;padding-top:12px;font-size:16px;font-weight:800;color:#061043;}
.notice{margin-top:24px;padding:14px 18px;background:#fef3e7;border-left:4px solid #DF5101;border-radius:6px;font-size:12px;color:#7c2d12;}
.footer{margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;}
</style></head><body>
<div class="doc">
  <div class="head">
    <div class="brand"><h1>RAC Logistics</h1><p>Global Logistics Solutions</p></div>
    <div class="doc-meta">
      <span class="tag">Quotation</span>
      <h2>${q.quote_number}</h2>
      <p>Issued ${created}<br>Valid until ${valid}</p>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Customer</h3>
      <p><strong>${q.customer_name}</strong></p>
      ${q.customer_email ? `<p>${q.customer_email}</p>` : ''}
      ${q.customer_phone ? `<p>${q.customer_phone}</p>` : ''}
    </div>
    <div class="card">
      <h3>Shipment</h3>
      <p><strong>${(q.shipment_type || '').toUpperCase()}</strong> · ${(q.shipping_method || '').toUpperCase()}</p>
      <p>${q.origin_country}${q.origin_city ? ', ' + q.origin_city : ''} → ${q.destination_country}${q.destination_city ? ', ' + q.destination_city : ''}</p>
      <p>Weight: ${Number(q.weight_kg).toFixed(2)} kg${q.chargeable_weight ? ` (Chargeable ${Number(q.chargeable_weight).toFixed(2)} kg)` : ''}</p>
    </div>
  </div>

  <table>
    <thead><tr><th>Description</th><th class="r">Amount</th></tr></thead>
    <tbody>
      <tr><td>Shipping (${Number(q.chargeable_weight || q.weight_kg).toFixed(2)} kg)</td><td class="r">${fmt(q.subtotal, q.currency)}</td></tr>
      <tr><td>Handling &amp; Customs</td><td class="r">${fmt(Number(q.handling_fee) + Number(q.customs_fee), q.currency)}</td></tr>
      <tr><td>VAT</td><td class="r">${fmt(q.vat, q.currency)}</td></tr>
      <tr><td>Insurance</td><td class="r">${fmt(q.insurance, q.currency)}</td></tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${fmt(Number(q.subtotal) + Number(q.handling_fee) + Number(q.customs_fee), q.currency)}</span></div>
    <div class="row"><span>VAT + Insurance</span><span>${fmt(Number(q.vat) + Number(q.insurance), q.currency)}</span></div>
    <div class="row total"><span>Total</span><span>${fmt(q.total, q.currency)}</span></div>
    ${ngnLine}
  </div>

  <div class="notice">This quotation is valid until ${valid}. Pricing is subject to change after this date. Final invoice may include verified weight adjustments.</div>

  ${q.notes ? `<div class="card" style="margin-top:20px;"><h3>Notes</h3><p>${q.notes}</p></div>` : ''}

  <div class="footer">RAC Logistics · info@raclogisticltd.com · Thank you for your business.</div>
</div>
</body></html>`;
}