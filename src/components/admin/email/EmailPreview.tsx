import { useMemo } from "react";

interface Props {
  subject: string;
  preheader?: string;
  heading?: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  bannerUrl?: string;
  footerText?: string;
  recipientName?: string;
}

const NAVY = "#061043";
const ORANGE = "#DF5101";
const BG = "#eef0f5";
const SITE = "https://raclogisticltd.com";
const LOGO = `${SITE}/lovable-uploads/rac-logo.png`;

function interpolate(s: string | undefined, name: string) {
  if (!s) return "";
  return s.replace(/\{\{\s*name\s*\}\}/g, name);
}

export default function EmailPreview(props: Props) {
  const name = props.recipientName || "Sample Customer";
  const html = useMemo(() => {
    const heading = interpolate(props.heading, name);
    const body = interpolate(props.bodyHtml, name);
    const cta = interpolate(props.ctaUrl, name);
    const sCta = interpolate(props.secondaryCtaUrl, name);
    return `<!doctype html><html><body style="margin:0;background:${BG};font-family:'DM Sans',sans-serif;color:#1f2937;padding:24px 12px;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7280;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">
        <span>RAC Logistics Newsletter</span><span>View in browser</span>
      </div>
      <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(6,16,67,.08);">
        <div style="background:${NAVY};padding:24px 32px;display:flex;align-items:center;justify-content:space-between;">
          <img src="${LOGO}" alt="RAC" style="height:36px;display:block"/>
          <span style="font-size:12px;color:#cdd2e6;letter-spacing:.04em;">Trusted Global Freight</span>
        </div>
        ${props.bannerUrl ? `<img src="${props.bannerUrl}" style="display:block;width:100%;height:auto"/>` : ""}
        <div style="padding:40px 40px 8px;">
          ${heading ? `<h1 style="margin:0 0 18px;font-size:26px;color:${NAVY};font-weight:700;letter-spacing:-.01em;">${heading}</h1>` : ""}
          <div style="font-size:15.5px;line-height:1.7;">${body}</div>
        </div>
        ${(props.ctaLabel || props.secondaryCtaLabel) ? `<div style="padding:28px 40px 8px;display:flex;gap:10px;flex-wrap:wrap;">
          ${props.ctaLabel ? `<a href="${cta || "#"}" style="display:inline-block;background:${ORANGE};color:#fff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:600;font-size:15px;">${props.ctaLabel}</a>` : ""}
          ${props.secondaryCtaLabel ? `<a href="${sCta || "#"}" style="display:inline-block;color:${NAVY};text-decoration:none;padding:13px 24px;border:1px solid ${NAVY};border-radius:10px;font-weight:600;font-size:15px;">${props.secondaryCtaLabel}</a>` : ""}
        </div>` : ""}
        <div style="padding:32px 40px 8px;">
          <div style="border-top:1px solid #eef0f3;padding-top:20px;display:flex;text-align:center;">
            <div style="flex:1;padding:6px;"><div style="font-size:13px;font-weight:700;color:${NAVY};">Air Freight</div><div style="font-size:11px;color:#6b7280;">Door to door</div></div>
            <div style="flex:1;padding:6px;border-left:1px solid #eef0f3;border-right:1px solid #eef0f3;"><div style="font-size:13px;font-weight:700;color:${NAVY};">Sea Freight</div><div style="font-size:11px;color:#6b7280;">Bulk cargo</div></div>
            <div style="flex:1;padding:6px;"><div style="font-size:13px;font-weight:700;color:${NAVY};">Procurement</div><div style="font-size:11px;color:#6b7280;">We shop for you</div></div>
          </div>
        </div>
        <div style="padding:24px 40px 32px;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.55;">${props.footerText || "RAC Logistics — fast, reliable freight worldwide."}</p>
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">RAC Logistics · support@raclogisticltd.com · +234 800 000 0000<br/>raclogisticltd.com</p>
          <p style="margin:18px 0 0;font-size:11px;color:#6b7280;">You're receiving this because you subscribed. <a href="#" style="color:#6b7280;text-decoration:underline">Unsubscribe</a>.</p>
        </div>
      </div>
      <p style="margin:14px 0 0;font-size:11px;color:#6b7280;text-align:center;">© ${new Date().getFullYear()} RAC Logistics. All rights reserved.</p>
    </div></body></html>`;
  }, [props, name]);

  return (
    <div className="rounded-xl border border-border/60 bg-[#eef0f5] p-3">
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div>Subject: <span className="text-foreground font-medium">{props.subject || "(no subject)"}</span></div>
        <div className="hidden sm:block">Preview</div>
      </div>
      {props.preheader && <div className="mb-2 px-1 text-[11px] text-muted-foreground italic truncate">↳ {props.preheader}</div>}
      <iframe title="email preview" srcDoc={html} className="w-full bg-white rounded-lg" style={{ height: 780, border: "1px solid #eef0f3" }} />
    </div>
  );
}
