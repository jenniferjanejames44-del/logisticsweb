export interface ProTemplate {
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  category: string;
  eyebrow: string;
}

const P = (t: string) => `<p style="margin:0 0 16px;">${t}</p>`;

const signature = `<p style="margin:26px 0 0;">Warm regards,</p>
<p style="margin:4px 0 0;"><strong>{{sender_name}}</strong><br/>
<span style="color:#6b7280;">{{company}}</span><br/>
<span style="color:#6b7280;">{{phone}}</span><br/>
<a href="{{website}}" style="color:#DF5101;text-decoration:none;">{{website}}</a></p>`;

const HERO = (eyebrow: string, title: string, copy: string) => `<div style="margin:0 0 28px;"><div style="margin-bottom:10px;color:#DF5101;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${eyebrow}</div><h1 style="margin:0 0 12px;color:#061043;font-size:28px;line-height:1.2;font-weight:800;">${title}</h1><p style="margin:0;color:#687184;font-size:15px;line-height:1.65;">${copy}</p></div>`;
const CALLOUT = (title: string, copy: string) => `<div style="margin:24px 0;padding:20px 22px;border-left:4px solid #DF5101;background:#f7f8fb;border-radius:0 8px 8px 0;"><div style="margin-bottom:5px;color:#061043;font-size:14px;font-weight:800;">${title}</div><div style="color:#586174;font-size:14px;line-height:1.65;">${copy}</div></div>`;

