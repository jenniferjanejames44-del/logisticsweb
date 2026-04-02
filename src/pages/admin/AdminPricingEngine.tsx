import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Globe, Weight, TrendingUp, Tag, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";

const compactAddButtonClass = "rounded-[10px] px-4";
const compactIconButtonClass = "rounded-[10px] border border-border/70 bg-white/90 shadow-[0_8px_18px_rgba(6,16,67,0.05)] hover:border-primary/20 hover:bg-muted/60";
const compactDeleteButtonClass = "rounded-[10px] border border-destructive/20 bg-destructive/[0.03] text-destructive shadow-[0_8px_18px_rgba(220,38,38,0.05)] hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive";

// ---- Generic CRUD helpers ----
function useCrud(table: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from(table).select("*").order("created_at", { ascending: true });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted");
    fetch();
  };

  useEffect(() => { fetch(); }, []);
  return { items, loading, fetch, remove };
}

// ============ ZONES TAB ============
const ZonesTab = () => {
  const { items: zones, loading, fetch, remove } = useCrud("zones");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });

  const openDialog = (z?: any) => {
    if (z) { setEditing(z); setForm({ name: z.name, description: z.description || "", is_active: z.is_active }); }
    else { setEditing(null); setForm({ name: "", description: "", is_active: true }); }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, description: form.description || null, is_active: form.is_active };
    const { error } = editing
      ? await (supabase as any).from("zones").update(payload).eq("id", editing.id)
      : await (supabase as any).from("zones").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created");
    setOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Zones ({zones.length})</h3>
        <Button size="compact" className={compactAddButtonClass} onClick={() => openDialog()}><Plus className="w-4 h-4 mr-1" />Add Zone</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
            zones.map(z => (
              <TableRow key={z.id}>
                <TableCell className="font-medium">{z.name}</TableCell>
                <TableCell>{z.description || "—"}</TableCell>
                <TableCell>{z.is_active ? "✓" : "✗"}</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="ghost" size="iconSm" className={compactIconButtonClass} onClick={() => openDialog(z)}><Edit2 className="w-4 h-4" /></Button><DeleteConfirmDialog title="Delete Zone" description={`Are you sure you want to delete zone "${z.name}"? This cannot be undone.`} onConfirm={() => remove(z.id)} buttonClassName={compactDeleteButtonClass} /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Zone</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={c => setForm({...form, is_active: c})} /><Label>Active</Label></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ ZONE COUNTRIES TAB ============
const ZoneCountriesTab = () => {
  const { items, loading, fetch, remove } = useCrud("zone_countries");
  const [zones, setZones] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ zone_id: "", country: "" });

  useEffect(() => { (supabase as any).from("zones").select("id, name").then(({ data }: any) => setZones(data || [])); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await (supabase as any).from("zone_countries").insert({ zone_id: form.zone_id, country: form.country });
    if (error) { toast.error(error.message); return; }
    toast.success("Added"); setOpen(false); fetch();
  };

  const getZoneName = (zid: string) => zones.find(z => z.id === zid)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Zone Countries ({items.length})</h3>
        <Button size="compact" className={compactAddButtonClass} onClick={() => { setForm({ zone_id: "", country: "" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Map Country</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Country</TableHead><TableHead>Zone</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
            items.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.country}</TableCell>
                <TableCell>{getZoneName(i.zone_id)}</TableCell>
                <TableCell><DeleteConfirmDialog title="Delete Country Mapping" description={`Are you sure you want to remove "${i.country}" from this zone?`} onConfirm={() => remove(i.id)} buttonClassName={compactDeleteButtonClass} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Map Country to Zone</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} required placeholder="e.g. United States" /></div>
            <div className="space-y-2"><Label>Zone</Label>
              <Select value={form.zone_id} onValueChange={v => setForm({...form, zone_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ WEIGHT PRICING TAB ============
const WeightPricingTab = () => {
  const { items, loading, fetch, remove } = useCrud("weight_pricing");
  const [zones, setZones] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ zone_id: "", min_weight: "", max_weight: "", price: "" });

  useEffect(() => { (supabase as any).from("zones").select("id, name").then(({ data }: any) => setZones(data || [])); }, []);
  const getZoneName = (zid: string) => zones.find(z => z.id === zid)?.name || "—";

  const openDialog = (i?: any) => {
    if (i) { setEditing(i); setForm({ zone_id: i.zone_id, min_weight: String(i.min_weight), max_weight: String(i.max_weight), price: String(i.price) }); }
    else { setEditing(null); setForm({ zone_id: "", min_weight: "", max_weight: "", price: "" }); }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { zone_id: form.zone_id, min_weight: parseFloat(form.min_weight), max_weight: parseFloat(form.max_weight), price: parseFloat(form.price) };
    const { error } = editing
      ? await (supabase as any).from("weight_pricing").update(payload).eq("id", editing.id)
      : await (supabase as any).from("weight_pricing").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Weight Pricing ({items.length})</h3>
        <Button size="compact" className={compactAddButtonClass} onClick={() => openDialog()}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Weight Range (KG)</TableHead><TableHead>Zone</TableHead><TableHead>Price (USD)</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
            items.map(i => (
              <TableRow key={i.id}>
                <TableCell>{i.min_weight}–{i.max_weight} KG</TableCell>
                <TableCell>{getZoneName(i.zone_id)}</TableCell>
                <TableCell>${Number(i.price).toLocaleString()}</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="ghost" size="iconSm" className={compactIconButtonClass} onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button><DeleteConfirmDialog title="Delete Weight Pricing" description="Are you sure you want to delete this weight pricing rule?" onConfirm={() => remove(i.id)} buttonClassName={compactDeleteButtonClass} /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Weight Pricing</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Zone</Label><Select value={form.zone_id} onValueChange={v => setForm({...form, zone_id: v})}><SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger><SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Min Weight (KG)</Label><Input type="number" step="0.1" value={form.min_weight} onChange={e => setForm({...form, min_weight: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Max Weight (KG)</Label><Input type="number" step="0.1" value={form.max_weight} onChange={e => setForm({...form, max_weight: e.target.value})} required /></div>
            </div>
            <div className="space-y-2"><Label>Price (USD)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ HEAVY WEIGHT PRICING TAB ============
const HeavyWeightPricingTab = () => {
  const { items, loading, fetch, remove } = useCrud("heavy_weight_pricing");
  const [zones, setZones] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ zone_id: "", min_weight: "", max_weight: "", price_per_kg: "" });

  useEffect(() => { (supabase as any).from("zones").select("id, name").then(({ data }: any) => setZones(data || [])); }, []);
  const getZoneName = (zid: string) => zones.find(z => z.id === zid)?.name || "—";

  const openDialog = (i?: any) => {
    if (i) { setEditing(i); setForm({ zone_id: i.zone_id, min_weight: String(i.min_weight), max_weight: String(i.max_weight), price_per_kg: String(i.price_per_kg) }); }
    else { setEditing(null); setForm({ zone_id: "", min_weight: "", max_weight: "", price_per_kg: "" }); }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { zone_id: form.zone_id, min_weight: parseFloat(form.min_weight), max_weight: parseFloat(form.max_weight), price_per_kg: parseFloat(form.price_per_kg) };
    const { error } = editing
      ? await (supabase as any).from("heavy_weight_pricing").update(payload).eq("id", editing.id)
      : await (supabase as any).from("heavy_weight_pricing").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Heavy Weight Pricing ({items.length})</h3>
        <Button size="compact" className={compactAddButtonClass} onClick={() => openDialog()}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Weight Range (KG)</TableHead><TableHead>Zone</TableHead><TableHead>Price/KG (USD)</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
            items.map(i => (
              <TableRow key={i.id}>
                <TableCell>{i.min_weight}–{i.max_weight} KG</TableCell>
                <TableCell>{getZoneName(i.zone_id)}</TableCell>
                <TableCell>${Number(i.price_per_kg).toLocaleString()}/KG</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="ghost" size="iconSm" className={compactIconButtonClass} onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button><DeleteConfirmDialog title="Delete Heavy Weight Pricing" description="Are you sure you want to delete this pricing rule?" onConfirm={() => remove(i.id)} buttonClassName={compactDeleteButtonClass} /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Heavy Weight Pricing</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Zone</Label><Select value={form.zone_id} onValueChange={v => setForm({...form, zone_id: v})}><SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger><SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Min Weight (KG)</Label><Input type="number" step="0.1" value={form.min_weight} onChange={e => setForm({...form, min_weight: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Max Weight (KG)</Label><Input type="number" step="0.1" value={form.max_weight} onChange={e => setForm({...form, max_weight: e.target.value})} required /></div>
            </div>
            <div className="space-y-2"><Label>Price per KG (USD)</Label><Input type="number" step="0.01" value={form.price_per_kg} onChange={e => setForm({...form, price_per_kg: e.target.value})} required /></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ EXTRA CHARGES TAB ============
const ExtraChargesTab = () => {
  const { items, loading, fetch, remove } = useCrud("extra_charges");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", price: "", is_active: true });

  const openDialog = (i?: any) => {
    if (i) { setEditing(i); setForm({ name: i.name, price: String(i.price), is_active: i.is_active }); }
    else { setEditing(null); setForm({ name: "", price: "", is_active: true }); }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, price: parseFloat(form.price), is_active: form.is_active };
    const { error } = editing
      ? await (supabase as any).from("extra_charges").update(payload).eq("id", editing.id)
      : await (supabase as any).from("extra_charges").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Extra Charges ({items.length})</h3>
        <Button size="compact" className={compactAddButtonClass} onClick={() => openDialog()}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price (USD)</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
            items.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>${Number(i.price).toLocaleString()}</TableCell>
                <TableCell>{i.is_active ? "✓" : "✗"}</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="ghost" size="iconSm" className={compactIconButtonClass} onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button><DeleteConfirmDialog title="Delete Extra Charge" description={`Are you sure you want to delete "${i.name}"?`} onConfirm={() => remove(i.id)} buttonClassName={compactDeleteButtonClass} /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Extra Charge</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="space-y-2"><Label>Price (USD)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={c => setForm({...form, is_active: c})} /><Label>Active</Label></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ TAXES TAB ============
const TaxesTab = () => {
  const { items, loading, fetch, remove } = useCrud("tax_settings");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", rate: "", is_active: true });

  const openDialog = (i?: any) => {
    if (i) { setEditing(i); setForm({ name: i.name, rate: String(i.rate), is_active: i.is_active }); }
    else { setEditing(null); setForm({ name: "", rate: "", is_active: true }); }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, rate: parseFloat(form.rate), is_active: form.is_active };
    const { error } = editing
      ? await (supabase as any).from("tax_settings").update(payload).eq("id", editing.id)
      : await (supabase as any).from("tax_settings").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Tax Settings ({items.length})</h3>
        <Button size="compact" className={compactAddButtonClass} onClick={() => openDialog()}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Rate (%)</TableHead><TableHead>Active</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
            items.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>{i.rate}%</TableCell>
                <TableCell>{i.is_active ? "✓" : "✗"}</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="ghost" size="iconSm" className={compactIconButtonClass} onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button><Button variant="ghost" size="iconSm" className={compactDeleteButtonClass} onClick={() => remove(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Tax</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="space-y-2"><Label>Rate (%)</Label><Input type="number" step="0.01" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} required /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={c => setForm({...form, is_active: c})} /><Label>Active</Label></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ PROCESSING FEES TAB ============
const ProcessingFeesTab = () => {
  const { items, loading, fetch, remove } = useCrud("processing_fees");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ min_value: "", max_value: "", fee_type: "percentage", fee_value: "" });

  const openDialog = (i?: any) => {
    if (i) { setEditing(i); setForm({ min_value: String(i.min_value), max_value: String(i.max_value), fee_type: i.fee_type, fee_value: String(i.fee_value) }); }
    else { setEditing(null); setForm({ min_value: "", max_value: "", fee_type: "percentage", fee_value: "" }); }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { min_value: parseFloat(form.min_value), max_value: parseFloat(form.max_value), fee_type: form.fee_type, fee_value: parseFloat(form.fee_value) };
    const { error } = editing
      ? await (supabase as any).from("processing_fees").update(payload).eq("id", editing.id)
      : await (supabase as any).from("processing_fees").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Processing Fees ({items.length})</h3>
        <Button size="compact" className={compactAddButtonClass} onClick={() => openDialog()}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Value Range ($)</TableHead><TableHead>Type</TableHead><TableHead>Fee</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
            items.map(i => (
              <TableRow key={i.id}>
                <TableCell>${Number(i.min_value).toLocaleString()}–${Number(i.max_value).toLocaleString()}</TableCell>
                <TableCell className="capitalize">{i.fee_type}</TableCell>
                <TableCell>{i.fee_type === "flat" ? `$${i.fee_value}` : `${i.fee_value}%`}</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="ghost" size="iconSm" className={compactIconButtonClass} onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button><Button variant="ghost" size="iconSm" className={compactDeleteButtonClass} onClick={() => remove(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Processing Fee</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Min Value ($)</Label><Input type="number" value={form.min_value} onChange={e => setForm({...form, min_value: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Max Value ($)</Label><Input type="number" value={form.max_value} onChange={e => setForm({...form, max_value: e.target.value})} required /></div>
            </div>
            <div className="space-y-2"><Label>Fee Type</Label>
              <Select value={form.fee_type} onValueChange={v => setForm({...form, fee_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="flat">Flat ($)</SelectItem><SelectItem value="percentage">Percentage (%)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Fee Value</Label><Input type="number" step="0.01" value={form.fee_value} onChange={e => setForm({...form, fee_value: e.target.value})} required /></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ MAIN PAGE ============
const AdminPricingEngine = () => {
  return (
    <AdminLayout title="Pricing Engine" description="Manage zones, weight pricing, extra charges, taxes, and processing fees.">
      <Card className="border-border/70 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="zones" className="space-y-6">
            <TabsList className="flex h-auto flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-muted/[0.18] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <TabsTrigger value="zones" className="gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:text-sm"><Globe className="hidden h-3.5 w-3.5 sm:block" />Zones</TabsTrigger>
              <TabsTrigger value="countries" className="gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:text-sm"><Globe className="hidden h-3.5 w-3.5 sm:block" />Countries</TabsTrigger>
              <TabsTrigger value="weight" className="gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:text-sm"><Weight className="hidden h-3.5 w-3.5 sm:block" />Weight</TabsTrigger>
              <TabsTrigger value="heavy" className="gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:text-sm"><TrendingUp className="hidden h-3.5 w-3.5 sm:block" />Heavy</TabsTrigger>
              <TabsTrigger value="extras" className="gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:text-sm"><Tag className="hidden h-3.5 w-3.5 sm:block" />Extras</TabsTrigger>
              <TabsTrigger value="taxes" className="gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:text-sm"><Percent className="hidden h-3.5 w-3.5 sm:block" />Taxes</TabsTrigger>
              <TabsTrigger value="fees" className="gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold data-[state=active]:shadow-[0_8px_18px_rgba(15,23,42,0.06)] sm:text-sm"><DollarSign className="hidden h-3.5 w-3.5 sm:block" />Fees</TabsTrigger>
            </TabsList>
            <TabsContent value="zones"><ZonesTab /></TabsContent>
            <TabsContent value="countries"><ZoneCountriesTab /></TabsContent>
            <TabsContent value="weight"><WeightPricingTab /></TabsContent>
            <TabsContent value="heavy"><HeavyWeightPricingTab /></TabsContent>
            <TabsContent value="extras"><ExtraChargesTab /></TabsContent>
            <TabsContent value="taxes"><TaxesTab /></TabsContent>
            <TabsContent value="fees"><ProcessingFeesTab /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminPricingEngine;
