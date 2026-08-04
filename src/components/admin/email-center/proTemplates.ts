export interface ProTemplate {
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
}

const P = (t: string) => `<p style="margin:0 0 16px;">${t}</p>`;

const signature = `<p style="margin:26px 0 0;">Warm regards,</p>
<p style="margin:4px 0 0;"><strong>{{sender_name}}</strong><br/>
<span style="color:#6b7280;">{{company}}</span><br/>
<span style="color:#6b7280;">{{phone}}</span><br/>
<a href="{{website}}" style="color:#DF5101;text-decoration:none;">{{website}}</a></p>`;

export const PRO_TEMPLATES: ProTemplate[] = [
  {
    key: "business-proposal",
    name: "Business Proposal",
    description: "Formal proposal outlining your offer and next steps.",
    subject: "Business Proposal — {{company}} & {{company_name}}",
    body:
      P("Dear {{contact_name}},") +
      P("I hope this message finds you well. My name is {{sender_name}}, and I lead business development at {{company}}.") +
      P("We have prepared a proposal outlining how we can support {{company_name}} with reliable, cost-efficient logistics and procurement operations. Our objective is simple: reduce your landed costs while improving delivery predictability.") +
      P("<strong>What we propose</strong>") +
      `<ul style="margin:0 0 16px;padding-left:20px;color:#374151;">
        <li style="margin-bottom:6px;">End-to-end freight management across air and ocean lanes</li>
        <li style="margin-bottom:6px;">Customs clearance handled by our licensed in-house team</li>
        <li style="margin-bottom:6px;">Dedicated account manager and consolidated monthly invoicing</li>
      </ul>` +
      P("I would welcome the opportunity to walk you through the details at a time convenient for you. Would a short call this week work?") +
      signature,
  },
  {
    key: "partnership-request",
    name: "Partnership Request",
    description: "Propose a mutually beneficial working relationship.",
    subject: "Partnership Opportunity with {{company}}",
    body:
      P("Dear {{contact_name}},") +
      P("I am reaching out from {{company}} regarding a potential partnership with {{company_name}}.") +
      P("We work with importers, manufacturers and distributors to move goods across international lanes, and we believe there is strong alignment between our capabilities and your operations.") +
      P("A partnership would give your clients access to our freight network, customs expertise and warehousing, while creating a recurring revenue stream on your side.") +
      P("If this is of interest, I would be glad to share our partnership framework and commercial terms.") +
      signature,
  },
  {
    key: "client-outreach",
    name: "Client Outreach",
    description: "Warm, concise first contact with a prospective client.",
    subject: "Helping {{company_name}} ship smarter",
    body:
      P("Hello {{contact_name}},") +
      P("I came across {{company_name}} and wanted to introduce {{company}}. We help businesses import and export goods with clear pricing, real-time tracking and clearance handled end to end.") +
      P("Most of our clients come to us because shipping has become unpredictable or expensive. We fix both.") +
      P("Would you be open to a brief conversation to see whether we can add value to your supply chain?") +
      signature,
  },
  {
    key: "introduction",
    name: "Introduction Email",
    description: "Introduce your company, services and credibility.",
    subject: "Introducing {{company}}",
    body:
      P("Dear {{contact_name}},") +
      P("Allow me to introduce {{company}} — a logistics partner specialising in procurement, international shipping and customs clearing.") +
      P("We manage shipments from supplier sourcing through to final-mile delivery, giving our clients a single point of accountability for the entire journey.") +
      P("I have attached further details for your review, and I am happy to answer any questions.") +
      signature,
  },
  {
    key: "follow-up",
    name: "Follow-up Email",
    description: "Polite, professional nudge after no reply.",
    subject: "Following up — {{company}}",
    body:
      P("Hello {{contact_name}},") +
      P("I wanted to follow up on my previous note regarding how {{company}} could support {{company_name}}.") +
      P("I appreciate that priorities shift, so if now is not the right time, simply let me know and I will follow up later in the year.") +
      P("If it is worth exploring, I am happy to arrange a short call at your convenience.") +
      signature,
  },
  {
    key: "sales-proposal",
    name: "Sales Proposal",
    description: "Commercial proposal with pricing and a clear call to action.",
    subject: "Proposal & Indicative Pricing for {{company_name}}",
    body:
      P("Dear {{contact_name}},") +
      P("Thank you for your interest in {{company}}. Please find below a summary of our proposal for {{company_name}}.") +
      `<table style="width:100%;border-collapse:collapse;margin:0 0 18px;font-size:14.5px;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;color:#6b7280;">Service</td><td style="padding:10px 0;border-bottom:1px solid #eef0f3;text-align:right;font-weight:600;">Air &amp; Ocean Freight</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;color:#6b7280;">Transit time</td><td style="padding:10px 0;border-bottom:1px solid #eef0f3;text-align:right;font-weight:600;">7 – 21 days</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;color:#6b7280;">Clearance</td><td style="padding:10px 0;border-bottom:1px solid #eef0f3;text-align:right;font-weight:600;">Included</td></tr>
      </table>` +
      P("Pricing is confirmed on receipt of shipment details, and all quotations remain valid for 14 days.") +
      P("I would be glad to formalise this into a signed agreement whenever you are ready to proceed.") +
      signature,
  },
];
