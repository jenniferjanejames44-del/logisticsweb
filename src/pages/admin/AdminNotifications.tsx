import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Bell, Search, Trash2, ToggleLeft, ToggleRight, RefreshCw, Mail, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationSubscription {
  id: string;
  tracking_number: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminNotifications = () => {
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("shipment_notifications").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Failed to load notification subscriptions", variant: "destructive" });
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
    const channel = supabase.channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipment_notifications" }, () => fetchSubscriptions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleSubscription = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("shipment_notifications").update({ is_active: !currentStatus }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update subscription", variant: "destructive" });
    } else {
      setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, is_active: !currentStatus } : sub));
      toast({ title: "Success", description: `Subscription ${!currentStatus ? "activated" : "deactivated"}` });
    }
  };

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase.from("shipment_notifications").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete subscription", variant: "destructive" });
    } else {
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast({ title: "Deleted", description: "Subscription removed successfully" });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = subscriptions.filter(s => s.is_active).length;
  const uniqueEmails = new Set(subscriptions.map(s => s.email)).size;
  const uniqueShipments = new Set(subscriptions.map(s => s.tracking_number)).size;

  return (
    <AdminLayout title="Notification Management" description="Manage email subscriptions for shipment tracking notifications">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{subscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <ToggleRight className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Emails</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{uniqueEmails}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Tracked</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{uniqueShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/70 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
        <CardHeader className="border-b border-border/60 p-6 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />Email Subscriptions
            </CardTitle>
            <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/[0.18] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border-border/80 bg-white pl-10 shadow-[0_6px_16px_rgba(15,23,42,0.04)] sm:w-60" />
              </div>
              <Button variant="outline" size="iconSm" onClick={fetchSubscriptions} className="flex-shrink-0 rounded-[10px] border-border/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No subscriptions found</p>
              <p className="text-sm text-center">Email subscriptions will appear here when users sign up for tracking notifications.</p>
            </div>
          ) : isMobile ? (
            <div className="p-3 space-y-3">
              {filteredSubscriptions.map((sub) => (
                <div key={sub.id} className="space-y-3 rounded-xl border border-border/70 bg-white/95 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{sub.email}</span>
                    <Badge variant={sub.is_active ? "successOutline" : "outline"}>{sub.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-sm">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tracking Number</p>
                    <code className="rounded-lg border border-border/70 bg-muted/[0.18] px-2.5 py-1 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">{sub.tracking_number}</code>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{format(new Date(sub.created_at), "MMM d, yyyy")}</span>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="iconSm" className="rounded-[10px] border border-border/70 bg-white/90 shadow-[0_8px_18px_rgba(6,16,67,0.05)] hover:border-primary/20 hover:bg-muted/60" onClick={() => toggleSubscription(sub.id, sub.is_active)}>
                        {sub.is_active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="iconSm" className="rounded-[10px] border border-destructive/20 bg-destructive/[0.03] text-destructive shadow-[0_8px_18px_rgba(220,38,38,0.05)] hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure? {sub.email} will no longer receive updates for {sub.tracking_number}.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSubscription(sub.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Email</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id} className="border-border/50">
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell><code className="rounded-lg border border-border/70 bg-muted/[0.18] px-2.5 py-1 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">{sub.tracking_number}</code></TableCell>
                    <TableCell><Badge variant={sub.is_active ? "successOutline" : "outline"}>{sub.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(sub.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="iconSm" className="rounded-[10px] border border-border/70 bg-white/90 shadow-[0_8px_18px_rgba(6,16,67,0.05)] hover:border-primary/20 hover:bg-muted/60" onClick={() => toggleSubscription(sub.id, sub.is_active)}>
                          {sub.is_active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="iconSm" className="rounded-[10px] border border-destructive/20 bg-destructive/[0.03] text-destructive shadow-[0_8px_18px_rgba(220,38,38,0.05)] hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure? {sub.email} will no longer receive updates for {sub.tracking_number}.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteSubscription(sub.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminNotifications;
