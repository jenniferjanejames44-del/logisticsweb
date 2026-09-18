import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Palette, Building2, Share2 } from "lucide-react";
import BrandedPreview from "./BrandedPreview";
import { renderBrandedEmail } from "./brandTemplate";
import { Settings, updateSettings } from "@/lib/emailCenter";

interface Props { settings: Settings; onSaved: () => void; }

export default function SettingsTab({ settings, onSaved }: Props) {
  const [s, setS] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Settings) => (e: any) => setS(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try { await updateSettings(s); toast.success("Settings saved — outgoing emails updated"); onSaved(); }
    catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  const Row = ({ label, k, placeholder, type = "text" }: { label: string; k: keyof Settings; placeholder?: string; type?: string }) => (
    <div><Label className="text-xs">{label}</Label><Input value={(s[k] as string) || ""} onChange={set(k)} placeholder={placeholder} type={type}/></div>
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-3 border-border p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4 text-accent"/>Company identity</h3>
        <Row label="Company name" k="company_name"/>
        <Row label="Slogan" k="slogan"/>
        <Row label="Logo URL" k="logo_url"/>
        <Row label="Website" k="website"/>
        <Row label="Address" k="address"/>
        <Row label="Phone" k="phone"/>
        <Row label="Support email" k="support_email"/>
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
          <div><Label className="text-xs">Primary color</Label><Input type="color" value={s.primary_color} onChange={set("primary_color")}/></div>
          <div><Label className="text-xs">Accent color</Label><Input type="color" value={s.accent_color} onChange={set("accent_color")}/></div>
        </div>
      </Card>
      <Card className="space-y-3 border-border p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Share2 className="h-4 w-4 text-accent"/>Social links</h3>
        <Row label="Facebook URL" k="facebook_url" placeholder="https://facebook.com/…"/>
        <Row label="Instagram URL" k="instagram_url"/>
        <Row label="LinkedIn URL" k="linkedin_url"/>
        <Row label="X (Twitter) URL" k="twitter_url"/>
        <Row label="YouTube URL" k="youtube_url"/>
        <Row label="TikTok URL" k="tiktok_url"/>
        <Row label="WhatsApp URL" k="whatsapp_url" placeholder="https://wa.me/…"/>
      </Card>
      <div className="flex justify-end md:col-span-2">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}Save settings
        </Button>
      </div>
      </div>
      <Card className="h-fit border-border p-3 xl:sticky xl:top-4"><div className="mb-3 flex items-center gap-2 px-1"><Palette className="h-4 w-4 text-accent"/><div><p className="text-sm font-semibold">Brand preview</p><p className="text-xs text-muted-foreground">Updates as you edit.</p></div></div><BrandedPreview html={renderBrandedEmail("<div style='color:#DF5101;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;'>Customer update</div><h1 style='margin:0 0 14px;color:#061043;font-size:27px;line-height:1.2;'>Your shipment is moving forward</h1><p style='margin:0;'>Hello there,</p><p>We’ll keep you informed at every important stage of your delivery.</p>", s, "Your RAC Logistics update")} height={650}/></Card>
    </div>
  );
}
