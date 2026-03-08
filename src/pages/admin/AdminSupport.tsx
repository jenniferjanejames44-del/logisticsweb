import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, Loader2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminSupport = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);

    let query = supabase
      .from("support_tickets")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tickets:", error);
    } else {
      setTickets(data || []);
    }

    setLoading(false);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.profiles as any)?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-700 border-blue-300",
      in_progress: "bg-orange-100 text-orange-700 border-orange-300",
      waiting_for_customer: "bg-purple-100 text-purple-700 border-purple-300",
      resolved: "bg-green-100 text-green-700 border-green-300",
      closed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[status] || colors.open;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-600",
      normal: "bg-blue-100 text-blue-600",
      high: "bg-orange-100 text-orange-600",
      urgent: "bg-red-100 text-red-600",
    };
    return colors[priority] || colors.normal;
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <AdminLayout title="Support Tickets" description="Manage customer support requests">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Tickets</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Open</p>
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="shipment_issue">Shipment Issue</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="refund_request">Refund Request</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">No Tickets Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No support tickets have been created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="border-border/40 hover:border-primary/25 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/admin/support/${ticket.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-2">{ticket.subject}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {ticket.ticket_number}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {ticket.category.replace(/_/g, " ")}
                        </Badge>
                        <Badge className={`text-xs border ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace(/_/g, " ")}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Customer: {(ticket.profiles as any)?.full_name || "Unknown"} ({(ticket.profiles as any)?.email || "N/A"})
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>Updated {new Date(ticket.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;

