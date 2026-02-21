import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

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
    { title: "Total Shipments", value: stats.totalShipments, icon: Package, color: "text-secondary", bgColor: "bg-secondary/10" },
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

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Welcome back! Here's an overview of your logistics operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border/50">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground truncate">{stat.title}</p>
                      <p className="text-lg sm:text-xl lg:text-3xl font-bold text-foreground mt-0.5 sm:mt-1 truncate">
                        {loading ? "..." : stat.value}
                      </p>
                    </div>
                    <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : stats.recentActivity.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2.5 sm:py-3 border-b border-border/50 last:border-0 gap-3"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-foreground text-sm sm:text-base truncate">{activity.description}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`${getStatusColor(activity.status)} text-[10px] sm:text-xs hidden sm:inline-flex`}>
                        {activity.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
