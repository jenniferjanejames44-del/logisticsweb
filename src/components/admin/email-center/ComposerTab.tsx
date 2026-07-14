import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Save, Eye, Paperclip, X, Loader2, Users, Calendar, TestTube, Smartphone, Monitor, Printer, Sparkles } from "lucide-react";
import RichEditor from "./RichEditor";
import BrandedPreview from "./BrandedPreview";
import { renderBrandedEmail } from "./brandTemplate";
import { Contact, Settings, Template, Message, AttachmentMeta, saveDraft, sendMessage, uploadAttachment, removeAttachment, scheduleMessage, sendTestEmail } from "@/lib/emailCenter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MERGE_VARS = [
  { k: "contact_name", label: "Contact name" },
  { k: "company_name", label: "Company name" },
  { k: "country", label: "Country" },
  { k: "position", label: "Position" },
  { k: "industry", label: "Industry" },
  { k: "sender_name", label: "Sender name" },
  { k: "website", label: "Company website" },
  { k: "phone", label: "Company phone" },
  { k: "email", label: "Company email" },
];

interface Props {
  settings: Settings;
  contacts: Contact[];
  templates: Template[];
  initial?: Message | null;
  onSent: () => void;
  onDrafted: () => void;
}

function parseEmails(s: string): string[] {
  return s.split(/[,;\n]/).map(x => x.trim()).filter(x => /.+@.+\..+/.test(x));
}

