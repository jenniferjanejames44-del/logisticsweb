import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        // Fetch all data in parallel
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

        // Create recent activity from shipments
        const recentActivity = shipments
          .slice(0, 5)
          .map(s => ({
            type: "shipment",
            description: `Shipment ${s.tracking_number} - ${s.status}`,
            time: new Date(s.created_at).toLocaleDateString(),
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
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Shipments",
      value: stats.totalShipments,
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Pending Shipments",
      value: stats.pendingShipments,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Completed",
      value: stats.completedShipments,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Growth Rate",
      value: "+12.5%",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your logistics operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {loading ? "..." : stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground">{activity.description}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
