import { useEffect, useState } from "react";
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildWhatsAppMessage, buildWhatsAppUrl, type Quotation } from "@/lib/quotations";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  quote: Quotation | null;
  pdfLink?: string;
  onSent?: () => void;
}

const WhatsAppShareDialog = ({ open, onOpenChange, quote, pdfLink, onSent }: Props) => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (quote && open) {
      setPhone(quote.customer_phone || "");
      setMessage(buildWhatsAppMessage(quote, pdfLink));
    }
  }, [quote, open, pdfLink]);

  if (!quote) return null;

  const handleOpen = async () => {
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    const url = buildWhatsAppUrl(phone, message);
    window.open(url, "_blank", "noopener,noreferrer");
    try {
      await (supabase as any)
        .from("quotations")
        .update({ status: quote.status === "draft" ? "sent" : quote.status, sent_at: new Date().toISOString() })
        .eq("id", quote.id);
      toast.success("Quotation marked as sent");
      onSent?.();
    } catch (e) {
      console.error(e);
    }
    onOpenChange(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    toast.success("Message copied");
  };

  return (
    <ModalShell open={open} onOpenChange={onOpenChange} ariaTitle="Send via WhatsApp">
      <ModalHeader
        title="Send via WhatsApp"
        subtitle={quote.quote_number}
        icon={<MessageCircle className="w-5 h-5" />}
      />
      <ModalBody>
        <div>
          <Label>Customer Phone (with country code)</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2348012345678" />
          <p className="mt-1 text-xs text-muted-foreground">Only digits are used to build the WhatsApp link.</p>
        </div>
        <div>
          <Label>Message</Label>
          <Textarea rows={12} value={message} onChange={(e) => setMessage(e.target.value)} className="font-mono text-sm" />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={handleCopy} className="sm:flex-1">
          <Copy className="w-4 h-4 mr-2" /> Copy
        </Button>
        <Button onClick={handleOpen} className="sm:flex-1">
          <ExternalLink className="w-4 h-4 mr-2" /> Open WhatsApp
        </Button>
      </ModalFooter>
    </ModalShell>
  );
};

export default WhatsAppShareDialog;