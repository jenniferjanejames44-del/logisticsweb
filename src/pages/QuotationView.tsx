import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer, Loader2, FileWarning } from "lucide-react";

const functionsBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const QuotationView = () => {
  const [params] = useSearchParams();
  const id = params.get("id")?.trim() || "";
  const token = params.get("token")?.trim() || "";
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id || !token) {
        setError("This quotation link is incomplete. Please open the full link from your email.");
        return;
      }
      try {
        const res = await fetch(
          `${functionsBase}/view-quotation?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } },
        );
        const text = await res.text();
        if (cancelled) return;
        if (!res.ok) {
          setError("We could not load this quotation. It may be invalid or expired — please contact info@raclogisticltd.com.");
          return;
        }
        setHtml(text);
      } catch {
        if (!cancelled) setError("We could not load this quotation. Please check your internet connection and try again.");
      }
    })();
    return () => { cancelled = true; };
  }, [id, token]);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="sticky top-0 z-10 bg-[#061043] text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-wide truncate">RAC LOGISTICS LTD</p>
            <p className="text-[11px] text-white/70 truncate">Your reliable freight company</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="bg-[#DF5101] text-white hover:bg-[#c44801] border-0"
            disabled={!html}
            onClick={() => iframeRef.current?.contentWindow?.print()}
          >
            <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4">
        {error ? (
          <div className="bg-card border border-border rounded-lg p-10 text-center max-w-lg mx-auto mt-10">
            <FileWarning className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
            <p className="text-sm mt-4">
              <Link to="/contact" className="text-primary font-semibold underline">Contact us</Link>
            </p>
          </div>
        ) : html ? (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            title="RAC Logistics Quotation"
            className="w-full bg-transparent border-0"
            style={{ height: "calc(100vh - 90px)" }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your quotation...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationView;
