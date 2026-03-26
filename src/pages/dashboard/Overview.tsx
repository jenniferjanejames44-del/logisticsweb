import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { OverviewSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shipments/StatusBadge";
import {
  Package,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  Wallet,
  ArrowUpCircle,
  ShoppingBag,
  Headphones,
  type LucideIcon,
} from "lucide-react";

interface ShipmentStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
}

interface RecentShipment {
  id: string;
  tracking_number: string;
  destination_country: string;
  status: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  message: string;
  time: string;
  type: "shipment" | "payment" | "delivery";
}

interface CompletedPayment {
  amount: number;
  currency: string | null;
}

const Overview = () => {
  const { user } = useAuth();
  const { balance } = useWalletBalance(user?.id);
  const { convertAmount, formatMoney, selectedCurrency } = useCurrency();
  const [stats, setStats] = useState<ShipmentStats>({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [completedPayments, setCompletedPayments] = useState<CompletedPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: shipments } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (shipments) {
        setStats({
          total: shipments.length,
          pending: shipments.filter((s) => s.status === "pending").length,
          inTransit: shipments.filter((s) => s.status === "in_transit").length,
          delivered: shipments.filter((s) => s.status === "delivered").length,
        });
        setRecentShipments(shipments.slice(0, 5));

        const shipmentActivities: ActivityItem[] = shipments.slice(0, 8).map((s) => ({
          id: s.id,
          icon: s.status === "delivered" ? CheckCircle : s.status === "in_transit" ? Truck : Package,
          message: `Shipment ${s.tracking_number || "created"} — ${s.status.replace(/_/g, " ")}`,
          time: new Date(s.updated_at || s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          type: "shipment" as const,
        }));
        setActivities(shipmentActivities);
      }

      const { data: payments } = await supabase
        .from("payments")
        .select("amount, currency")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (payments) {
        setCompletedPayments(payments);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const totalSpent = useMemo(
    () => completedPayments.reduce(
      (sum, payment) => sum + convertAmount(Number(payment.amount), payment.currency || "USD"),
      0,
    ),
    [completedPayments, convertAmount],
  );

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" description="Welcome back! Here's an overview of your shipments.">
        <OverviewSkeleton />
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: "Total Shipments", value: stats.total, icon: Package, color: "text-primary", bg: "bg-primary/8" },
    { label: "In Transit", value: stats.inTransit, icon: Truck, color: "text-primary", bg: "bg-primary/8" },
    { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/8" },
    { label: "Total Spent", value: formatMoney(totalSpent, selectedCurrency), icon: CreditCard, color: "text-accent", bg: "bg-accent/8" },
  ];

  return (
    <DashboardLayout title="Dashboard" description="Welcome back! Here's an overview of your shipments.">
      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</p>
                    <p className="mt-1.5 text-lg font-bold text-foreground sm:text-2xl truncate">{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`w-[18px] h-[18px] ${stat.color}`} strokeWidth={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wallet Banner */}
      <Card className="mb-6 border-primary/15 bg-primary">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Wallet className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Wallet Balance (USD)</p>
                <p className="text-2xl font-bold text-white sm:text-3xl">{formatMoney(convertAmount(balance, "NGN", "USD"), "USD")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="default" size="sm" asChild className="bg-white text-primary hover:bg-white/90 border-0 shadow-none">
                <Link to="/dashboard/wallet">
                  <ArrowUpCircle className="w-4 h-4" />
                  Add Funds
                </Link>
              </Button>
              <Button variant="heroSecondary" size="sm" asChild>
                <Link to="/dashboard/wallet">Manage Wallet</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: "Create Shipment", desc: "Start a new shipment", icon: Plus, href: "/shipping", iconColor: "text-accent", bg: "bg-accent/8" },
          { label: "Get Quote", desc: "Calculate shipping cost", icon: ShoppingBag, href: "/pricing", iconColor: "text-primary", bg: "bg-primary/8" },
          { label: "Contact Support", desc: "Get help with shipments", icon: Headphones, href: "/contact", iconColor: "text-muted-foreground", bg: "bg-muted" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.href}>
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${action.bg}`}>
                    <Icon className={`w-[18px] h-[18px] ${action.iconColor}`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Shipments + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Shipments</CardTitle>
            <Button variant="link" className="text-accent p-0 h-auto text-sm" asChild>
              <Link to="/dashboard/shipments">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentShipments.length > 0 ? (
              <div className="space-y-2">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 flex-shrink-0">
                        <Package className="w-4 h-4 text-primary" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{shipment.tracking_number || "Pending"}</p>
                        <p className="text-xs text-muted-foreground">To: {shipment.destination_country}</p>
                      </div>
                    </div>
                    <StatusBadge status={shipment.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Package className="mx-auto mb-3 w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground mb-3">No shipments yet</p>
                <Button variant="default" size="sm" asChild>
                  <Link to="/shipping">Create Your First Shipment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-4">
                  {activities.slice(0, 6).map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="relative flex gap-3">
                        <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-background border border-border">
                          <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-xs text-foreground leading-snug">{activity.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock className="mx-auto mb-2 w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
