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
    { title: "Total Shipments", value: stats.totalShipments, icon: Package, color: "text-accent", bgColor: "bg-accent/10" },
    { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success", bgColor: "bg-success/10" },
    { title: "Pending", value: stats.pendingShipments, icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
    { title: "Completed", value: stats.completedShipments, icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
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
    <AdminLayout title="Dashboard" description="Overview of your logistics operations.">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border/60 bg-white shadow-sm transition-all duration-150 hover:shadow-md">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight truncate">
                        {loading ? "—" : stat.value}
                      </p>
                    </div>
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-[18px] h-[18px] ${stat.color}`} strokeWidth={2} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="border-border/60 bg-white shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="text-muted-foreground text-sm p-5">Loading...</p>
            ) : stats.recentActivity.length > 0 ? (
              <div className="divide-y divide-border/40">
                {stats.recentActivity.map((activity, index) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors duration-100 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8">
                          <StatusIcon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-foreground text-sm font-medium truncate">{activity.description}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
              <div className="py-12 text-center">
                <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
