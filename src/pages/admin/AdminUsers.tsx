import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, UserCog, Trash2, Eye, Monitor, Smartphone, Tablet, Clock, MapPin, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  role: string;
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

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || "customer",
        };
      });

      setUsers(usersWithRoles);
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
      const { data, error } = await supabase
        .from("login_history")
        .select("*")
        .eq("user_id", userId)
        .order("logged_in_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSelectedUserHistory(data || []);
    } catch (error) {
      console.error("Error fetching login history:", error);
      toast.error("Failed to load login history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "admin" | "customer") => {
    try {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: newRole }]);

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
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout
      title="User Management"
      description="Manage customer accounts, permissions, and view activity"
    >
      <div className="space-y-8">
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                All Users ({filteredUsers.length})
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{user.email || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.company_name || "N/A"}</TableCell>
                        <TableCell>
                          {user.city && user.country
                            ? `${user.city}, ${user.country}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {format(new Date(user.created_at), "MMM dd, yyyy")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(user.created_at), "hh:mm a")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchLoginHistory(user.user_id)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Login Activity - {user.full_name || user.email}</DialogTitle>
                                <DialogDescription>
                                  Recent login history and device information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {historyLoading ? (
                                  <p className="text-center text-muted-foreground py-4">Loading...</p>
                                ) : selectedUserHistory.length === 0 ? (
                                  <p className="text-center text-muted-foreground py-4">No login history found</p>
                                ) : (
                                  selectedUserHistory.map((history) => (
                                    <div
                                      key={history.id}
                                      className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border border-border"
                                    >
                                      <div className="p-2 rounded-full bg-primary/10">
                                        {getDeviceIcon(history.device_type)}
                                      </div>
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">
                                            {history.device_type || "Unknown Device"}
                                          </span>
                                          <Badge variant="outline" className="text-xs">
                                            {history.browser || "Unknown Browser"}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {history.location || "Unknown location"}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(history.logged_in_at), "MMM dd, yyyy hh:mm a")}
                                          </span>
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
                            <Select
                              value={user.role}
                              onValueChange={(value: "admin" | "customer") =>
                                handleRoleChange(user.user_id, value)
                              }
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  disabled={deletingUserId === user.user_id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.full_name || user.email}? 
                                    This action cannot be undone and will remove all their data 
                                    including shipments, payments, and login history.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.user_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
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
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
