import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  description: string | null;
  created_at: string;
  shipment_id: string | null;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    processing: "bg-primary/10 text-primary",
    completed: "bg-success/10 text-success",
    failed: "bg-destructive/10 text-destructive",
    refunded: "bg-primary/10 text-primary",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const isMobile = useIsMobile();

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("payments").update({ status: newStatus }).eq("id", paymentId);
      if (error) throw error;
      toast.success("Payment status updated");
      fetchPayments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track and manage all customer payments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-success/10"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">${pendingAmount.toLocaleString()}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-warning/10"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-warning" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{payments.length}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />All Payments ({filteredPayments.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search payments..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading payments...</p>
            ) : filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <DollarSign className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No payments found</p>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="border border-border/50 rounded-xl p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">${Number(payment.amount).toLocaleString()} {payment.currency}</span>
                      <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Transaction ID</p>
                        <p className="text-foreground font-mono text-xs truncate">{payment.transaction_id || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Method</p>
                        <p className="text-foreground capitalize">{payment.payment_method || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Description</p>
                        <p className="text-foreground truncate">{payment.description || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</span>
                      <Select value={payment.status} onValueChange={(v) => handleStatusChange(payment.id, v)}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono">{payment.transaction_id || "N/A"}</TableCell>
                        <TableCell className="font-medium">${Number(payment.amount).toLocaleString()} {payment.currency}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method || "N/A"}</TableCell>
                        <TableCell>{payment.description || "N/A"}</TableCell>
                        <TableCell><Badge className={getStatusColor(payment.status)}>{payment.status}</Badge></TableCell>
                        <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select value={payment.status} onValueChange={(v) => handleStatusChange(payment.id, v)}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
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

export default AdminPayments;
