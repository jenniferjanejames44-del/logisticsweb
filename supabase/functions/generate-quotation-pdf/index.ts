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
    const filePath = `quotations/${quote.id}/${quote.quote_number}-RAC-Quotation.html`;
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

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fmt(n: number, c: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (c || 'USD').toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

function chargeRow(label: string, amount: number, currency: string, note = '') {
  return `<tr><td>${escapeHtml(label)}${note ? `<small>${escapeHtml(note)}</small>` : ''}</td><td class="r">${fmt(amount, currency)}</td></tr>`;
}

function renderHTML(q: any) {
  const created = fmtDate(q.created_at);
  const valid = fmtDate(q.valid_until);
  const currency = (q.currency || 'USD').toUpperCase();
  const chargeable = Number(q.chargeable_weight || q.weight_kg || 0);
  const dims = [q.length_cm, q.width_cm, q.height_cm].filter(Boolean).length === 3
    ? `${q.length_cm} × ${q.width_cm} × ${q.height_cm} cm`
    : 'Not specified';
  const reference = `RAC-QTN-${String(q.id || '').slice(0, 8).toUpperCase()}`;
  const status = String(q.status || 'draft').replace(/_/g, ' ').toUpperCase();
  const ngnLine = q.ngn_total && currency !== 'NGN'
    ? `<tr><td>NGN payable estimate</td><td class="r">&#8358;${Number(q.ngn_total).toLocaleString('en-NG')}</td></tr>` : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>RAC Logistics Quotation ${escapeHtml(q.quote_number)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#1d2433;background:#e9ecef;font-size:11px;line-height:1.45;-webkit-font-smoothing:antialiased;}
.document{width:210mm;min-height:297mm;margin:18px auto;background:#fff;padding:18mm;box-shadow:0 2px 20px rgba(0,0,0,.12);position:relative;overflow:hidden;}
:root{--navy:#061043;--orange:#DF5101;--ink:#1d2433;--muted:#667085;--line:#cbd5e1;--soft:#f4f7fb;}
table{width:100%;border-collapse:collapse;}.r{text-align:right;}.muted{color:var(--muted);}.strong{font-weight:800;color:var(--navy);}small{display:block;color:var(--muted);font-size:8.5px;margin-top:2px;}
.top{width:100%;margin-bottom:14px;table-layout:fixed;}.top td{vertical-align:top;padding:0;}.brand-cell{width:61%;padding-right:18px!important;}.doc-cell{width:39%;text-align:right;padding-left:18px!important;}
.brand-logo{height:60px;width:auto;max-width:330px;display:block;margin-bottom:8px;}.brand-sub{font-size:9px;color:#777;font-style:italic;margin-bottom:6px;letter-spacing:.4px;text-transform:uppercase;}.brand-details{font-size:9.8px;color:#444;line-height:1.65;}.rc-label{font-size:10px;color:#444;font-weight:700;margin-top:6px;}
.doc-title{font-size:35px;font-weight:900;color:var(--navy);letter-spacing:3.5px;text-transform:uppercase;line-height:.95;margin-bottom:10px;}.status{display:inline-block;background:var(--orange);color:#fff;font-weight:800;font-size:9px;letter-spacing:.8px;text-transform:uppercase;padding:5px 10px;margin-bottom:8px;}
.doc-meta{display:inline-table;width:100%;max-width:245px;border-top:3px solid var(--navy);border-bottom:1px solid var(--line);}.doc-meta div{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid var(--line);padding:5px 0;font-size:9.5px;}.doc-meta div:last-child{border-bottom:0;}.doc-meta span:first-child{color:#666;font-weight:800;text-transform:uppercase;}.doc-meta span:last-child{font-weight:800;text-align:right;color:var(--ink);}
.divider{height:3.5px;background:var(--navy);margin:0 0 14px;}.bar{background:var(--navy);color:#fff;font-size:10px;font-weight:800;padding:6px 10px;letter-spacing:.4px;text-transform:uppercase;}.bar.orange{background:var(--orange);}
.intro{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}.box{border:1px solid var(--line);background:#fff;}.box-body{padding:10px;font-size:10.5px;line-height:1.75;min-height:82px;}.box-body strong{color:var(--navy);font-size:11.5px;}.route{background:var(--soft);border:1px solid var(--line);padding:10px 12px;margin-bottom:14px;display:grid;grid-template-columns:1.1fr .9fr;gap:14px;align-items:center;}.route h2{font-size:18px;color:var(--navy);line-height:1.2;}.route p{font-size:10px;color:var(--muted);margin-top:4px;}.route-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;}.pill{border:1px solid var(--line);background:#fff;padding:7px 8px;}.pill span{display:block;color:var(--muted);font-size:8px;font-weight:800;text-transform:uppercase;}.pill strong{display:block;color:var(--ink);font-size:10px;margin-top:2px;}
.charges{border:1px solid var(--line);margin-bottom:14px;}.charges th{background:var(--navy);color:#fff;padding:7px 10px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.35px;}.charges td{padding:8px 10px;font-size:10.5px;border:1px solid var(--line);}.charges td:first-child{font-weight:700;color:var(--ink);}.charges .r{font-weight:800;white-space:nowrap;}
.bottom{margin-top:4px;}.bottom>tbody>tr>td{vertical-align:top;}.terms{border:1px solid var(--line);}.terms-body{padding:10px;font-size:9.5px;color:#475467;line-height:1.7;}.sum{border:1px solid var(--line);}.sum td{padding:6px 10px;font-size:10.5px;border:1px solid var(--line);}.sum td:first-child{font-weight:700;background:var(--soft);}.sum td:last-child{text-align:right;font-weight:800;}.sum .grand td{background:var(--navy);color:#fff;font-size:12px;font-weight:900;}.sum .ngn td{background:#fff7ed;color:#7c2d12;}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px;}.sig-line{border-top:1px solid var(--line);padding-top:6px;font-size:9px;color:var(--muted);}.notice{margin-top:14px;padding:10px 12px;background:#fff7ed;border-left:4px solid var(--orange);font-size:9.5px;color:#7c2d12;}.footer{margin-top:20px;padding-top:10px;border-top:3px solid var(--navy);text-align:center;}.footer .ftr-brand{font-size:12px;font-weight:900;color:var(--navy);letter-spacing:1px;}.footer p{font-size:9.5px;color:#666;margin-bottom:3px;}
@media screen and (max-width:800px){html,body{background:#fff;}.document{width:100%;min-height:auto;margin:0;padding:14px;box-shadow:none;}.top,.top tbody,.top tr,.top td{display:block;width:100%!important;padding:0!important;}.doc-cell{text-align:left;margin-top:14px;}.doc-title{text-align:left;font-size:28px;}.doc-meta{max-width:100%;}.intro,.route,.sign{grid-template-columns:1fr;}.charges{min-width:520px;}.charges-wrap{overflow-x:auto;}.bottom,.bottom tbody,.bottom tr,.bottom td{display:block;width:100%!important;padding:0!important;}.bottom td{margin-bottom:10px;}}
@media print{html,body{background:#fff;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.document{width:100%;min-height:auto;margin:0;padding:10mm 14mm;box-shadow:none;}}
</style></head><body>
<div class="document">
  <table class="top"><tr>
    <td class="brand-cell">
      <svg class="brand-logo" viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet"><g fill="#07145C"><path d="M22 26h104c62 0 110 16 141 56l13 18H114c-42 0-72-9-91-26C11 64 4 48 0 26h22Z"/><path d="M10 111h106v110c-39 0-70-11-91-31C7 170 0 144 0 111h10Z"/><rect x="126" y="111" width="112" height="64" rx="2"/></g><circle cx="144" cy="188" r="29" fill="#DF5101"/><text x="286" y="122" fill="#07145C" font-family="'DM Sans','Helvetica Neue',Arial,sans-serif" font-size="126" font-weight="900" letter-spacing="-5">RAC</text><text x="290" y="194" fill="#07145C" font-family="'DM Sans','Helvetica Neue',Arial,sans-serif" font-size="72" font-weight="800" letter-spacing="2">LOGISTICS</text></svg>
      <div class="brand-sub">Courier &amp; Freight Services</div>
      <div class="brand-details">29b Osolo Way, Opposite Polaris Bank, Ajao Estate, Isolo, Lagos State<br>+234 818 595 6707 &nbsp;·&nbsp; info@raclogisticltd.com &nbsp;·&nbsp; www.raclogisticltd.com</div>
      <div class="rc-label">RC: 1454183</div>
    </td>
    <td class="doc-cell">
      <div class="status">${escapeHtml(status)}</div>
      <div class="doc-title">Quotation</div>
      <div class="doc-meta">
        <div><span>No.</span><span>${escapeHtml(q.quote_number)}</span></div>
        <div><span>Date</span><span>${created}</span></div>
        <div><span>Valid Until</span><span>${valid}</span></div>
        <div><span>Ref</span><span>${reference}</span></div>
      </div>
    </td>
  </tr></table>
  <div class="divider"></div>

  <div class="intro">
    <div class="box"><div class="bar">Prepared For</div><div class="box-body"><strong>${escapeHtml(q.customer_name)}</strong><br>${q.customer_email ? `${escapeHtml(q.customer_email)}<br>` : ''}${q.customer_phone ? `${escapeHtml(q.customer_phone)}<br>` : ''}<span class="muted">Customer quotation for RAC Logistics freight service.</span></div></div>
    <div class="box"><div class="bar orange">Quotation Summary</div><div class="box-body"><strong>${escapeHtml(String(q.shipment_type || '').toUpperCase())} SHIPMENT</strong><br>${escapeHtml(String(q.shipping_method || '').toUpperCase())}${q.service_type ? ` · ${escapeHtml(q.service_type)}` : ''}<br><span class="muted">Service subject to verified shipment details and final operational review.</span></div></div>
  </div>

  <div class="route">
    <div><h2>${escapeHtml(q.origin_country)}${q.origin_city ? `, ${escapeHtml(q.origin_city)}` : ''} &rarr; ${escapeHtml(q.destination_country)}${q.destination_city ? `, ${escapeHtml(q.destination_city)}` : ''}</h2><p>${escapeHtml(q.description || 'General logistics shipment')}</p></div>
    <div class="route-grid">
      <div class="pill"><span>Actual Weight</span><strong>${Number(q.weight_kg || 0).toFixed(2)} KG</strong></div>
      <div class="pill"><span>Chargeable</span><strong>${chargeable.toFixed(2)} KG</strong></div>
      <div class="pill"><span>Dimensions</span><strong>${escapeHtml(dims)}</strong></div>
      <div class="pill"><span>Declared Value</span><strong>${fmt(Number(q.declared_value || 0), currency)}</strong></div>
    </div>
  </div>

  <div class="charges-wrap"><table class="charges">
    <thead><tr><th>Description</th><th class="r">Amount</th></tr></thead>
    <tbody>
      ${chargeRow(`Freight charge (${chargeable.toFixed(2)} KG)`, Number(q.subtotal || 0), currency, 'Calculated from RAC Logistics pricing engine')}
      ${chargeRow('Handling fee', Number(q.handling_fee || 0), currency)}
      ${chargeRow('Customs / clearing estimate', Number(q.customs_fee || 0), currency)}
      ${chargeRow('VAT', Number(q.vat || 0), currency)}
      ${chargeRow('Insurance', Number(q.insurance || 0), currency)}
    </tbody>
  </table></div>

  <table class="bottom"><tr>
    <td style="width:55%;padding-right:10px;"><div class="terms"><div class="bar">Terms &amp; Notes</div><div class="terms-body">This quotation is valid until <strong>${valid}</strong>. Pricing is based on the details provided and may change after physical verification, dimensional weight confirmation, customs assessment, or special handling requirements.${q.notes ? `<br><br><strong>Admin Note:</strong> ${escapeHtml(q.notes)}` : ''}</div></div></td>
    <td style="width:45%;"><table class="sum">
      <tr><td>Subtotal</td><td>${fmt(Number(q.subtotal || 0) + Number(q.handling_fee || 0) + Number(q.customs_fee || 0), currency)}</td></tr>
      <tr><td>VAT + Insurance</td><td>${fmt(Number(q.vat || 0) + Number(q.insurance || 0), currency)}</td></tr>
      ${ngnLine ? ngnLine.replace('<tr>', '<tr class="ngn">') : ''}
      <tr class="grand"><td>Total Due (${currency})</td><td>${fmt(q.total, currency)}</td></tr>
    </table></td>
  </tr></table>

  <div class="sign"><div class="sig-line">Prepared by RAC Logistics</div><div class="sig-line">Customer Approval / Signature</div></div>
  <div class="notice">For payment or shipment conversion, this quotation should be reviewed and confirmed from the RAC Logistics dashboard or by an authorized RAC Logistics representative.</div>
  <div class="footer"><p class="ftr-brand">RAC LOGISTICS LTD</p><p>Thank you for choosing RAC Logistics.</p><p>Questions about this quotation? Contact info@raclogisticltd.com or +234 818 595 6707.</p></div>
</div>
</body></html>`;
}