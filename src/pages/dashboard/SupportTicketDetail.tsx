import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2, User, Shield, Paperclip, Download } from "lucide-react";
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
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const SupportTicketDetail = () => {
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
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (ticketError || !ticketData) {
      toast({
        title: "Error",
        description: "Ticket not found or you don't have access to it.",
        variant: "destructive",
      });
      navigate("/dashboard/support");
      return;
    }

    setTicket(ticketData);

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
      const { error } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: id,
          user_id: user.id,
          message: replyMessage,
          is_admin: false,
        });

      if (error) throw error;

      // Update ticket status if it was resolved/closed
      if (ticket?.status === "resolved" || ticket?.status === "closed") {
        await supabase
          .from("support_tickets")
          .update({ status: "waiting_for_customer", updated_at: new Date().toISOString() })
          .eq("id", id);
      } else {
        await supabase
          .from("support_tickets")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", id);
      }

      toast({
        title: "Reply Sent",
        description: "Your message has been sent to our support team.",
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

  if (loading) {
    return (
      <DashboardLayout title="Support Ticket" description="Loading ticket details...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <DashboardLayout title={`Ticket #${ticket.ticket_number}`} description={ticket.subject}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="dashOutline"
          onClick={() => navigate("/dashboard/support")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Button>

        {/* Ticket Info Card */}
        <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="mb-3 text-foreground">{ticket.subject}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{ticket.ticket_number}</Badge>
                  <Badge variant="secondary" className="capitalize">
                    {ticket.category.replace(/_/g, " ")}
                  </Badge>
                  <Badge
                    className={`${
                      ticket.status === "open"
                        ? "bg-blue-100 text-blue-700"
                        : ticket.status === "in_progress"
                        ? "bg-orange-100 text-orange-700"
                        : ticket.status === "waiting_for_customer"
                        ? "bg-purple-100 text-purple-700"
                        : ticket.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ticket.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(ticket.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages Thread */}
        <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.is_admin ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
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
                    <div className={`flex-1 ${msg.is_admin ? "text-left" : "text-right"}`}>
                      <div
                        className={`inline-block max-w-[80%] rounded-lg p-4 ${
                          msg.is_admin
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
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
              <div className="mt-6 border-t pt-6">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Paperclip className="w-4 h-4" />
                  Attachments ({attachments.length})
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/25 hover:bg-muted/30"
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

            {/* Reply Box */}
            {ticket.status !== "closed" && (
              <div className="mt-6 space-y-3 border-t pt-6">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="min-h-[100px] rounded-lg"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendReply}
                    disabled={isSending || !replyMessage.trim()}
                    variant="dashAccent"
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
              <div className="mt-6 border-t pt-6">
                <div className="rounded-lg border border-border bg-muted/50 p-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    This ticket has been closed. Please create a new ticket if you need further assistance.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupportTicketDetail;

