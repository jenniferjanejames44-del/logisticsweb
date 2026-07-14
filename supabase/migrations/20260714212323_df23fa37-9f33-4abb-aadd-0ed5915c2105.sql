
ALTER TABLE public.email_center_contacts
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.email_center_messages
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS template_name TEXT,
  ADD COLUMN IF NOT EXISTS from_name TEXT;

CREATE INDEX IF NOT EXISTS idx_email_center_messages_scheduled
  ON public.email_center_messages (scheduled_at)
  WHERE status = 'scheduled';

INSERT INTO public.email_center_templates (name, category, subject, body_html, is_system)
SELECT 'Business Proposal (Premium)', 'proposal',
  'Business Proposal — RAC Logistics Corporate Freight & Procurement',
  $html$
<h1 style="margin:0 0 8px 0;font-size:24px;color:#061043;">Business Proposal</h1>
<p style="color:#6b7280;margin:0 0 24px 0;font-size:14px;">Prepared for {{company_name}} · Attention: {{contact_name}}</p>

<p>Dear {{contact_name}},</p>

<p>Thank you for the opportunity to present <strong>RAC Logistics</strong> as your logistics partner. We deliver end-to-end freight, procurement, and customs clearance solutions across Africa, Asia, Europe, and North America.</p>

<h2 style="font-size:16px;color:#061043;margin:28px 0 10px 0;border-bottom:2px solid #DF5101;padding-bottom:6px;display:inline-block;">Our Core Services</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px 0;">
  <tr>
    <td width="50%" style="padding:10px 14px 10px 0;vertical-align:top;">
      <div style="font-weight:600;color:#061043;">Air &amp; Sea Freight</div>
      <div style="font-size:13px;color:#4b5563;">Consolidated and dedicated shipping worldwide with real-time tracking.</div>
    </td>
    <td width="50%" style="padding:10px 0 10px 14px;vertical-align:top;">
      <div style="font-weight:600;color:#061043;">Customs Clearance</div>
      <div style="font-size:13px;color:#4b5563;">Documentation, duty calculation, and clearance at all major ports.</div>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 14px 10px 0;vertical-align:top;">
      <div style="font-weight:600;color:#061043;">Global Procurement</div>
      <div style="font-size:13px;color:#4b5563;">Sourcing, quality checks, and consolidated shipping from any market.</div>
    </td>
    <td style="padding:10px 0 10px 14px;vertical-align:top;">
      <div style="font-weight:600;color:#061043;">Warehousing &amp; Last-Mile</div>
      <div style="font-size:13px;color:#4b5563;">Secure storage and door-to-door delivery across Nigeria and West Africa.</div>
    </td>
  </tr>
</table>

<h2 style="font-size:16px;color:#061043;margin:28px 0 10px 0;border-bottom:2px solid #DF5101;padding-bottom:6px;display:inline-block;">Why Choose RAC Logistics</h2>
<ul style="padding-left:20px;margin:8px 0 20px 0;color:#374151;line-height:1.7;">
  <li>Direct trade lanes with China, UAE, UK, USA, and Europe</li>
  <li>Licensed customs brokers &amp; bonded warehousing</li>
  <li>Transparent pricing with itemised quotations</li>
  <li>Dedicated account manager and 24/7 client support</li>
</ul>

<div style="text-align:center;margin:28px 0;">
  <a href="https://raclogisticltd.com" style="display:inline-block;background:#DF5101;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Schedule a Discovery Call</a>
</div>

<p>We would welcome the opportunity to prepare a tailored logistics plan for {{company_name}}. Please let us know a convenient time for a discovery call.</p>

<p style="margin-top:24px;">Warm regards,<br/>
<strong>{{sender_name}}</strong><br/>
<span style="color:#6b7280;font-size:13px;">RAC Logistics Corporate Team</span></p>
  $html$,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.email_center_templates WHERE name = 'Business Proposal (Premium)');
