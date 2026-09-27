import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Message, Settings, deleteMessage, unscheduleMessage, retryMessage } from "@/lib/emailCenter";
import { supabase } from "@/integrations/supabase/client";
import { renderBrandedEmail } from "./brandTemplate";
import BrandedPreview from "./BrandedPreview";
import { Edit3, Trash2, Send as SendIcon, Loader2, Calendar, RotateCcw, MailOpen, Eye, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Props { messages: Message[]; mode: "drafts" | "sent" | "failed" | "history"; settings?: Settings; onEdit?: (m: Message) => void; onChange: () => void; }

const STATUS: Record<string, string> = {
  draft: "bg-muted text-foreground",
  scheduled: "bg-blue-100 text-blue-800",
  sending: "bg-amber-100 text-amber-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

interface RecipientStatus { email: string; status: string; error: string | null }

function PreviewDialog({ m, settings, onClose }: { m: Message; settings?: Settings; onClose: () => void }) {
  const [rows, setRows] = useState<RecipientStatus[] | null>(null);
  useEffect(() => {
    if (m.status === "draft" || m.status === "scheduled") { setRows([]); return; }
    (async () => {
      const { data } = await (supabase as any).from("email_send_log")
        .select("recipient_email,status,error_message,metadata,created_at")
        .like("message_id", `ec-${m.id}-%`)
        .order("created_at", { ascending: false }).limit(5000);
      const map = new Map<string, RecipientStatus>();
      for (const r of (data || []) as any[]) {
        const key = r.recipient_email.toLowerCase();
        if (!map.has(key)) map.set(key, { email: r.recipient_email, status: r.status, error: r.error_message });
      }
      setRows(Array.from(map.values()));
    })();
  }, [m]);
  const html = settings ? renderBrandedEmail(m.body_html, settings as any, m.subject) : m.body_html;
  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>{m.subject || "(no subject)"}</DialogTitle></DialogHeader>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>To: {m.to_recipients.join(", ") || "—"}</p>
          {m.error_message && <p className="whitespace-pre-line text-red-600">{m.error_message}</p>}
        </div>
        {rows && rows.length > 0 && (
          <div className="max-h-48 divide-y divide-border/40 overflow-y-auto rounded-md border border-border">
            {rows.map(r => (
              <div key={r.email} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <div className="min-w-0"><p className="truncate font-medium">{r.email}</p>{r.error && <p className="truncate text-red-600">{r.error}</p>}</div>
                <Badge variant="outline" className={r.status === "sent" ? "border-green-200 text-green-700" : r.status === "pending" ? "border-amber-200 text-amber-700" : "border-red-200 text-red-700"}>{r.status === "dlq" ? "failed" : r.status}</Badge>
              </div>
            ))}
          </div>
        )}
        <BrandedPreview html={html} height={560} />
      </DialogContent>
    </Dialog>
  );
}

export default function MessagesTab({ messages, mode, settings, onEdit, onChange }: Props) {
  const [preview, setPreview] = useState<Message | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const title = mode === "drafts" ? "Work in progress" : mode === "failed" ? "Failed emails" : "Sent campaigns";

  const doRetry = async (m: Message) => {
    setRetrying(m.id);
    try {
      const res = await retryMessage(m);
      if (res.failed && !res.sent) toast.error(res.errors?.[0] || "Retry failed");
      else toast.success(`Re-queued for ${res.sent} recipient${res.sent === 1 ? "" : "s"}`);
      onChange();
    } catch (e: any) { toast.error(e.message || "Retry failed"); }
    setRetrying(null);
  };

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-secondary px-5 py-4"><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{messages.length} message{messages.length === 1 ? "" : "s"}</p></div><MailOpen className="h-5 w-5 text-accent"/></div>
      <div className="divide-y divide-border/40">
        {messages.map(m => (
          <div key={m.id} className="flex items-start justify-between gap-3 p-5 transition hover:bg-muted/30">
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setPreview(m)}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-sm truncate">{m.subject || "(no subject)"}</p>
                <Badge className={STATUS[m.status] || ""}>{m.status === "sending" ? <><Loader2 className="w-3 h-3 mr-1 animate-spin"/>sending</> : m.status}</Badge>
                {m.template_name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m.template_name}</span>}
                {m.sent_count > 0 && <span className="text-[11px] text-muted-foreground">✓ {m.sent_count}</span>}
                {m.failed_count > 0 && <span className="text-[11px] text-red-600">✗ {m.failed_count}</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">To: {m.to_recipients.join(", ") || "—"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {m.status === "scheduled" && m.scheduled_at ? (
                  <span className="inline-flex items-center gap-1 text-blue-700"><Calendar className="w-3 h-3"/> Scheduled for {new Date(m.scheduled_at).toLocaleString()}</span>
                ) : (
                  <>{mode === "drafts" ? "Updated" : "Sent"} {formatDistanceToNow(new Date(m.sent_at || m.updated_at), { addSuffix: true })}</>
                )}
              </p>
              {m.error_message && <p className="text-[11px] text-red-600 mt-1 line-clamp-2">{m.error_message}</p>}
            </button>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" title="Preview" onClick={() => setPreview(m)}><Eye className="w-4 h-4"/></Button>
              {(m.status === "failed" || m.failed_count > 0) && (
                <Button size="icon" variant="ghost" title="Retry" disabled={retrying === m.id} onClick={() => doRetry(m)}>
                  {retrying === m.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
                </Button>
              )}
              {m.status === "scheduled" && (
                <Button size="icon" variant="ghost" title="Cancel schedule" onClick={async () => { await unscheduleMessage(m.id); toast.success("Moved to drafts"); onChange(); }}>
                  <RotateCcw className="w-4 h-4"/>
                </Button>
              )}
              {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(m)} title={mode === "drafts" ? "Edit" : "Duplicate"}>{mode === "drafts" ? <Edit3 className="w-4 h-4"/> : <SendIcon className="w-4 h-4"/>}</Button>}
              <Button size="icon" variant="ghost" title="Delete" onClick={async () => { await deleteMessage(m.id); toast.success("Deleted"); onChange(); }}><Trash2 className="w-4 h-4 text-destructive"/></Button>
            </div>
          </div>
        ))}
        {!messages.length && <div className="p-10 text-center text-sm text-muted-foreground">Nothing here yet</div>}
      </div>
      {preview && <PreviewDialog m={preview} settings={settings} onClose={() => setPreview(null)} />}
    </Card>
  );
}
