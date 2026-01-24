import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, Package, DollarSign } from "lucide-react";

interface AnalyticsData {
  shipmentsByStatus: Array<{ status: string; count: number }>;
  shipmentsByService: Array<{ service: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  shipmentsByMonth: Array<{ month: string; count: number }>;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
  revenue: { label: "Revenue", color: "hsl(var(--secondary))" },
};

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    shipmentsByStatus: [],
    shipmentsByService: [],
    revenueByMonth: [],
    shipmentsByMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch shipments
        const { data: shipments, error: shipmentsError } = await supabase
          .from("shipments")
          .select("*");

        if (shipmentsError) throw shipmentsError;

        // Fetch payments
        const { data: payments, error: paymentsError } = await supabase
          .from("payments")
          .select("*");

        if (paymentsError) throw paymentsError;

        // Process shipments by status
        const statusCounts: Record<string, number> = {};
        (shipments || []).forEach((s) => {
          statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
        });
        const shipmentsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.replace("_", " "),
          count,
        }));

        // Process shipments by service type
        const serviceCounts: Record<string, number> = {};
        (shipments || []).forEach((s) => {
          serviceCounts[s.service_type] = (serviceCounts[s.service_type] || 0) + 1;
        });
        const shipmentsByService = Object.entries(serviceCounts).map(([service, count]) => ({
          service: service.replace("_", " "),
          count,
        }));

        // Process revenue by month
        const revenueByMonth: Record<string, number> = {};
        (payments || [])
          .filter((p) => p.status === "completed")
          .forEach((p) => {
            const month = new Date(p.created_at).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
            revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(p.amount);
          });

        // Process shipments by month
        const shipmentsByMonth: Record<string, number> = {};
        (shipments || []).forEach((s) => {
          const month = new Date(s.created_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          shipmentsByMonth[month] = (shipmentsByMonth[month] || 0) + 1;
        });

        setData({
          shipmentsByStatus,
          shipmentsByService,
          revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({
            month,
            revenue,
          })),
          shipmentsByMonth: Object.entries(shipmentsByMonth).map(([month, count]) => ({
            month,
            count,
          })),
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights and performance metrics for your logistics operations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipments by Status - Bar Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Shipments by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.shipmentsByStatus.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data.shipmentsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="status" className="text-xs capitalize" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Shipments by Service Type - Pie Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Shipments by Service Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.shipmentsByService.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={data.shipmentsByService}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="service"
                      label={({ service, count }) => `${service}: ${count}`}
                    >
                      {data.shipmentsByService.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Revenue Over Time - Line Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.revenueByMonth.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={data.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--secondary))" }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No revenue data available</p>
              )}
            </CardContent>
          </Card>

          {/* Shipments Over Time - Line Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Shipments Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.shipmentsByMonth.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={data.shipmentsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No shipment data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
