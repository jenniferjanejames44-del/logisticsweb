import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeliveryRow, Message, listDelivery, retryMessage } from "@/lib/emailCenter";
import { CheckCircle2, Clock, XCircle, Mail, RefreshCw, Loader2, AlertTriangle, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Props { messages: Message[]; onChange: () => void; }

const RANGES = [
  { label: "24 hours", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
];

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  dlq: "bg-red-50 text-red-700 border-red-200",
  suppressed: "bg-slate-100 text-slate-600 border-slate-200",
  rate_limited: "bg-amber-50 text-amber-700 border-amber-200",
};

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
      </div>
    </Card>
  );
}

export default function DeliveryTab({ messages, onChange }: Props) {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [retrying, setRetrying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await listDelivery(days)); }
    catch (e: any) { toast.error(e.message || "Could not load delivery data"); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  const stats = useMemo(() => ({
    total: rows.length,
    sent: rows.filter(r => r.status === "sent").length,
    pending: rows.filter(r => r.status === "pending" || r.status === "rate_limited").length,
    failed: rows.filter(r => r.status === "failed" || r.status === "dlq").length,
  }), [rows]);

  const visible = useMemo(() => rows.filter(r => {
    const matchStatus =
      filter === "all" ||
      (filter === "failed" ? (r.status === "failed" || r.status === "dlq") : r.status === filter);
    const q = query.trim().toLowerCase();
    const matchQuery = !q || r.recipient_email.toLowerCase().includes(q) || (r.subject || "").toLowerCase().includes(q);
    return matchStatus && matchQuery;
  }), [rows, filter, query]);

  const failedMessages = messages.filter(m => m.status === "failed");

  const doRetry = async (m: Message) => {
    setRetrying(m.id);
    try {
      const res = await retryMessage(m);
      if (res.failed && !res.sent) toast.error(res.errors?.[0] || "Retry failed");
      else toast.success(`Re-queued for ${res.sent} recipient${res.sent === 1 ? "" : "s"}`);
      onChange(); load();
    } catch (e: any) { toast.error(e.message || "Retry failed"); }
    setRetrying(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border/60 bg-white p-1">
          {RANGES.map(r => (
            <button key={r.days} onClick={() => setDays(r.days)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${days === r.days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Last {r.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Mail} label="Total emails" value={stats.total} tone="bg-slate-100 text-slate-700" />
        <Stat icon={CheckCircle2} label="Delivered" value={stats.sent} tone="bg-emerald-50 text-emerald-600" />
        <Stat icon={Clock} label="Pending" value={stats.pending} tone="bg-amber-50 text-amber-600" />
        <Stat icon={XCircle} label="Failed" value={stats.failed} tone="bg-red-50 text-red-600" />
      </div>

      {failedMessages.length > 0 && (
        <Card className="border-red-200 bg-red-50/40 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" /> {failedMessages.length} email{failedMessages.length === 1 ? "" : "s"} need attention
          </div>
          <div className="space-y-2">
            {failedMessages.slice(0, 5).map(m => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.subject || "(no subject)"}</p>
                  <p className="truncate text-xs text-red-600">{m.error_message || "Delivery failed"}</p>
                </div>
                <Button size="sm" variant="outline" disabled={retrying === m.id} onClick={() => doRetry(m)}>
                  {retrying === m.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}Retry
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/50 p-4">
          <div className="inline-flex rounded-lg border border-border/60 p-1">
            {["all", "sent", "pending", "failed"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${filter === s ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search recipient or subject" className="h-9 pl-9" />
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {loading && <div className="p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div>}
          {!loading && visible.slice(0, 100).map(r => (
            <div key={r.message_id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-muted/30">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.subject || "(no subject)"}</p>
                <p className="truncate text-xs text-muted-foreground">{r.recipient_email}</p>
                {r.error_message && <p className="mt-1 line-clamp-2 text-[11px] text-red-600">{r.error_message}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {r.template_name === "email_center_test" && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">test</span>}
                <Badge variant="outline" className={STATUS_STYLES[r.status] || ""}>{r.status}</Badge>
                <span className="w-24 text-right text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
          {!loading && !visible.length && <div className="p-12 text-center text-sm text-muted-foreground">No emails in this period</div>}
        </div>
      </Card>
    </div>
  );
}
