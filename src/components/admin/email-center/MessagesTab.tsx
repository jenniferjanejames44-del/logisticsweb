import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Message, deleteMessage } from "@/lib/emailCenter";
import { Edit3, Trash2, Send as SendIcon, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Props { messages: Message[]; mode: "drafts" | "sent" | "history"; onEdit?: (m: Message) => void; onChange: () => void; }

const STATUS: Record<string, string> = {
  draft: "bg-muted text-foreground",
  sending: "bg-amber-100 text-amber-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function MessagesTab({ messages, mode, onEdit, onChange }: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-border/40">
        {messages.map(m => (
          <div key={m.id} className="p-4 flex items-start justify-between gap-3 hover:bg-muted/30 transition">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-sm truncate">{m.subject || "(no subject)"}</p>
                <Badge className={STATUS[m.status] || ""}>{m.status === "sending" ? <><Loader2 className="w-3 h-3 mr-1 animate-spin"/>sending</> : m.status}</Badge>
                {m.sent_count > 0 && <span className="text-[11px] text-muted-foreground">✓ {m.sent_count}</span>}
                {m.failed_count > 0 && <span className="text-[11px] text-red-600">✗ {m.failed_count}</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">To: {m.to_recipients.join(", ") || "—"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {mode === "drafts" ? "Updated" : "Sent"} {formatDistanceToNow(new Date(m.sent_at || m.updated_at), { addSuffix: true })}
              </p>
              {m.error_message && <p className="text-[11px] text-red-600 mt-1 line-clamp-2">{m.error_message}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(m)} title={mode === "drafts" ? "Edit" : "Duplicate"}>{mode === "drafts" ? <Edit3 className="w-4 h-4"/> : <SendIcon className="w-4 h-4"/>}</Button>}
              <Button size="icon" variant="ghost" onClick={async () => { await deleteMessage(m.id); toast.success("Deleted"); onChange(); }}><Trash2 className="w-4 h-4 text-destructive"/></Button>
            </div>
          </div>
        ))}
        {!messages.length && <div className="p-10 text-center text-sm text-muted-foreground">Nothing here yet</div>}
      </div>
    </Card>
  );
}
