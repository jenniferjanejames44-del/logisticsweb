import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Save, Eye, Paperclip, X, Loader2, Users } from "lucide-react";
import RichEditor from "./RichEditor";
import BrandedPreview from "./BrandedPreview";
import { renderBrandedEmail } from "./brandTemplate";
import { Contact, Settings, Template, Message, AttachmentMeta, saveDraft, sendMessage, uploadAttachment, removeAttachment } from "@/lib/emailCenter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [toInput, setToInput] = useState((initial?.to_recipients || []).join(", "));
  const [ccInput, setCcInput] = useState((initial?.cc_recipients || []).join(", "));
  const [bccInput, setBccInput] = useState((initial?.bcc_recipients || []).join(", "));
  const [showCc, setShowCc] = useState(!!initial?.cc_recipients?.length);
  const [showBcc, setShowBcc] = useState(!!initial?.bcc_recipients?.length);
  const [bodyHtml, setBodyHtml] = useState(initial?.body_html || "");
  const [attachments, setAttachments] = useState<AttachmentMeta[]>(initial?.attachments || []);
  const [templateId, setTemplateId] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

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
    }
  }, [initial]);

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

  const handleFiles = async (files: FileList | null) => {
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
      const newId = await saveDraft({ id, subject, body_html: bodyHtml, to_recipients: to, cc_recipients: cc, bcc_recipients: bcc, attachments });
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
      const draftId = await saveDraft({ id, subject, body_html: bodyHtml, to_recipients: to, cc_recipients: cc, bcc_recipients: bcc, attachments });
      setId(draftId);
      const res = await sendMessage({ id: draftId, subject, bodyHtml, to, cc, bcc, attachments });
      if (res.failed) toast.warning(`Sent ${res.sent}, failed ${res.failed}`);
      else toast.success(`Sent to ${res.sent} recipient${res.sent === 1 ? "" : "s"}`);
      onSent();
      // reset
      setId(undefined); setSubject(""); setToInput(""); setCcInput(""); setBccInput(""); setBodyHtml(""); setAttachments([]);
    } catch (e: any) { toast.error(e.message || "Send failed"); }
    setSending(false);
  };

  const previewHtml = useMemo(() => renderBrandedEmail(bodyHtml || "<p style='color:#9ca3af;'>Your email body will appear here…</p>", settings), [bodyHtml, settings]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
          <div>
            <Label className="text-xs">Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter subject" className="mt-1"/>
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
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs">Attachments</Label>
            <label className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
              <Paperclip className="w-3.5 h-3.5"/> Attach files
              <input type="file" multiple hidden onChange={e => handleFiles(e.target.files)}/>
            </label>
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
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
            Save draft
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4 mr-2"/>Preview</Button>
        </div>
      </Card>

      <div className="lg:sticky lg:top-4 h-fit">
        <Card className="p-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Live preview</div>
          <BrandedPreview html={previewHtml} height={520}/>
        </Card>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader><DialogTitle>Email preview</DialogTitle></DialogHeader>
          <div className="text-xs text-muted-foreground mb-2">Subject: <span className="text-foreground font-medium">{subject || "(no subject)"}</span></div>
          <BrandedPreview html={previewHtml} height={640}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}
