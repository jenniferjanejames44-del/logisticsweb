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
    { label: "In Transit", value: stats.inTransit, icon: Truck, color: "text-blue-600", bg: "bg-blue-500/8" },
    { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/8" },
    { label: "Total Spent", value: formatMoney(totalSpent, selectedCurrency), icon: CreditCard, color: "text-accent", bg: "bg-accent/8" },
  ];

  return (
    <DashboardLayout title="Dashboard" description="Welcome back! Here's an overview of your shipments.">
      {/* Stats Grid */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="mt-1.5 text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} strokeWidth={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wallet Banner */}
      <Card className="mb-5 bg-primary border-0 overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Wallet Balance</p>
                <p className="text-xl font-bold text-white sm:text-2xl">{formatMoney(convertAmount(balance, "NGN", "USD"), "USD")}</p>
              </div>
            </div>
            <Button size="sm" asChild className="bg-white text-primary hover:bg-white/90 border-0 shadow-none h-9 text-[13px] font-semibold">
              <Link to="/dashboard/wallet">
                <ArrowUpCircle className="w-3.5 h-3.5" />
                Add Funds
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Create Shipment", desc: "Start a new shipment", icon: Plus, href: "/shipping" },
          { label: "Get Quote", desc: "Calculate shipping cost", icon: ShoppingBag, href: "/pricing" },
          { label: "Contact Support", desc: "Need help? Reach out", icon: Headphones, href: "/contact" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.href}>
              <Card className="h-full cursor-pointer border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/8">
                    <Icon className="w-4 h-4 text-accent" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Shipments + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 sm:px-5">
            <CardTitle className="text-sm font-semibold">Recent Shipments</CardTitle>
            <Link to="/dashboard/shipments" className="text-[12px] font-semibold text-accent hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="px-4 sm:px-5">
            {recentShipments.length > 0 ? (
              <div className="divide-y divide-border/50">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/6">
                        <Package className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{shipment.tracking_number || "Pending"}</p>
                        <p className="text-[11px] text-muted-foreground">To: {shipment.destination_country}</p>
                      </div>
                    </div>
                    <StatusBadge status={shipment.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Package className="mx-auto mb-3 w-10 h-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground mb-3">No shipments yet</p>
                <Button variant="default" size="sm" asChild>
                  <Link to="/shipping">Create Your First Shipment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="px-4 sm:px-5">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-5">
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 6).map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-2.5">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted/80">
                        <Icon className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[12px] text-foreground leading-snug">{activity.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock className="mx-auto mb-2 w-8 h-8 text-muted-foreground/20" />
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
