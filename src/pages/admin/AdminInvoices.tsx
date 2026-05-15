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
import { Search, FileText, CheckCircle, Loader2, Download, Printer, Clock, AlertTriangle, TrendingUp, FileDown, Circle, Mail, RefreshCw } from "lucide-react";
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
  paid_at: string | null;
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
  const [resending, setResending] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
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
      setSelectedInvoice(invoice);
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

  const handlePrint = () => {
    if (!invoiceHtml) return;
    try {
      const win = iframeRef.current?.contentWindow;
      if (win) {
        win.focus();
        win.print();
        return;
      }
    } catch (e) {
      console.warn("iframe print blocked, falling back to new window", e);
    }
    const printWin = window.open("", "_blank");
    if (!printWin) {
      toast.error("Pop-ups blocked. Please allow pop-ups or use Save instead.");
      return;
    }
    printWin.document.open();
    printWin.document.write(invoiceHtml);
    printWin.document.close();
    printWin.onload = () => { printWin.focus(); printWin.print(); };
  };

  const handleSaveToDevice = () => {
    if (!invoiceHtml) return;
    const name = selectedInvoice?.invoice_number || "invoice";
    const blob = new Blob([invoiceHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Saved. Open the file and use Print → Save as PDF.");
  };

  const handleResendEmail = async (invoice: Invoice) => {
    setResending(invoice.id);
    try {
      const { data: shipment } = await supabase
        .from("shipments")
        .select("tracking_number")
        .eq("id", invoice.shipment_id)
        .maybeSingle();
      const { error } = await supabase.functions.invoke("send-notification-email", {
        body: {
          type: invoice.status === "paid" ? "payment_confirmation" : "invoice_ready",
          user_name: invoice.profiles?.full_name || "Customer",
          user_email: invoice.profiles?.email,
          amount: Number(invoice.amount),
          currency: "USD",
          invoice_number: invoice.invoice_number,
          tracking_number: shipment?.tracking_number,
          payment_channel: "manual",
          reference: invoice.payment_reference || "",
        },
      });
      if (error) throw error;
      toast.success(`Invoice email sent to ${invoice.profiles?.email}`);
    } catch (err) {
      console.error("Resend email error:", err);
      toast.error("Failed to send email");
    } finally {
      setResending(null);
    }
  };

  const handleRegenerate = async (invoice: Invoice) => {
    setRegenerating(invoice.id);
    try {
      const { error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice_id: invoice.id },
      });
      if (error) throw error;
      toast.success("Invoice regenerated");
    } catch (err) {
      console.error("Regenerate error:", err);
      toast.error("Failed to regenerate invoice");
    } finally {
      setRegenerating(null);
    }
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error("No invoices to export");
      return;
    }
    const headers = ["Invoice #", "Customer", "Email", "Tracking #", "Amount", "Status", "Due Date", "Paid At", "Reference", "Created"];
    const escape = (val: unknown) => {
      const s = val === null || val === undefined ? "" : String(val);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filtered.map((i) => [
      i.invoice_number,
      i.profiles?.full_name || "",
      i.profiles?.email || "",
      i.shipments?.tracking_number || "",
      Number(i.amount).toFixed(2),
      i.status,
      i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : "",
      i.paid_at ? new Date(i.paid_at).toISOString() : "",
      i.payment_reference || "",
      new Date(i.created_at).toISOString(),
    ].map(escape).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} invoice${filtered.length === 1 ? "" : "s"}`);
  };

  const buildTimeline = (invoice: Invoice) => {
    const now = new Date();
    const created = new Date(invoice.created_at);
    const due = invoice.due_date ? new Date(invoice.due_date) : null;
    const paid = invoice.paid_at ? new Date(invoice.paid_at) : null;
    const isOverdue = invoice.status === "overdue" || (invoice.status === "unpaid" && due && due < now);
    const events: Array<{ label: string; date: Date | null; state: "done" | "current" | "upcoming" | "alert"; description: string }> = [
      { label: "Invoice Created", date: created, state: "done", description: "Invoice generated and sent to customer." },
      { label: "Awaiting Payment", date: null, state: invoice.status === "unpaid" && !isOverdue ? "current" : invoice.status === "paid" ? "done" : "done", description: "Customer notified, payment pending." },
      { label: isOverdue ? "Marked Overdue" : "Due Date", date: due, state: isOverdue ? "alert" : invoice.status === "paid" ? "done" : "upcoming", description: isOverdue ? "Payment past due — follow up required." : "Expected payment date." },
      { label: "Payment Received", date: paid, state: invoice.status === "paid" ? "done" : "upcoming", description: invoice.status === "paid" ? `Reference: ${invoice.payment_reference || "—"}` : "Awaiting confirmation." },
    ];
    return events;
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
  const overdueCount = invoices.filter(i => i.status === "overdue").length;
  const paidCount = invoices.filter(i => i.status === "paid").length;

  const summaryCards = [
    { label: "Paid Revenue", value: `$${totalRevenue.toLocaleString()}`, sub: `${paidCount} invoices`, icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Unpaid Balance", value: `$${totalUnpaid.toLocaleString()}`, sub: "Awaiting payment", icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Total Invoices", value: invoices.length, sub: "All time", icon: FileText, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Overdue", value: overdueCount, sub: "Needs follow-up", icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600" },
  ];

  return (
    <AdminLayout title="Invoice Management" description="Track and manage all customer invoices">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summaryCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} className="border-border/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow">
                <CardContent className="p-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.iconBg} mb-3`}>
                    <Icon className={`w-4 h-4 ${c.iconColor}`} strokeWidth={2} />
                  </div>
                  <p className="text-lg font-bold text-foreground tracking-tight tabular-nums leading-none mb-1">{loading ? "—" : c.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{c.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-border/60 bg-white shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-border/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />All Invoices ({filtered.length})
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative sm:w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search invoices..." className="h-9 rounded-lg border-border/80 bg-muted/30 pl-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full rounded-lg border-border/80 bg-muted/30 text-sm sm:w-36"><SelectValue placeholder="Filter status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="h-9 gap-1.5 rounded-lg border-border/80 bg-white text-sm"
                  onClick={handleExportCsv}
                  disabled={loading || filtered.length === 0}
                >
                  <FileDown className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {loading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Loading invoices...</p>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No invoices found</p>
              </div>
            ) : isMobile ? (
              <div className="divide-y divide-border/40">
                {filtered.map((invoice) => (
                  <div key={invoice.id} className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-sm text-foreground">{invoice.invoice_number}</span>
                      <Badge className={`${getStatusColor(invoice.status)} text-[11px]`}>{invoice.status}</Badge>
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
                    <div className="flex items-center gap-2 border-t border-border/30 pt-3">
                      {invoice.status === "unpaid" && (
                        <Button variant="default" className="h-9 flex-1 rounded-lg text-sm" onClick={() => openPayDialog(invoice)}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />Mark Paid
                        </Button>
                      )}
                      <Button variant="outline" className="h-9 flex-1 rounded-lg text-sm" onClick={() => handleDownload(invoice)}>
                        <Download className="w-3.5 h-3.5 mr-1" />View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[1020px]">
                <Table>
                  <TableHeader className="bg-muted/30 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((invoice) => (
                      <TableRow key={invoice.id} className="transition-colors hover:bg-muted/20 [&_td]:py-3 [&_td]:text-[13px]">
                        <TableCell className="font-mono font-medium text-xs">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          <div><p className="font-medium">{invoice.profiles?.full_name || "N/A"}</p><p className="text-xs text-muted-foreground">{invoice.profiles?.email || ""}</p></div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{invoice.shipments?.tracking_number || "N/A"}</TableCell>
                        <TableCell className="font-semibold tabular-nums">${Number(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell><Badge className={`${getStatusColor(invoice.status)} capitalize`}>{invoice.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{invoice.payment_reference || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
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
                <div className="mr-6 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleSaveToDevice} className="rounded-lg">
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                  <Button size="sm" onClick={handlePrint} className="rounded-lg">
                    <Printer className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Print / Save as PDF</span>
                    <span className="sm:hidden">Print</span>
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
              <div className="h-[55vh] min-h-[400px]">
                <iframe ref={iframeRef} srcDoc={invoiceHtml || ""} className="w-full h-full border border-border rounded-lg" title="Invoice Preview" sandbox="allow-same-origin allow-scripts allow-modals allow-popups allow-downloads allow-popups-to-escape-sandbox" />
              </div>
              {selectedInvoice && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4 sm:p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Status Timeline</h3>
                    <span className="ml-2 text-[11px] uppercase tracking-wider text-muted-foreground">{selectedInvoice.invoice_number}</span>
                  </div>
                  <ol className="relative space-y-4 border-l-2 border-border/60 pl-5">
                    {buildTimeline(selectedInvoice).map((event, idx) => {
                      const dotColor =
                        event.state === "done" ? "bg-success border-success" :
                        event.state === "current" ? "bg-primary border-primary animate-pulse" :
                        event.state === "alert" ? "bg-destructive border-destructive" :
                        "bg-muted border-border";
                      const labelColor =
                        event.state === "alert" ? "text-destructive" :
                        event.state === "current" ? "text-primary" :
                        "text-foreground";
                      return (
                        <li key={idx} className="relative">
                          <span className={`absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${dotColor}`}>
                            <Circle className="h-1 w-1 opacity-0" />
                          </span>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                            <p className={`text-sm font-semibold ${labelColor}`}>{event.label}</p>
                            <p className="text-[11px] tabular-nums text-muted-foreground">
                              {event.date ? event.date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"}
                            </p>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminInvoices;
