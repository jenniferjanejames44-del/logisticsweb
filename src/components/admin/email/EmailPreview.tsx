import { useMemo } from "react";

interface Props {
  subject: string;
  heading?: string;
  bodyHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bannerUrl?: string;
  footerText?: string;
  recipientName?: string;
}

const NAVY = "#061043";
const ORANGE = "#DF5101";
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
    return `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:'DM Sans',sans-serif;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(6,16,67,.06);">
      <div style="background:${NAVY};padding:22px 28px;"><img src="${LOGO}" alt="RAC" style="height:34px;display:block"/></div>
      ${props.bannerUrl ? `<img src="${props.bannerUrl}" style="display:block;width:100%;height:auto"/>` : ""}
      <div style="padding:36px 36px 8px;">
        ${heading ? `<h1 style="margin:0 0 16px;font-size:24px;color:${NAVY};font-weight:700;">${heading}</h1>` : ""}
        <div style="font-size:15px;line-height:1.65;">${body}</div>
      </div>
      ${props.ctaLabel ? `<div style="padding:24px 36px 8px;"><a href="${cta || "#"}" style="display:inline-block;background:${ORANGE};color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">${props.ctaLabel}</a></div>` : ""}
      <div style="padding:32px 36px 24px;">
        <hr style="border:0;border-top:1px solid #eef0f3;margin:0 0 20px;"/>
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">${props.footerText || "RAC Logistics — moving the world for you."}</p>
        <p style="margin:0;font-size:12px;color:#6b7280;">RAC Logistics · support@raclogisticltd.com · raclogisticltd.com</p>
        <p style="margin:14px 0 0;font-size:11px;color:#6b7280;">You received this because you subscribed. <a href="#" style="color:#6b7280;text-decoration:underline">Unsubscribe</a>.</p>
      </div>
    </div></body></html>`;
  }, [props, name]);

  return (
    <div className="rounded-xl border border-border/60 bg-[#f5f5f7] p-3">
      <div className="mb-2 px-1 text-xs text-muted-foreground">Subject: <span className="text-foreground font-medium">{props.subject || "(no subject)"}</span></div>
      <iframe title="email preview" srcDoc={html} className="w-full bg-white rounded-lg" style={{ height: 720, border: "1px solid #eef0f3" }} />
    </div>
  );
}