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

  const fetchInvoices = async () => {
    try {
      // Fetch invoices
      const { data: invoiceData, error } = await supabase
        .from("invoices")
        .select("*, shipments(tracking_number)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for user names
      const userIds = [...new Set((invoiceData || []).map(i => i.user_id))];
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profileMap = new Map((profileData || []).map(p => [p.user_id, p]));
      
      const enriched = (invoiceData || []).map(inv => ({
        ...inv,
        profiles: profileMap.get(inv.user_id) || null,
      }));

      setInvoices(enriched as Invoice[]);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const openPayDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentRef("");
    setPayDialogOpen(true);
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;
    setMarking(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid", payment_reference: paymentRef || null })
        .eq("id", selectedInvoice.id);

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
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice_id: invoice.id },
      });
      if (error) throw error;

      const filePath = data.file_path || `${invoice.user_id}/${invoice.invoice_number}.html`;
      const { data: fileData, error: dlError } = await supabase.storage
        .from("invoices")
        .download(filePath);
      if (dlError) throw dlError;

      const htmlText = await fileData.text();
      setInvoiceHtml(htmlText);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download invoice");
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

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
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage all customer invoices</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
                  <p className="text-2xl font-bold text-foreground">${totalUnpaid.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10">
                  <DollarSign className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                All Invoices ({filtered.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search invoices..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
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
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading invoices...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No invoices found</p>
            ) : (
              <div className="overflow-x-auto">
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
                          <div>
                            <p className="font-medium">{invoice.profiles?.full_name || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{invoice.profiles?.email || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{invoice.shipments?.tracking_number || "N/A"}</TableCell>
                        <TableCell className="font-medium">${Number(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>{invoice.payment_reference || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {invoice.status === "unpaid" && (
                              <Button variant="default" size="sm" onClick={() => openPayDialog(invoice)}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleDownload(invoice)}>
                              <Download className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mark Paid Dialog */}
        <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Invoice as Paid</DialogTitle>
              <DialogDescription>
                Confirm payment for {selectedInvoice?.invoice_number} — ${Number(selectedInvoice?.amount || 0).toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payRef">Payment Reference (optional)</Label>
                <Input
                  id="payRef"
                  placeholder="e.g. Bank transfer ref, receipt #"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleMarkPaid} disabled={marking}>
                {marking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><CheckCircle className="w-4 h-4 mr-2" />Confirm Payment</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Viewer Dialog */}
        <Dialog open={!!invoiceHtml} onOpenChange={(open) => !open && setInvoiceHtml(null)}>
          <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle>Invoice Preview</DialogTitle>
                <Button size="sm" onClick={handlePrint} className="mr-6">
                  <Printer className="w-4 h-4 mr-2" />
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
      </div>
    </AdminLayout>
  );
};

export default AdminInvoices;
