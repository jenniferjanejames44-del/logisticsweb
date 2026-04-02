import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PaymentsListSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard, Search, DollarSign, CheckCircle, Clock, AlertCircle, Calendar, type LucideIcon,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  description: string | null;
  created_at: string;
  shipments: { tracking_number: string } | null;
}

const Payments = () => {
  const { user } = useAuth();
  const { convertAmount, formatConverted, formatMoney, selectedCurrency } = useCurrency();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("payments")
        .select(`*, shipments (tracking_number)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setPayments(data);
      setLoading(false);
    };
    fetchPayments();
  }, [user]);

  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + convertAmount(Number(p.amount), p.currency || "USD"), 0),
    [payments, convertAmount],
  );

  const pendingAmount = useMemo(
    () => payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + convertAmount(Number(p.amount), p.currency || "USD"), 0),
    [payments, convertAmount],
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: LucideIcon }> = {
      completed: { variant: "outline", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      failed: { variant: "destructive", icon: AlertCircle },
      refunded: { variant: "default", icon: DollarSign },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="gap-1 capitalize text-[10px]">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.shipments?.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout title="Payments" description="View your payment history and invoices">
        <PaymentsListSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payments" description="View your payment history and invoices">
      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Paid", value: formatMoney(totalPaid, selectedCurrency), icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/8" },
          { label: "Pending", value: formatMoney(pendingAmount, selectedCurrency), icon: Clock, color: "text-accent", bg: "bg-accent/8" },
          { label: "Total Transactions", value: payments.length, icon: CreditCard, color: "text-primary", bg: "bg-primary/8" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="mt-1.5 text-xl font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 text-[13px] border-border/60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full sm:w-[180px] text-[13px] border-border/60">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      {filteredPayments.length > 0 ? (
        <div className="grid gap-2.5">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="border-border/50 transition-all duration-200 hover:shadow-sm hover:border-border">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/6">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[13px] font-semibold text-foreground">
                          {formatConverted(Number(payment.amount), payment.currency || "USD")}
                        </h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span>Original: {formatMoney(Number(payment.amount), payment.currency || "USD")}</span>
                        {payment.shipments && <span>Shipment: {payment.shipments.tracking_number}</span>}
                        {payment.payment_method && <span className="capitalize">{payment.payment_method}</span>}
                        {payment.transaction_id && <span>ID: {payment.transaction_id}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                    {payment.description && (
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">{payment.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="w-12 h-12 text-muted-foreground/20 mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">No Payments Found</h3>
            <p className="text-[12px] text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Your payment history will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Payments;
