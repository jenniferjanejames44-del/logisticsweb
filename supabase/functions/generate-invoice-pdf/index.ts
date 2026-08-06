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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Require authenticated caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const callerId = claimsData.claims.sub as string;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: 'invoice_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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

    // Authorize: only invoice owner or an admin may generate this PDF
    if (invoice.user_id !== callerId) {
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: callerId,
        _role: 'admin',
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
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

    const html = generateInvoiceHTML(invoice, shipment, profile);

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

    await supabase
      .from('invoices')
      .update({ pdf_url: fileName })
      .eq('id', invoice_id);

    return new Response(JSON.stringify({ success: true, file_path: fileName }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate invoice' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function fmt(val: number, currency: string): string {
  void currency;
  const normalizedCurrency = "USD";
  const locale = "en-US";

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(val || 0));
}

function generateInvoiceHTML(invoice: any, shipment: any, profile: any) {
  const date = new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A';
  const paidDate = invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : date;

  const isPaid = invoice.status === 'paid';
  const amount = Number(invoice.amount);
  const shippingRate = Number(invoice.shipping_rate || amount);
  const clearingRate = Number(invoice.clearing_rate || 0);
  const deliveryRate = Number(invoice.delivery_rate || 0);
  const storageCharges = Number(invoice.storage_charges || 0);
  const insuranceCharges = Number(invoice.insurance_charges || 0);
  const additionalCharges = Number(invoice.additional_charges || 0);
  const pickupCharges = Number(invoice.pickup_charges || 0);
  const subtotal = Number(invoice.subtotal || amount);
  const totalAmount = amount;
  const amountPaid = isPaid ? totalAmount : 0;
  const totalDue = totalAmount - amountPaid;
  const currency = 'USD';
  // VAT is shown as inclusive of total (Nigerian standard 7.5%) for transparency
  const VAT_RATE = 7.5;
  const vatAmount = +(totalAmount - totalAmount / (1 + VAT_RATE / 100)).toFixed(2);
  const netAmount = +(totalAmount - vatAmount).toFixed(2);
  const chargeable = Number(shipment?.chargeable_weight || 0);
  const actualW = Number(shipment?.actual_weight || 0);
  const volW = Number(shipment?.volumetric_weight || 0);
  const weight = chargeable || shipment?.weight || invoice.weight_value || 0;
  const dimsParts = [shipment?.length_cm, shipment?.width_cm, shipment?.height_cm].filter((v: any) => v);
  const dimensions = dimsParts.length === 3
    ? `${dimsParts[0]} × ${dimsParts[1]} × ${dimsParts[2]} cm`
    : (invoice.dimensions || shipment?.description || 'N/A');
  const packageName = shipment?.package_name || '';
  const items: any[] = Array.isArray(shipment?.items_json) ? shipment.items_json : [];
  const itemsRows = items.length > 0
    ? items.map((it, i) => `
        <tr>
          <td>${i + 1}</td>
          <td style="text-align:left;">${(it.name || `Item ${i + 1}`).toString().replace(/</g,'&lt;')}</td>
          <td>${it.quantity || 1}</td>
          <td>${Number(it.weightKg || it.weight || 0).toFixed(2)} kg</td>
          <td>${it.declaredValue ? fmt(Number(it.declaredValue), currency) : '—'}</td>
        </tr>`).join('')
    : '';
  const serviceType = shipment?.service_type?.replace(/[-_]/g, ' ') || 'N/A';
  const trackingNumber = shipment?.tracking_number || 'N/A';

  const senderName = profile?.full_name || 'Customer';
  const senderCountry = profile?.country || '';
  const senderCity = profile?.city || '';
  const senderAddress = profile?.address || '';

  const destCity = shipment?.destination_city || '';
  const destCountry = shipment?.destination_country || '';

  const qrData = encodeURIComponent(`https://www.raclogisticltd.com/track?tracking=${trackingNumber}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrData}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice – ${invoice.invoice_number}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── Reset ── */
*{margin:0;padding:0;box-sizing:border-box;}

/* ── Page ── */
html,body{background:#e9ecef;font-family:'DM Sans','Helvetica Neue','Arial',sans-serif;color:#1a1a2e;font-size:11px;line-height:1.45;-webkit-font-smoothing:antialiased;}

.document{
  width:210mm;margin:20px auto;background:#fff;
  padding:20mm 18mm 18mm 18mm;
  box-shadow:0 2px 20px rgba(0,0,0,.12);
  position:relative;
}

/* ── Colour tokens ── */
:root{
  --navy:#002b80;
  --navy-dark:#001d5c;
  --blue-light:#eaf0fb;
  --border:#c5cdd8;
  --text:#1a1a2e;
  --text-light:#555;
  --green-bg:#d4edda;
  --green-text:#155724;
}

/* ── Utility ── */
table{border-collapse:collapse;}
.text-right{text-align:right;}

/* ══════════════════════════
   HEADER
   ══════════════════════════ */
.top-head{width:100%;margin-bottom:14px;table-layout:fixed;}
.top-head td{vertical-align:top;padding:0;}
.brand-cell{width:60%;padding-right:18px!important;}
.doc-cell{width:40%;text-align:right;padding-left:18px!important;}
.brand-logo{height:62px;width:auto;max-width:330px;display:block;margin-bottom:8px;}
.brand-sub{font-size:9px;color:#777;font-style:italic;margin-bottom:6px;letter-spacing:.4px;text-transform:uppercase;}
.brand-details{font-size:9.8px;color:#444;line-height:1.65;}
.rc-label{font-size:10px;color:#444;font-weight:700;margin-top:6px;}
.doc-title{
  font-size:39px;font-weight:900;color:var(--navy);
  letter-spacing:4px;text-align:right;margin:0 0 10px;
  text-transform:uppercase;line-height:.92;
}
.doc-meta{display:inline-table;width:100%;max-width:220px;border-top:3px solid var(--navy);border-bottom:1px solid var(--border);margin-bottom:10px;}
.doc-meta div{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid var(--border);padding:5px 0;font-size:9.5px;}
.doc-meta div:last-child{border-bottom:0;}
.doc-meta span:first-child{color:#666;font-weight:700;text-transform:uppercase;letter-spacing:.3px;}
.doc-meta span:last-child{color:var(--text);font-weight:800;text-align:right;}
.qr-img{width:78px;height:78px;display:inline-block;}
.qr-cap{font-size:8.5px;color:#666;margin-top:2px;text-align:right;letter-spacing:.3px;}

/* ── Divider ── */
.divider{height:3.5px;background:var(--navy);margin:0 0 14px 0;}

/* ── Blue bar ── */
.bar{background:var(--navy);color:#fff;font-size:10.5px;font-weight:700;padding:5px 10px;letter-spacing:.3px;}
.bar-sm{background:var(--navy);color:#fff;font-size:9.5px;font-weight:700;padding:4px 9px;}

/* ── Info table ── */
.info-tbl{width:100%;border:1px solid var(--border);margin-bottom:16px;}
.info-tbl td{padding:5px 10px;font-size:10.5px;border:1px solid var(--border);}
.info-tbl .lbl{font-weight:700;width:30%;background:var(--blue-light);}
.info-tbl .val{width:70%;}

/* ── Address ── */
.addr{width:100%;margin-bottom:16px;}
.addr td{vertical-align:top;}
.addr-box{border:1px solid var(--border);}
.addr-body{padding:8px 10px;font-size:10.5px;line-height:1.75;min-height:72px;}

/* ── Charges ── */
.chrg{width:100%;border:1px solid var(--border);margin-bottom:16px;}
.chrg th{
  background:var(--navy);color:#fff;padding:6px 5px;
  font-size:8.5px;font-weight:700;text-transform:uppercase;
  letter-spacing:.3px;text-align:center;border:1px solid var(--navy);
}
.chrg td{padding:6px 5px;font-size:10.5px;text-align:center;border:1px solid var(--border);}
.chrg .amt{font-weight:700;}

/* ── Additional services ── */
.addl{width:100%;border:1px solid var(--border);margin-bottom:16px;}
.addl th{
  background:var(--navy);color:#fff;padding:5px 8px;
  font-size:8.5px;font-weight:700;text-transform:uppercase;
  text-align:center;border:1px solid var(--navy);
}
.addl td{padding:5px 8px;font-size:10.5px;text-align:center;border:1px solid var(--border);}

/* ── Bottom layout ── */
.btm{width:100%;margin-top:6px;}
.btm>tbody>tr>td{vertical-align:top;}

.pay-box{border:1px solid var(--border);}
.pay-body{padding:10px;font-size:9.5px;line-height:1.7;color:#444;}

.sum{border:1px solid var(--border);}
.sum td{padding:5px 10px;font-size:10.5px;border:1px solid var(--border);}
.sum .lbl{font-weight:600;background:var(--blue-light);white-space:nowrap;}
.sum .val{text-align:right;font-weight:700;min-width:90px;}
.sum .total td{background:var(--navy);color:#fff;font-weight:800;font-size:11.5px;}
.sum .paid td{background:var(--green-bg);color:var(--green-text);font-weight:700;}

/* ── Paid watermark ── */
${isPaid ? `.document::after{
  content:'PAID';position:absolute;top:52%;left:50%;
  transform:translate(-50%,-50%) rotate(-28deg);
  font-size:130px;font-weight:900;color:rgba(0,153,51,.07);
  letter-spacing:22px;pointer-events:none;z-index:0;
}` : ''}

/* ── Footer ── */
.ftr{margin-top:24px;padding-top:10px;border-top:3px solid var(--navy);text-align:center;}
.ftr p{font-size:9.5px;color:#666;margin-bottom:3px;}
.ftr .ftr-brand{font-size:12px;font-weight:900;color:var(--navy);letter-spacing:1px;}

/* ══════════════════════════
   RESPONSIVE
   ══════════════════════════ */
@media screen and (max-width:800px){
  html,body{background:#fff;}
  .document{width:100%;margin:0;padding:14px;box-shadow:none;}
  .top-head,.top-head tbody,.top-head tr,.top-head td{display:block;width:100%!important;padding:0!important;}
  .brand-logo{height:46px;max-width:260px;}
  .doc-cell{text-align:left;margin-top:12px;}
  .doc-title{text-align:left;font-size:28px;letter-spacing:3px;margin-bottom:8px;}
  .doc-meta{max-width:100%;}
  .qr-img{width:76px;height:76px;}
  .qr-cap{text-align:left;}
  .addr,.addr tbody,.addr tr,.addr td{display:block;width:100%!important;padding:0!important;}
  .addr td{margin-bottom:10px;}
  .chrg-wrap,.addl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:16px;}
  .chrg{min-width:620px;margin-bottom:0;}
  .addl{min-width:420px;margin-bottom:0;}
  .btm,.btm tbody,.btm tr,.btm td{display:block;width:100%!important;padding:0!important;}
  .btm td{margin-bottom:10px;}
}
@media screen and (max-width:480px){
  .document{padding:8px;}
  .brand-logo{height:38px;max-width:220px;}
  .brand-details{font-size:8.5px;}
  .doc-title{font-size:24px;letter-spacing:1.5px;}
  .doc-meta div{font-size:8.7px;}
  .bar{font-size:9.5px;padding:4px 8px;}
  .bar-sm{font-size:8.5px;}
  .info-tbl td{font-size:9.5px;padding:4px 6px;}
  .addr-body{font-size:9.5px;padding:6px 8px;min-height:auto;}
  .sum td{font-size:9.5px;padding:4px 8px;}
  .pay-body{font-size:8.5px;padding:8px;}
}

/* ── Print ── */
@media print{
  html,body{background:#fff;}
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .document{width:100%;margin:0;padding:10mm 14mm;box-shadow:none;min-height:auto;}
}
</style>
</head>
<body>
<div class="document">

  <!-- ═══ HEADER ═══ -->
  <table class="top-head">
    <tr>
      <td class="brand-cell">
        <svg class="brand-logo" viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet">
          <g fill="#07145C">
            <path d="M22 26h104c62 0 110 16 141 56l13 18H114c-42 0-72-9-91-26C11 64 4 48 0 26h22Z"/>
            <path d="M10 111h106v110c-39 0-70-11-91-31C7 170 0 144 0 111h10Z"/>
            <rect x="126" y="111" width="112" height="64" rx="2"/>
          </g>
          <circle cx="144" cy="188" r="29" fill="#DF5101"/>
          <text x="286" y="122" fill="#07145C" font-family="'DM Sans','Helvetica Neue',Arial,sans-serif" font-size="126" font-weight="900" letter-spacing="-5">RAC</text>
          <text x="290" y="194" fill="#07145C" font-family="'DM Sans','Helvetica Neue',Arial,sans-serif" font-size="72" font-weight="800" letter-spacing="2">LOGISTICS</text>
        </svg>
        <div class="brand-sub">Courier &amp; Freight Services</div>
        <div class="brand-details">
          29b Osolo Way, Opposite Polaris Bank, Ajao Estate, Isolo, Lagos State<br>
          +234 818 595 6707 &nbsp;·&nbsp; info@raclogisticltd.com &nbsp;·&nbsp; www.raclogisticltd.com
        </div>
        <div class="rc-label">RC: 1454183</div>
      </td>
      <td class="doc-cell">
        <div class="doc-title">Invoice</div>
        <div class="doc-meta">
          <div><span>No.</span><span>${invoice.invoice_number}</span></div>
          <div><span>Date</span><span>${date}</span></div>
          <div><span>Status</span><span>${isPaid ? 'Paid' : 'Unpaid'}</span></div>
        </div>
        <img src="${qrUrl}" class="qr-img" alt="QR Code"/>
        <div class="qr-cap">Scan to track</div>
      </td>
    </tr>
  </table>

  <div class="divider"></div>

  <!-- ═══ PAYMENT DATE BAR ═══ -->
  <div class="bar">Payment Date &nbsp;&nbsp;&nbsp;&nbsp; ${paidDate}</div>

  <!-- ═══ INVOICE INFO ═══ -->
  <table class="info-tbl">
    <tr><td class="lbl">Invoice Date</td><td class="val">${date}</td></tr>
    <tr><td class="lbl">Invoice No.</td><td class="val">${invoice.invoice_number}</td></tr>
    <tr><td class="lbl">Shipment No.</td><td class="val">${trackingNumber}</td></tr>
    <tr><td class="lbl">Shipment Type</td><td class="val" style="text-transform:capitalize;">${serviceType}</td></tr>
  </table>

  <!-- ═══ ADDRESSES ═══ -->
  <table class="addr">
    <tr>
      <td style="width:50%;padding-right:0;">
        <div class="addr-box">
          <div class="bar-sm">Sender Address</div>
          <div class="addr-body">
            <strong>${senderName}</strong><br>
            ${senderAddress ? senderAddress + '<br>' : ''}
            ${senderCity}${senderCountry ? ', ' + senderCountry : ''}
          </div>
        </div>
      </td>
      <td style="width:50%;padding-left:0;">
        <div class="addr-box">
          <div class="bar-sm">Delivery Address</div>
          <div class="addr-body">
            ${shipment ? `<strong>${destCity}${destCountry ? ', ' + destCountry : ''}</strong><br>
            ${destCountry}<br>
            ${destCity}${destCountry ? ', ' + destCountry : ''}<br>
            29B Osolo Way, Opposite Polaris Bank,<br>Ajao Estate, Isolo` : 'N/A'}
          </div>
        </div>
      </td>
    </tr>
  </table>

  <!-- ═══ SHIPMENT CHARGES ═══ -->
  <div class="chrg-wrap">
  <table class="chrg">
    <thead>
      <tr>
        <th>Tracking ID</th>
        <th>Weight (KG)</th>
        <th>Dimensions /<br>Cubic Volume</th>
        <th>Shipping<br>Rate</th>
        <th>Clearing<br>Rate</th>
        <th>Delivery<br>Rate</th>
        <th>Storage<br>Rate</th>
        <th>Insurance<br>Charge</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${trackingNumber}</td>
        <td>${weight}</td>
        <td>${dimensions}</td>
        <td>${fmt(shippingRate, currency)}</td>
        <td>${fmt(clearingRate, currency)}</td>
        <td>${fmt(deliveryRate, currency)}</td>
        <td>${fmt(storageCharges, currency)}</td>
        <td>${fmt(insuranceCharges, currency)}</td>
        <td class="amt">${fmt(subtotal, currency)}</td>
      </tr>
    </tbody>
  </table>
  </div>

  ${packageName || items.length > 0 ? `
  <div class="bar">Package & Items</div>
  <table class="info-tbl">
    ${packageName ? `<tr><td class="lbl">Package</td><td class="val">${packageName}</td></tr>` : ''}
    ${dimsParts.length === 3 ? `<tr><td class="lbl">Dimensions</td><td class="val">${dimensions}</td></tr>` : ''}
    ${actualW ? `<tr><td class="lbl">Actual Weight</td><td class="val">${actualW.toFixed(2)} kg</td></tr>` : ''}
    ${volW ? `<tr><td class="lbl">Volumetric Weight</td><td class="val">${volW.toFixed(2)} kg</td></tr>` : ''}
    ${chargeable ? `<tr><td class="lbl">Chargeable Weight</td><td class="val"><strong>${chargeable.toFixed(2)} kg</strong></td></tr>` : ''}
  </table>
  ${items.length > 0 ? `
  <div class="addl-wrap">
  <table class="addl">
    <thead>
      <tr>
        <th style="width:8%;">#</th>
        <th style="width:42%;">Item</th>
        <th style="width:14%;">Qty</th>
        <th style="width:18%;">Weight</th>
        <th style="width:18%;">Declared Value</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>
  </div>` : ''}
  ` : ''}

  <!-- ═══ ADDITIONAL SERVICES ═══ -->
  <div class="addl-wrap">
  <table class="addl">
    <thead>
      <tr>
        <th style="width:25%;">Additional Service</th>
        <th style="width:35%;">Description</th>
        <th style="width:13%;">Quantity</th>
        <th style="width:13%;">Rate</th>
        <th style="width:14%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Additional Charges</td>
        <td>Extra service charges</td>
        <td>1</td>
        <td>${fmt(additionalCharges, currency)}</td>
        <td>${fmt(additionalCharges, currency)}</td>
      </tr>
      <tr>
        <td>Pickup</td>
        <td>Pickup service</td>
        <td>1</td>
        <td>${fmt(pickupCharges, currency)}</td>
        <td>${fmt(pickupCharges, currency)}</td>
      </tr>
    </tbody>
  </table>
  </div>

  <!-- ═══ BOTTOM: PAYMENT + SUMMARY ═══ -->
  <table class="btm">
    <tr>
      <td style="width:54%;padding-right:10px;">
        <div class="pay-box">
          <div class="bar-sm">Payment Instructions</div>
          <div class="pay-body">
            Log into your RAC Logistics account dashboard to make your payment.
            Note: There is a <strong>5% late payment fee</strong> on the total invoice value
            for payments not made before the vessel arrives at the destination port.<br><br>
            <strong>Due Date:</strong> ${dueDate}
          </div>
        </div>
      </td>
      <td style="width:46%;">
        <table class="sum" style="width:100%;">
          <tr><td class="lbl">Additional Charges</td><td class="val">${fmt(additionalCharges, currency)}</td></tr>
          <tr><td class="lbl">Pickup Charges</td><td class="val">${fmt(pickupCharges, currency)}</td></tr>
          <tr><td class="lbl">Net (excl. VAT)</td><td class="val">${fmt(netAmount, currency)}</td></tr>
          <tr><td class="lbl">VAT (${VAT_RATE}%)</td><td class="val">${fmt(vatAmount, currency)}</td></tr>
          <tr class="${isPaid ? 'paid' : ''}"><td class="lbl">Amount Paid (${currency})</td><td class="val">${fmt(amountPaid, currency)}</td></tr>
          <tr class="total"><td class="lbl">Total Due (${currency})</td><td class="val">${fmt(totalDue, currency)}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- ═══ FOOTER ═══ -->
  <div class="ftr">
    <p class="ftr-brand">RAC LOGISTICS LTD</p>
    <p>Thank you for choosing RAC Logistics</p>
    <p>For questions about this invoice, contact us at info@raclogisticltd.com</p>
  </div>

</div>
</body>
</html>`;
}
