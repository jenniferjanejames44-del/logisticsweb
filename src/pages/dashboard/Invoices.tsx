import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  FileText,
  Search,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (user) fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, shipments(tracking_number, status, service_type)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) setInvoices(data as unknown as Invoice[]);
    setLoading(false);
  };

  const handleDownload = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice_id: invoice.id },
      });

      if (error) throw error;

      const filePath = data.file_path || `${user!.id}/${invoice.invoice_number}.html`;
      const { data: fileData, error: dlError } = await supabase.storage
        .from("invoices")
        .download(filePath);

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
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      unpaid: { variant: "secondary", icon: Clock },
      paid: { variant: "outline", icon: CheckCircle },
      overdue: { variant: "destructive", icon: AlertTriangle },
    };
    const c = config[status] || config.unpaid;
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className={`gap-1 capitalize ${status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/30' : ''}`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const totalUnpaid = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);

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
          <div className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Invoices" description="View and download your invoices">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{invoices.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpaid</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent">₦{totalUnpaid.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-500">₦{totalPaid.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice or tracking number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
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
        <div className="grid gap-4">
          {filtered.map((invoice) => (
            <Card key={invoice.id} className="border-border/50 hover:shadow-card transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <h3 className="font-semibold text-foreground">{invoice.invoice_number}</h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                        {invoice.shipments && (
                          <span>Shipment: {invoice.shipments.tracking_number}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ₦{Number(invoice.amount).toFixed(2)}
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(invoice)}
                      disabled={downloading === invoice.id}
                    >
                      {downloading === invoice.id ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No Invoices Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Your invoices will appear here when you create shipments"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Viewer Dialog */}
      <Dialog open={!!invoiceHtml} onOpenChange={(open) => !open && setInvoiceHtml(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Invoice Preview</DialogTitle>
              <Button size="sm" onClick={handlePrint} className="mr-6">
                Print / Save as PDF
              </Button>
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
