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

      // Fetch shipments
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

      // Fetch payments
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
      <Badge variant={config.variant} className="gap-1">
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
      {/* Stats Grid - Enhanced & Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <Card className="border-border/50 card-premium hover:shadow-card-hover transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Shipments</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 card-premium hover:shadow-card-hover transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">In Transit</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.inTransit}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 card-premium hover:shadow-card-hover transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Delivered</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.delivered}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 card-premium hover:shadow-card-hover transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Spent</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">${totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Enhanced & Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <Card className="border-border/50 card-premium hover:border-secondary/50 hover:shadow-card-hover transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6">
            <Link to="/dashboard/shipments" className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent text-accent-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Create Shipment</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Start a new shipment</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 card-premium hover:border-primary/50 hover:shadow-card-hover transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6">
            <Link to="/pricing" className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Get Quote</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Calculate shipping cost</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 card-premium hover:border-muted-foreground/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer group sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <Link to="/contact" className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted text-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Contact Support</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Get help with shipments</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments - Enhanced & Responsive */}
      <Card className="border-border/50 card-premium">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-6">
          <CardTitle className="font-heading text-lg sm:text-xl">Recent Shipments</CardTitle>
          <Button variant="link" className="text-accent p-0 h-auto justify-start sm:justify-end" asChild>
            <Link to="/dashboard/shipments">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {recentShipments.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{shipment.tracking_number}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        To: {shipment.destination_country}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(shipment.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">No shipments yet</p>
              <Button variant="cta" className="mt-3 sm:mt-4" size="sm" asChild>
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
