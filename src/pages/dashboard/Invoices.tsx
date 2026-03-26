import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText, Search, Download, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle, type LucideIcon,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string | null;
  status: string;
  due_date: string | null;
  payment_reference: string | null;
  pdf_url: string | null;
  created_at: string;
  shipment_id: string;
  shipments: { tracking_number: string; status: string; service_type: string } | null;
}

const Invoices = () => {
  const { user } = useAuth();
  const { convertAmount, formatConverted, formatMoney, selectedCurrency } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("invoices")
      .select("*, shipments(tracking_number, status, service_type)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setInvoices(data as unknown as Invoice[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchInvoices();
  }, [user, fetchInvoices]);

  const handleDownload = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice_id: invoice.id },
      });
      if (error) throw error;
      const filePath = data.file_path || `${user!.id}/${invoice.invoice_number}.html`;
      const { data: fileData, error: dlError } = await supabase.storage.from("invoices").download(filePath);
      if (dlError) throw dlError;
      const htmlText = await fileData.text();
      setInvoiceHtml(htmlText);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download invoice");
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: LucideIcon }> = {
      unpaid: { variant: "secondary", icon: Clock },
      paid: { variant: "outline", icon: CheckCircle },
      overdue: { variant: "destructive", icon: AlertTriangle },
    };
    const c = config[status] || config.unpaid;
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className={`gap-1 capitalize ${status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : ''}`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const totalUnpaid = invoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + convertAmount(Number(i.amount), i.currency || 'USD'), 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + convertAmount(Number(i.amount), i.currency || 'USD'), 0);

  const filtered = invoices.filter(i => {
    const matchesSearch = i.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.shipments?.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout title="Invoices" description="View and download your invoices">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Invoices" description="View and download your invoices">
      {/* Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: "Total Invoices", value: invoices.length, icon: FileText, color: "text-primary", bg: "bg-primary/8" },
          { label: "Unpaid", value: formatMoney(totalUnpaid, selectedCurrency), icon: Clock, color: "text-accent", bg: "bg-accent/8" },
          { label: "Paid", value: formatMoney(totalPaid, selectedCurrency), icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/8" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground sm:text-2xl truncate">{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`w-[18px] h-[18px] ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoice or tracking..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 pl-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-full sm:w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      {filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((invoice) => (
            <Card key={invoice.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/8">
                      <FileText className="w-[18px] h-[18px] text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{invoice.invoice_number}</h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {invoice.shipments && <span>Shipment: {invoice.shipments.tracking_number}</span>}
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatConverted(Number(invoice.amount), invoice.currency || 'USD')}
                        </span>
                        {invoice.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(invoice)} disabled={downloading === invoice.id}>
                    {downloading === invoice.id ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Invoices Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Your invoices will appear here when you create shipments"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Viewer Dialog */}
      <Dialog open={!!invoiceHtml} onOpenChange={(open) => !open && setInvoiceHtml(null)}>
        <DialogContent className="flex h-[85vh] max-w-4xl flex-col p-0">
          <DialogHeader className="px-6 pt-5 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Invoice Preview</DialogTitle>
              <Button size="sm" onClick={handlePrint} className="mr-6">Print / Save as PDF</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <iframe
              ref={iframeRef}
              srcDoc={invoiceHtml || ""}
              className="w-full h-full border border-border rounded-lg"
              title="Invoice Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Invoices;
