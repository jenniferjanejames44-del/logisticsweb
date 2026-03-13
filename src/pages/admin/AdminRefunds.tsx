import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Loader2, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Refund {
  id: string;
  refund_number: string;
  user_id: string;
  amount: number;
  refund_type: string;
  refund_reason: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminRefunds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [refundType, setRefundType] = useState("wallet");
  const [refundReason, setRefundReason] = useState("");
  const [notes, setNotes] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [ticketId, setTicketId] = useState("");
  
  const [users, setUsers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchRefunds();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserShipments(selectedUserId);
      fetchUserTickets(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchRefunds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("refunds")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching refunds:", error);
    } else {
      setRefunds(data || []);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .order("full_name");
    setUsers(data || []);
  };

  const fetchUserShipments = async (userId: string) => {
    const { data } = await supabase
      .from("shipments")
      .select("id, tracking_number")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setShipments(data || []);
  };

  const fetchUserTickets = async (userId: string) => {
    const { data } = await supabase
      .from("support_tickets")
      .select("id, ticket_number, subject")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setTickets(data || []);
  };

  const generateRefundNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REF-${timestamp}-${random}`;
  };

  const handleProcessRefund = async () => {
    if (!user || !selectedUserId || !amount || !refundReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const refundNumber = generateRefundNumber();

      // Create refund record
      const { data: refund, error: refundError } = await supabase
        .from("refunds")
        .insert({
          refund_number: refundNumber,
          user_id: selectedUserId,
          shipment_id: shipmentId || null,
          ticket_id: ticketId || null,
          amount: numAmount,
          refund_type: refundType,
          refund_reason: refundReason,
          status: refundType === "wallet" ? "processing" : "pending",
          processed_by: user.id,
          notes,
        })
        .select()
        .single();

      if (refundError) throw refundError;

      // If wallet refund, process immediately
      if (refundType === "wallet") {
        // Get current wallet balance
        const { data: walletData } = await supabase
          .from("wallet_balances")
          .select("balance")
          .eq("user_id", selectedUserId)
          .single();

        const currentBalance = walletData?.balance || 0;
        const newBalance = currentBalance + numAmount;

        // Update wallet balance
        await supabase
          .from("wallet_balances")
          .upsert({
            user_id: selectedUserId,
            balance: newBalance,
          });

        // Create wallet transaction
        await supabase
          .from("wallet_transactions")
          .insert({
            user_id: selectedUserId,
            amount: numAmount,
            type: "credit",
            description: `Refund: ${refundReason}`,
            reference: refundNumber,
          });

        // Update refund status
        await supabase
          .from("refunds")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
            transaction_reference: refundNumber,
          })
          .eq("id", refund.id);
      }

      // Create notification for user
      await supabase
        .from("user_notifications")
        .insert({
          user_id: selectedUserId,
          type: "refund_issued",
          title: "Refund Processed",
          message: `A refund of $${numAmount.toLocaleString()} has been ${
            refundType === "wallet" ? "added to your wallet" : "initiated"
          }. Reason: ${refundReason}`,
          link: "/dashboard/wallet",
          refund_id: refund.id,
        });

      toast({
        title: "Refund Processed",
        description: `Refund ${refundNumber} has been ${
          refundType === "wallet" ? "completed" : "created"
        } successfully.`,
      });

      // Reset form
      setSelectedUserId("");
      setAmount("");
      setRefundType("wallet");
      setRefundReason("");
      setNotes("");
      setShipmentId("");
      setTicketId("");
      setIsDialogOpen(false);
      
      fetchRefunds();
    } catch (error: any) {
      console.error("Error processing refund:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.refund_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (refund.profiles as any)?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: refunds.length,
    pending: refunds.filter((r) => r.status === "pending").length,
    processing: refunds.filter((r) => r.status === "processing").length,
    completed: refunds.filter((r) => r.status === "completed").length,
    totalAmount: refunds
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <AdminLayout title="Refund Management" description="Process and manage customer refunds">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Refunds</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
              <p className="text-xl font-bold text-foreground">${stats.totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Header with Process Refund Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Refund History</h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and process customer refunds
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="dashAccent" size="dash" className="shadow-md shadow-accent/20">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Process Refund
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Process Customer Refund</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Customer *</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger id="user" className="h-11 rounded-xl">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.user_id} value={u.user_id}>
                          {u.full_name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-11 rounded-xl"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refundType">Refund Type *</Label>
                    <Select value={refundType} onValueChange={setRefundType}>
                      <SelectTrigger id="refundType" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wallet">Refund to Wallet</SelectItem>
                        <SelectItem value="payment_method">Refund to Payment Method</SelectItem>
                        <SelectItem value="manual_adjustment">Manual Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedUserId && shipments.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="shipment">Related Shipment (Optional)</Label>
                    <Select value={shipmentId} onValueChange={setShipmentId}>
                      <SelectTrigger id="shipment" className="h-11 rounded-xl">
                        <SelectValue placeholder="Select shipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {shipments.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.tracking_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedUserId && tickets.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="ticket">Related Ticket (Optional)</Label>
                    <Select value={ticketId} onValueChange={setTicketId}>
                      <SelectTrigger id="ticket" className="h-11 rounded-xl">
                        <SelectValue placeholder="Select ticket" />
                      </SelectTrigger>
                      <SelectContent>
                        {tickets.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.ticket_number} - {t.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Refund Reason *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain the reason for this refund..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="min-h-[80px] rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any internal notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[60px] rounded-xl"
                  />
                </div>

                <Button
                  onClick={handleProcessRefund}
                  disabled={isProcessing || !selectedUserId || !amount || !refundReason}
                  className="w-full h-11 rounded-xl"
                  variant="dashAccent"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Process Refund
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                <Input
                  placeholder="Search refunds..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Refunds List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="text-center py-12">
              <DollarSign className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">No Refunds Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No refunds have been processed yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRefunds.map((refund) => (
              <Card key={refund.id} className="border-border/40 hover:border-primary/25 hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-2">
                        Refund #{refund.refund_number}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {refund.refund_type.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          className={`text-xs ${
                            refund.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : refund.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : refund.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {refund.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Customer: {(refund.profiles as any)?.full_name || "Unknown"} ({(refund.profiles as any)?.email || "N/A"})
                      </p>
                      <p className="text-sm text-foreground font-medium">
                        Reason: {refund.refund_reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${refund.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(refund.created_at).toLocaleDateString()}</span>
                    {refund.processed_at && (
                      <span>Processed {new Date(refund.processed_at).toLocaleDateString()}</span>
                    )}
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

export default AdminRefunds;

