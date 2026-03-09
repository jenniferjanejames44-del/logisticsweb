import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, DollarSign, TrendingUp, Clock, CheckCircle, Activity } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalShipments: number;
  totalRevenue: number;
  pendingShipments: number;
  completedShipments: number;
  recentActivity: Array<{
    type: string;
    description: string;
    time: string;
    status: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalShipments: 0,
    totalRevenue: 0,
    pendingShipments: 0,
    completedShipments: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, shipmentsRes, paymentsRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("shipments").select("*"),
          supabase.from("payments").select("amount, status"),
        ]);

        const shipments = shipmentsRes.data || [];
        const payments = paymentsRes.data || [];

        const pendingShipments = shipments.filter(s => s.status === "pending" || s.status === "in_transit").length;
        const completedShipments = shipments.filter(s => s.status === "delivered").length;
        const totalRevenue = payments
          .filter(p => p.status === "completed")
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const recentActivity = shipments
          .slice(0, 5)
          .map(s => ({
            type: "shipment",
            description: `Shipment ${s.tracking_number}`,
            time: new Date(s.created_at).toLocaleDateString(),
            status: s.status,
          }));

        setStats({
          totalUsers: profilesRes.count || 0,
          totalShipments: shipments.length,
          totalRevenue,
          pendingShipments,
          completedShipments,
          recentActivity,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Total Shipments", value: stats.totalShipments, icon: Package, color: "text-accent", bgColor: "bg-accent/12" },
    { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success", bgColor: "bg-success/12" },
    { title: "Pending", value: stats.pendingShipments, icon: Clock, color: "text-warning", bgColor: "bg-warning/12" },
    { title: "Completed", value: stats.completedShipments, icon: CheckCircle, color: "text-success", bgColor: "bg-success/12" },
    { title: "Growth Rate", value: "+12.5%", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10" },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-warning/10 text-warning",
      processing: "bg-primary/10 text-primary",
      in_transit: "bg-primary/10 text-primary",
      delivered: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      in_transit: Package,
      delivered: CheckCircle,
    };
    return icons[status] || Package;
  };

  return (
    <AdminLayout title="Admin Dashboard" description="Welcome back! Here's an overview of your logistics operations.">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="group relative overflow-hidden border-border transition-all duration-200 hover:border-primary/25 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground">{stat.title}</p>
                      <p className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-foreground tracking-tight truncate">
                        {loading ? "..." : stat.value}
                      </p>
                    </div>
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-border/40 ${stat.bgColor} shadow-sm transition-all duration-200 group-hover:scale-105`}>
                      <Icon className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${stat.color}`} strokeWidth={2.5} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-[1.0625rem] sm:text-lg font-semibold flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {loading ? (
              <p className="text-muted-foreground text-[0.875rem]">Loading...</p>
            ) : stats.recentActivity.length > 0 ? (
              <div className="space-y-1">
                {stats.recentActivity.map((activity, index) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  return (
                    <div
                      key={index}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg border-b border-border/25 px-2 py-4 transition-colors duration-150 last:border-0 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8">
                          <StatusIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-foreground text-[0.875rem] font-medium truncate">{activity.description}</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <Badge className={`${getStatusColor(activity.status)} text-[11px] hidden sm:inline-flex`}>
                          {activity.status.replace("_", " ")}
                        </Badge>
                        <span className="text-[12px] text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-muted/60">
                  <Activity className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-[0.875rem]">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
