import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Company identity</h3>
        <Row label="Company name" k="company_name"/>
        <Row label="Slogan" k="slogan"/>
        <Row label="Logo URL" k="logo_url"/>
        <Row label="Website" k="website"/>
        <Row label="Address" k="address"/>
        <Row label="Phone" k="phone"/>
        <Row label="Support email" k="support_email"/>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Primary color</Label><Input type="color" value={s.primary_color} onChange={set("primary_color")}/></div>
          <div><Label className="text-xs">Accent color</Label><Input type="color" value={s.accent_color} onChange={set("accent_color")}/></div>
        </div>
      </Card>
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold">Social media</h3>
        <Row label="Facebook URL" k="facebook_url" placeholder="https://facebook.com/…"/>
        <Row label="Instagram URL" k="instagram_url"/>
        <Row label="LinkedIn URL" k="linkedin_url"/>
        <Row label="X (Twitter) URL" k="twitter_url"/>
        <Row label="YouTube URL" k="youtube_url"/>
        <Row label="TikTok URL" k="tiktok_url"/>
        <Row label="WhatsApp URL" k="whatsapp_url" placeholder="https://wa.me/…"/>
      </Card>
      <div className="md:col-span-2 flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-[#DF5101] hover:bg-[#c04600]">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}Save settings
        </Button>
      </div>
    </div>
  );
}
