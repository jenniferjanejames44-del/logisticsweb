import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Send, Save, Paperclip, X, Loader2, Calendar, TestTube, Smartphone, Monitor,
  ArrowLeft, ArrowRight, Check, FileText, PenLine, Users, Eye, Rocket, Search,
} from "lucide-react";
import RichEditor from "./RichEditor";
import BrandedPreview from "./BrandedPreview";
import { renderBrandedEmail } from "./brandTemplate";
import { PRO_TEMPLATES } from "./proTemplates";
import {
  Contact, Settings, Template, Message, AttachmentMeta,
  saveDraft, sendMessage, uploadAttachment, removeAttachment, scheduleMessage, sendTestEmail,
} from "@/lib/emailCenter";

interface Props {
  settings: Settings;
  contacts: Contact[];
  templates: Template[];
  initial?: Message | null;
  onSent: () => void;
  onDrafted: () => void;
}

const STEPS = [
  { n: 1, label: "Template", icon: FileText },
  { n: 2, label: "Write", icon: PenLine },
  { n: 3, label: "Recipients", icon: Users },
  { n: 4, label: "Preview", icon: Eye },
  { n: 5, label: "Send", icon: Rocket },
];

const parseEmails = (s: string) =>
  Array.from(new Set(s.split(/[,;\n\s]+/).map(x => x.trim().toLowerCase()).filter(x => /.+@.+\..+/.test(x))));

