import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  Smartphone, Send, RefreshCw, Wallet, Plug, Users, FileText, History, ShieldBan,
  ScrollText, Zap, Megaphone, LayoutDashboard, Plus, Search, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ---------- types ----------
interface SmsProvider {
  id: string; provider_key: string; display_name: string; api_key: string | null;
  has_api_key?: boolean; sender_id: string | null; base_url: string;
  is_primary: boolean; is_backup: boolean; is_active: boolean;
  last_check_at: string | null; last_check_status: string | null;
  last_balance: number | null; balance_currency: string | null; notes: string | null;
}
interface SmsTemplate { id: string; name: string; category: string; body: string; is_active: boolean; }
interface SmsCampaign {
  id: string; name: string; message: string; audience: string; manual_phones: string[] | null;
  status: string; scheduled_at: string | null; sent_at: string | null;
  total_recipients: number; sent_count: number; failed_count: number; created_at: string;
}
interface SmsRule { id: string; name: string; trigger_event: string; template_id: string | null; is_active: boolean; }
interface SmsContact { id: string; user_id: string | null; full_name: string | null; phone: string; marketing_opt_in: boolean; opted_out_at: string | null; source: string; created_at: string; }
interface SmsSuppression { id: string; phone: string; reason: string; created_at: string; }
interface SmsMessage {
  id: string; phone: string; contact_name: string | null; body: string; message_type: string;
  source: string; provider_key: string | null; status: string; error_message: string | null;
  created_at: string; sent_at: string | null; delivered_at: string | null; campaign_id: string | null;
}
interface AuditRow { id: string; action: string; details: Record<string, unknown> | null; created_at: string; }

const TRIGGER_LABELS: Record<string, string> = {
  customer_registered: "Customer registers",
  shipment_created: "Shipment created",
  shipment_status_changed: "Shipment status changes",
  payment_received: "Payment received",
};

