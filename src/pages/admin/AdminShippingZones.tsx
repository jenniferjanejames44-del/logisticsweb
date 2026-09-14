import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe2, Plus, Search, Trash2, ChevronDown, ChevronRight, Edit2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { listZoneCountries, listZones, type ShippingZone, type ZoneCountry } from "@/lib/shippingZones";

const AdminShippingZones = () => {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [countries, setCountries] = useState<ZoneCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [zoneDialog, setZoneDialog] = useState<ShippingZone | null>(null);
  const [zoneForm, setZoneForm] = useState({ zone_number: "", name: "", description: "" });

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", iso_code: "", zone_id: "" });

  const load = async () => {
    try {
      const [z, c] = await Promise.all([listZones(), listZoneCountries()]);
      setZones(z);
      setCountries(c);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load shipping zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const byZone = useMemo(() => {
    const q = search.trim().toLowerCase();
    const map: Record<string, ZoneCountry[]> = {};
    countries.forEach((c) => {
      if (!c.zone_id) return;
      if (q && !c.name.toLowerCase().includes(q) && !c.iso_code.toLowerCase().includes(q)) return;
      (map[c.zone_id] ||= []).push(c);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [countries, search]);

  const totalFor = (zoneId: string) => countries.filter((c) => c.zone_id === zoneId).length;

  const openZoneDialog = (zone: ShippingZone) => {
    setZoneForm({
      zone_number: String(zone.zone_number),
      name: zone.name,
      description: zone.description ?? "",
    });
    setZoneDialog(zone);
  };

  const saveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneDialog) return;
    const { error } = await supabase
      .from("shipping_zones")
      .update({
        zone_number: parseInt(zoneForm.zone_number, 10),
        name: zoneForm.name.trim(),
        description: zoneForm.description.trim() || null,
      })
      .eq("id", zoneDialog.id);
    if (error) { toast.error("Could not save this zone"); return; }
    toast.success("Zone updated");
    setZoneDialog(null);
    load();
  };

  const toggleZone = async (zone: ShippingZone) => {
    const { error } = await supabase
      .from("shipping_zones").update({ is_active: !zone.is_active }).eq("id", zone.id);
    if (error) { toast.error("Could not change zone status"); return; }
    toast.success(`${zone.name} ${zone.is_active ? "disabled" : "enabled"}`);
    load();
  };

  const toggleCountry = async (c: ZoneCountry) => {
    const { error } = await supabase
      .from("countries").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) { toast.error("Could not change country status"); return; }
    load();
  };

  const moveCountry = async (c: ZoneCountry, zoneId: string) => {
    if (zoneId === c.zone_id) return;
    const { error } = await supabase
      .from("shipping_zone_countries").update({ zone_id: zoneId }).eq("country_id", c.id);
    if (error) { toast.error("Could not move this country"); return; }
    toast.success(`${c.name} moved`);
    load();
  };

  const removeCountry = async (c: ZoneCountry) => {
    const { error } = await supabase
      .from("shipping_zone_countries").delete().eq("country_id", c.id);
    if (error) { toast.error("Could not remove this country"); return; }
    toast.success(`${c.name} removed from its zone`);
    load();
  };

  const addCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    const iso = addForm.iso_code.trim().toUpperCase();
    const name = addForm.name.trim();
    if (!iso || !name || !addForm.zone_id) { toast.error("Fill in every field"); return; }

    const existing = countries.find((c) => c.iso_code.toUpperCase() === iso);
    if (existing?.zone_id) {
      const z = zones.find((z) => z.id === existing.zone_id);
      toast.error(`${existing.name} (${iso}) already belongs to ${z?.name ?? "another zone"}`);
      return;
    }

    let countryId = existing?.id;
    if (!countryId) {
      const { data, error } = await supabase
        .from("countries").insert({ name, iso_code: iso }).select("id").single();
      if (error) { toast.error("Could not add this country"); return; }
      countryId = data.id;
    }

    const { error: linkErr } = await supabase
      .from("shipping_zone_countries").insert({ zone_id: addForm.zone_id, country_id: countryId });
    if (linkErr) { toast.error("This country is already assigned to a zone"); return; }

    toast.success(`${name} added`);
    setAddOpen(false);
    setAddForm({ name: "", iso_code: "", zone_id: "" });
    load();
  };

  return (
    <AdminLayout title="Shipping Zones" description="Group countries into Zone 1–8. Pricing rules reference these zones.">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Shipping Zones</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {zones.length} zones · {countries.length} countries assigned
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search country or code"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Country
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12 text-sm">Loading zones...</p>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => {
              const list = byZone[zone.id] || [];
              const isOpen = expanded[zone.id] ?? Boolean(search.trim() && list.length);
              return (
                <Card key={zone.id} className="border-border/50 overflow-hidden">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                        onClick={() => setExpanded((p) => ({ ...p, [zone.id]: !isOpen }))}
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {zone.zone_number}
                        </span>
                        <CardTitle className="text-base truncate">{zone.name}</CardTitle>
                        <Badge variant="secondary" className="shrink-0">{totalFor(zone.id)} countries</Badge>
                        <Badge className={zone.is_active ? "bg-success/10 text-success shrink-0" : "bg-muted text-muted-foreground shrink-0"}>
                          {zone.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openZoneDialog(zone)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Switch checked={zone.is_active} onCheckedChange={() => toggleZone(zone)} />
                      </div>
                    </div>
                  </CardHeader>
                  {isOpen && (
                    <CardContent className="pt-0">
                      {list.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">No countries in this zone.</p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {list.map((c) => (
                            <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{c.name}</p>
                                <p className="text-[11px] text-muted-foreground">{c.iso_code}</p>
                              </div>
                              <Select value={c.zone_id ?? ""} onValueChange={(v) => moveCountry(c, v)}>
                                <SelectTrigger className="h-8 w-[104px] text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {zones.map((z) => (
                                    <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Switch checked={c.is_active} onCheckedChange={() => toggleCountry(c)} />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCountry(c)}>
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit zone */}
      <Dialog open={!!zoneDialog} onOpenChange={(o) => !o && setZoneDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Zone</DialogTitle></DialogHeader>
          <form onSubmit={saveZone} className="space-y-4">
            <div className="space-y-2">
              <Label>Zone Number</Label>
              <Input type="number" min="1" value={zoneForm.zone_number}
                onChange={(e) => setZoneForm({ ...zoneForm, zone_number: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Zone Name</Label>
              <Input value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={zoneForm.description} onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Save Zone</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add country */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Country to a Zone</DialogTitle></DialogHeader>
          <form onSubmit={addCountry} className="space-y-4">
            <div className="space-y-2">
              <Label>Country Name</Label>
              <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Country Code (ISO)</Label>
              <Input maxLength={3} value={addForm.iso_code}
                onChange={(e) => setAddForm({ ...addForm, iso_code: e.target.value.toUpperCase() })} required />
            </div>
            <div className="space-y-2">
              <Label>Zone</Label>
              <Select value={addForm.zone_id} onValueChange={(v) => setAddForm({ ...addForm, zone_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (<SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              <Globe2 className="w-4 h-4 mr-2" />Add Country
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminShippingZones;