export default function ComposerWizard({ settings, contacts, templates, initial, onSent, onDrafted }: Props) {
  const [step, setStep] = useState(1);
  const [id, setId] = useState<string | undefined>(initial?.id || undefined);
  const [subject, setSubject] = useState(initial?.subject || "");
  const [fromName, setFromName] = useState(initial?.from_name || settings.company_name);
  const [bodyHtml, setBodyHtml] = useState(initial?.body_html || "");
  const [selected, setSelected] = useState<string[]>(initial?.to_recipients || []);
  const [manual, setManual] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [attachments, setAttachments] = useState<AttachmentMeta[]>(initial?.attachments || []);
  const [templateKey, setTemplateKey] = useState<string>("");

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initial) return;
    setId(initial.id || undefined);
    setSubject(initial.subject);
    setBodyHtml(initial.body_html);
    setSelected(initial.to_recipients || []);
    setAttachments(initial.attachments || []);
    setFromName(initial.from_name || settings.company_name);
    setStep(2);
  }, [initial, settings.company_name]);

  const recipients = useMemo(
    () => Array.from(new Set([...selected, ...parseEmails(manual)])),
    [selected, manual]
  );

  const filteredContacts = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return contacts.slice(0, 200);
    return contacts.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q)
    ).slice(0, 200);
  }, [contacts, contactQuery]);

  const previewHtml = useMemo(
    () => renderBrandedEmail(bodyHtml || "<p style='color:#9ca3af;'>Your message will appear here…</p>", settings),
    [bodyHtml, settings]
  );

  const goto = (n: number) => { setStep(n); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const chooseBuiltIn = (key: string) => {
    const t = PRO_TEMPLATES.find(x => x.key === key);
    if (!t) return;
    setTemplateKey(key);
    setSubject(t.subject);
    setBodyHtml(t.body);
    goto(2);
  };

  const chooseSaved = (t: Template) => {
    setTemplateKey(t.id);
    setSubject(t.subject);
    setBodyHtml(t.body_html);
    goto(2);
  };

  const startBlank = () => { setTemplateKey("blank"); setSubject(""); setBodyHtml(""); goto(2); };

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setUploading(files.length);
    try {
      const out: AttachmentMeta[] = [];
      for (const f of Array.from(files)) {
        if (f.size > 15 * 1024 * 1024) { toast.error(`${f.name} is larger than 15MB`); continue; }
        out.push(await uploadAttachment(f));
      }
      setAttachments(a => [...a, ...out]);
    } catch (e: any) { toast.error(e.message || "Upload failed"); }
    setUploading(0);
  };

  const persist = () =>
    saveDraft({
      id, subject, body_html: bodyHtml,
      to_recipients: recipients, cc_recipients: [], bcc_recipients: [],
      attachments, from_name: fromName,
    });

  const handleSaveDraft = async () => {
    setSaving(true);
    try { setId(await persist()); toast.success("Draft saved"); onDrafted(); }
    catch (e: any) { toast.error(e.message || "Could not save draft"); }
    setSaving(false);
  };

  const reset = () => {
    setId(undefined); setSubject(""); setBodyHtml(""); setSelected([]); setManual("");
    setAttachments([]); setFromName(settings.company_name); setTemplateKey(""); setStep(1);
  };

  const handleSend = async () => {
    if (!subject.trim()) { toast.error("Add a subject line"); return goto(2); }
    if (!bodyHtml.trim()) { toast.error("Write your message"); return goto(2); }
    if (!recipients.length) { toast.error("Select at least one recipient"); return goto(3); }
    setSending(true);
    try {
      const draftId = await persist();
      setId(draftId);
      const res = await sendMessage({ id: draftId, subject, bodyHtml, to: recipients, attachments, fromName });
      if (res.failed && !res.sent) toast.error(res.errors?.[0] || "Sending failed");
      else if (res.failed) toast.warning(`Queued ${res.sent}, failed ${res.failed}`);
      else toast.success(`Queued for delivery to ${res.sent} recipient${res.sent === 1 ? "" : "s"}`);
      onSent();
      reset();
    } catch (e: any) { toast.error(e.message || "Sending failed"); }
    setSending(false);
  };

  const handleSchedule = async () => {
    const when = new Date(scheduleAt);
    if (!scheduleAt || isNaN(when.getTime()) || when.getTime() < Date.now() + 30_000)
      return toast.error("Pick a time at least a minute from now");
    if (!subject.trim() || !bodyHtml.trim() || !recipients.length)
      return toast.error("Subject, message and recipients are required");
    setScheduling(true);
    try {
      const draftId = await persist();
      await scheduleMessage(draftId, when);
      toast.success(`Scheduled for ${when.toLocaleString()}`);
      setShowSchedule(false); setScheduleAt(""); onSent(); reset();
    } catch (e: any) { toast.error(e.message || "Could not schedule"); }
    setScheduling(false);
  };

  const handleTest = async () => {
    if (!/.+@.+\..+/.test(testEmail)) return toast.error("Enter a valid email address");
    if (!subject.trim() || !bodyHtml.trim()) return toast.error("Subject and message are required");
    setTesting(true);
    try {
      const r: any = await sendTestEmail({ subject, bodyHtml, testTo: testEmail, fromName, attachments });
      if (r?.sent) { toast.success(`Test sent to ${testEmail}`); setShowTest(false); }
      else toast.error(r?.errors?.[0] || "Test send failed");
    } catch (e: any) { toast.error(e.message || "Test send failed"); }
    setTesting(false);
  };

  const canContinue = step === 2 ? !!subject.trim() && !!bodyHtml.trim() : step === 3 ? recipients.length > 0 : true;

  return (
    <div ref={topRef} className="space-y-6">
      {/* Stepper */}
      <Card className="p-1.5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const active = step === s.n, done = step > s.n;
            return (
              <button key={s.n} onClick={() => (done || s.n < step) && goto(s.n)}
                className={`flex min-w-fit flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition
                  ${active ? "bg-primary text-primary-foreground" : done ? "text-foreground hover:bg-muted" : "text-muted-foreground"}`}>
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold
                  ${active ? "bg-primary-foreground/20" : done ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>
                  {done ? <Check className="h-3 w-3" /> : s.n}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
                {i < STEPS.length - 1 && <span className="ml-1 hidden text-border md:inline">›</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 1 — Template */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold">Choose a starting point</h3>
            <p className="mt-1 text-sm text-muted-foreground">Professional layouts written for real business correspondence.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PRO_TEMPLATES.map(t => (
              <button key={t.key} onClick={() => chooseBuiltIn(t.key)}
                className="group rounded-xl border border-border/60 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <p className="font-semibold">{t.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
              </button>
            ))}
            <button onClick={startBlank}
              className="rounded-xl border-2 border-dashed border-border/60 p-5 text-left transition hover:border-primary/40 hover:bg-muted/30">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground"><PenLine className="h-4.5 w-4.5" /></div>
              <p className="font-semibold">Blank email</p>
              <p className="mt-1 text-sm text-muted-foreground">Start from an empty branded shell.</p>
            </button>
          </div>

          {templates.length > 0 && (
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your saved templates</h4>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <button key={t.id} onClick={() => chooseSaved(t)}
                    className="rounded-lg border border-border/60 bg-white px-3.5 py-2 text-sm transition hover:border-primary/40 hover:bg-muted/40">
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Write */}
      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <div>
                <Label className="text-xs font-medium">Subject line</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Business Proposal — RAC Logistics" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-medium">From name</Label>
                <Input value={fromName} onChange={e => setFromName(e.target.value)} className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs font-medium">Message</Label>
              <RichEditor value={bodyHtml} onChange={setBodyHtml} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Tip: <code className="rounded bg-muted px-1">{"{{contact_name}}"}</code> and{" "}
                <code className="rounded bg-muted px-1">{"{{company_name}}"}</code> are replaced with each recipient's details.
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-xs font-medium">Attachments</Label>
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-primary hover:underline">
                  <Paperclip className="h-3.5 w-3.5" /> Add files
                  <input type="file" multiple hidden onChange={e => handleFiles(e.target.files)} />
                </label>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                className={`rounded-lg border-2 border-dashed p-4 text-center text-xs transition ${dragOver ? "border-primary bg-primary/5 text-primary" : "border-border/50 text-muted-foreground"}`}>
                Drop PDFs, proposals or images here — up to 15MB each
              </div>
              {uploading > 0 && <p className="mt-2 text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" />Uploading…</p>}
              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map(a => (
                    <Badge key={a.path} variant="outline" className="gap-1.5 px-2 py-1.5">
                      <Paperclip className="h-3 w-3" />
                      <span className="max-w-[180px] truncate">{a.name}</span>
                      <button onClick={async () => { await removeAttachment(a.path).catch(() => {}); setAttachments(x => x.filter(y => y.path !== a.path)); }}
                        className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="h-fit lg:sticky lg:top-4">
            <Card className="p-3">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
              <BrandedPreview html={previewHtml} height={520} />
            </Card>
          </div>
        </div>
      )}

      {/* Step 3 — Recipients */}
      {step === 3 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="p-6">
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={contactQuery} onChange={e => setContactQuery(e.target.value)} placeholder="Search contacts by name, email or company" className="pl-9" />
            </div>
            <div className="max-h-[420px] divide-y divide-border/40 overflow-y-auto rounded-lg border border-border/50">
              {filteredContacts.map(c => {
                const on = selected.includes(c.email.toLowerCase());
                return (
                  <button key={c.id} type="button"
                    onClick={() => setSelected(s => on ? s.filter(e => e !== c.email.toLowerCase()) : [...s, c.email.toLowerCase()])}
                    className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/40">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.full_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{c.email}{c.company ? ` · ${c.company}` : ""}</span>
                    </span>
                  </button>
                );
              })}
              {!filteredContacts.length && <p className="p-8 text-center text-sm text-muted-foreground">No contacts found</p>}
            </div>

            <div className="mt-4">
              <Label className="text-xs font-medium">Or type email addresses</Label>
              <Input value={manual} onChange={e => setManual(e.target.value)} placeholder="name@company.com, another@company.com" className="mt-1.5" />
            </div>
          </Card>

          <Card className="h-fit p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sending to</p>
            <p className="mt-2 text-3xl font-semibold">{recipients.length}</p>
            <p className="text-sm text-muted-foreground">recipient{recipients.length === 1 ? "" : "s"}</p>
            {recipients.length > 0 && (
              <div className="mt-4 max-h-64 space-y-1 overflow-y-auto">
                {recipients.map(e => (
                  <div key={e} className="flex items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1.5 text-xs">
                    <span className="truncate">{e}</span>
                    <button onClick={() => { setSelected(s => s.filter(x => x !== e)); setManual(m => parseEmails(m).filter(x => x !== e).join(", ")); }}
                      className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Step 4 — Preview */}
      {step === 4 && (
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm"><span className="text-muted-foreground">Subject:</span> <span className="font-medium">{subject || "(no subject)"}</span></p>
              <p className="text-xs text-muted-foreground">From {fromName} · to {recipients.length} recipient{recipients.length === 1 ? "" : "s"}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setPreviewDevice("desktop")} className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs ${previewDevice === "desktop" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}><Monitor className="h-3.5 w-3.5" />Desktop</button>
              <button onClick={() => setPreviewDevice("mobile")} className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs ${previewDevice === "mobile" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}><Smartphone className="h-3.5 w-3.5" />Mobile</button>
              <Button size="sm" variant="outline" className="ml-2" onClick={() => setShowTest(true)}><TestTube className="mr-1.5 h-3.5 w-3.5" />Send test</Button>
            </div>
          </div>
          <div className={previewDevice === "mobile" ? "mx-auto" : ""} style={previewDevice === "mobile" ? { width: 380 } : undefined}>
            <BrandedPreview html={previewHtml} height={660} />
          </div>
        </Card>
      )}

      {/* Step 5 — Send */}
      {step === 5 && (
        <Card className="mx-auto max-w-xl p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/5 text-primary"><Rocket className="h-6 w-6" /></div>
          <h3 className="text-lg font-semibold">Ready to send</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            “{subject || "(no subject)"}” will be delivered to <strong>{recipients.length}</strong> recipient{recipients.length === 1 ? "" : "s"}.
          </p>
          <div className="mt-6 space-y-2 rounded-xl border border-border/50 bg-muted/20 p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">From</span><span className="font-medium">{fromName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Recipients</span><span className="font-medium">{recipients.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Attachments</span><span className="font-medium">{attachments.length}</span></div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={handleSend} disabled={sending} size="lg">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send now
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowSchedule(true)}><Calendar className="mr-2 h-4 w-4" />Schedule</Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Delivery status is tracked in the Delivery tab.</p>
        </Card>
      )}

      {/* Footer nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
        <Button variant="ghost" disabled={step === 1} onClick={() => goto(step - 1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save draft
            </Button>
          )}
          {step < 5 && step > 1 && (
            <Button onClick={() => canContinue ? goto(step + 1) : toast.error(step === 2 ? "Add a subject and message" : "Select at least one recipient")}>
              Continue<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader><DialogTitle>Schedule this email</DialogTitle></DialogHeader>
          <p className="-mt-2 text-sm text-muted-foreground">It will be queued and delivered automatically at the chosen time.</p>
          <div>
            <Label className="text-xs">Send at</Label>
            <Input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={scheduling}>{scheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTest} onOpenChange={setShowTest}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader><DialogTitle>Send a test email</DialogTitle></DialogHeader>
          <p className="-mt-2 text-sm text-muted-foreground">Delivered only to this address so you can review it first.</p>
          <div>
            <Label className="text-xs">Send test to</Label>
            <Input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTest(false)}>Cancel</Button>
            <Button onClick={handleTest} disabled={testing}>{testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send test</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
