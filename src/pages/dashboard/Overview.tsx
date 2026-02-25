import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ShipmentStats>({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
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
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      in_transit: { variant: "default", icon: Truck },
      delivered: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1 text-[11px]">
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8 lg:mb-10">
        {[
          { label: "Total Shipments", value: stats.total, icon: Package, iconBg: "bg-primary/8" , iconColor: "text-primary" },
          { label: "In Transit", value: stats.inTransit, icon: Truck, iconBg: "bg-primary/8", iconColor: "text-primary" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle, iconBg: "bg-success/8", iconColor: "text-success" },
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
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 ${stat.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-8 lg:mb-10">
        {[
          { label: "Create Shipment", desc: "Start a new shipment", icon: Plus, href: "/dashboard/shipments", iconBg: "bg-accent", iconColor: "text-accent-foreground" },
          { label: "Get Quote", desc: "Calculate shipping cost", icon: CreditCard, href: "/pricing", iconBg: "bg-primary", iconColor: "text-primary-foreground" },
          { label: "Contact Support", desc: "Get help with shipments", icon: Package, href: "/contact", iconBg: "bg-muted", iconColor: "text-foreground" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.label} className="border-border/40 hover:border-border hover:shadow-xs transition-all cursor-pointer group">
              <CardContent className="p-4 sm:p-5">
                <Link to={action.href} className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 ${action.iconBg} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}>
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

      {/* Recent Shipments */}
      <Card className="border-border/40">
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
                      <p className="font-medium text-foreground text-[0.875rem] truncate">{shipment.tracking_number}</p>
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
              <Button variant="cta" size="lg" asChild>
                <Link to="/dashboard/shipments">Create Your First Shipment</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Overview;
