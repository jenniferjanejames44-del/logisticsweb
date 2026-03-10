import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  price_per_kg: number;
  base_price: number;
  service_type: string;
  is_active: boolean;
  created_at: string;
}

const AdminPricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price_per_kg: "", base_price: "", service_type: "", is_active: true });
  const isMobile = useIsMobile();

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase.from("pricing_plans").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      toast.error("Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleOpenDialog = (plan?: PricingPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ name: plan.name, description: plan.description || "", price_per_kg: plan.price_per_kg.toString(), base_price: plan.base_price.toString(), service_type: plan.service_type, is_active: plan.is_active });
    } else {
      setEditingPlan(null);
      setFormData({ name: "", description: "", price_per_kg: "", base_price: "", service_type: "", is_active: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const planData = { name: formData.name, description: formData.description || null, price_per_kg: parseFloat(formData.price_per_kg), base_price: parseFloat(formData.base_price), service_type: formData.service_type, is_active: formData.is_active };
    try {
      if (editingPlan) {
        const { error } = await supabase.from("pricing_plans").update(planData).eq("id", editingPlan.id);
        if (error) throw error;
        toast.success("Pricing plan updated");
      } else {
        const { error } = await supabase.from("pricing_plans").insert(planData);
        if (error) throw error;
        toast.success("Pricing plan created");
      }
      setIsDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error("Error saving pricing plan:", error);
      toast.error("Failed to save pricing plan");
    }
  };

  const togglePlanStatus = async (plan: PricingPlan) => {
    try {
      const { error } = await supabase.from("pricing_plans").update({ is_active: !plan.is_active }).eq("id", plan.id);
      if (error) throw error;
      toast.success(`Plan ${plan.is_active ? "deactivated" : "activated"}`);
      fetchPlans();
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error("Failed to update plan status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Pricing Controls</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage service pricing and rate configurations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="w-full max-w-[220px] sm:w-auto sm:max-w-none">
                <Plus className="w-4 h-4 mr-2" />Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPlan ? "Edit Pricing Plan" : "Create Pricing Plan"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Base Price ($)</Label>
                    <Input id="base_price" type="number" step="0.01" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_per_kg">Price per KG ($)</Label>
                    <Input id="price_per_kg" type="number" step="0.01" value={formData.price_per_kg} onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Input id="service_type" value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} placeholder="e.g., air, ocean, road" required />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit" className="w-full">{editingPlan ? "Update Plan" : "Create Plan"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />Pricing Plans ({plans.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading pricing plans...</p>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Settings className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No pricing plans found</p>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="border border-border/50 rounded-xl p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{plan.name}</span>
                      <Badge variant={plan.is_active ? "default" : "secondary"}
                        className={plan.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Base Price</p>
                        <p className="text-foreground font-medium">₦{Number(plan.base_price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Per KG</p>
                        <p className="text-foreground font-medium">₦{Number(plan.price_per_kg).toFixed(2)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Service Type</p>
                        <p className="text-foreground capitalize">{plan.service_type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Switch checked={plan.is_active} onCheckedChange={() => togglePlanStatus(plan)} />
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(plan)}>
                        <Edit2 className="w-3.5 h-3.5 mr-1" />Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Price/KG</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.description || "N/A"}</TableCell>
                        <TableCell>₦{Number(plan.base_price).toFixed(2)}</TableCell>
                        <TableCell>₦{Number(plan.price_per_kg).toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{plan.service_type.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? "default" : "secondary"}
                            className={plan.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(plan)}><Edit2 className="w-4 h-4" /></Button>
                            <Switch checked={plan.is_active} onCheckedChange={() => togglePlanStatus(plan)} />
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

export default AdminPricing;
