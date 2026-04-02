import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, Truck, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalUsers: number;
  totalShipments: number;
  totalRevenue: number;
  pendingShipments: number;
  completedShipments: number;
  inTransitShipments: number;
  recentShipments: Array<{
    id: string;
    tracking_number: string;
    status: string;
    origin: string;
    destination: string;
    created_at: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalShipments: 0,
    totalRevenue: 0,
    pendingShipments: 0,
    completedShipments: 0,
    inTransitShipments: 0,
    recentShipments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, shipmentsRes, paymentsRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("shipments").select("*").order("created_at", { ascending: false }),
          supabase.from("payments").select("amount, status"),
        ]);

        const shipments = shipmentsRes.data || [];
        const payments = paymentsRes.data || [];

        const pendingShipments = shipments.filter(s => s.status === "pending" || s.status === "shipment_created" || s.status === "awaiting_warehouse").length;
        const completedShipments = shipments.filter(s => s.status === "delivered").length;
        const inTransitShipments = shipments.filter(s => s.status === "in_transit").length;
        const totalRevenue = payments
          .filter(p => p.status === "completed")
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const recentShipments = shipments.slice(0, 6).map(s => ({
          id: s.id,
          tracking_number: s.tracking_number,
          status: s.status,
          origin: `${s.origin_city}, ${s.origin_country}`,
          destination: `${s.destination_city}, ${s.destination_country}`,
          created_at: s.created_at,
        }));

        setStats({
          totalUsers: profilesRes.count || 0,
          totalShipments: shipments.length,
          totalRevenue,
          pendingShipments,
          completedShipments,
          inTransitShipments,
          recentShipments,
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
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Total Shipments",
      value: stats.totalShipments,
      icon: Package,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "+15.3%",
      trendUp: true,
    },
    {
      title: "In Transit",
      value: stats.inTransitShipments,
      icon: Truck,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: null,
      trendUp: false,
    },
    {
      title: "Pending",
      value: stats.pendingShipments,
      icon: Clock,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: null,
      trendUp: false,
    },
    {
      title: "Delivered",
      value: stats.completedShipments,
      icon: CheckCircle,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      trend: "+5.1%",
      trendUp: true,
    },
  ];

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      shipment_created: "bg-blue-50 text-blue-700 border-blue-200",
      awaiting_warehouse: "bg-orange-50 text-orange-700 border-orange-200",
      received_warehouse: "bg-cyan-50 text-cyan-700 border-cyan-200",
      processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
      in_transit: "bg-violet-50 text-violet-700 border-violet-200",
      arrived_nigeria: "bg-teal-50 text-teal-700 border-teal-200",
      ready_for_pickup: "bg-lime-50 text-lime-700 border-lime-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const quickLinks = [
    { name: "Users", href: "/admin/users", icon: Users, count: stats.totalUsers },
    { name: "Shipments", href: "/admin/shipments", icon: Package, count: stats.totalShipments },
    { name: "Payments", href: "/admin/payments", icon: DollarSign, count: null },
    { name: "Analytics", href: "/admin/analytics", icon: TrendingUp, count: null },
  ];

  return (
    <AdminLayout title="Dashboard" description="Overview of your logistics operations">
      <div className="space-y-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                      <Icon className={`w-4 h-4 ${stat.iconColor}`} strokeWidth={2} />
                    </div>
                    {stat.trend && (
                      <span className={`flex items-center gap-0.5 text-[11px] font-medium ${stat.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                        {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground tracking-tight leading-none mb-0.5">
                    {loading ? "—" : stat.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Shipments */}
          <div className="lg:col-span-2">
            <Card className="border-border/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Recent Shipments</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Latest shipment activity</p>
                </div>
                <Link to="/admin/shipments" className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors">
                  View All →
                </Link>
              </div>
              <div className="divide-y divide-border/30">
                {loading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                ) : stats.recentShipments.length > 0 ? (
                  stats.recentShipments.map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/20 transition-colors duration-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.06] flex-shrink-0">
                          <Package className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-foreground font-mono">{shipment.tracking_number}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{shipment.origin} → {shipment.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`${getStatusStyle(shipment.status)} text-[10px] font-medium border px-2 py-0.5 capitalize hidden sm:inline-flex`}>
                          {shipment.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(shipment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Package className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent shipments</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Links */}
          <div>
            <Card className="border-border/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="px-5 py-4 border-b border-border/30">
                <h3 className="text-sm font-semibold text-foreground">Quick Access</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Navigate to key sections</p>
              </div>
              <div className="p-3 space-y-1">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-primary/[0.06] hover:text-primary transition-all duration-150 group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-colors">
                        <Icon className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <span className="flex-1">{link.name}</span>
                      {link.count !== null && (
                        <span className="text-[11px] font-semibold text-muted-foreground/60 bg-muted/50 rounded-full px-2 py-0.5">
                          {link.count}
                        </span>
                      )}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>
                  );
                })}
              </div>
            </Card>

            {/* Summary Card */}
            <Card className="border-border/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] mt-4">
              <div className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Shipment Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">Pending</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: stats.totalShipments ? `${(stats.pendingShipments / stats.totalShipments) * 100}%` : "0%" }} />
                      </div>
                      <span className="text-[12px] font-semibold text-foreground w-6 text-right">{loading ? "—" : stats.pendingShipments}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">In Transit</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-400" style={{ width: stats.totalShipments ? `${(stats.inTransitShipments / stats.totalShipments) * 100}%` : "0%" }} />
                      </div>
                      <span className="text-[12px] font-semibold text-foreground w-6 text-right">{loading ? "—" : stats.inTransitShipments}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">Delivered</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div className="h-full rounded-full bg-green-400" style={{ width: stats.totalShipments ? `${(stats.completedShipments / stats.totalShipments) * 100}%` : "0%" }} />
                      </div>
                      <span className="text-[12px] font-semibold text-foreground w-6 text-right">{loading ? "—" : stats.completedShipments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
