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
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", bgColor: "bg-primary/8" },
    { title: "Total Shipments", value: stats.totalShipments, icon: Package, color: "text-accent", bgColor: "bg-accent/10" },
    { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success", bgColor: "bg-success/8" },
    { title: "Pending", value: stats.pendingShipments, icon: Clock, color: "text-warning", bgColor: "bg-warning/8" },
    { title: "Completed", value: stats.completedShipments, icon: CheckCircle, color: "text-success", bgColor: "bg-success/8" },
    { title: "Growth Rate", value: "+12.5%", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/8" },
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
    <AdminLayout title="Admin Dashboard" description="Welcome back! Here's an overview of your logistics operations.">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border/40 hover:border-border transition-colors">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12px] sm:text-[13px] text-muted-foreground font-medium mb-1">{stat.title}</p>
                      <p className="text-[1.25rem] sm:text-[1.5rem] lg:text-[1.75rem] font-bold text-foreground tracking-tight truncate">
                        {loading ? "..." : stat.value}
                      </p>
                    </div>
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="border-border/40">
          <CardHeader className="p-5 sm:p-6 pb-3 sm:pb-4">
            <CardTitle className="text-[1.0625rem] sm:text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6">
            {loading ? (
              <p className="text-muted-foreground text-[0.875rem]">Loading...</p>
            ) : stats.recentActivity.length > 0 ? (
              <div className="space-y-1">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border/30 last:border-0 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-foreground text-[0.875rem] font-medium truncate">{activity.description}</span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <Badge className={`${getStatusColor(activity.status)} text-[11px] hidden sm:inline-flex`}>
                        {activity.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[12px] text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-[0.875rem]">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
