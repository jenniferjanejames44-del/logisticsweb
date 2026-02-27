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

function generateInvoiceHTML(invoice: any, shipment: any, profile: any) {
  const date = new Date(invoice.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }) : 'N/A';

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
  const currencySymbol = currency === 'NGN' ? '₦' : '$';
  const weight = shipment?.weight || invoice.weight_value || 0;
  const dimensions = invoice.dimensions || shipment?.description || 'N/A';
  const serviceType = shipment?.service_type?.replace(/[-_]/g, ' ') || 'N/A';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${invoice.invoice_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; font-size: 13px; }
  .invoice { max-width: 800px; margin: 0 auto; padding: 30px 40px; }
  
  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 4px solid #061043; }
  .company-logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon { width: 60px; height: 60px; background: #061043; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .logo-icon svg { width: 40px; height: 40px; }
  .company-info h1 { font-size: 22px; color: #061043; font-weight: 900; letter-spacing: -0.5px; }
  .company-info p { font-size: 11px; color: #555; line-height: 1.5; }
  .header-right { text-align: right; }
  .header-right .codes { font-size: 11px; color: #555; margin-bottom: 4px; }
  
  /* Receipt Title */
  .receipt-title { text-align: center; margin: 15px 0; }
  .receipt-title h2 { font-size: 28px; color: #FF4D00; font-weight: 700; letter-spacing: 2px; }
  
  /* Info Sections */
  .info-bar { background: #061043; color: #fff; padding: 6px 12px; font-size: 12px; font-weight: 700; margin-bottom: 0; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  .info-table td { padding: 6px 12px; border: 1px solid #ddd; font-size: 12px; }
  .info-table td:first-child { font-weight: 600; width: 30%; background: #f8f9fb; }
  
  /* Address Section */
  .address-section { display: flex; gap: 0; margin-bottom: 15px; }
  .address-box { flex: 1; }
  .address-header { background: #061043; color: #fff; padding: 6px 12px; font-size: 12px; font-weight: 700; }
  .address-content { border: 1px solid #ddd; padding: 10px 12px; font-size: 12px; line-height: 1.6; min-height: 80px; }
  
  /* Charges Table */
  .charges-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  .charges-table th { background: #061043; color: #fff; padding: 8px 10px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  .charges-table td { padding: 8px 10px; border: 1px solid #ddd; font-size: 12px; text-align: center; }
  .charges-table tr:nth-child(even) { background: #f9f9fb; }
  
  /* Additional Services */
  .additional-header { background: #061043; color: #fff; }
  
  /* Summary Section */
  .summary-section { display: flex; justify-content: space-between; gap: 20px; margin-top: 15px; }
  .payment-instructions { flex: 1; }
  .payment-instructions .title { background: #061043; color: #fff; padding: 6px 12px; font-size: 12px; font-weight: 700; }
  .payment-instructions .content { border: 1px solid #ddd; padding: 10px 12px; font-size: 11px; line-height: 1.6; }
  .summary-table { width: 280px; border-collapse: collapse; }
  .summary-table td { padding: 5px 12px; font-size: 12px; border: 1px solid #ddd; }
  .summary-table td:first-child { font-weight: 600; background: #f8f9fb; }
  .summary-table td:last-child { text-align: right; font-weight: 600; }
  .summary-table .highlight { background: #FF4D00; color: #fff; font-weight: 700; }
  .summary-table .highlight td { background: #FF4D00; color: #fff; border-color: #FF4D00; }
  .summary-table .paid-row td { background: #d4edda; color: #155724; font-weight: 700; }
  
  /* Paid Stamp */
  .paid-stamp { position: relative; }
  .paid-stamp::after { 
    content: 'PAID'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg);
    font-size: 80px; font-weight: 900; color: rgba(40, 167, 69, 0.15); letter-spacing: 10px;
    pointer-events: none; z-index: 1;
  }
  
  /* Footer */
  .footer { margin-top: 30px; padding-top: 15px; border-top: 4px solid #061043; text-align: center; }
  .footer p { font-size: 11px; color: #666; margin-bottom: 4px; }
  .footer .brand { font-size: 14px; font-weight: 800; color: #061043; }
  
  @media print { 
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } 
    .invoice { padding: 15px; } 
  }
</style>
</head>
<body>
<div class="invoice ${isPaid ? 'paid-stamp' : ''}">
  
  <!-- Header -->
  <div class="header">
    <div class="company-logo">
      <div class="logo-icon">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4C4 4 14 2 24 8C29 11 31 15 31 15L19 15C12 15 7 11 4 4Z" fill="white"/>
          <rect x="4" y="17" width="13" height="13" rx="2" fill="white"/>
          <path d="M19 17H29C29 17 33 17 33 23C33 29 29 30 26 30H19V17Z" fill="white"/>
          <circle cx="20" cy="27" r="3.5" fill="#FF4D00"/>
        </svg>
      </div>
      <div class="company-info">
        <h1>RAC LOGISTICS LTD</h1>
        <p>29b Osolo Way, Opposite Polaris Bank<br>
        Ajao Estate, Isolo, Lagos State<br>
        info@raclogistics.com<br>
        www.raclogistics.com</p>
      </div>
    </div>
    <div class="header-right">
      <div class="codes">RC: XXXXXXX</div>
    </div>
  </div>
  
  <!-- Receipt Title -->
  <div class="receipt-title">
    <h2>${isPaid ? 'RECEIPT' : 'INVOICE'}</h2>
  </div>
  
  <!-- Payment Date -->
  <div class="info-bar">Payment date &nbsp;&nbsp;&nbsp; ${isPaid && invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : date}</div>
  
  <!-- Invoice Details -->
  <table class="info-table">
    <tr><td>Invoice Date</td><td>${date}</td></tr>
    <tr><td>Invoice No.</td><td>${invoice.invoice_number}</td></tr>
    <tr><td>Shipment No.</td><td>${shipment?.tracking_number || 'N/A'}</td></tr>
    <tr><td>Shipment Type</td><td style="text-transform: capitalize;">${serviceType}</td></tr>
  </table>
  
  <!-- Addresses -->
  <div class="address-section">
    <div class="address-box">
      <div class="address-header">Sender Address</div>
      <div class="address-content">
        ${profile?.full_name || 'Customer'}<br>
        ${profile?.country || ''}<br>
        ${profile?.city || ''}${profile?.country ? ', ' + profile.country : ''}<br>
        ${profile?.address || ''}
      </div>
    </div>
    <div class="address-box">
      <div class="address-header">Delivery Address</div>
      <div class="address-content">
        ${shipment ? `${shipment.destination_city}, ${shipment.destination_country}<br>
        29B OSOLO WAY OPPOSITE POLARIS BANK AJAO<br>ESTATE ISOLO` : 'N/A'}
      </div>
    </div>
  </div>
  
  <!-- Charges Table -->
  <table class="charges-table">
    <thead>
      <tr>
        <th>Tracking ID</th>
        <th>Weight (KG)</th>
        <th>Dimensions</th>
        <th>Shipping Rate</th>
        <th>Clearing Rate</th>
        <th>Delivery Rate</th>
        <th>Storage</th>
        <th>Insurance</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${shipment?.tracking_number || 'N/A'}</td>
        <td>${weight}</td>
        <td>${dimensions}</td>
        <td>${currencySymbol}${shippingRate.toFixed(2)}</td>
        <td>${currencySymbol}${clearingRate.toFixed(2)}</td>
        <td>${currencySymbol}${deliveryRate.toFixed(2)}</td>
        <td>${currencySymbol}${storageCharges.toFixed(2)}</td>
        <td>${currencySymbol}${insuranceCharges.toFixed(2)}</td>
        <td><strong>${currencySymbol}${subtotal.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>

  <!-- Summary -->
  <div class="summary-section">
    <div class="payment-instructions">
      <div class="title">Payment Instructions</div>
      <div class="content">
        Log into your RAC Logistics account dashboard to make your payment. 
        Note: There is a 5% late payment fee on the total invoice value for payments 
        not made before the vessel arrives at the destination port.
        <br><br>
        <strong>Due Date:</strong> ${dueDate}
      </div>
    </div>
    <table class="summary-table">
      <tr><td>Additional Charges</td><td>${currencySymbol}${additionalCharges.toFixed(2)}</td></tr>
      <tr><td>Pickup Charges</td><td>${currencySymbol}${pickupCharges.toFixed(2)}</td></tr>
      <tr class="${isPaid ? 'paid-row' : ''}"><td>Amount Paid (${currency})</td><td>${currencySymbol}${amountPaid.toFixed(2)}</td></tr>
      <tr class="highlight"><td>Total Due (${currency})</td><td>${currencySymbol}${totalDue.toFixed(2)}</td></tr>
    </table>
  </div>
  
  <!-- Footer -->
  <div class="footer">
    <p class="brand">RAC LOGISTICS LTD</p>
    <p>Thank you for choosing RAC Logistics</p>
    <p>For questions about this invoice, contact us at info@raclogistics.com</p>
  </div>
  
</div>
</body>
</html>`;
}
