import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { OverviewSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Wallet,
  ArrowUpCircle,
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
  icon: any;
  message: string;
  time: string;
  type: "shipment" | "payment" | "delivery";
}

const Overview = () => {
  const { user } = useAuth();
  const { balance } = useWalletBalance(user?.id);
  const [stats, setStats] = useState<ShipmentStats>({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
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

        // Build activity timeline from shipments + payments
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
        .select("amount")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (payments) {
        const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        setTotalSpent(total);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; className?: string }> = {
      pending: { variant: "secondary", icon: Clock },
      shipment_created: { variant: "secondary", icon: Package, className: "bg-primary/10 text-primary border-primary/20" },
      in_transit: { variant: "default", icon: Truck },
      ready_for_pickup: { variant: "outline", icon: AlertCircle, className: "bg-accent/10 text-accent border-accent/30" },
      delivered: { variant: "outline", icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/30" },
      cancelled: { variant: "destructive", icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={`gap-1 text-[11px] ${config.className || ""}`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" description="Welcome back! Here's an overview of your shipments.">
        <OverviewSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" description="Welcome back! Here's an overview of your shipments.">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6 lg:mb-8">
        {[
          { label: "Total Shipments", value: stats.total, icon: Package, iconBg: "bg-primary/8", iconColor: "text-primary" },
          { label: "In Transit", value: stats.inTransit, icon: Truck, iconBg: "bg-primary/8", iconColor: "text-primary" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, iconBg: "bg-green-500/10", iconColor: "text-green-600" },
          { label: "Total Spent", value: `₦${totalSpent.toLocaleString()}`, icon: CreditCard, iconBg: "bg-accent/10", iconColor: "text-accent" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/40 hover:border-border transition-colors">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] sm:text-[13px] text-muted-foreground font-medium mb-1">{stat.label}</p>
                    <p className="text-[1.375rem] sm:text-[1.625rem] font-bold text-foreground tracking-tight truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wallet Feature Card */}
      <Card className="mb-6 lg:mb-8 border-border/40 bg-gradient-to-r from-primary/8 to-primary/3">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Wallet Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">₦{balance.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button variant="dashPrimary" size="dash" asChild>
                <Link to="/dashboard/wallet">
                  <ArrowUpCircle className="w-4 h-4" />
                  Add Funds
                </Link>
              </Button>
              <Button variant="dashOutline" size="dash" asChild>
                <Link to="/dashboard/wallet">Manage Wallet</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-6 lg:mb-8">
        {[
          { label: "Create Shipment", desc: "Start a new shipment", icon: Plus, href: "/shipping", iconBg: "bg-accent", iconColor: "text-accent-foreground" },
          { label: "Get Quote", desc: "Calculate shipping cost", icon: CreditCard, href: "/pricing", iconBg: "bg-primary", iconColor: "text-primary-foreground" },
          { label: "Contact Support", desc: "Get help with shipments", icon: Package, href: "/contact", iconBg: "bg-muted", iconColor: "text-foreground" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.label} className="border-border/40 hover:border-border hover:shadow-sm transition-all cursor-pointer group">
              <CardContent className="p-4 sm:p-5">
                <Link to={action.href} className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 ${action.iconBg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-[0.9375rem]">{action.label}</h3>
                    <p className="text-[13px] text-muted-foreground">{action.desc}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
        {/* Recent Shipments */}
        <Card className="border-border/40 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6">
            <CardTitle className="text-[1.0625rem] sm:text-lg font-semibold">Recent Shipments</CardTitle>
            <Button variant="link" className="text-accent p-0 h-auto text-[0.875rem]" asChild>
              <Link to="/dashboard/shipments">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
            {recentShipments.length > 0 ? (
              <div className="space-y-2.5">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3.5 bg-muted/40 rounded-lg hover:bg-muted/70 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-9 h-9 bg-primary/8 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-[0.875rem] truncate">{shipment.tracking_number || "Pending"}</p>
                        <p className="text-[12px] text-muted-foreground truncate">To: {shipment.destination_country}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(shipment.status)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Package className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-[0.9375rem] mb-4">No shipments yet</p>
                <Button variant="dashAccent" size="dash" asChild>
                  <Link to="/shipping">Create Your First Shipment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="text-[1.0625rem] sm:text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
            {activities.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border/60" />
                <div className="space-y-4">
                  {activities.slice(0, 6).map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-3 relative">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 z-10">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-[13px] text-foreground leading-snug">{activity.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
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
