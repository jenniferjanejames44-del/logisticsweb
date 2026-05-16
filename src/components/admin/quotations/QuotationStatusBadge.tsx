import { Badge } from "@/components/ui/badge";
import type { QuoteStatus } from "@/lib/quotations";

const map: Record<QuoteStatus, { variant: any; label: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  sent: { variant: "info", label: "Sent" },
  accepted: { variant: "success", label: "Accepted" },
  rejected: { variant: "error", label: "Rejected" },
  expired: { variant: "warning", label: "Expired" },
  converted: { variant: "default", label: "Converted" },
};

export const QuotationStatusBadge = ({ status }: { status: QuoteStatus }) => {
  const cfg = map[status] || map.draft;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

export default QuotationStatusBadge;