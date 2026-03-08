import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Loader2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatusBadge from "@/components/shipments/StatusBadge";
import { Badge } from "@/components/ui/badge";

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchUserShipments();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tickets:", error);
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const fetchUserShipments = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("shipments")
      .select("id, tracking_number")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setShipments(data || []);
  };

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  };

  const handleCreateTicket = async () => {
    if (!user || !subject || !category || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const ticketNumber = generateTicketNumber();

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          ticket_number: ticketNumber,
          user_id: user.id,
          subject,
          category,
          shipment_id: shipmentId || null,
          status: "open",
          priority: "normal",
        })
        .select()
        .single();

      if (ticketError) {
        console.error("Ticket creation error:", ticketError);
        throw ticketError;
      }

      // Create initial message
      const { error: messageError } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          message,
          is_admin: false,
        });

      if (messageError) throw messageError;

      // Handle attachment if present
      if (attachment && ticket.id) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${ticket.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('support-attachments')
          .upload(fileName, attachment);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('support-attachments')
            .getPublicUrl(fileName);

          await supabase
            .from("support_ticket_attachments")
            .insert({
              ticket_id: ticket.id,
              file_name: attachment.name,
              file_url: publicUrl,
              file_size: attachment.size,
              file_type: attachment.type,
              uploaded_by: user.id,
            });
        }
      }

      toast({
        title: "Ticket Created",
        description: `Your support ticket ${ticketNumber} has been created successfully.`,
      });

      // Reset form
      setSubject("");
      setCategory("");
      setMessage("");
      setShipmentId("");
      setAttachment(null);
      setIsDialogOpen(false);
      
      fetchTickets();
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout title="Support Center" description="Get help with your shipments and account">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Support Tickets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage your support requests
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="dashAccent" size="dash" className="shadow-md shadow-accent/20">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Issue Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="h-11 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipment_issue">Shipment Issue</SelectItem>
                      <SelectItem value="payment_issue">Payment Issue</SelectItem>
                      <SelectItem value="refund_request">Refund Request</SelectItem>
                      <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {category === "shipment_issue" && shipments.length > 0 && (
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

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachment (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="attachment"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                      className="h-11 rounded-xl"
                    />
                    {attachment && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAttachment(null)}
                        className="h-11 w-11"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {attachment && (
                    <p className="text-xs text-muted-foreground">
                      {attachment.name} ({(attachment.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCreateTicket}
                  disabled={isCreating || !subject || !category || !message}
                  className="w-full h-11 rounded-xl"
                  variant="dashAccent"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground/50" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2">No Support Tickets</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any support tickets yet.
              </p>
              <Button variant="dashAccent" size="dash" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Create Your First Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="border-border/40 hover:border-primary/25 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => window.location.href = `/dashboard/support/${ticket.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-2">{ticket.subject}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {ticket.ticket_number}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {ticket.category.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          className={`text-xs ${
                            ticket.status === "open"
                              ? "bg-blue-100 text-blue-700"
                              : ticket.status === "in_progress"
                              ? "bg-orange-100 text-orange-700"
                              : ticket.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ticket.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
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
    </DashboardLayout>
  );
};

export default Support;