const statusBadge = (status: string) => {
  switch (status) {
    case "sent": case "delivered": return <Badge variant="successOutline">{status}</Badge>;
    case "failed": return <Badge variant="destructive">{status}</Badge>;
    case "sending": case "scheduled": case "pending": return <Badge variant="outline" className="text-amber-600 border-amber-300">{status}</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const smsCall = async (action: string, payload: Record<string, unknown> = {}) => {
  const { data, error } = await supabase.functions.invoke("sms-admin", { body: { action, ...payload } });
  if (error) {
    let detail = error.message;
    try { const ctx = (error as { context?: Response }).context; if (ctx) detail = await ctx.text(); } catch { /* ignore */ }
    throw new Error(detail);
  }
  if (data?.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
  return data;
};

const AdminSMSCenter = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([]);
  const [rules, setRules] = useState<SmsRule[]>([]);
  const [contacts, setContacts] = useState<SmsContact[]>([]);
  const [suppressions, setSuppressions] = useState<SmsSuppression[]>([]);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [auditLog, setAuditLog] = useState<AuditRow[]>([]);
  const [range, setRange] = useState("30d");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const providerData = await smsCall("list_providers");
      setProviders(providerData.providers || []);
      const [t, c, r, ct, s, m, a] = await Promise.all([
        supabase.from("sms_templates").select("*").order("name"),
        supabase.from("sms_campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("sms_automation_rules").select("*").order("name"),
        supabase.from("sms_contacts").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("sms_suppressions").select("*").order("created_at", { ascending: false }),
        supabase.from("sms_messages").select("*").order("created_at", { ascending: false }).limit(300),
        supabase.from("sms_audit_log").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      setTemplates(t.data || []); setCampaigns(c.data || []); setRules(r.data || []);
      setContacts(ct.data || []); setSuppressions(s.data || []); setMessages(m.data || []); setAuditLog(a.data || []);
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadAll();
    // Process any campaigns whose scheduled time has arrived.
    smsCall("run_due_campaigns").then((r) => {
      if (r?.launched?.length) { toast({ title: "Scheduled campaigns sent", description: `${r.launched.length} due campaign(s) launched.` }); loadAll(); }
    }).catch(() => { /* non-fatal */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primary = providers.find((p) => p.is_primary) || providers[0];

  // ---------- Overview stats ----------
  const rangeStart = useMemo(() => {
    const now = Date.now();
    if (range === "today") { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
    if (range === "7d") return now - 7 * 864e5;
    if (range === "30d") return now - 30 * 864e5;
    return 0;
  }, [range]);

  const ranged = useMemo(() => messages.filter((m) => new Date(m.created_at).getTime() >= rangeStart), [messages, rangeStart]);
  const stats = useMemo(() => ({
    sentToday: messages.filter((m) => m.sent_at && new Date(m.sent_at).toDateString() === new Date().toDateString()).length,
    sentMonth: messages.filter((m) => m.sent_at && new Date(m.sent_at).getMonth() === new Date().getMonth()).length,
    sent: ranged.filter((m) => m.status === "sent" || m.status === "delivered").length,
    delivered: ranged.filter((m) => m.status === "delivered").length,
    failed: ranged.filter((m) => m.status === "failed").length,
    pending: ranged.filter((m) => m.status === "pending").length,
    subscribers: contacts.filter((c) => c.marketing_opt_in).length,
    optedOut: contacts.filter((c) => !c.marketing_opt_in).length + suppressions.length,
    activeRules: rules.filter((r) => r.is_active).length,
    scheduledCampaigns: campaigns.filter((c) => c.status === "scheduled").length,
  }), [messages, ranged, contacts, suppressions, rules, campaigns]);

  const StatCard = ({ label, value, icon: Icon, hint }: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; hint?: string }) => (
    <Card className="border-border/50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-base sm:text-xl font-bold text-foreground truncate">{value}</p>
            {hint && <p className="text-[10px] text-muted-foreground truncate">{hint}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ---------- Providers tab ----------
  const ProviderCard = ({ p }: { p: SmsProvider }) => {
    const [form, setForm] = useState({ api_key: "", sender_id: p.sender_id || "", base_url: p.base_url, notes: p.notes || "" });
    const [busy, setBusy] = useState<string | null>(null);
    const [balance, setBalance] = useState<{ balance?: number; currency?: string } | null>(
      p.last_balance !== null ? { balance: p.last_balance, currency: p.balance_currency || undefined } : null,
    );

    const run = async (label: string, fn: () => Promise<unknown>, okMsg?: string) => {
      setBusy(label);
      try {
        await fn();
        if (okMsg) toast({ title: okMsg });
        await loadAll();
      } catch (e) {
        toast({ title: "Action failed", description: (e as Error).message, variant: "destructive" });
      }
      setBusy(null);
    };

    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{p.display_name}</CardTitle>
            {p.is_primary && <Badge>Primary</Badge>}
            {p.is_backup && <Badge variant="outline">Backup</Badge>}
            {p.is_active ? <Badge variant="successOutline">Active</Badge> : <Badge variant="outline">Disabled</Badge>}
            {p.last_check_status && (
              <span className={`text-xs flex items-center gap-1 ${p.last_check_status === "ok" ? "text-success" : "text-destructive"}`}>
                {p.last_check_status === "ok" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                Last check {p.last_check_at ? format(new Date(p.last_check_at), "MMM d, HH:mm") : ""}
              </span>
            )}
          </div>
          {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">API Key {p.has_api_key ? `(saved: ${p.api_key})` : "(not set)"}</Label>
              <Input type="password" placeholder={p.has_api_key ? "Enter new key to replace" : "Paste API key"} value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sender ID (3–11 characters)</Label>
              <Input value={form.sender_id} maxLength={11} onChange={(e) => setForm({ ...form, sender_id: e.target.value })} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Base URL</Label>
              <Input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={busy !== null} onClick={() => run("save", () =>
              smsCall("save_provider", { provider_key: p.provider_key, api_key: form.api_key, sender_id: form.sender_id, base_url: form.base_url }), "Provider saved")}>
              {busy === "save" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run("test", () =>
              smsCall("test_connection", { provider_key: p.provider_key }).then((r) => {
                if (!r.ok) throw new Error(r.error || "Connection failed");
                toast({ title: "Connection OK" });
              }))}>
              <Plug className="w-3.5 h-3.5 mr-1" /> Test Connection
            </Button>
            <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run("balance", async () => {
              const r = await smsCall("get_balance", { provider_key: p.provider_key });
              if (r.supported === false) { toast({ title: "Not supported by this provider" }); return; }
              if (r.error) throw new Error(r.error);
              setBalance({ balance: r.balance, currency: r.currency });
            })}>
              <Wallet className="w-3.5 h-3.5 mr-1" /> Check Balance
            </Button>
            {!p.is_primary && (
              <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run("primary", () =>
                smsCall("set_role", { provider_key: p.provider_key, role: "primary" }), `${p.display_name} is now the primary provider`)}>
                Set Primary
              </Button>
            )}
            {!p.is_backup && !p.is_primary && (
              <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run("backup", () =>
                smsCall("set_role", { provider_key: p.provider_key, role: "backup" }), `${p.display_name} is now the backup provider`)}>
                Set Backup
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Label className="text-xs">Enabled</Label>
              <Switch checked={p.is_active} disabled={busy !== null} onCheckedChange={(v) => run("toggle", () =>
                smsCall("save_provider", { provider_key: p.provider_key, is_active: v }))} />
            </div>
          </div>
          {balance && (
            <p className="text-sm text-muted-foreground">
              Balance: <span className="font-semibold text-foreground">{balance.balance ?? "—"} {balance.currency || ""}</span>
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  // ---------- Send SMS tab ----------
  const SendTab = () => {
    const [body, setBody] = useState("");
    const [phones, setPhones] = useState("");
    const [type, setType] = useState<"transactional" | "marketing">("transactional");
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const parsed = useMemo(() => [...new Set(phones.split(/[\s,;]+/).map((p) => p.replace(/[^\d+]/g, "")).filter((p) => p.length >= 7))], [phones]);

    const send = async () => {
      setSending(true); setResult(null);
      try {
        const r = await smsCall(parsed.length > 1 ? "send_bulk" : "send_single", { phones: parsed, phone: parsed[0], body, message_type: type });
        setResult(`Provider: ${r.provider}. Sent: ${r.sent}, failed: ${r.failed}, skipped (suppressed): ${r.skipped}.${r.errors?.length ? " Errors: " + r.errors.join(" | ") : ""}`);
        if (r.failed > 0) toast({ title: "Some messages failed", description: `${r.failed} of ${r.sent + r.failed} failed`, variant: "destructive" });
        else toast({ title: "SMS sent", description: `${r.sent} message(s) accepted by ${r.provider}` });
        loadAll();
      } catch (e) {
        toast({ title: "Send failed", description: (e as Error).message, variant: "destructive" });
      }
      setSending(false);
    };

    return (
      <Card className="border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Send className="w-4 h-4 text-primary" /> Compose SMS</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Message type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactional">Transactional (service notifications)</SelectItem>
                  <SelectItem value="marketing">Marketing (promotions — opt-in contacts only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Start from template</Label>
              <Select onValueChange={(id) => { const t = templates.find((x) => x.id === id); if (t) setBody(t.body); }}>
                <SelectTrigger><SelectValue placeholder="Choose a template…" /></SelectTrigger>
                <SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Recipients (one per line, or comma-separated, international format)</Label>
            <Textarea rows={3} placeholder={"2348012345678\n2349098765432"} value={phones} onChange={(e) => setPhones(e.target.value)} />
            <p className="text-xs text-muted-foreground">{parsed.length} valid recipient(s) detected</p>
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={4} value={body} maxLength={1600} onChange={(e) => setBody(e.target.value)} placeholder="Type your message…" />
            <p className="text-xs text-muted-foreground">{body.length}/1600 characters · ~{Math.max(1, Math.ceil(body.length / 160))} SMS segment(s)</p>
          </div>
          {type === "marketing" && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
              Marketing SMS should only go to contacts who opted in. Numbers on the suppression list are skipped automatically.
            </p>
          )}
          <Button disabled={sending || !body.trim() || parsed.length === 0} onClick={send} className="h-11">
            {sending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send to {parsed.length} recipient(s)
          </Button>
          {result && <p className="text-sm text-muted-foreground border border-border/60 rounded-lg p-3">{result}</p>}
        </CardContent>
      </Card>
    );
  };

  // ---------- Campaigns tab ----------
  const CampaignsTab = () => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", message: "", audience: "marketing_subscribers", manual: "", scheduled_at: "" });
    const [busy, setBusy] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const create = async () => {
      setBusy(true);
      const manualPhones = form.audience === "manual" ? form.manual.split(/[\s,;]+/).filter(Boolean) : null;
      const { error } = await supabase.from("sms_campaigns").insert({
        name: form.name, message: form.message, audience: form.audience, manual_phones: manualPhones,
        status: form.scheduled_at ? "scheduled" : "draft",
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      });
      setBusy(false);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: form.scheduled_at ? "Campaign scheduled" : "Campaign saved as draft" });
      setOpen(false); setForm({ name: "", message: "", audience: "marketing_subscribers", manual: "", scheduled_at: "" });
      loadAll();
    };

    const launch = async (id: string) => {
      setBusy(true);
      try {
        const r = await smsCall("launch_campaign", { campaign_id: id });
        toast({ title: "Campaign sent", description: `Sent: ${r.sent}, failed: ${r.failed}, skipped: ${r.skipped}` });
      } catch (e) { toast({ title: "Launch failed", description: (e as Error).message, variant: "destructive" }); }
      setBusy(false); loadAll();
    };

    return (
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Megaphone className="w-4 h-4 text-primary" /> Campaigns</CardTitle>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> New Campaign</Button>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No campaigns yet. Create your first SMS campaign.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Audience</TableHead><TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead><TableHead>Sent / Failed</TableHead><TableHead>Scheduled</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.audience === "manual" ? "Manual list" : "Marketing subscribers"}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell>{c.total_recipients}</TableCell>
                    <TableCell>{c.sent_count} / {c.failed_count}</TableCell>
                    <TableCell className="text-muted-foreground">{c.scheduled_at ? format(new Date(c.scheduled_at), "MMM d, HH:mm") : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {(c.status === "draft" || c.status === "scheduled" || c.status === "failed") && (
                          <Button size="sm" variant="outline" disabled={busy} onClick={() => launch(c.id)}>Send now</Button>
                        )}
                        {c.status === "draft" && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(c.id)}>Delete</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>New SMS Campaign</DialogTitle>
              <DialogDescription>Marketing campaigns go only to opted-in subscribers or a manual list.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Audience</Label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing_subscribers">Marketing subscribers ({stats.subscribers})</SelectItem>
                    <SelectItem value="manual">Manual phone list</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.audience === "manual" && (
                <div className="space-y-1"><Label>Phone numbers</Label>
                  <Textarea rows={3} value={form.manual} onChange={(e) => setForm({ ...form, manual: e.target.value })} placeholder="One per line or comma-separated" /></div>
              )}
              <div className="space-y-1"><Label>Message</Label>
                <Textarea rows={4} value={form.message} maxLength={1600} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <p className="text-xs text-muted-foreground">{form.message.length}/1600</p>
              </div>
              <div className="space-y-1"><Label>Schedule (optional)</Label>
                <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                <p className="text-xs text-muted-foreground">Scheduled campaigns are sent when an admin opens the SMS Center after the scheduled time.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={busy || !form.name.trim() || !form.message.trim() || (form.audience === "manual" && !form.manual.trim())} onClick={create}>
                {form.scheduled_at ? "Schedule" : "Save Draft"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(o) => !o && setDeleteId(null)}
          onConfirm={async () => {
            await supabase.from("sms_campaigns").delete().eq("id", deleteId!);
            setDeleteId(null); loadAll();
          }}
          title="Delete campaign?"
          description="This draft campaign will be permanently removed."
        />
      </Card>
    );
  };

  // ---------- Automation tab ----------
  const AutomationTab = () => (
    <Card className="border-border/50">
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="w-4 h-4 text-primary" /> Automation Rules</CardTitle>
        <p className="text-xs text-muted-foreground">Transactional messages sent automatically when events happen. They respect the suppression list but do not require marketing opt-in.</p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Rule</TableHead><TableHead>Trigger</TableHead><TableHead>Template</TableHead><TableHead className="text-right">Enabled</TableHead></TableRow></TableHeader>
          <TableBody>
            {rules.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{TRIGGER_LABELS[r.trigger_event] || r.trigger_event}</TableCell>
                <TableCell>
                  <Select value={r.template_id || ""} onValueChange={async (v) => {
                    await supabase.from("sms_automation_rules").update({ template_id: v }).eq("id", r.id); loadAll();
                  }}>
                    <SelectTrigger className="w-56"><SelectValue placeholder="Choose template" /></SelectTrigger>
                    <SelectContent>{templates.filter((t) => t.category === "transactional").map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Switch checked={r.is_active} onCheckedChange={async (v) => {
                    await supabase.from("sms_automation_rules").update({ is_active: v }).eq("id", r.id);
                    toast({ title: v ? "Rule enabled" : "Rule disabled", description: r.name }); loadAll();
                  }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // ---------- Templates tab ----------
  const TemplatesTab = () => {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<SmsTemplate | null>(null);
    const [form, setForm] = useState({ name: "", category: "transactional", body: "" });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const save = async () => {
      const payload = { name: form.name, category: form.category, body: form.body };
      const { error } = editing
        ? await supabase.from("sms_templates").update(payload).eq("id", editing.id)
        : await supabase.from("sms_templates").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: editing ? "Template updated" : "Template created" });
      setOpen(false); setEditing(null); loadAll();
    };

    return (
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="w-4 h-4 text-primary" /> Message Templates</CardTitle>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ name: "", category: "transactional", body: "" }); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Template
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Message</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge variant={t.category === "marketing" ? "outline" : "secondary"}>{t.category}</Badge></TableCell>
                  <TableCell className="max-w-[320px] truncate text-muted-foreground">{t.body}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(t); setForm({ name: t.name, category: t.category, body: t.body }); setOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(t.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Template" : "New Template"}</DialogTitle>
              <DialogDescription>Use {"{{name}}"}, {"{{tracking_number}}"}, {"{{status}}"}, {"{{amount}}"}, {"{{currency}}"}, {"{{invoice_number}}"}, {"{{origin}}"}, {"{{destination}}"} as placeholders.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Message</Label><Textarea rows={4} value={form.body} maxLength={1600} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={!form.name.trim() || !form.body.trim()} onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(o) => !o && setDeleteId(null)}
          onConfirm={async () => { await supabase.from("sms_templates").delete().eq("id", deleteId!); setDeleteId(null); loadAll(); }}
          title="Delete template?"
          description="Automation rules using this template will stop sending until a new template is assigned."
        />
      </Card>
    );
  };

  // ---------- Contacts tab ----------
  const ContactsTab = () => {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ full_name: "", phone: "", marketing_opt_in: false });
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const filtered = contacts.filter((c) =>
      c.phone.includes(search) || (c.full_name || "").toLowerCase().includes(search.toLowerCase()));

    return (
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><Users className="w-4 h-4 text-primary" /> Contacts & Subscribers</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9 w-52" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button size="sm" variant="outline" onClick={async () => {
                try { const r = await smsCall("sync_contacts"); toast({ title: "Contacts synced", description: `${r.imported} imported from ${r.profiles} customer profiles` }); loadAll(); }
                catch (e) { toast({ title: "Sync failed", description: (e as Error).message, variant: "destructive" }); }
              }}>Sync Customers</Button>
              <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Source</TableHead><TableHead>Marketing opt-in</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                  <TableCell><code className="text-xs">{c.phone}</code></TableCell>
                  <TableCell className="text-muted-foreground">{c.source}</TableCell>
                  <TableCell>
                    <Switch checked={c.marketing_opt_in} onCheckedChange={async (v) => {
                      await supabase.from("sms_contacts").update({ marketing_opt_in: v, opted_out_at: v ? null : new Date().toISOString() }).eq("id", c.id);
                      loadAll();
                    }} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(c.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No contacts found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Phone (international format)</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="2348012345678" /></div>
              <div className="flex items-center gap-2"><Switch checked={form.marketing_opt_in} onCheckedChange={(v) => setForm({ ...form, marketing_opt_in: v })} /><Label>Marketing opt-in</Label></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={!form.phone.trim()} onClick={async () => {
                const { error } = await supabase.from("sms_contacts").insert({
                  full_name: form.full_name || null, phone: form.phone.replace(/[^\d]/g, ""),
                  marketing_opt_in: form.marketing_opt_in, source: "manual",
                });
                if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                toast({ title: "Contact added" }); setOpen(false); setForm({ full_name: "", phone: "", marketing_opt_in: false }); loadAll();
              }}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(o) => !o && setDeleteId(null)}
          onConfirm={async () => { await supabase.from("sms_contacts").delete().eq("id", deleteId!); setDeleteId(null); loadAll(); }}
          title="Delete contact?" description="This contact will be removed from SMS lists."
        />
      </Card>
    );
  };

  // ---------- History tab ----------
  const HistoryTab = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [type, setType] = useState("all");
    const filtered = messages.filter((m) =>
      (status === "all" || m.status === status) &&
      (type === "all" || m.message_type === type) &&
      (m.phone.includes(search) || (m.contact_name || "").toLowerCase().includes(search.toLowerCase())));

    return (
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><History className="w-4 h-4 text-primary" /> Message History & Delivery</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9 w-44" placeholder="Search phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem><SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem><SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem><SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Recipient</TableHead><TableHead>Message</TableHead><TableHead>Type</TableHead>
              <TableHead>Source</TableHead><TableHead>Provider</TableHead><TableHead>Status</TableHead><TableHead>Time</TableHead><TableHead className="text-right">Delivery</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.contact_name || "—"}</div>
                    <code className="text-xs text-muted-foreground">{m.phone}</code>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <span className="block truncate text-muted-foreground" title={m.body}>{m.body}</span>
                    {m.error_message && <span className="block text-xs text-destructive truncate" title={m.error_message}>{m.error_message}</span>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{m.message_type}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{m.source}</TableCell>
                  <TableCell className="text-muted-foreground">{m.provider_key || "—"}</TableCell>
                  <TableCell>{statusBadge(m.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {m.sent_at ? format(new Date(m.sent_at), "MMM d, HH:mm") : format(new Date(m.created_at), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.provider_key === "termii" && m.status !== "failed" ? (
                      <Button size="sm" variant="ghost" onClick={async () => {
                        try {
                          const r = await smsCall("refresh_status", { message_id: m.id });
                          if (r.supported === false) toast({ title: "Not supported by this provider" });
                          else if (r.error) toast({ title: "Status unavailable", description: r.error, variant: "destructive" });
                          else toast({ title: `Provider status: ${r.status || "unknown"}` });
                          loadAll();
                        } catch (e) { toast({ title: "Error", description: (e as Error).message, variant: "destructive" }); }
                      }}>Refresh</Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{m.status === "failed" ? "—" : "Not supported"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No messages found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // ---------- Consent tab ----------
  const ConsentTab = () => {
    const [phone, setPhone] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    return (
      <div className="space-y-4">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldBan className="w-4 h-4 text-primary" /> Suppression List</CardTitle>
            <p className="text-xs text-muted-foreground">Suppressed numbers receive no SMS at all — neither marketing nor transactional.</p></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Phone number (international)" value={phone} onChange={(e) => setPhone(e.target.value)} className="max-w-xs" />
              <Button size="sm" disabled={!phone.trim()} onClick={async () => {
                const { error } = await supabase.from("sms_suppressions").insert({ phone: phone.replace(/[^\d]/g, ""), reason: "opted_out" });
                if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
                toast({ title: "Number suppressed" }); setPhone(""); loadAll();
              }}>Suppress</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Phone</TableHead><TableHead>Reason</TableHead><TableHead>Added</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {suppressions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell><code className="text-xs">{s.phone}</code></TableCell>
                    <TableCell className="text-muted-foreground">{s.reason}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(s.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(s.id)}>Remove</Button></TableCell>
                  </TableRow>
                ))}
                {suppressions.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No suppressed numbers.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Opted-out Contacts</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Opted out</TableHead></TableRow></TableHeader>
              <TableBody>
                {contacts.filter((c) => !c.marketing_opt_in).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                    <TableCell><code className="text-xs">{c.phone}</code></TableCell>
                    <TableCell className="text-muted-foreground">{c.opted_out_at ? format(new Date(c.opted_out_at), "MMM d, yyyy") : "Never opted in"}</TableCell>
                  </TableRow>
                ))}
                {contacts.filter((c) => !c.marketing_opt_in).length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No opted-out contacts.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DeleteConfirmDialog
          open={deleteId !== null}
          onOpenChange={(o) => !o && setDeleteId(null)}
          onConfirm={async () => { await supabase.from("sms_suppressions").delete().eq("id", deleteId!); setDeleteId(null); loadAll(); }}
          title="Remove suppression?" description="This number will be able to receive SMS again."
        />
      </div>
    );
  };

  // ---------- Audit tab ----------
  const AuditTab = () => (
    <Card className="border-border/50">
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ScrollText className="w-4 h-4 text-primary" /> SMS Audit Log</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Details</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
          <TableBody>
            {auditLog.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.action}</TableCell>
                <TableCell className="max-w-[420px] truncate text-muted-foreground text-xs">
                  {a.details ? JSON.stringify(a.details) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy HH:mm")}</TableCell>
              </TableRow>
            ))}
            {auditLog.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No audit entries yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout title="SMS Center" description="Send SMS, manage providers, campaigns, automation and consent">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
          <TabsTrigger value="overview"><LayoutDashboard className="w-3.5 h-3.5 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="providers"><Plug className="w-3.5 h-3.5 mr-1" />Providers</TabsTrigger>
          <TabsTrigger value="send"><Send className="w-3.5 h-3.5 mr-1" />Send SMS</TabsTrigger>
          <TabsTrigger value="campaigns"><Megaphone className="w-3.5 h-3.5 mr-1" />Campaigns</TabsTrigger>
          <TabsTrigger value="automation"><Zap className="w-3.5 h-3.5 mr-1" />Automation</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="w-3.5 h-3.5 mr-1" />Templates</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="w-3.5 h-3.5 mr-1" />Contacts</TabsTrigger>
          <TabsTrigger value="history"><History className="w-3.5 h-3.5 mr-1" />History</TabsTrigger>
          <TabsTrigger value="consent"><ShieldBan className="w-3.5 h-3.5 mr-1" />Consent</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="w-3.5 h-3.5 mr-1" />Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="w-4 h-4" />
              Active provider: <span className="font-semibold text-foreground">{primary ? primary.display_name : "None configured"}</span>
              {primary && !primary.has_api_key && <Badge variant="destructive">API key missing</Badge>}
              {primary?.last_check_status === "ok" && <Badge variant="successOutline">Connected</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem><SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="iconSm" onClick={loadAll}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></Button>
            </div>
          </div>
          {!loading && primary && !primary.has_api_key && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              No SMS provider API key is configured yet. Open the <button className="underline font-medium" onClick={() => setTab("providers")}>Providers tab</button> and paste your {primary.display_name} API key to start sending real SMS.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            <StatCard label="Sent today" value={stats.sentToday} icon={Send} />
            <StatCard label="Sent this month" value={stats.sentMonth} icon={Send} />
            <StatCard label="Sent (range)" value={stats.sent} icon={CheckCircle2} />
            <StatCard label="Delivered (range)" value={stats.delivered} icon={CheckCircle2} hint="Where the provider reports it" />
            <StatCard label="Failed (range)" value={stats.failed} icon={XCircle} />
            <StatCard label="Pending (range)" value={stats.pending} icon={Clock} />
            <StatCard label="Balance" value={primary?.last_balance !== null && primary?.last_balance !== undefined ? `${primary.last_balance} ${primary.balance_currency || ""}` : "—"} icon={Wallet} hint={primary ? primary.display_name : undefined} />
            <StatCard label="Marketing subscribers" value={stats.subscribers} icon={Users} />
            <StatCard label="Opted out / suppressed" value={stats.optedOut} icon={ShieldBan} />
            <StatCard label="Active automation rules" value={stats.activeRules} icon={Zap} />
            <StatCard label="Scheduled campaigns" value={stats.scheduledCampaigns} icon={Megaphone} />
          </div>
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Recent SMS Activity</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Recipient</TableHead><TableHead>Type</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
                <TableBody>
                  {messages.slice(0, 10).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell><code className="text-xs">{m.phone}</code></TableCell>
                      <TableCell><Badge variant="outline">{m.message_type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{m.source}</TableCell>
                      <TableCell>{statusBadge(m.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{format(new Date(m.sent_at || m.created_at), "MMM d, HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                  {messages.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No SMS activity yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <div className="space-y-4">
            {providers.map((p) => <ProviderCard key={p.id} p={p} />)}
            {providers.length === 0 && !loading && <p className="text-sm text-muted-foreground">No providers configured.</p>}
          </div>
        </TabsContent>
        <TabsContent value="send"><SendTab /></TabsContent>
        <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
        <TabsContent value="automation"><AutomationTab /></TabsContent>
        <TabsContent value="templates"><TemplatesTab /></TabsContent>
        <TabsContent value="contacts"><ContactsTab /></TabsContent>
        <TabsContent value="history"><HistoryTab /></TabsContent>
        <TabsContent value="consent"><ConsentTab /></TabsContent>
        <TabsContent value="audit"><AuditTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSMSCenter;
