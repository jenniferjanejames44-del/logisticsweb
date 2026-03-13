import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, FileText, DollarSign, CheckCircle, Loader2, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  shipment_id: string;
  amount: number;
  status: string;
  due_date: string | null;
  payment_reference: string | null;
  pdf_url: string | null;
  created_at: string;
  shipments: { tracking_number: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    unpaid: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    overdue: "bg-destructive/10 text-destructive",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [marking, setMarking] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();

  const fetchInvoices = async () => {
    try {
      const { data: invoiceData, error } = await supabase
        .from("invoices").select("*, shipments(tracking_number)").order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((invoiceData || []).map(i => i.user_id))];
      const { data: profileData } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
      const profileMap = new Map((profileData || []).map(p => [p.user_id, p]));
      const enriched = (invoiceData || []).map(inv => ({ ...inv, profiles: profileMap.get(inv.user_id) || null }));
      setInvoices(enriched as Invoice[]);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const openPayDialog = (invoice: Invoice) => { setSelectedInvoice(invoice); setPaymentRef(""); setPayDialogOpen(true); };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;
    setMarking(true);
    try {
      const { error } = await supabase.from("invoices").update({ status: "paid", payment_reference: paymentRef || null }).eq("id", selectedInvoice.id);
      if (error) throw error;
      toast.success("Invoice marked as paid");
      setPayDialogOpen(false);
      fetchInvoices();
    } catch (err) {
      console.error("Error marking paid:", err);
      toast.error("Failed to update invoice");
    } finally {
      setMarking(false);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", { body: { invoice_id: invoice.id } });
      if (error) throw error;
      const filePath = data.file_path || `${invoice.user_id}/${invoice.invoice_number}.html`;
      const { data: fileData, error: dlError } = await supabase.storage.from("invoices").download(filePath);
      if (dlError) throw dlError;
      const htmlText = await fileData.text();
      setInvoiceHtml(htmlText);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download invoice");
    }
  };

  const handlePrint = () => { iframeRef.current?.contentWindow?.print(); };

  const filtered = invoices.filter(i => {
    const matchesSearch =
      i.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.shipments?.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalUnpaid = invoices.filter(i => i.status === "unpaid").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <AdminLayout title="Invoice Management" description="Track and manage all customer invoices">
      <div className="space-y-6 sm:space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6">
          <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs sm:text-sm text-muted-foreground">Paid Revenue</p><p className="text-xl sm:text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p></div>
                <div className="rounded-lg bg-success/10 p-3"><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs sm:text-sm text-muted-foreground">Unpaid Invoices</p><p className="text-xl sm:text-2xl font-bold text-foreground">${totalUnpaid.toLocaleString()}</p></div>
                <div className="rounded-lg bg-warning/10 p-3"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-warning" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs sm:text-sm text-muted-foreground">Total Invoices</p><p className="text-xl sm:text-2xl font-bold text-foreground">{invoices.length}</p></div>
                <div className="rounded-lg bg-primary/10 p-3"><FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <CardHeader className="p-6 pb-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />All Invoices ({filtered.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search invoices..." className="h-11 rounded-lg pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 w-full rounded-lg sm:w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading invoices...</p>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No invoices found</p>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {filtered.map((invoice) => (
                  <div key={invoice.id} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-sm text-foreground">{invoice.invoice_number}</span>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Customer</p>
                        <p className="text-foreground truncate">{invoice.profiles?.full_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Amount</p>
                        <p className="text-foreground font-medium">${Number(invoice.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Shipment</p>
                        <p className="text-foreground font-mono text-xs">{invoice.shipments?.tracking_number || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Due Date</p>
                        <p className="text-foreground">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                      {invoice.status === "unpaid" && (
                        <Button variant="default" className="h-11 flex-1 rounded-lg" onClick={() => openPayDialog(invoice)}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />Mark Paid
                        </Button>
                      )}
                      <Button variant="outline" className="h-11 flex-1 rounded-lg" onClick={() => handleDownload(invoice)}>
                        <Download className="w-3.5 h-3.5 mr-1" />View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="-mx-6 overflow-x-auto px-6">
                <div className="min-w-[1020px] overflow-hidden rounded-lg border border-border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          <div><p className="font-medium">{invoice.profiles?.full_name || "N/A"}</p><p className="text-xs text-muted-foreground">{invoice.profiles?.email || ""}</p></div>
                        </TableCell>
                        <TableCell className="font-mono">{invoice.shipments?.tracking_number || "N/A"}</TableCell>
                        <TableCell className="font-medium">${Number(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell><Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge></TableCell>
                        <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>{invoice.payment_reference || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {invoice.status === "unpaid" && (
                              <Button variant="default" size="sm" className="rounded-lg" onClick={() => openPayDialog(invoice)}>
                                <CheckCircle className="w-3 h-3 mr-1" />Mark Paid
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => handleDownload(invoice)}>
                              <Download className="w-3 h-3 mr-1" />View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mark Paid Dialog */}
        <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-lg border border-border bg-background p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-foreground">Mark Invoice as Paid</DialogTitle>
              <DialogDescription>Confirm payment for {selectedInvoice?.invoice_number} — ${Number(selectedInvoice?.amount || 0).toFixed(2)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="payRef">Payment Reference (optional)</Label>
                <Input id="payRef" placeholder="e.g. Bank transfer ref, receipt #" className="h-11 rounded-lg" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 px-6 pb-6 sm:flex-row">
              <Button variant="outline" onClick={() => setPayDialogOpen(false)} className="h-11 w-full rounded-lg sm:w-auto">Cancel</Button>
              <Button onClick={handleMarkPaid} disabled={marking} className="h-11 w-full rounded-lg sm:w-auto">
                {marking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><CheckCircle className="w-4 h-4 mr-2" />Confirm Payment</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Viewer Dialog */}
        <Dialog open={!!invoiceHtml} onOpenChange={(open) => !open && setInvoiceHtml(null)}>
          <DialogContent className="flex h-[85vh] max-w-4xl flex-col rounded-lg border border-border bg-background p-0">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base sm:text-lg text-foreground">Invoice Preview</DialogTitle>
                <Button size="sm" onClick={handlePrint} className="mr-6 rounded-lg">
                  <Printer className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Print / Save as PDF</span>
                  <span className="sm:hidden">Print</span>
                </Button>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6">
              <iframe ref={iframeRef} srcDoc={invoiceHtml || ""} className="w-full h-full border border-border rounded-lg" title="Invoice Preview" sandbox="allow-same-origin allow-scripts" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminInvoices;
