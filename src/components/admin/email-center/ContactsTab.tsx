import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Plus, Upload, Trash2, Edit3, Search } from "lucide-react";
import { Contact, upsertContact, deleteContact } from "@/lib/emailCenter";
import { toast } from "sonner";

interface Props { contacts: Contact[]; onChange: () => void }

export default function ContactsTab({ contacts, onChange }: Props) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [editing, setEditing] = useState<Partial<Contact> | null>(null);
  const [toDelete, setToDelete] = useState<Contact | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    contacts.forEach(c => c.tags.forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [contacts]);

  const filtered = contacts.filter(c => {
    if (tag && !c.tags.includes(tag)) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!c.full_name.toLowerCase().includes(s) && !c.email.toLowerCase().includes(s) && !(c.company||"").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const save = async () => {
    if (!editing?.email || !editing.full_name) return toast.error("Name and email required");
    try {
      await upsertContact({
        id: editing.id, full_name: editing.full_name!, email: editing.email!.toLowerCase(),
        company: editing.company || null, phone: editing.phone || null, notes: editing.notes || null,
        tags: (editing.tags as string[]) || [],
      } as any);
      toast.success("Contact saved");
      setEditing(null); onChange();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;
    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const idx = (k: string) => header.indexOf(k);
    let added = 0, skipped = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const email = cols[idx("email")]?.toLowerCase();
      const name = cols[idx("name")] || cols[idx("full_name")] || email;
      if (!email || !/.+@.+\..+/.test(email)) { skipped++; continue; }
      const tags = (cols[idx("tags")] || cols[idx("group")] || "").split(/[;|]/).map(t => t.trim()).filter(Boolean);
      try {
        await upsertContact({ full_name: name, email, company: cols[idx("company")] || null, phone: cols[idx("phone")] || null, tags });
        added++;
      } catch { skipped++; }
    }
    toast.success(`Imported ${added} contacts (${skipped} skipped)`);
    onChange();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, company" className="pl-9"/>
        </div>
        <select value={tag} onChange={e => setTag(e.target.value)} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="">All groups</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])}/>
        <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-2"/>Import CSV</Button>
        <Button onClick={() => setEditing({ full_name: "", email: "", tags: [] })} className="bg-[#DF5101] hover:bg-[#c04600]"><Plus className="w-4 h-4 mr-2"/>Add contact</Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1.5fr_100px] gap-3 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b">
          <div>Name</div><div>Email</div><div>Company</div><div>Groups</div><div></div>
        </div>
        <div className="divide-y divide-border/40">
          {filtered.map(c => (
            <div key={c.id} className="px-4 py-3 md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1.5fr_100px] md:gap-3 md:items-center">
              <div className="font-medium text-sm">{c.full_name}</div>
              <div className="text-sm text-muted-foreground md:text-foreground truncate">{c.email}</div>
              <div className="text-sm text-muted-foreground truncate">{c.company || "—"}</div>
              <div className="flex flex-wrap gap-1 mt-1 md:mt-0">
                {c.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
              <div className="flex gap-1 justify-end mt-2 md:mt-0">
                <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Edit3 className="w-4 h-4"/></Button>
                <Button variant="ghost" size="icon" onClick={() => setToDelete(c)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="p-10 text-center text-sm text-muted-foreground">No contacts</div>}
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit contact" : "New contact"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Full name*</Label><Input value={editing?.full_name || ""} onChange={e => setEditing(v => ({...v!, full_name: e.target.value}))}/></div>
              <div><Label className="text-xs">Email*</Label><Input value={editing?.email || ""} onChange={e => setEditing(v => ({...v!, email: e.target.value}))}/></div>
              <div><Label className="text-xs">Company</Label><Input value={editing?.company || ""} onChange={e => setEditing(v => ({...v!, company: e.target.value}))}/></div>
              <div><Label className="text-xs">Phone</Label><Input value={editing?.phone || ""} onChange={e => setEditing(v => ({...v!, phone: e.target.value}))}/></div>
            </div>
            <div>
              <Label className="text-xs">Groups (comma separated)</Label>
              <Input value={(editing?.tags as string[] || []).join(", ")} onChange={e => setEditing(v => ({...v!, tags: e.target.value.split(",").map(x => x.trim()).filter(Boolean) as any}))} placeholder="Corporate Clients, Partners"/>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={editing?.notes || ""} onChange={e => setEditing(v => ({...v!, notes: e.target.value}))} rows={3}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} className="bg-[#DF5101] hover:bg-[#c04600]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete contact?</AlertDialogTitle><AlertDialogDescription>{toDelete?.full_name} ({toDelete?.email})</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (toDelete) { await deleteContact(toDelete.id); setToDelete(null); onChange(); toast.success("Deleted"); }}} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
