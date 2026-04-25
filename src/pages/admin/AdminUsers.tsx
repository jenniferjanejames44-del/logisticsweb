import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Search, UserCog, Trash2, Eye, Monitor, Smartphone, Tablet, Clock, MapPin, Mail, UserPlus, Loader2, KeyRound, Wallet, Phone, Home } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AddFundsDialog from "@/components/wallet/AddFundsDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  created_at: string;
  role: string;
  balance?: number;
}

interface LoginHistory {
  id: string;
  device_type: string | null;
  browser: string | null;
  location: string | null;
  logged_in_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserHistory, setSelectedUserHistory] = useState<LoginHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordUserName, setResetPasswordUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [addFundsUserId, setAddFundsUserId] = useState("");
  const [addFundsUserName, setAddFundsUserName] = useState("");
  const isMobile = useIsMobile();
  const [viewProfileUser, setViewProfileUser] = useState<UserWithRole | null>(null);
  const [profileExtras, setProfileExtras] = useState<{ shipments: number; payments: number; paidAmount: number } | null>(null);

  useEffect(() => {
    if (!viewProfileUser) {
      setProfileExtras(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [{ data: ships }, { data: pays }] = await Promise.all([
          supabase.from("shipments").select("id").eq("user_id", viewProfileUser.user_id),
          supabase.from("payments").select("amount, status").eq("user_id", viewProfileUser.user_id),
        ]);
        if (cancelled) return;
        const paidAmount = (pays || [])
          .filter((p: any) => p.status === "completed" || p.status === "success" || p.status === "paid")
          .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
        setProfileExtras({
          shipments: (ships || []).length,
          payments: (pays || []).length,
          paidAmount,
        });
      } catch (e) {
        if (!cancelled) setProfileExtras({ shipments: 0, payments: 0, paidAmount: 0 });
      }
    })();
    return () => { cancelled = true; };
  }, [viewProfileUser]);

  const fetchUsers = async () => {
    try {
      const [{ data: profiles, error: pe }, { data: roles, error: re }, { data: transactions, error: te }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("wallet_transactions").select("user_id, amount, type"),
      ]);
      if (pe) throw pe; if (re) throw re; if (te) throw te;

      const balanceMap: Record<string, number> = {};
      (transactions || []).forEach(t => {
        if (!balanceMap[t.user_id]) balanceMap[t.user_id] = 0;
        balanceMap[t.user_id] += t.type === "credit" ? Number(t.amount) : -Number(t.amount);
      });

      setUsers((profiles || []).map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role || "customer",
        balance: balanceMap[p.user_id] || 0,
      })));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase.from("login_history").select("*").eq("user_id", userId).order("logged_in_at", { ascending: false }).limit(10);
      if (error) throw error;
      setSelectedUserHistory(data || []);
    } catch (error) {
      console.error("Error fetching login history:", error);
      toast.error("Failed to load login history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: "admin" | "customer") => {
    try {
      const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", userId).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert([{ user_id: userId, role: newRole }]);
        if (error) throw error;
      }
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete user");
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) { toast.error("Email and password are required"); return; }
    if (newAdminPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setCreatingAdmin(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword, fullName: newAdminName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create admin");
      toast.success("New admin created successfully!");
      setAddAdminOpen(false); setNewAdminEmail(""); setNewAdminPassword(""); setNewAdminName("");
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !newPassword) { toast.error("New password is required"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setResettingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: resetPasswordUserId, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to reset password");
      toast.success("Password reset successfully!");
      setResetPasswordOpen(false); setResetPasswordUserId(null); setResetPasswordUserName(""); setNewPassword(""); setConfirmPassword("");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const openResetPasswordDialog = (userId: string, userName: string) => {
    setResetPasswordUserId(userId); setResetPasswordUserName(userName); setNewPassword(""); setConfirmPassword(""); setResetPasswordOpen(true);
  };

  const openAddFundsDialog = (userId: string, userName: string) => {
    setAddFundsUserId(userId); setAddFundsUserName(userName); setAddFundsOpen(true);
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "tablet": return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="User Management" description="Manage customer accounts, permissions, and view activity">
      <div className="space-y-5">
        <Card className="border-border/60 bg-white shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-border/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCog className="w-4 h-4 text-primary" />
                All Users ({filteredUsers.length})
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative sm:w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="h-9 rounded-lg border-border/80 bg-muted/30 pl-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-9 rounded-lg px-4 text-sm"><UserPlus className="w-4 h-4 mr-1.5" />Add Admin</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-xl border border-border/60 bg-white p-0">
                    <DialogHeader className="border-b border-border/40 px-5 py-4">
                      <DialogTitle className="text-foreground text-base">Add New Admin</DialogTitle>
                      <DialogDescription className="text-sm">Create a new admin account with full dashboard access.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-5 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="admin-name" className="text-sm">Full Name</Label>
                        <Input id="admin-name" placeholder="Enter full name" className="h-10 rounded-lg border-border/80 bg-white text-sm" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="admin-email" className="text-sm">Email *</Label>
                        <Input id="admin-email" type="email" placeholder="Enter email address" className="h-10 rounded-lg border-border/80 bg-white text-sm" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="admin-password" className="text-sm">Password *</Label>
                        <Input id="admin-password" type="password" placeholder="Min 6 characters" className="h-10 rounded-lg border-border/80 bg-white text-sm" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter className="border-t border-border/40 px-5 py-4">
                      <Button variant="outline" onClick={() => setAddAdminOpen(false)} className="h-10 w-full rounded-lg sm:w-auto text-sm">Cancel</Button>
                      <Button onClick={handleCreateAdmin} disabled={creatingAdmin} className="h-10 w-full rounded-lg sm:w-auto text-sm">
                        {creatingAdmin ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><UserPlus className="w-4 h-4 mr-2" />Create Admin</>}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <UserCog className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No users found</p>
              </div>
            ) : isMobile ? (
              /* Mobile Card View */
              <div className="divide-y divide-border/40">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{user.full_name || "Not provided"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email || "Not provided"}</p>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </div>
                     <div className="grid grid-cols-2 gap-2 text-sm">
                       <div>
                         <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Phone</p>
                         <p className="text-foreground truncate">{user.phone || "Not provided"}</p>
                       </div>
                       <div>
                         <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Location</p>
                         <p className="text-foreground truncate">{user.city && user.country ? `${user.city}, ${user.country}` : "Not provided"}</p>
                       </div>
                       <div>
                         <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Address</p>
                         <p className="text-foreground truncate">{user.address || "Not provided"}</p>
                       </div>
                       <div>
                         <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Balance</p>
                         <p className="text-foreground font-medium">${(user.balance || 0).toFixed(2)}</p>
                       </div>
                       <div>
                         <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Joined</p>
                         <p className="text-foreground">{format(new Date(user.created_at), "MMM dd, yyyy")}</p>
                       </div>
                     </div>
                    <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
                      <Select value={user.role} onValueChange={(v: "admin" | "customer") => handleRoleChange(user.user_id, v)}>
                        <SelectTrigger className="h-10 w-28 rounded-lg border-border bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" onClick={() => openAddFundsDialog(user.user_id, user.full_name || user.email || "User")} title="Add Funds">
                        <Wallet className="w-4 h-4 text-success" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" onClick={() => openResetPasswordDialog(user.user_id, user.full_name || user.email || "User")} title="Reset Password">
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" onClick={() => fetchLoginHistory(user.user_id)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-xl border border-border/70 bg-background p-0">
                          <DialogHeader className="px-6 pt-6">
                            <DialogTitle className="text-base">Login Activity - {user.full_name || user.email}</DialogTitle>
                            <DialogDescription>Recent login history</DialogDescription>
                          </DialogHeader>
                          <div className="max-h-[400px] space-y-3 overflow-y-auto px-6 pb-6">
                            {historyLoading ? (
                              <p className="text-center text-muted-foreground py-4 text-sm">Loading...</p>
                            ) : selectedUserHistory.length === 0 ? (
                              <p className="text-center text-muted-foreground py-4 text-sm">No login history found</p>
                            ) : (
                              selectedUserHistory.map((h) => (
                                <div key={h.id} className="flex items-start gap-3 rounded-xl border border-border/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                                  <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">{getDeviceIcon(h.device_type)}</div>
                                  <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-sm">{h.device_type || "Unknown"}</span>
                                      <Badge variant="outline" className="text-xs">{h.browser || "Unknown"}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{h.location || "Unknown"}</span>
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(h.logged_in_at), "MMM dd, yyyy hh:mm a")}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="ml-auto h-10 w-10 rounded-lg" disabled={deletingUserId === user.user_id}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete {user.full_name || user.email}? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="-mx-6 overflow-x-auto px-6">
                <div className="min-w-[980px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "Not provided"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{user.email || "Not provided"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{user.phone || "Not provided"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.city && user.country ? `${user.city}, ${user.country}` : "Not provided"}</TableCell>
                        <TableCell><Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${(user.balance || 0).toFixed(2)}</span>
                            <Button variant="ghost" size="iconSm" className="rounded-[10px] border border-success/20 bg-success/[0.05] text-success shadow-[0_8px_18px_rgba(34,197,94,0.06)] hover:border-success/30 hover:bg-success/10 hover:text-success" onClick={() => openAddFundsDialog(user.user_id, user.full_name || user.email || "User")} title="Add Funds">
                              <Wallet className="w-4 h-4 text-success" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{format(new Date(user.created_at), "MMM dd, yyyy")}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(user.created_at), "hh:mm a")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="compact" className="rounded-[10px] border-border px-4" onClick={() => setViewProfileUser(user)}>
                            <Eye className="w-4 h-4 mr-1" />Details
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="compact" className="rounded-[10px] border-border px-4" onClick={() => fetchLoginHistory(user.user_id)}>
                                <Eye className="w-4 h-4 mr-1" />View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg rounded-xl border border-border/70 bg-background p-0">
                              <DialogHeader className="px-6 pt-6">
                                <DialogTitle>Login Activity - {user.full_name || user.email}</DialogTitle>
                                <DialogDescription>Recent login history and device information</DialogDescription>
                              </DialogHeader>
                              <div className="max-h-[400px] space-y-4 overflow-y-auto px-6 pb-6">
                                {historyLoading ? (
                                  <p className="text-center text-muted-foreground py-4">Loading...</p>
                                ) : selectedUserHistory.length === 0 ? (
                                  <p className="text-center text-muted-foreground py-4">No login history found</p>
                                ) : (
                                  selectedUserHistory.map((h) => (
                                    <div key={h.id} className="flex items-start gap-4 rounded-xl border border-border/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                                      <div className="rounded-lg bg-primary/10 p-2">{getDeviceIcon(h.device_type)}</div>
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{h.device_type || "Unknown Device"}</span>
                                          <Badge variant="outline" className="text-xs">{h.browser || "Unknown Browser"}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{h.location || "Unknown location"}</span>
                                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(h.logged_in_at), "MMM dd, yyyy hh:mm a")}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select value={user.role} onValueChange={(v: "admin" | "customer") => handleRoleChange(user.user_id, v)}>
                              <SelectTrigger className="h-10 w-28 rounded-lg border-border bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="iconSm" className="rounded-[10px] border-border" onClick={() => openResetPasswordDialog(user.user_id, user.full_name || user.email || "User")} title="Reset Password">
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="iconSm" className="rounded-[10px] border border-destructive/20 bg-destructive/[0.03] text-destructive shadow-[0_8px_18px_rgba(220,38,38,0.05)] hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive" disabled={deletingUserId === user.user_id} title="Delete User">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.full_name || user.email}? This action cannot be undone and will remove all their data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border border-border/70 bg-background p-0">
            <DialogHeader className="border-b border-border/60 px-6 py-6 pr-16">
              <DialogTitle className="text-foreground">Reset Password</DialogTitle>
              <DialogDescription>Set a new password for {resetPasswordUserName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password *</Label>
                <Input id="new-password" type="password" className="h-11 rounded-xl border-border/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <Input id="confirm-password" type="password" className="h-11 rounded-xl border-border/80 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.04)]" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="border-t border-border/60 px-6 py-5">
              <Button variant="outline" onClick={() => setResetPasswordOpen(false)} className="h-11 w-full rounded-xl sm:w-auto">Cancel</Button>
              <Button onClick={handleResetPassword} disabled={resettingPassword} className="h-11 w-full rounded-xl sm:w-auto">
                {resettingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</> : <><KeyRound className="w-4 h-4 mr-2" />Reset Password</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AddFundsDialog open={addFundsOpen} onOpenChange={setAddFundsOpen} userId={addFundsUserId} userName={addFundsUserName} onSuccess={fetchUsers} />

        {/* User Profile Detail Dialog */}
        <Dialog open={!!viewProfileUser} onOpenChange={(open) => !open && setViewProfileUser(null)}>
          <DialogContent className="sm:max-w-lg rounded-2xl border border-border/70 bg-background p-0 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border/60 px-6 py-5">
              <DialogTitle className="text-foreground">User Details</DialogTitle>
              <DialogDescription>{viewProfileUser?.full_name || viewProfileUser?.email}</DialogDescription>
            </DialogHeader>
            {viewProfileUser && (
              <div className="space-y-4 px-6 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-medium text-foreground">{viewProfileUser.full_name || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-medium text-foreground break-all">{viewProfileUser.email || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <p className="text-sm font-medium text-foreground">{viewProfileUser.phone || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Company</p>
                    <p className="text-sm font-medium text-foreground">{viewProfileUser.company_name || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                    <div className="flex items-start gap-1.5">
                      <Home className="w-3.5 h-3.5 text-primary mt-0.5" />
                      <p className="text-sm font-medium text-foreground">{viewProfileUser.address || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">City</p>
                    <p className="text-sm font-medium text-foreground">{viewProfileUser.city || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">State / Region</p>
                    <p className="text-sm font-medium text-foreground">{viewProfileUser.state || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Country</p>
                    <p className="text-sm font-medium text-foreground">{viewProfileUser.country || <span className="text-muted-foreground italic font-normal">Not provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Role</p>
                    <Badge variant={viewProfileUser.role === "admin" ? "default" : "secondary"}>{viewProfileUser.role}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Joined</p>
                    <p className="text-sm font-medium text-foreground">{format(new Date(viewProfileUser.created_at), "MMM dd, yyyy")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/[0.18] p-4">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Shipments</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{profileExtras?.shipments ?? "—"}</p>
                  </div>
                  <div className="text-center border-x border-border/40">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Payments</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{profileExtras?.payments ?? "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paid</p>
                    <p className="text-lg font-bold text-primary mt-0.5">${(profileExtras?.paidAmount ?? 0).toLocaleString()}</p>
                  </div>
                </div>
                {viewProfileUser.phone && (
                  <a href={`tel:${viewProfileUser.phone}`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Phone className="w-4 h-4" /> Call {viewProfileUser.full_name?.split(" ")[0] || "User"}
                  </a>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
