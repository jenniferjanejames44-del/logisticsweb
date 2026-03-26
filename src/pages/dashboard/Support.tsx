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
import { Plus, MessageSquare, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    if (user) { fetchTickets(); fetchUserShipments(); }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (!error) setTickets(data || []);
    setLoading(false);
  };

  const fetchUserShipments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("shipments").select("id, tracking_number").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setShipments(data || []);
  };

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  };

  const handleCreateTicket = async () => {
    if (!user || !subject || !category || !message) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const ticketNumber = generateTicketNumber();
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({ ticket_number: ticketNumber, user_id: user.id, subject, category, shipment_id: shipmentId || null, status: "open", priority: "normal" })
        .select().single();
      if (ticketError) throw ticketError;

      const { error: messageError } = await supabase
        .from("support_ticket_messages")
        .insert({ ticket_id: ticket.id, user_id: user.id, message, is_admin: false });
      if (messageError) throw messageError;

      if (attachment && ticket.id) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${ticket.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('support-attachments').upload(fileName, attachment);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('support-attachments').getPublicUrl(fileName);
          await supabase.from("support_ticket_attachments").insert({
            ticket_id: ticket.id, file_name: attachment.name, file_url: publicUrl, file_size: attachment.size, file_type: attachment.type, uploaded_by: user.id,
          });
        }
      }

      try {
        const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("user_id", user.id).single();
        await supabase.functions.invoke("send-notification-email", {
          body: { type: "support_ticket_created", data: { ticket_id: ticket.id, ticket_number: ticketNumber, subject, category, user_name: profile?.full_name || "", user_email: profile?.email || user.email } },
        });
      } catch (emailErr) { console.error("Failed to send ticket email:", emailErr); }

      toast({ title: "Ticket Created", description: `Your support ticket ${ticketNumber} has been created successfully.` });
      setSubject(""); setCategory(""); setMessage(""); setShipmentId(""); setAttachment(null); setIsDialogOpen(false);
      fetchTickets();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create ticket.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "open") return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "in_progress") return "bg-orange-50 text-orange-700 border-orange-200";
    if (status === "resolved") return "bg-green-50 text-green-700 border-green-200";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout
      title="Support Center"
      description="Get help with your shipments and account"
      action={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 gap-0">
            <DialogHeader className="px-5 pt-5">
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-5 pt-3">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Issue Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
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
                    <SelectTrigger id="shipment" className="h-11"><SelectValue placeholder="Select shipment" /></SelectTrigger>
                    <SelectContent>
                      {shipments.map((s) => (<SelectItem key={s.id} value={s.id}>{s.tracking_number}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" placeholder="Describe your issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input id="attachment" type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="h-11" />
                  {attachment && (
                    <Button variant="ghost" size="iconSm" onClick={() => setAttachment(null)}><X className="w-4 h-4" /></Button>
                  )}
                </div>
                {attachment && <p className="text-xs text-muted-foreground">{attachment.name} ({(attachment.size / 1024).toFixed(2)} KB)</p>}
              </div>
              <Button onClick={handleCreateTicket} disabled={isCreating || !subject || !category || !message} variant="default" size="sm" className="w-full">
                {isCreating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>) : "Create Ticket"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-14">
            <MessageSquare className="mx-auto mb-3 w-12 h-12 text-muted-foreground/40" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Support Tickets</h3>
            <p className="text-sm text-muted-foreground mb-4">You haven't created any support tickets yet.</p>
            <Button variant="default" size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Create Your First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => window.location.href = `/dashboard/support/${ticket.id}`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">{ticket.subject}</h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{ticket.ticket_number}</Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">{ticket.category.replace(/_/g, " ")}</Badge>
                      <Badge className={`text-[10px] border ${getStatusColor(ticket.status)}`}>{ticket.status.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                  <span>Updated {new Date(ticket.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Support;
