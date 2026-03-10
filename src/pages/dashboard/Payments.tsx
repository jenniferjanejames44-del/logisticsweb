import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PaymentsListSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  type LucideIcon,
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
        .select(`
          *,
          shipments (tracking_number)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPayments(data);
      }
      setLoading(false);
    };

    fetchPayments();
  }, [user]);

  const totalPaid = useMemo(
    () => payments
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + convertAmount(Number(payment.amount), payment.currency || "USD"), 0),
    [payments, convertAmount],
  );

  const pendingAmount = useMemo(
    () => payments
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + convertAmount(Number(payment.amount), payment.currency || "USD"), 0),
    [payments, convertAmount],
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: LucideIcon }> = {
      completed: { variant: "outline", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      failed: { variant: "destructive", icon: AlertCircle },
      refunded: { variant: "default", icon: DollarSign },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1 capitalize">
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
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
        <Card className="group border-border transition-all duration-200 hover:border-border/80 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground">Total Paid</p>
                <p className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-foreground tracking-tight truncate">{formatMoney(totalPaid, selectedCurrency)}</p>
              </div>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/8 transition-transform duration-200 group-hover:scale-105">
                <CheckCircle className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-border transition-all duration-200 hover:border-border/80 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground">Pending</p>
                <p className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-foreground tracking-tight truncate">{formatMoney(pendingAmount, selectedCurrency)}</p>
              </div>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-warning/8 transition-transform duration-200 group-hover:scale-105">
                <Clock className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group border-border transition-all duration-200 hover:border-border/80 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground">Total Transactions</p>
                <p className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-foreground tracking-tight truncate">{payments.length}</p>
              </div>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8 transition-transform duration-200 group-hover:scale-105">
                <CreditCard className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-lg pl-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-12 w-full rounded-lg sm:w-[180px]">
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
        </CardContent>
      </Card>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredPayments.length > 0 ? (
        <div className="grid gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="border-border transition-all duration-200 hover:border-border/80 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {formatConverted(Number(payment.amount), payment.currency || "USD")}
                        </h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Original: {formatMoney(Number(payment.amount), payment.currency || "USD")}</span>
                        {payment.shipments && (
                          <span>Shipment: {payment.shipments.tracking_number}</span>
                        )}
                        {payment.payment_method && (
                          <span className="capitalize">{payment.payment_method}</span>
                        )}
                        {payment.transaction_id && (
                          <span>ID: {payment.transaction_id}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                      <Calendar className="w-4 h-4" />
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                    {payment.description && (
                      <p className="text-sm text-muted-foreground mt-1">{payment.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No Payments Found</h3>
            <p className="text-muted-foreground">
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
