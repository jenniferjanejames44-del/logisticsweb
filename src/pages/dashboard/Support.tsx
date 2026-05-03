import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Loader2, X } from "lucide-react";
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal-shell";
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
    if (status === "in_progress") return "bg-accent/8 text-accent border-accent/20";
    if (status === "resolved") return "bg-green-50 text-green-700 border-green-200";
    return "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout
      title="Support Center"
      description="Get help with your shipments and account"
      action={
        <>
          <Button variant="default" size="sm" className="h-9 text-[13px]" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Ticket
          </Button>
          <ModalShell
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            ariaTitle="Create Support Ticket"
          >
            <ModalHeader title="Create Support Ticket" subtitle="We'll respond within 24 hours" icon={<Plus className="w-5 h-5" />} />
            <ModalBody className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-[12px]">Subject *</Label>
                <Input id="subject" placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 text-[13px] border-border/60" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[12px]">Issue Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="h-10 text-[13px] border-border/60"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipment_issue">Shipment Issue</SelectItem>
                    <SelectItem value="payment_issue">Payment Issue</SelectItem>
                    <SelectItem value="refund_request">Refund Request</SelectItem>
                    <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {category === "shipment_issue" && shipments.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="shipment" className="text-[12px]">Related Shipment (Optional)</Label>
                  <Select value={shipmentId} onValueChange={setShipmentId}>
                    <SelectTrigger id="shipment" className="h-10 text-[13px] border-border/60"><SelectValue placeholder="Select shipment" /></SelectTrigger>
                    <SelectContent>
                      {shipments.map((s) => (<SelectItem key={s.id} value={s.id}>{s.tracking_number}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-[12px]">Message *</Label>
                <Textarea id="message" placeholder="Describe your issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px] text-[13px] border-border/60" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="attachment" className="text-[12px]">Attachment (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input id="attachment" type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="h-10 text-[13px] border-border/60" />
                  {attachment && (
                    <Button variant="ghost" size="iconSm" onClick={() => setAttachment(null)}><X className="w-3.5 h-3.5" /></Button>
                  )}
                </div>
                {attachment && <p className="text-[11px] text-muted-foreground">{attachment.name} ({(attachment.size / 1024).toFixed(2)} KB)</p>}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-11 sm:h-12">
                Cancel
              </Button>
              <Button onClick={handleCreateTicket} disabled={isCreating || !subject || !category || !message} className="flex-1 h-11 sm:h-12">
                {isCreating ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating…</>) : "Create Ticket"}
              </Button>
            </ModalFooter>
          </ModalShell>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="text-center py-14">
            <MessageSquare className="mx-auto mb-3 w-12 h-12 text-muted-foreground/20" />
            <h3 className="text-sm font-semibold text-foreground mb-1">No Support Tickets</h3>
            <p className="text-[12px] text-muted-foreground mb-4">You haven't created any support tickets yet.</p>
            <Button variant="default" size="sm" onClick={() => setIsDialogOpen(true)} className="h-9 text-[13px]">
              <Plus className="w-3.5 h-3.5" />
              Create Your First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2.5">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer border-border/50 transition-all duration-200 hover:shadow-sm hover:border-border"
              onClick={() => window.location.href = `/dashboard/support/${ticket.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold text-foreground mb-1.5">{ticket.subject}</h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] border-border/60">{ticket.ticket_number}</Badge>
                      <Badge variant="secondary" className="text-[9px] capitalize">{ticket.category.replace(/_/g, " ")}</Badge>
                      <Badge className={`text-[9px] border ${getStatusColor(ticket.status)}`}>{ticket.status.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 mt-3 pt-3 border-t border-border/30">
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
