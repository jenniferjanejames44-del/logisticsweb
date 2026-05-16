import { useEffect, useRef, useState } from "react";
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal-shell";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Quotation } from "@/lib/quotations";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  quote: Quotation | null;
  onUpdated?: () => void;
}

const PdfPreviewDialog = ({ open, onOpenChange, quote, onUpdated }: Props) => {
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastGeneratedQuoteId = useRef<string | null>(null);
  const onUpdatedRef = useRef(onUpdated);

  useEffect(() => {
    onUpdatedRef.current = onUpdated;
  }, [onUpdated]);

  useEffect(() => {
    if (!open || !quote) return;
    let cancelled = false;
    (async () => {
      if (lastGeneratedQuoteId.current === quote.id && html) return;
      setLoading(true);
      setHtml(null);
      try {
        const generated = await supabase.functions.invoke("generate-quotation-pdf", {
          body: { quotation_id: quote.id },
        });
        if (generated.error) throw generated.error;
        const data = generated.data as { file_path?: string } | null;
        if (cancelled) return;
        if (data?.file_path) {
          const { data: file } = await supabase.storage
            .from("invoices")
            .download(data.file_path);
          if (file) {
            const text = await file.text();
            setHtml(text);
            lastGeneratedQuoteId.current = quote.id;
          }
          onUpdatedRef.current?.();
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Failed to generate quotation PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, quote?.id, quote?.pdf_url, html]);

  const handlePrint = () => iframeRef.current?.contentWindow?.print();
  const handleDownload = () => {
    if (!html || !quote) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quote.quote_number}-RAC-Quotation.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModalShell open={open} onOpenChange={onOpenChange} size="lg" ariaTitle="Quotation Preview" className="sm:max-w-4xl">
      <ModalHeader
        title="Quotation Preview"
        subtitle={quote?.quote_number}
        icon={<FileText className="w-5 h-5" />}
      />
      <ModalBody className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating quotation...</p>
          </div>
        ) : html ? (
          <iframe ref={iframeRef} srcDoc={html} title="Quotation" className="w-full h-[60vh] bg-white" />
        ) : (
          <div className="py-20 text-center text-sm text-muted-foreground">No preview available</div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={handlePrint} disabled={!html} className="sm:flex-1">
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button onClick={handleDownload} disabled={!html} className="sm:flex-1">
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
      </ModalFooter>
    </ModalShell>
  );
};

export default PdfPreviewDialog;