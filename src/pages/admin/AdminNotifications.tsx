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
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
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
      <Card className="border-border/50">
        <CardHeader className="border-b border-border/50 pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />Email Subscriptions
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full sm:w-56" />
              </div>
              <Button variant="outline" size="icon" onClick={fetchSubscriptions} className="flex-shrink-0">
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
                <div key={sub.id} className="border border-border/50 rounded-xl p-4 space-y-3 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{sub.email}</span>
                    <Badge variant={sub.is_active ? "default" : "secondary"}>{sub.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-sm">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tracking Number</p>
                    <code className="px-2 py-1 bg-muted rounded text-xs">{sub.tracking_number}</code>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{format(new Date(sub.created_at), "MMM d, yyyy")}</span>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSubscription(sub.id, sub.is_active)}>
                        {sub.is_active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
                    <TableCell><code className="px-2 py-1 bg-muted rounded text-sm">{sub.tracking_number}</code></TableCell>
                    <TableCell><Badge variant={sub.is_active ? "default" : "secondary"}>{sub.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(sub.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleSubscription(sub.id, sub.is_active)}>
                          {sub.is_active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
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
