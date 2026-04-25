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
import { Search, DollarSign, Clock, Receipt, XCircle, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleRetryPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status: "pending" })
        .eq("id", paymentId);
      if (error) throw error;
      toast.success("Payment queued for retry");
      fetchPayments();
    } catch (error) {
      console.error("Error retrying payment:", error);
      toast.error("Failed to retry payment");
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);
  const failedCount = payments.filter((p) => p.status === "failed").length;
  const completedCount = payments.filter((p) => p.status === "completed").length;

  const summaryCards = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, sub: `${completedCount} completed`, icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Pending Payments", value: `$${pendingAmount.toLocaleString()}`, sub: "Awaiting confirmation", icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Total Transactions", value: payments.length, sub: "All time", icon: Receipt, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Failed", value: failedCount, sub: "Needs review", icon: XCircle, iconBg: "bg-red-50", iconColor: "text-red-600" },
  ];

  return (
    <AdminLayout title="Payment Management" description="Track and manage all customer payments">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summaryCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} className="border-border/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                <CardContent className="p-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.iconBg} mb-3`}>
                    <Icon className={`w-4 h-4 ${c.iconColor}`} strokeWidth={2} />
                  </div>
                  <p className="text-lg font-bold text-foreground tracking-tight tabular-nums leading-none mb-1">{loading ? "—" : c.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{c.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-border/60 bg-white shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-border/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                All Payments ({filteredPayments.length})
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative sm:w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search payments..." className="h-9 rounded-lg border-border/80 bg-muted/30 pl-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-muted/30 text-sm sm:w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading payments...</p>
            ) : filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <DollarSign className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No payments found</p>
              </div>
            ) : isMobile ? (
              <div className="divide-y divide-border/40">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">${Number(payment.amount).toLocaleString()}</span>
                      <Badge className={`${getStatusColor(payment.status)} capitalize text-[11px]`}>{payment.status}</Badge>
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
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        {payment.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 gap-1.5 rounded-lg border-primary/40 text-primary hover:bg-primary/10"
                            onClick={() => handleRetryPayment(payment.id)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Retry
                          </Button>
                        )}
                        <Select value={payment.status} onValueChange={(v) => handleStatusChange(payment.id, v)}>
                          <SelectTrigger className="h-9 w-32 rounded-lg border-border/80 bg-muted/30 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                <Table>
                  <TableHeader className="bg-muted/30 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="transition-colors hover:bg-muted/20 [&_td]:py-3 [&_td]:text-[13px]">
                        <TableCell className="font-mono text-xs">{payment.transaction_id || <span className="text-muted-foreground italic">—</span>}</TableCell>
                        <TableCell className="font-semibold tabular-nums">${Number(payment.amount).toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method || "N/A"}</TableCell>
                        <TableCell className="max-w-[220px] truncate">{payment.description || <span className="text-muted-foreground italic">—</span>}</TableCell>
                        <TableCell><Badge className={`${getStatusColor(payment.status)} capitalize`}>{payment.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {payment.status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 gap-1.5 rounded-lg border-primary/40 text-primary hover:bg-primary/10"
                                onClick={() => handleRetryPayment(payment.id)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Retry
                              </Button>
                            )}
                            <Select value={payment.status} onValueChange={(v) => handleStatusChange(payment.id, v)}>
                              <SelectTrigger className="h-9 w-32 rounded-lg border-border/80 bg-muted/30 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
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
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
