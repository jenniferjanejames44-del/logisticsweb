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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Route, Plus, Edit2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShippingRoute {
  id: string;
  origin_country: string;
  destination_country: string;
  price_per_kg: number;
  is_active: boolean;
  created_at: string;
}

const COUNTRIES = [
  "Nigeria", "United States", "United Kingdom", "China", "Germany",
  "France", "Japan", "Australia", "Canada", "United Arab Emirates",
  "Singapore", "India",
];

const AdminShippingRoutes = () => {
  const [routes, setRoutes] = useState<ShippingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ShippingRoute | null>(null);
  const [formData, setFormData] = useState({
    origin_country: "", destination_country: "", price_per_kg: "", is_active: true,
  });
  const isMobile = useIsMobile();

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("shipping_routes")
        .select("*")
        .order("origin_country", { ascending: true });
      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching shipping routes:", error);
      toast.error("Failed to load shipping routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleOpenDialog = (route?: ShippingRoute) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        origin_country: route.origin_country,
        destination_country: route.destination_country,
        price_per_kg: route.price_per_kg.toString(),
        is_active: route.is_active,
      });
    } else {
      setEditingRoute(null);
      setFormData({ origin_country: "", destination_country: "", price_per_kg: "", is_active: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.origin_country === formData.destination_country) {
      toast.error("Origin and destination must be different");
      return;
    }
    const routeData = {
      origin_country: formData.origin_country,
      destination_country: formData.destination_country,
      price_per_kg: parseFloat(formData.price_per_kg),
      is_active: formData.is_active,
    };
    try {
      if (editingRoute) {
        const { error } = await supabase.from("shipping_routes").update(routeData).eq("id", editingRoute.id);
        if (error) throw error;
        toast.success("Shipping route updated");
      } else {
        const { error } = await supabase.from("shipping_routes").insert(routeData);
        if (error) throw error;
        toast.success("Shipping route created");
      }
      setIsDialogOpen(false);
      fetchRoutes();
    } catch (error: any) {
      console.error("Error saving shipping route:", error);
      if (error.code === "23505") {
        toast.error("This route already exists");
      } else {
        toast.error("Failed to save shipping route");
      }
    }
  };

  const toggleRouteStatus = async (route: ShippingRoute) => {
    try {
      const { error } = await supabase.from("shipping_routes").update({ is_active: !route.is_active }).eq("id", route.id);
      if (error) throw error;
      toast.success(`Route ${route.is_active ? "deactivated" : "activated"}`);
      fetchRoutes();
    } catch (error) {
      console.error("Error toggling route status:", error);
      toast.error("Failed to update route status");
    }
  };

  return (
    <AdminLayout title="Shipping Routes" description="Manage per-KG shipping rates by route. Changes apply instantly to the pricing calculator.">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Route Pricing</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Set price per KG for each shipping route</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="w-full max-w-[220px] sm:w-auto sm:max-w-none">
                <Plus className="w-4 h-4 mr-2" />Add Route
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRoute ? "Edit Shipping Route" : "Create Shipping Route"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Origin Country</Label>
                  <Select value={formData.origin_country} onValueChange={(v) => setFormData({ ...formData, origin_country: v })}>
                    <SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination Country</Label>
                  <Select value={formData.destination_country} onValueChange={(v) => setFormData({ ...formData, destination_country: v })}>
                    <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price per KG ($)</Label>
                  <Input type="number" step="0.01" min="0" value={formData.price_per_kg} onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })} required />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                  <Label>Active</Label>
                </div>
                <Button type="submit" className="w-full">{editingRoute ? "Update Route" : "Create Route"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Route className="w-4 h-4 sm:w-5 sm:h-5" />Shipping Routes ({routes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading routes...</p>
            ) : routes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Route className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No shipping routes configured</p>
                <p className="text-sm mt-1">Add routes to enable route-based pricing</p>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {routes.map((route) => (
                  <div key={route.id} className="border border-border/50 rounded-xl p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                        <span>{route.origin_country}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{route.destination_country}</span>
                      </div>
                      <Badge variant={route.is_active ? "default" : "secondary"}
                        className={route.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {route.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Price per KG</p>
                      <p className="text-foreground font-bold text-lg">${Number(route.price_per_kg).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Switch checked={route.is_active} onCheckedChange={() => toggleRouteStatus(route)} />
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(route)}>
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
                      <TableHead>Route</TableHead>
                      <TableHead>Price per KG</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell>
                          <span className="font-medium">{route.origin_country}</span>
                          <ArrowRight className="w-3.5 h-3.5 inline mx-2 text-muted-foreground" />
                          <span className="font-medium">{route.destination_country}</span>
                        </TableCell>
                        <TableCell className="font-bold">${Number(route.price_per_kg).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={route.is_active ? "default" : "secondary"}
                            className={route.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                            {route.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(route)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Switch checked={route.is_active} onCheckedChange={() => toggleRouteStatus(route)} />
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

export default AdminShippingRoutes;
