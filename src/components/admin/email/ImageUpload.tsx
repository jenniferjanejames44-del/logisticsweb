import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspect?: string; // e.g. "aspect-[3/1]"
}

export default function ImageUpload({ value, onChange, label = "Image", hint, aspect = "aspect-[3/1]" }: Props) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    if (!/^image\//.test(file.type)) { toast.error("Only image files allowed"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `campaigns/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("email-assets").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("email-assets").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
            <X className="w-3 h-3"/>Remove
          </button>
        )}
      </div>
      {value ? (
        <div className={`relative w-full ${aspect} overflow-hidden rounded-lg border border-border/60 bg-muted/30`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full ${aspect} flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/70 bg-muted/20 hover:bg-muted/40 hover:border-accent/50 transition-colors text-muted-foreground`}
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin"/> : <ImageIcon className="w-6 h-6"/>}
          <span className="text-xs font-medium">{busy ? "Uploading…" : "Click to upload image"}</span>
          <span className="text-[11px]">PNG, JPG, WEBP — up to 5MB</span>
        </button>
      )}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste image URL"
          className="text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy} className="shrink-0">
          {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>}
        </Button>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}
