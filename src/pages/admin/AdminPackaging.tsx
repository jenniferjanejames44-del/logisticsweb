import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Box, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PackagingMaterial {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

const AdminPackaging = () => {
  const [items, setItems] = useState<PackagingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PackagingMaterial | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "", is_active: true });
  const isMobile = useIsMobile();

  const fetchItems = async () => {
    const { data, error } = await (supabase as any).from("packaging_materials").select("*").order("name");
    if (error) { toast.error("Failed to load packaging materials"); console.error(error); }
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openDialog = (item?: PackagingMaterial) => {
    if (item) {
      setEditing(item);
      setFormData({ name: item.name, price: item.price.toString(), is_active: item.is_active });
    } else {
      setEditing(null);
      setFormData({ name: "", price: "", is_active: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: formData.name, price: parseFloat(formData.price), is_active: formData.is_active };
    try {
      if (editing) {
        const { error } = await (supabase as any).from("packaging_materials").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Packaging material updated");
      } else {
        const { error } = await (supabase as any).from("packaging_materials").insert(payload);
        if (error) throw error;
        toast.success("Packaging material created");
      }
      setIsDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    }
  };

  const toggleStatus = async (item: PackagingMaterial) => {
    const { error } = await (supabase as any).from("packaging_materials").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) toast.error("Failed to update status");
    else { toast.success(`${item.name} ${item.is_active ? "disabled" : "enabled"}`); fetchItems(); }
  };

  const deleteItem = async (item: PackagingMaterial) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const { error } = await (supabase as any).from("packaging_materials").delete().eq("id", item.id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchItems(); }
  };

  return (
    <AdminLayout title="Packaging Materials" description="Manage packaging options available to customers during shipment creation.">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Packaging Materials</h1>
            <p className="text-muted-foreground mt-1 text-sm">Set prices for boxes, bags, and other packaging</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="w-full max-w-[220px] sm:w-auto sm:max-w-none"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Packaging Material</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Small Box" />
                </div>
                <div className="space-y-2">
                  <Label>Price (₦)</Label>
                  <Input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                  <Label>Active</Label>
                </div>
                <Button type="submit" className="w-full">{editing ? "Update" : "Create"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Box className="w-4 h-4 sm:w-5 sm:h-5" />Materials ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading...</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Box className="w-12 h-12 mb-4 opacity-50" /><p className="font-medium">No packaging materials</p>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="border border-border/50 rounded-xl p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground text-sm">{item.name}</span>
                      <Badge variant={item.is_active ? "default" : "secondary"} className={item.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-foreground font-bold text-lg">₦{Number(item.price).toLocaleString()}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Switch checked={item.is_active} onCheckedChange={() => toggleStatus(item)} />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDialog(item)}><Edit2 className="w-3.5 h-3.5 mr-1" />Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => deleteItem(item)} className="text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-bold">₦{Number(item.price).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? "default" : "secondary"} className={item.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteItem(item)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            <Switch checked={item.is_active} onCheckedChange={() => toggleStatus(item)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPackaging;