export const PRO_TEMPLATES: ProTemplate[] = [
  {
    key: "business-proposal",
    name: "Business Proposal",
    description: "Formal proposal outlining your offer and next steps.",
    category: "Sales",
    eyebrow: "Strategic proposal",
    subject: "Business Proposal — {{company}} & {{company_name}}",
    body:
      HERO("Strategic proposal", "A smarter logistics plan for {{company_name}}", "Reliable freight, clear communication and one accountable logistics partner.") + P("Dear {{contact_name}},") +
      P("I hope this message finds you well. My name is {{sender_name}}, and I lead business development at {{company}}.") +
      P("We have prepared a proposal outlining how we can support {{company_name}} with reliable, cost-efficient logistics and procurement operations. Our objective is simple: reduce your landed costs while improving delivery predictability.") +
      P("<strong>What we propose</strong>") +
      `<ul style="margin:0 0 16px;padding-left:20px;color:#374151;">
        <li style="margin-bottom:6px;">End-to-end freight management across air and ocean lanes</li>
        <li style="margin-bottom:6px;">Customs clearance handled by our licensed in-house team</li>
        <li style="margin-bottom:6px;">Dedicated account manager and consolidated monthly invoicing</li>
      </ul>` +
      CALLOUT("Built around your operation", "We tailor routing, consolidation and clearance around your shipment volume, timeline and commercial priorities.") +
       P("I would welcome the opportunity to walk you through the details at a time convenient for you. Would a short call this week work?") +
      signature,
  },
  {
    key: "partnership-request",
    name: "Partnership Request",
    description: "Propose a mutually beneficial working relationship.",
    category: "Partnerships",
    eyebrow: "Growth opportunity",
    subject: "Partnership Opportunity with {{company}}",
    body:
      HERO("Growth opportunity", "Let’s move more, together", "A partnership designed to expand reach and create lasting value for both teams.") + P("Dear {{contact_name}},") +
      P("I am reaching out from {{company}} regarding a potential partnership with {{company_name}}.") +
      P("We work with importers, manufacturers and distributors to move goods across international lanes, and we believe there is strong alignment between our capabilities and your operations.") +
      P("A partnership would give your clients access to our freight network, customs expertise and warehousing, while creating a recurring revenue stream on your side.") +
       CALLOUT("A dependable extension of your team", "Your clients gain access to our freight network, customs expertise, procurement support and warehousing capacity.") + P("If this is of interest, I would be glad to share our partnership framework and commercial terms.") +
      signature,
  },
  {
    key: "client-outreach",
    name: "Client Outreach",
    description: "Warm, concise first contact with a prospective client.",
    category: "Outreach",
    eyebrow: "A better way to ship",
    subject: "Helping {{company_name}} ship smarter",
    body:
      HERO("A better way to ship", "Move your business forward with confidence", "International logistics made clear, accountable and easier to manage.") + P("Hello {{contact_name}},") +
      P("I came across {{company_name}} and wanted to introduce {{company}}. We help businesses import and export goods with clear pricing, real-time tracking and clearance handled end to end.") +
      P("Most of our clients come to us because shipping has become unpredictable or expensive. We fix both.") +
       CALLOUT("Why businesses choose RAC", "Clear pricing, proactive updates and one experienced team from pickup through final delivery.") + P("Would you be open to a brief conversation to see whether we can add value to your supply chain?") +
      signature,
  },
  {
    key: "introduction",
    name: "Introduction Email",
    description: "Introduce your company, services and credibility.",
    category: "Company",
    eyebrow: "Meet RAC Logistics",
    subject: "Introducing {{company}}",
    body:
      HERO("Meet RAC Logistics", "Your global logistics partner", "Procurement, international shipping and customs support under one trusted brand.") + P("Dear {{contact_name}},") +
      P("Allow me to introduce {{company}} — a logistics partner specialising in procurement, international shipping and customs clearing.") +
      P("We manage shipments from supplier sourcing through to final-mile delivery, giving our clients a single point of accountability for the entire journey.") +
       P("I have attached further details for your review, and I am happy to answer any questions.") +
      signature,
  },
  {
    key: "follow-up",
    name: "Follow-up Email",
    description: "Polite, professional nudge after no reply.",
    category: "Follow-up",
    eyebrow: "A quick follow-up",
    subject: "Following up — {{company}}",
    body:
      HERO("A quick follow-up", "Still exploring your logistics options?", "We’re ready whenever the timing is right for your business.") + P("Hello {{contact_name}},") +
      P("I wanted to follow up on my previous note regarding how {{company}} could support {{company_name}}.") +
      P("I appreciate that priorities shift, so if now is not the right time, simply let me know and I will follow up later in the year.") +
       P("If it is worth exploring, I am happy to arrange a short call at your convenience.") +
      signature,
  },
  {
    key: "sales-proposal",
    name: "Sales Proposal",
    description: "Commercial proposal with pricing and a clear call to action.",
    category: "Sales",
    eyebrow: "Commercial proposal",
    subject: "Proposal & Indicative Pricing for {{company_name}}",
    body:
      HERO("Commercial proposal", "A clear path from quote to delivery", "A practical logistics proposal built for speed, visibility and cost control.") + P("Dear {{contact_name}},") +
      P("Thank you for your interest in {{company}}. Please find below a summary of our proposal for {{company_name}}.") +
      `<table style="width:100%;border-collapse:collapse;margin:0 0 18px;font-size:14.5px;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;color:#6b7280;">Service</td><td style="padding:10px 0;border-bottom:1px solid #eef0f3;text-align:right;font-weight:600;">Air &amp; Ocean Freight</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;color:#6b7280;">Transit time</td><td style="padding:10px 0;border-bottom:1px solid #eef0f3;text-align:right;font-weight:600;">7 – 21 days</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eef0f3;color:#6b7280;">Clearance</td><td style="padding:10px 0;border-bottom:1px solid #eef0f3;text-align:right;font-weight:600;">Included</td></tr>
      </table>` +
      P("Pricing is confirmed on receipt of shipment details, and all quotations remain valid for 14 days.") +
       CALLOUT("Quotation validity", "Pricing is confirmed when final shipment details are received. Formal quotations remain valid for the period shown on the document.") + P("I would be glad to formalise this into a signed agreement whenever you are ready to proceed.") +
      signature,
  },
];
