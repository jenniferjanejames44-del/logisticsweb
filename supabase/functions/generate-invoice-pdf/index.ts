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
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function fmt(val: number, symbol: string): string {
  return symbol + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  const currency = invoice.currency || 'NGN';
  const cs = currency === 'NGN' ? '₦' : '$';
  const weight = shipment?.weight || invoice.weight_value || 0;
  const dimensions = invoice.dimensions || shipment?.description || 'N/A';
  const serviceType = shipment?.service_type?.replace(/[-_]/g, ' ') || 'N/A';
  const trackingNumber = shipment?.tracking_number || 'N/A';

  const senderName = profile?.full_name || 'Customer';
  const senderCountry = profile?.country || '';
  const senderCity = profile?.city || '';
  const senderAddress = profile?.address || '';

  const destCity = shipment?.destination_city || '';
  const destCountry = shipment?.destination_country || '';

  // QR code via public API
  const qrData = encodeURIComponent(`https://logisticsweb.lovable.app/track?tracking=${trackingNumber}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

  const BLUE = '#003399';
  const LIGHT_BLUE = '#e8eef7';
  const DARK = '#1a1a2e';
  const BORDER = '#c0c8d8';
  const WHITE = '#ffffff';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${isPaid ? 'Receipt' : 'Invoice'} ${invoice.invoice_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Helvetica', 'Arial', sans-serif; color: ${DARK}; background: #fff; font-size: 12px; line-height: 1.4; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 15mm 15mm 15mm; }
  
  table { border-collapse: collapse; }
  
  /* Header */
  .header-table { width: 100%; margin-bottom: 6px; }
  .header-table td { vertical-align: top; padding: 0; }
  .logo-cell { width: 50%; }
  .codes-cell { width: 25%; text-align: center; padding-top: 4px; }
  .qr-cell { width: 25%; text-align: right; }
  
  .company-name { font-size: 20px; font-weight: 900; color: ${BLUE}; letter-spacing: -0.3px; margin-bottom: 2px; }
  .company-subtitle { font-size: 9px; color: #666; font-style: italic; margin-bottom: 4px; }
  .company-details { font-size: 10px; color: #444; line-height: 1.6; }
  
  .codes-box { font-size: 10px; color: #333; }
  .codes-box strong { display: block; margin-bottom: 2px; }
  
  .qr-img { width: 110px; height: 110px; }
  
  /* Divider */
  .blue-divider { height: 4px; background: ${BLUE}; margin: 8px 0 12px 0; }
  
  /* Receipt title */
  .doc-title { text-align: right; font-size: 32px; font-weight: 900; color: ${BLUE}; letter-spacing: 3px; margin-bottom: 14px; }
  
  /* Blue bar header */
  .bar { background: ${BLUE}; color: ${WHITE}; font-size: 11px; font-weight: 700; padding: 5px 10px; letter-spacing: 0.3px; }
  .bar-sm { background: ${BLUE}; color: ${WHITE}; font-size: 10px; font-weight: 700; padding: 4px 8px; }
  
  /* Info table */
  .info-tbl { width: 100%; border: 1px solid ${BORDER}; margin-bottom: 14px; }
  .info-tbl td { padding: 5px 10px; font-size: 11px; border: 1px solid ${BORDER}; }
  .info-tbl .lbl { font-weight: 700; width: 28%; background: ${LIGHT_BLUE}; }
  .info-tbl .val { width: 72%; }
  
  /* Address section */
  .addr-table { width: 100%; margin-bottom: 14px; }
  .addr-table td { vertical-align: top; }
  .addr-box { border: 1px solid ${BORDER}; }
  .addr-content { padding: 8px 10px; font-size: 11px; line-height: 1.7; min-height: 75px; }
  
  /* Charges table */
  .charges { width: 100%; border: 1px solid ${BORDER}; margin-bottom: 14px; }
  .charges th { background: ${BLUE}; color: ${WHITE}; padding: 7px 6px; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; text-align: center; border: 1px solid ${BLUE}; }
  .charges td { padding: 7px 6px; font-size: 11px; text-align: center; border: 1px solid ${BORDER}; }
  .charges .amt { font-weight: 700; }
  
  /* Additional services */
  .addl { width: 100%; border: 1px solid ${BORDER}; margin-bottom: 14px; }
  .addl th { background: ${BLUE}; color: ${WHITE}; padding: 6px 8px; font-size: 9.5px; font-weight: 700; text-transform: uppercase; text-align: center; border: 1px solid ${BLUE}; }
  .addl td { padding: 6px 8px; font-size: 11px; text-align: center; border: 1px solid ${BORDER}; }
  
  /* Bottom section */
  .bottom-table { width: 100%; margin-top: 4px; }
  .bottom-table > tbody > tr > td { vertical-align: top; }
  
  .payment-box { border: 1px solid ${BORDER}; }
  .payment-content { padding: 10px; font-size: 10px; line-height: 1.7; color: #444; }
  
  .summary-tbl { border: 1px solid ${BORDER}; }
  .summary-tbl td { padding: 5px 10px; font-size: 11px; border: 1px solid ${BORDER}; }
  .summary-tbl .lbl { font-weight: 600; background: ${LIGHT_BLUE}; white-space: nowrap; }
  .summary-tbl .val { text-align: right; font-weight: 700; min-width: 80px; }
  .summary-tbl .total-row td { background: ${BLUE}; color: ${WHITE}; font-weight: 800; font-size: 12px; }
  .summary-tbl .paid-row td { background: #d4edda; color: #155724; font-weight: 700; }
  
  /* Paid stamp */
  ${isPaid ? `.page { position: relative; }
  .page::after {
    content: 'PAID';
    position: absolute;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-25deg);
    font-size: 120px;
    font-weight: 900;
    color: rgba(0, 153, 51, 0.08);
    letter-spacing: 20px;
    pointer-events: none;
    z-index: 0;
  }` : ''}
  
  /* Footer */
  .footer { margin-top: 20px; padding-top: 10px; border-top: 3px solid ${BLUE}; text-align: center; }
  .footer p { font-size: 10px; color: #666; margin-bottom: 3px; }
  .footer .brand { font-size: 13px; font-weight: 900; color: ${BLUE}; letter-spacing: 1px; }
  
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 10mm 12mm; width: 100%; min-height: auto; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <table class="header-table">
    <tr>
      <td class="logo-cell">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:55px;height:55px;background:${BLUE};border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:36px;">
              <path d="M4 4C4 4 14 2 24 8C29 11 31 15 31 15L19 15C12 15 7 11 4 4Z" fill="white"/>
              <rect x="4" y="17" width="13" height="13" rx="2" fill="white"/>
              <path d="M19 17H29C29 17 33 17 33 23C33 29 29 30 26 30H19V17Z" fill="white"/>
              <circle cx="20" cy="27" r="3.5" fill="#FF4D00"/>
            </svg>
          </div>
          <div>
            <div class="company-name">RAC LOGISTICS LTD</div>
            <div class="company-subtitle">Courier &amp; Freight Services</div>
            <div class="company-details">
              29b Osolo Way, Opposite Polaris Bank<br>
              Ajao Estate, Isolo, Lagos State<br>
              +234 818 595 6707<br>
              info@raclogistics.com<br>
              www.raclogistics.com
            </div>
          </div>
        </div>
      </td>
      <td class="codes-cell">
        <div class="codes-box" style="margin-top:10px;">
          <strong style="font-size:11px;">RC: XXXXXXX</strong>
        </div>
      </td>
      <td class="qr-cell">
        <img src="${qrUrl}" class="qr-img" alt="QR Code" />
      </td>
    </tr>
  </table>

  <div class="blue-divider"></div>

  <!-- TITLE -->
  <div class="doc-title">${isPaid ? 'RECEIPT' : 'INVOICE'}</div>

  <!-- PAYMENT DATE BAR -->
  <div class="bar">Payment Date &nbsp;&nbsp;&nbsp;&nbsp; ${paidDate}</div>

  <!-- INVOICE DETAILS -->
  <table class="info-tbl">
    <tr><td class="lbl">Invoice Date</td><td class="val">${date}</td></tr>
    <tr><td class="lbl">Invoice No.</td><td class="val">${invoice.invoice_number}</td></tr>
    <tr><td class="lbl">Shipment No.</td><td class="val">${trackingNumber}</td></tr>
    <tr><td class="lbl">Shipment Type</td><td class="val" style="text-transform:capitalize;">${serviceType}</td></tr>
  </table>

  <!-- ADDRESSES -->
  <table class="addr-table">
    <tr>
      <td style="width:50%;padding-right:0;">
        <div class="addr-box">
          <div class="bar-sm">Sender Address</div>
          <div class="addr-content">
            <strong>${senderName}</strong><br>
            ${senderCountry}<br>
            ${senderCity}${senderCountry ? ', ' + senderCountry : ''}<br>
            ${senderAddress}
          </div>
        </div>
      </td>
      <td style="width:50%;padding-left:0;">
        <div class="addr-box">
          <div class="bar-sm">Delivery Address</div>
          <div class="addr-content">
            ${shipment ? `<strong>${destCity}, ${destCountry}</strong><br>
            ${destCountry}<br>
            ${destCity}, ${destCountry}<br>
            29B Osolo Way, Opposite Polaris Bank,<br>Ajao Estate, Isolo` : 'N/A'}
          </div>
        </div>
      </td>
    </tr>
  </table>

  <!-- SHIPMENT CHARGES TABLE -->
  <table class="charges">
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
        <td>${fmt(shippingRate, cs)}</td>
        <td>${fmt(clearingRate, cs)}</td>
        <td>${fmt(deliveryRate, cs)}</td>
        <td>${fmt(storageCharges, cs)}</td>
        <td>${fmt(insuranceCharges, cs)}</td>
        <td class="amt">${fmt(subtotal, cs)}</td>
      </tr>
    </tbody>
  </table>

  <!-- ADDITIONAL SERVICES -->
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
        <td>${fmt(additionalCharges, cs)}</td>
        <td>${fmt(additionalCharges, cs)}</td>
      </tr>
      <tr>
        <td>Pickup</td>
        <td>Pickup service</td>
        <td>1</td>
        <td>${fmt(pickupCharges, cs)}</td>
        <td>${fmt(pickupCharges, cs)}</td>
      </tr>
    </tbody>
  </table>

  <!-- BOTTOM: PAYMENT INSTRUCTIONS + SUMMARY -->
  <table class="bottom-table">
    <tr>
      <td style="width:55%;padding-right:10px;">
        <div class="payment-box">
          <div class="bar-sm">Payment Instructions</div>
          <div class="payment-content">
            Log into your RAC Logistics account dashboard to make your payment.
            Note: There is a <strong>5% late payment fee</strong> on the total invoice value
            for payments not made before the vessel arrives at the destination port.<br><br>
            <strong>Due Date:</strong> ${dueDate}
          </div>
        </div>
      </td>
      <td style="width:45%;">
        <table class="summary-tbl" style="width:100%;">
          <tr><td class="lbl">Additional Charges</td><td class="val">${fmt(additionalCharges, cs)}</td></tr>
          <tr><td class="lbl">Pickup Charges</td><td class="val">${fmt(pickupCharges, cs)}</td></tr>
          <tr class="${isPaid ? 'paid-row' : ''}"><td class="lbl">Amount Paid (${currency})</td><td class="val">${fmt(amountPaid, cs)}</td></tr>
          <tr class="total-row"><td class="lbl">Total Due (${currency})</td><td class="val">${fmt(totalDue, cs)}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- FOOTER -->
  <div class="footer">
    <p class="brand">RAC LOGISTICS LTD</p>
    <p>Thank you for choosing RAC Logistics</p>
    <p>For questions about this invoice, contact us at info@raclogistics.com</p>
  </div>

</div>
</body>
</html>`;
}
