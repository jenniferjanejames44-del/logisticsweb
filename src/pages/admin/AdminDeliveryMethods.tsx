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
import { Truck, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeliveryMethod {
  id: string;
  name: string;
  description: string | null;
  fee: number;
  is_active: boolean;
}

const AdminDeliveryMethods = () => {
  const [items, setItems] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryMethod | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", fee: "", is_active: true });
  const isMobile = useIsMobile();

  const fetchItems = async () => {
    const { data, error } = await (supabase as any).from("delivery_methods").select("*").order("name");
    if (error) { toast.error("Failed to load delivery methods"); console.error(error); }
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openDialog = (item?: DeliveryMethod) => {
    if (item) {
      setEditing(item);
      setFormData({ name: item.name, description: item.description || "", fee: item.fee.toString(), is_active: item.is_active });
    } else {
      setEditing(null);
      setFormData({ name: "", description: "", fee: "", is_active: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: formData.name, description: formData.description || null, fee: parseFloat(formData.fee), is_active: formData.is_active };
    try {
      if (editing) {
        const { error } = await (supabase as any).from("delivery_methods").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Delivery method updated");
      } else {
        const { error } = await (supabase as any).from("delivery_methods").insert(payload);
        if (error) throw error;
        toast.success("Delivery method created");
      }
      setIsDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    }
  };

  const toggleStatus = async (item: DeliveryMethod) => {
    const { error } = await (supabase as any).from("delivery_methods").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) toast.error("Failed to update");
    else { toast.success(`${item.name} ${item.is_active ? "disabled" : "enabled"}`); fetchItems(); }
  };

  return (
    <AdminLayout title="Delivery Methods" description="Configure delivery options and fees for shipments.">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Delivery Methods</h1>
            <p className="text-muted-foreground mt-1 text-sm">Set fees for pickup and delivery options</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Add Method</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Delivery Method</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Doorstep Delivery" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                </div>
                <div className="space-y-2">
                  <Label>Fee (₦)</Label>
                  <Input type="number" min="0" step="0.01" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} required />
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
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Truck className="w-4 h-4 sm:w-5 sm:h-5" />Methods ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading...</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Truck className="w-12 h-12 mb-4 opacity-50" /><p className="font-medium">No delivery methods</p>
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
                    {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    <p className="text-foreground font-bold text-lg">₦{Number(item.fee).toLocaleString()}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Switch checked={item.is_active} onCheckedChange={() => toggleStatus(item)} />
                      <Button variant="outline" size="sm" onClick={() => openDialog(item)}><Edit2 className="w-3.5 h-3.5 mr-1" />Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Fee</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.description || "—"}</TableCell>
                        <TableCell className="font-bold">₦{Number(item.fee).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? "default" : "secondary"} className={item.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit2 className="w-4 h-4" /></Button>
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

export default AdminDeliveryMethods;