export default function ComposerTab({ settings, contacts, templates, initial, onSent, onDrafted }: Props) {
  const [id, setId] = useState<string | undefined>(initial?.id);
  const [subject, setSubject] = useState(initial?.subject || "");
  const [fromName, setFromName] = useState(initial?.from_name || settings.company_name);
  const [toInput, setToInput] = useState((initial?.to_recipients || []).join(", "));
  const [ccInput, setCcInput] = useState((initial?.cc_recipients || []).join(", "));
  const [bccInput, setBccInput] = useState((initial?.bcc_recipients || []).join(", "));
  const [showCc, setShowCc] = useState(!!initial?.cc_recipients?.length);
  const [showBcc, setShowBcc] = useState(!!initial?.bcc_recipients?.length);
  const [bodyHtml, setBodyHtml] = useState(initial?.body_html || "");
  const [attachments, setAttachments] = useState<AttachmentMeta[]>(initial?.attachments || []);
  const [templateId, setTemplateId] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop"|"mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState<string>("");
  const [showTest, setShowTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (initial) {
      setId(initial.id);
      setSubject(initial.subject);
      setToInput(initial.to_recipients.join(", "));
      setCcInput(initial.cc_recipients.join(", "));
      setBccInput(initial.bcc_recipients.join(", "));
      setBodyHtml(initial.body_html);
      setAttachments(initial.attachments || []);
      setShowCc(!!initial.cc_recipients?.length);
      setShowBcc(!!initial.bcc_recipients?.length);
      setFromName(initial.from_name || settings.company_name);
    }
  }, [initial, settings.company_name]);

  const to = useMemo(() => parseEmails(toInput), [toInput]);
  const cc = useMemo(() => parseEmails(ccInput), [ccInput]);
  const bcc = useMemo(() => parseEmails(bccInput), [bccInput]);

  const groups = useMemo(() => {
    const map = new Map<string, Contact[]>();
    contacts.forEach(c => c.tags.forEach(tag => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(c);
    }));
    return Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  }, [contacts]);

  const applyTemplate = (tid: string) => {
    setTemplateId(tid);
    const t = templates.find(x => x.id === tid);
    if (!t) return;
    if (!subject) setSubject(t.subject);
    setBodyHtml(t.body_html);
  };

  const addRecipients = (emails: string[], field: "to"|"cc"|"bcc") => {
    const setInput = field === "to" ? setToInput : field === "cc" ? setCcInput : setBccInput;
    const current = field === "to" ? toInput : field === "cc" ? ccInput : bccInput;
    const existing = new Set(parseEmails(current));
    emails.forEach(e => existing.add(e));
    setInput(Array.from(existing).join(", "));
    if (field === "cc") setShowCc(true);
    if (field === "bcc") setShowBcc(true);
  };

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setUploadingCount(files.length);
    try {
      const uploaded: AttachmentMeta[] = [];
      for (const f of Array.from(files)) {
        if (f.size > 15 * 1024 * 1024) { toast.error(`${f.name} exceeds 15MB`); continue; }
        const meta = await uploadAttachment(f);
        uploaded.push(meta);
      }
      setAttachments(a => [...a, ...uploaded]);
    } catch (e: any) { toast.error(e.message || "Upload failed"); }
    setUploadingCount(0);
  };

  const removeAtt = async (path: string) => {
    await removeAttachment(path).catch(() => {});
    setAttachments(a => a.filter(x => x.path !== path));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const newId = await saveDraft({ id, subject, body_html: bodyHtml, to_recipients: to, cc_recipients: cc, bcc_recipients: bcc, attachments, from_name: fromName });
      setId(newId);
      toast.success("Draft saved");
      onDrafted();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setSaving(false);
  };

  const handleSend = async () => {
    if (!subject.trim()) return toast.error("Subject required");
    if (!bodyHtml.trim()) return toast.error("Body required");
    if (!to.length) return toast.error("At least one recipient");
    setSending(true);
    try {
      const draftId = await saveDraft({ id, subject, body_html: bodyHtml, to_recipients: to, cc_recipients: cc, bcc_recipients: bcc, attachments, from_name: fromName });
      setId(draftId);
      const res = await sendMessage({ id: draftId, subject, bodyHtml, to, cc, bcc, attachments, fromName });
      if (res.failed) toast.warning(`Sent ${res.sent}, failed ${res.failed}`);
      else toast.success(`Sent to ${res.sent} recipient${res.sent === 1 ? "" : "s"}`);
      onSent();
      // reset
      setId(undefined); setSubject(""); setToInput(""); setCcInput(""); setBccInput(""); setBodyHtml(""); setAttachments([]); setFromName(settings.company_name);
    } catch (e: any) { toast.error(e.message || "Send failed"); }
    setSending(false);
  };

  const handleSchedule = async () => {
    if (!scheduleAt) return toast.error("Pick a date/time");
    const when = new Date(scheduleAt);
    if (isNaN(when.getTime()) || when.getTime() < Date.now() + 30_000) return toast.error("Schedule must be at least 30 seconds in the future");
    if (!subject.trim() || !bodyHtml.trim() || !to.length) return toast.error("Subject, body and recipients required");
    setScheduling(true);
    try {
      const draftId = await saveDraft({ id, subject, body_html: bodyHtml, to_recipients: to, cc_recipients: cc, bcc_recipients: bcc, attachments, from_name: fromName });
      await scheduleMessage(draftId, when);
      toast.success(`Scheduled for ${when.toLocaleString()}`);
      setShowSchedule(false); setScheduleAt("");
      onSent();
      setId(undefined); setSubject(""); setToInput(""); setCcInput(""); setBccInput(""); setBodyHtml(""); setAttachments([]); setFromName(settings.company_name);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setScheduling(false);
  };

  const handleTestSend = async () => {
    if (!/.+@.+\..+/.test(testEmail)) return toast.error("Enter a valid email");
    if (!subject.trim() || !bodyHtml.trim()) return toast.error("Subject and body required");
    setTesting(true);
    try {
      const r: any = await sendTestEmail({ subject, bodyHtml, testTo: testEmail, fromName, attachments });
      if (r?.sent) toast.success(`Test email sent to ${testEmail}`);
      else toast.warning(`Test send failed: ${r?.errors?.[0] || "unknown"}`);
      setShowTest(false);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setTesting(false);
  };

  const insertVar = (k: string) => {
    const token = `{{${k}}}`;
    // append at cursor via execCommand for simplicity
    document.execCommand("insertText", false, token);
  };

  const previewHtml = useMemo(() => renderBrandedEmail(bodyHtml || "<p style='color:#9ca3af;'>Your email body will appear here…</p>", settings), [bodyHtml, settings]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_180px] gap-3">
          <div>
            <Label className="text-xs">Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter subject" className="mt-1"/>
          </div>
          <div>
            <Label className="text-xs">From name</Label>
            <Input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Sender name" className="mt-1"/>
          </div>
          <div>
            <Label className="text-xs">Load template</Label>
            <select value={templateId} onChange={e => applyTemplate(e.target.value)} className="mt-1 w-full h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="">Choose…</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">To</Label>
            <div className="flex gap-2 text-xs">
              {!showCc && <button type="button" onClick={() => setShowCc(true)} className="text-primary hover:underline">Add CC</button>}
              {!showBcc && <button type="button" onClick={() => setShowBcc(true)} className="text-primary hover:underline">Add BCC</button>}
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-1 text-primary hover:underline"><Users className="w-3 h-3"/>From contacts</button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0 bg-white" align="end">
                  <div className="p-3 border-b text-xs font-semibold">Groups</div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {groups.length === 0 && <p className="p-3 text-xs text-muted-foreground">No groups yet. Tag contacts to create groups.</p>}
                    {groups.map(([tag, list]) => (
                      <button key={tag} type="button" onClick={() => addRecipients(list.map(c => c.email), "to")} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between">
                        <span>{tag}</span><span className="text-xs text-muted-foreground">{list.length}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-t text-xs font-semibold">All contacts</div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {contacts.slice(0, 100).map(c => (
                      <button key={c.id} type="button" onClick={() => addRecipients([c.email], "to")} className="w-full text-left px-3 py-2 text-sm hover:bg-muted">
                        <div className="truncate">{c.full_name}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Input value={toInput} onChange={e => setToInput(e.target.value)} placeholder="email@example.com, another@example.com" />
          <p className="text-[11px] text-muted-foreground mt-1">{to.length} valid recipient{to.length === 1 ? "" : "s"}</p>
        </div>

        {showCc && (
          <div><Label className="text-xs">CC</Label><Input value={ccInput} onChange={e => setCcInput(e.target.value)} placeholder="cc@example.com"/></div>
        )}
        {showBcc && (
          <div><Label className="text-xs">BCC</Label><Input value={bccInput} onChange={e => setBccInput(e.target.value)} placeholder="bcc@example.com"/></div>
        )}

        <div>
          <Label className="text-xs mb-1 block">Message</Label>
          <RichEditor value={bodyHtml} onChange={setBodyHtml} />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mr-1"><Sparkles className="w-3 h-3"/> Insert variable:</span>
            {MERGE_VARS.map(v => (
              <button key={v.k} type="button" onClick={() => insertVar(v.k)}
                className="text-[11px] px-2 py-0.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition">
                {`{{${v.k}}}`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">Attachments</Label>
            <label className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
              <Paperclip className="w-3.5 h-3.5"/> Attach files
              <input type="file" multiple hidden onChange={e => handleFiles(e.target.files)}/>
            </label>
          </div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`rounded-lg border-2 border-dashed p-3 mb-2 text-center text-xs transition ${dragOver ? "border-[#DF5101] bg-[#DF5101]/5 text-[#DF5101]" : "border-border/50 text-muted-foreground"}`}
          >
            Drag &amp; drop files here — PDF, DOCX, XLSX, images up to 15MB each
          </div>
          {uploadingCount > 0 && <p className="text-xs text-muted-foreground mb-2"><Loader2 className="w-3 h-3 inline animate-spin mr-1"/>Uploading {uploadingCount}…</p>}
          <div className="flex flex-wrap gap-2">
            {attachments.map(a => (
              <Badge key={a.path} variant="outline" className="gap-1.5 py-1.5 px-2">
                <Paperclip className="w-3 h-3"/>
                <span className="max-w-[180px] truncate">{a.name}</span>
                <span className="text-[10px] text-muted-foreground">{Math.round(a.size/1024)}KB</span>
                <button onClick={() => removeAtt(a.path)} className="ml-1 hover:text-destructive"><X className="w-3 h-3"/></button>
              </Badge>
            ))}
            {attachments.length === 0 && <p className="text-xs text-muted-foreground">No attachments</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
          <Button onClick={handleSend} disabled={sending} className="bg-[#DF5101] hover:bg-[#c04600]">
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Send className="w-4 h-4 mr-2"/>}
            Send email
          </Button>
          <Button variant="outline" onClick={() => setShowSchedule(true)}><Calendar className="w-4 h-4 mr-2"/>Schedule</Button>
          <Button variant="outline" onClick={() => setShowTest(true)}><TestTube className="w-4 h-4 mr-2"/>Send test</Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
            Save draft
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4 mr-2"/>Preview</Button>
        </div>
      </Card>

      <div className="lg:sticky lg:top-4 h-fit">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live preview</div>
            <div className="flex gap-1">
              <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded ${previewDevice==="desktop" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}><Monitor className="w-3.5 h-3.5"/></button>
              <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded ${previewDevice==="mobile" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}><Smartphone className="w-3.5 h-3.5"/></button>
            </div>
          </div>
          <div className={previewDevice === "mobile" ? "mx-auto" : ""} style={previewDevice === "mobile" ? { width: 340 } : undefined}>
            <BrandedPreview html={previewHtml} height={520}/>
          </div>
        </Card>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl bg-white max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Email preview</DialogTitle></DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground">Subject: <span className="text-foreground font-medium">{subject || "(no subject)"}</span></div>
            <div className="flex gap-1">
              <button onClick={() => setPreviewDevice("desktop")} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs ${previewDevice==="desktop" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}><Monitor className="w-3.5 h-3.5"/>Desktop</button>
              <button onClick={() => setPreviewDevice("mobile")} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs ${previewDevice==="mobile" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}><Smartphone className="w-3.5 h-3.5"/>Mobile</button>
              <button onClick={() => { const w = window.open("", "_blank"); if (w) { w.document.write(previewHtml); w.document.close(); setTimeout(() => w.print(), 400); } }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-muted-foreground hover:bg-muted/60"><Printer className="w-3.5 h-3.5"/>Print</button>
            </div>
          </div>
          <div className={previewDevice === "mobile" ? "mx-auto" : ""} style={previewDevice === "mobile" ? { width: 380 } : undefined}>
            <BrandedPreview html={previewHtml} height={previewDevice === "mobile" ? 640 : 640}/>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader><DialogTitle>Schedule email</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">The email will be queued and delivered automatically at the chosen time.</p>
          <div>
            <Label className="text-xs">Send at</Label>
            <Input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} min={new Date(Date.now() + 60_000).toISOString().slice(0,16)}/>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={scheduling} className="bg-[#DF5101] hover:bg-[#c04600]">
              {scheduling && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTest} onOpenChange={setShowTest}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader><DialogTitle>Send a test email</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">The email will be delivered only to this address so you can review it before sending to real recipients.</p>
          <div>
            <Label className="text-xs">Send test to</Label>
            <Input type="email" placeholder="you@example.com" value={testEmail} onChange={e => setTestEmail(e.target.value)}/>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTest(false)}>Cancel</Button>
            <Button onClick={handleTestSend} disabled={testing} className="bg-[#DF5101] hover:bg-[#c04600]">
              {testing && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}Send test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
