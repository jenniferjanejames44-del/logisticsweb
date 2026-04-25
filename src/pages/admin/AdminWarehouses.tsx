import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";

const AdminWarehouses = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ country: "", name: "", address: "", city: "", state: "", zip_code: "", phone: "", is_active: true });

  const fetch_ = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("warehouses").select("*").order("created_at");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const openDialog = (i?: any) => {
    if (i) { setEditing(i); setForm({ country: i.country, name: i.name, address: i.address, city: i.city || "", state: i.state || "", zip_code: i.zip_code || "", phone: i.phone || "", is_active: i.is_active }); }
    else { setEditing(null); setForm({ country: "", name: "", address: "", city: "", state: "", zip_code: "", phone: "", is_active: true }); }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { country: form.country, name: form.name, address: form.address, city: form.city || null, state: form.state || null, zip_code: form.zip_code || null, phone: form.phone || null, is_active: form.is_active };
    const { error } = editing
      ? await (supabase as any).from("warehouses").update(payload).eq("id", editing.id)
      : await (supabase as any).from("warehouses").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); fetch_();
  };

  const removeWarehouse = async (id: string) => {
    const { error } = await (supabase as any).from("warehouses").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted"); fetch_();
  };

  return (
    <AdminLayout title="Warehouses" description="Manage warehouse locations for shipments.">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Add Warehouse</Button>
        </div>
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Warehouse className="w-5 h-5" />Warehouses ({items.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Country</TableHead><TableHead>City / State</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
                  items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell>{i.country}</TableCell>
                      <TableCell className="text-sm">{[i.city, i.state].filter(Boolean).join(", ") || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{i.address}</TableCell>
                      <TableCell>{i.phone || "—"}</TableCell>
                      <TableCell>{i.is_active ? "✓" : "✗"}</TableCell>
                      <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button><DeleteConfirmDialog title="Delete Warehouse" description={`Are you sure you want to delete "${i.name}"? This cannot be undone.`} onConfirm={() => removeWarehouse(i.id)} trigger={<Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>} /></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Warehouse</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} required /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div className="space-y-2"><Label>State / Region</Label><Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>ZIP / Postal Code</Label><Input value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={c => setForm({...form, is_active: c})} /><Label>Active</Label></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWarehouses;
