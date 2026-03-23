import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2, User, Shield, Paperclip, Download, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TicketMessage {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  user_id: string;
}

interface TicketAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  shipment_id: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const AdminSupportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");

  useEffect(() => {
    if (user && id) {
      fetchTicketDetails();
    }
  }, [user, id]);

  const fetchTicketDetails = async () => {
    if (!user || !id) return;

    setLoading(true);

    // Fetch ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from("support_tickets")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (ticketError || !ticketData) {
      toast({
        title: "Error",
        description: "Ticket not found.",
        variant: "destructive",
      });
      navigate("/admin/support");
      return;
    }

    setTicket(ticketData);
    setNewStatus(ticketData.status);
    setNewPriority(ticketData.priority);

    // Fetch messages
    const { data: messagesData } = await supabase
      .from("support_ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    setMessages(messagesData || []);

    // Fetch attachments
    const { data: attachmentsData } = await supabase
      .from("support_ticket_attachments")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    setAttachments(attachmentsData || []);

    setLoading(false);
  };

  const handleSendReply = async () => {
    if (!user || !id || !replyMessage.trim()) return;

    setIsSending(true);

    try {
      // Insert admin reply
      const { error: messageError } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: id,
          user_id: user.id,
          message: replyMessage,
          is_admin: true,
        });

      if (messageError) throw messageError;

      // Update ticket timestamp and status if changed
      const updates: any = { updated_at: new Date().toISOString() };
      
      if (newStatus !== ticket?.status) {
        updates.status = newStatus;
        if (newStatus === "resolved") {
          updates.resolved_at = new Date().toISOString();
        } else if (newStatus === "closed") {
          updates.closed_at = new Date().toISOString();
        }
      }

      if (newPriority !== ticket?.priority) {
        updates.priority = newPriority;
      }

      await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", id);

      // Send email notification to user
      if (ticket) {
        try {
          const customerEmail = (ticket.profiles as any)?.email;
          const customerName = (ticket.profiles as any)?.full_name;

          if (customerEmail) {
            await supabase.functions.invoke("send-notification-email", {
              body: {
                type: "admin_ticket_reply",
                data: {
                  ticket_id: ticket.id,
                  ticket_number: ticket.ticket_number,
                  subject: ticket.subject,
                  reply_message: replyMessage,
                  user_name: customerName || "",
                  user_email: customerEmail,
                },
              },
            });
          }
        } catch (emailErr) {
          console.error("Failed to send reply email:", emailErr);
        }
      }

      toast({
        title: "Reply Sent",
        description: "Your message has been sent to the customer.",
      });

      setReplyMessage("");
      fetchTicketDetails();
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id || !ticket) return;

    try {
      const updates: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
      } else if (status === "closed") {
        updates.closed_at = new Date().toISOString();
      }

      await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", id);

      // Notify user via in-app notification
      await supabase
        .from("notifications")
        .insert({
          user_id: ticket.user_id,
          type: "ticket_status_change",
          title: "Support Ticket Status Updated",
          message: `Your ticket #${ticket.ticket_number} status has been changed to ${status.replace(/_/g, " ")}`,
        });

      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${status.replace(/_/g, " ")}`,
      });

      setNewStatus(status);
      fetchTicketDetails();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Support Ticket" description="Loading ticket details...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <AdminLayout title={`Ticket #${ticket.ticket_number}`} description={ticket.subject}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/support")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Button>

        {/* Ticket Info & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Info */}
          <Card className="border-border/40 lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl mb-2">{ticket.subject}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="outline">{ticket.ticket_number}</Badge>
                    <Badge variant="secondary" className="capitalize">
                      {ticket.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer: {(ticket.profiles as any)?.full_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {(ticket.profiles as any)?.email || "N/A"}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Actions Card */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Ticket Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_for_customer">Waiting for Customer</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(ticket.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Thread */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.is_admin ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.is_admin
                          ? "bg-primary/10 text-primary"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {msg.is_admin ? (
                        <Shield className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <User className="w-5 h-5" strokeWidth={2.5} />
                      )}
                    </div>
                    <div className={`flex-1 ${msg.is_admin ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block max-w-[80%] p-4 rounded-2xl ${
                          msg.is_admin
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments ({attachments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/50 transition-colors"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.file_name}</p>
                        {att.file_size && (
                          <p className="text-xs text-muted-foreground">
                            {(att.file_size / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Reply Box */}
            {ticket.status !== "closed" && (
              <div className="mt-6 pt-6 border-t space-y-3">
                <Textarea
                  placeholder="Type your reply to the customer..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="min-h-[120px] rounded-xl"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendReply}
                    disabled={isSending || !replyMessage.trim()}
                    variant="dashAccent"
                    className="shadow-md shadow-accent/20"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {ticket.status === "closed" && (
              <div className="mt-6 pt-6 border-t">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/40 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">This ticket is closed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Change the status above to reopen if needed
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSupportDetail;

