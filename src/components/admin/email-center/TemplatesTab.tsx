import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Plus, Copy, Trash2, Edit3, Send } from "lucide-react";
import RichEditor from "./RichEditor";
import { Template, saveTemplate, deleteTemplate, duplicateTemplate, Settings } from "@/lib/emailCenter";
import BrandedPreview from "./BrandedPreview";
import { renderBrandedEmail } from "./brandTemplate";
import { toast } from "sonner";

interface Props { templates: Template[]; settings: Settings; onChange: () => void; onUseTemplate: (t: Template) => void; }

export default function TemplatesTab({ templates, settings, onChange, onUseTemplate }: Props) {
  const [editing, setEditing] = useState<Partial<Template> | null>(null);
  const [toDelete, setToDelete] = useState<Template | null>(null);

  const save = async () => {
    if (!editing?.name || !editing?.subject || !editing?.body_html) return toast.error("All fields required");
    try {
      await saveTemplate({ id: editing.id, name: editing.name!, subject: editing.subject!, body_html: editing.body_html!, category: editing.category || "general" });
      toast.success("Template saved");
      setEditing(null); onChange();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ name: "", subject: "", body_html: "<p></p>", category: "general" })} className="bg-[#DF5101] hover:bg-[#c04600]"><Plus className="w-4 h-4 mr-2"/>New template</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="p-4 flex flex-col gap-3 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground truncate">{t.subject}</div>
              </div>
              {t.is_system && <Badge variant="secondary" className="text-[10px] shrink-0">System</Badge>}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: t.body_html }}/>
            <div className="flex gap-1 pt-2 border-t border-border/40 mt-auto">
              <Button size="sm" variant="outline" onClick={() => onUseTemplate(t)}><Send className="w-3.5 h-3.5 mr-1.5"/>Use</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(t)}><Edit3 className="w-3.5 h-3.5"/></Button>
              <Button size="sm" variant="ghost" onClick={async () => { await duplicateTemplate(t); onChange(); toast.success("Duplicated"); }}><Copy className="w-3.5 h-3.5"/></Button>
              {!t.is_system && <Button size="sm" variant="ghost" onClick={() => setToDelete(t)}><Trash2 className="w-3.5 h-3.5 text-destructive"/></Button>}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Name</Label><Input value={editing?.name || ""} onChange={e => setEditing(v => ({...v!, name: e.target.value}))}/></div>
                <div><Label className="text-xs">Category</Label><Input value={editing?.category || ""} onChange={e => setEditing(v => ({...v!, category: e.target.value}))}/></div>
              </div>
              <div><Label className="text-xs">Subject</Label><Input value={editing?.subject || ""} onChange={e => setEditing(v => ({...v!, subject: e.target.value}))}/></div>
              <div><Label className="text-xs">Body</Label><RichEditor value={editing?.body_html || ""} onChange={html => setEditing(v => ({...v!, body_html: html}))}/></div>
            </div>
            <div>
              <Label className="text-xs">Preview</Label>
              <BrandedPreview html={renderBrandedEmail(editing?.body_html || "", settings)} height={520}/>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} className="bg-[#DF5101] hover:bg-[#c04600]">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete template?</AlertDialogTitle><AlertDialogDescription>{toDelete?.name}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (toDelete) { await deleteTemplate(toDelete.id); setToDelete(null); onChange(); toast.success("Deleted"); }}} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
