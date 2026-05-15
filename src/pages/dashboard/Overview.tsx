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
  Headphones,
  Calculator,
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
    { label: "Total Deliveries", value: stats.delivered, icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/8" },
    { label: "Total Value", value: formatMoney(totalSpent, selectedCurrency), icon: CreditCard, color: "text-accent", bg: "bg-accent/8" },
  ];

  return (
    <DashboardLayout title="Dashboard" description="Welcome back! Here's an overview of your shipments.">
      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-xl border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground leading-tight">{stat.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        {[
          { label: "Create Shipment", desc: "Start a new shipment", icon: Plus, href: "/dashboard/shipments/new" },
          { label: "Get Quote", desc: "Calculate shipping cost", icon: Calculator, href: "/pricing" },
          { label: "Contact Support", desc: "Need help? Reach out", icon: Headphones, href: "/contact" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.href}>
              <Card className="h-full cursor-pointer rounded-xl border-border/60 hover:border-accent/40 hover:shadow-md transition-all duration-200">
                <CardContent className="flex items-center gap-3.5 p-5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="w-5 h-5 text-accent" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Shipments + Activity */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3 rounded-xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-5 sm:px-6 pt-5">
            <CardTitle className="text-base font-semibold">Recent Shipments</CardTitle>
            <Link to="/dashboard/shipments" className="text-xs font-semibold text-accent hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 pb-5">
            {recentShipments.length > 0 ? (
              <div className="divide-y divide-border/60">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{shipment.tracking_number || "Pending"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">To: {shipment.destination_country}</p>
                      </div>
                    </div>
                    <StatusBadge status={shipment.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-3 w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground mb-4">No shipments yet</p>
                <Button asChild className="h-10 px-5 bg-accent hover:bg-accent/90 text-white rounded-lg">
                  <Link to="/dashboard/shipments/new">Create Your First Shipment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-xl border-border/60">
          <CardHeader className="px-5 sm:px-6 pt-5 pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 pb-5">
            {activities.length > 0 ? (
              <div className="space-y-3.5">
                {activities.slice(0, 6).map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-xs text-foreground leading-snug">{activity.message}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Clock className="mx-auto mb-2 w-8 h-8 text-muted-foreground/30" />
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
