import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Warehouse, Search } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";

const SHIPPING_METHODS = [
  { value: "any", label: "All methods" },
  { value: "sea", label: "Sea Freight" },
  { value: "air", label: "Air Freight" },
];

const methodLabel = (v?: string | null) =>
  SHIPPING_METHODS.find((m) => m.value === (v || "any"))?.label || "All methods";

const emptyForm = {
  country: "",
  country_code: "",
  name: "",
  company: "",
  care_of: "",
  recipient: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  phone: "",
  shipping_method: "any",
  is_active: true,
};

const AdminWarehouses = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const fetch_ = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("warehouses").select("*").order("country");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const countries = useMemo(
    () => Array.from(new Set(items.map((i) => i.country))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (countryFilter !== "all" && i.country !== countryFilter) return false;
      if (methodFilter !== "all" && (i.shipping_method || "any") !== methodFilter) return false;
      if (!q) return true;
      return [i.name, i.country, i.company, i.care_of, i.recipient, i.address, i.city, i.state, i.zip_code, i.phone]
        .filter(Boolean)
        .some((v: string) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, countryFilter, methodFilter]);

  const openDialog = (i?: any) => {
    if (i) {
      setEditing(i);
      setForm({
        country: i.country || "",
        country_code: i.country_code || "",
        name: i.name || "",
        company: i.company || "",
        care_of: i.care_of || "",
        recipient: i.recipient || "",
        address: i.address || "",
        city: i.city || "",
        state: i.state || "",
        zip_code: i.zip_code || "",
        phone: i.phone || "",
        shipping_method: i.shipping_method || "any",
        is_active: i.is_active,
      });
    } else {
      setEditing(null);
      setForm({ ...emptyForm });
    }
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      country: form.country,
      country_code: form.country_code.trim().toLowerCase() || null,
      name: form.name,
      company: form.company || null,
      care_of: form.care_of || null,
      recipient: form.recipient || null,
      address: form.address,
      city: form.city || null,
      state: form.state || null,
      zip_code: form.zip_code || null,
      phone: form.phone || null,
      shipping_method: form.shipping_method || "any",
      is_active: form.is_active,
    };
    const { error } = editing
      ? await (supabase as any).from("warehouses").update(payload).eq("id", editing.id)
      : await (supabase as any).from("warehouses").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Updated" : "Created"); setOpen(false); fetch_();
  };

  const toggleActive = async (i: any) => {
    const { error } = await (supabase as any).from("warehouses").update({ is_active: !i.is_active }).eq("id", i.id);
    if (error) { toast.error(error.message); return; }
    toast.success(i.is_active ? "Warehouse disabled" : "Warehouse enabled");
    fetch_();
  };

  const removeWarehouse = async (id: string) => {
    const { error } = await (supabase as any).from("warehouses").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Deleted"); fetch_();
  };

  return (
    <AdminLayout title="Warehouses" description="Manage warehouse locations for shipments.">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative sm:max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search warehouses..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="sm:w-44"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="sm:w-44"><SelectValue placeholder="Shipping method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All shipping methods</SelectItem>
                {SHIPPING_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Add Warehouse</Button>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Warehouse className="w-5 h-5" />Warehouses ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Country</TableHead><TableHead>Method</TableHead><TableHead>Company / C-O</TableHead><TableHead>Address</TableHead><TableHead>Recipient</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Loading...</TableCell></TableRow> :
                  filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No warehouses found</TableCell></TableRow> :
                  filtered.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell>{i.country}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[11px]">{methodLabel(i.shipping_method)}</Badge></TableCell>
                      <TableCell className="text-sm">{[i.company, i.care_of && `C/O ${i.care_of}`].filter(Boolean).join(" · ") || "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate" title={i.address}>{[i.address, i.city, i.state, i.zip_code].filter(Boolean).join(", ")}</TableCell>
                      <TableCell className="text-sm">{i.recipient || "—"}</TableCell>
                      <TableCell>{i.phone || "—"}</TableCell>
                      <TableCell>
                        <button type="button" onClick={() => toggleActive(i)} className="inline-flex items-center gap-2">
                          <Switch checked={i.is_active} />
                          <span className="text-xs text-muted-foreground">{i.is_active ? "Active" : "Disabled"}</span>
                        </button>
                      </TableCell>
                      <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button><DeleteConfirmDialog title="Delete Warehouse" description={`Are you sure you want to delete "${i.name}"? This cannot be undone.`} onConfirm={() => removeWarehouse(i.id)} trigger={<Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>} /></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {loading ? <p className="text-center text-sm text-muted-foreground py-6">Loading...</p> :
              filtered.length === 0 ? <p className="text-center text-sm text-muted-foreground py-6">No warehouses found</p> :
              filtered.map(i => (
                <div key={i.id} className="rounded-lg border border-border/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.country}</p>
                    </div>
                    <Badge variant="secondary" className="text-[11px]">{methodLabel(i.shipping_method)}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{[i.company, i.care_of && `C/O ${i.care_of}`].filter(Boolean).join(" · ")}</p>
                  <p className="mt-1 text-xs text-foreground">{[i.address, i.city, i.state, i.zip_code].filter(Boolean).join(", ")}</p>
                  {i.recipient && <p className="mt-1 text-xs text-muted-foreground">Recipient: {i.recipient}</p>}
                  {i.phone && <p className="mt-1 text-xs text-muted-foreground">{i.phone}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <button type="button" onClick={() => toggleActive(i)} className="inline-flex items-center gap-2">
                      <Switch checked={i.is_active} />
                      <span className="text-xs text-muted-foreground">{i.is_active ? "Active" : "Disabled"}</span>
                    </button>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(i)}><Edit2 className="w-4 h-4" /></Button>
                      <DeleteConfirmDialog title="Delete Warehouse" description={`Are you sure you want to delete "${i.name}"? This cannot be undone.`} onConfirm={() => removeWarehouse(i.id)} trigger={<Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Warehouse</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Warehouse Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Country Code (us, cn, ca)</Label><Input value={form.country_code} onChange={e => setForm({...form, country_code: e.target.value})} maxLength={2} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
              <div className="space-y-2"><Label>C/O</Label><Input value={form.care_of} onChange={e => setForm({...form, care_of: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div className="space-y-2"><Label>State / Province</Label><Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Postal Code</Label><Input value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Recipient</Label><Input value={form.recipient} onChange={e => setForm({...form, recipient: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Shipping Method</Label>
              <Select value={form.shipping_method} onValueChange={v => setForm({...form, shipping_method: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SHIPPING_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={c => setForm({...form, is_active: c})} /><Label>Active</Label></div>
            <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWarehouses;
