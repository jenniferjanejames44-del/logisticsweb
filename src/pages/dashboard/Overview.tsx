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
import StatusBadge from "@/components/shipments/StatusBadge";
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
  ShoppingBag,
  Headphones,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-7 lg:mb-8">
        {[
          { label: "Total Shipments", value: stats.total, icon: Package, iconBg: "bg-primary/8", iconColor: "text-primary" },
          { label: "In Transit", value: stats.inTransit, icon: Truck, iconBg: "bg-primary/8", iconColor: "text-primary" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, iconBg: "bg-green-500/10", iconColor: "text-green-600" },
          { label: "Total Spent", value: `₦${totalSpent.toLocaleString()}`, icon: CreditCard, iconBg: "bg-accent/10", iconColor: "text-accent" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/40 hover:border-border/70 hover:shadow-md hover:shadow-primary/[0.03] transition-all duration-200 group">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] sm:text-[13px] text-muted-foreground font-medium mb-1.5 tracking-wide">{stat.label}</p>
                    <p className="text-[1.375rem] sm:text-[1.625rem] font-bold text-foreground tracking-tight truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-200 shadow-sm`}>
                    <Icon className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${stat.iconColor}`} strokeWidth={2.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wallet Feature Card */}
      <Card className="mb-7 lg:mb-8 border-primary/35 bg-gradient-to-br from-primary/[0.2] via-primary/[0.09] to-accent/[0.1] shadow-xl shadow-primary/[0.14] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.1] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/[0.1] rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardContent className="p-5 sm:p-7 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30 border border-primary/30">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-foreground/80 font-semibold tracking-wide uppercase">Wallet Balance</p>
                <p className="text-[2rem] sm:text-[2.45rem] font-bold text-foreground tracking-tight mt-0.5">₦{balance.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2.5 sm:gap-3">
              <Button variant="dashAccent" size="dash" asChild className="shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all duration-200">
                <Link to="/dashboard/wallet">
                  <ArrowUpCircle className="w-4 h-4" strokeWidth={2.5} />
                  Add Funds
                </Link>
              </Button>
              <Button variant="dashPrimary" size="dash" asChild className="border border-primary/25 bg-primary/95 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200">
                <Link to="/dashboard/wallet">Manage Wallet</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-7 lg:mb-8">
        {[
          { label: "Create Shipment", desc: "Start a new shipment", icon: Plus, href: "/shipping", iconBg: "bg-gradient-to-br from-accent to-accent/80", iconColor: "text-accent-foreground" },
          { label: "Get Quote", desc: "Calculate shipping cost", icon: ShoppingBag, href: "/pricing", iconBg: "bg-gradient-to-br from-primary to-primary/80", iconColor: "text-primary-foreground" },
          { label: "Contact Support", desc: "Get help with shipments", icon: Headphones, href: "/contact", iconBg: "bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10", iconColor: "text-foreground" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.label} className="border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-200 cursor-pointer group">
              <CardContent className="p-5 sm:p-5">
                <Link to={action.href} className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0 shadow-md`}>
                    <Icon className={`w-5 h-5 ${action.iconColor}`} strokeWidth={2.5} />
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
            <Button variant="link" className="text-accent p-0 h-auto text-[0.875rem] hover:text-accent/80 transition-colors" asChild>
              <Link to="/dashboard/shipments">
                View All <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
            {recentShipments.length > 0 ? (
              <div className="space-y-2.5">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl hover:bg-muted/60 transition-all duration-150 gap-3 border border-transparent hover:border-border/30"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-[18px] h-[18px] text-primary" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-[0.875rem] truncate">{shipment.tracking_number || "Pending"}</p>
                        <p className="text-[12px] text-muted-foreground truncate">To: {shipment.destination_country}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0"><StatusBadge status={shipment.status} size="sm" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-7 h-7 text-muted-foreground/50" strokeWidth={2.5} />
                </div>
                <p className="text-muted-foreground text-[0.9375rem] font-medium mb-4">No shipments yet</p>
                <Button variant="dashAccent" size="dash" asChild className="shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all duration-200">
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
                <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/50" />
                <div className="space-y-4">
                  {activities.slice(0, 6).map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-3.5 relative">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 z-10 border border-primary/5">
                          <Icon className="w-4 h-4 text-primary" strokeWidth={2.5} />
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
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-muted-foreground/50" strokeWidth={2.5} />
                </div>
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
