import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Search, MoreHorizontal, Eye, Pencil, FileText, MessageCircle,
  Trash2, Truck, Receipt, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatMoney, QUOTE_STATUSES, type Quotation, convertQuoteToShipment, convertQuoteToInvoice } from "@/lib/quotations";
import QuotationStatusBadge from "@/components/admin/quotations/QuotationStatusBadge";
import QuoteFormDialog from "@/components/admin/quotations/QuoteFormDialog";
import WhatsAppShareDialog from "@/components/admin/quotations/WhatsAppShareDialog";
import PdfPreviewDialog from "@/components/admin/quotations/PdfPreviewDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminQuotations = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [waQuote, setWaQuote] = useState<Quotation | null>(null);
  const [pdfQuote, setPdfQuote] = useState<Quotation | null>(null);
  const [delQuote, setDelQuote] = useState<Quotation | null>(null);
  const [converting, setConverting] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load quotations");
    } else {
      setRows((data as Quotation[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !r.quote_number.toLowerCase().includes(s) &&
          !r.customer_name.toLowerCase().includes(s) &&
          !(r.customer_email || "").toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [rows, q, status]);

  const handleCreate = () => navigate("/admin/quotations/new");
  const handleCreateAuto = () => { setEditing(null); setFormOpen(true); };
  const handleEdit = (row: Quotation) => navigate(`/admin/quotations/${row.id}/edit`);

  const handleConvertShipment = async (row: Quotation) => {
    if (!row.user_id) {
      toast.error("Quote has no linked user. Edit and assign a customer first.");
      return;
    }
    setConverting(row.id);
    try {
      await convertQuoteToShipment(row, row.user_id);
      toast.success("Converted to shipment");
      fetchRows();
    } catch (e: any) {
      toast.error(e.message || "Conversion failed");
    } finally {
      setConverting(null);
    }
  };

  const handleConvertInvoice = async (row: Quotation) => {
    if (!row.user_id) {
      toast.error("Quote has no linked user.");
      return;
    }
    setConverting(row.id);
    try {
      await convertQuoteToInvoice(row, row.user_id);
      toast.success("Invoice generated");
      fetchRows();
    } catch (e: any) {
      toast.error(e.message || "Conversion failed");
    } finally {
      setConverting(null);
    }
  };

  const handleDelete = async () => {
    if (!delQuote) return;
    const { error } = await (supabase as any).from("quotations").delete().eq("id", delQuote.id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Quotation deleted");
    setDelQuote(null);
    fetchRows();
  };

  const RowActions = ({ row }: { row: Quotation }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="iconSm">
          {converting === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link to={`/admin/quotations/${row.id}`}><Eye className="w-4 h-4 mr-2" /> View</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEdit(row)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPdfQuote(row)}><FileText className="w-4 h-4 mr-2" /> Preview / PDF</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setWaQuote(row)}><MessageCircle className="w-4 h-4 mr-2" /> Send WhatsApp</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={row.status === "converted"} onClick={() => handleConvertShipment(row)}>
          <Truck className="w-4 h-4 mr-2" /> Convert to Shipment
        </DropdownMenuItem>
        <DropdownMenuItem disabled={row.status === "converted"} onClick={() => handleConvertInvoice(row)}>
          <Receipt className="w-4 h-4 mr-2" /> Convert to Invoice
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => setDelQuote(row)}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <AdminLayout title="Quotations" description="Generate, share and convert customer quotes">
      <div className="space-y-5">
        {/* Filters */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by quote #, customer, email" className="pl-9" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {QUOTE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" /> New Quotation
              </Button>
              <Button variant="outline" onClick={handleCreateAuto}>
                Auto Pricing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table / Cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">
            No quotations found. Create your first quote to get started.
          </CardContent></Card>
        ) : isMobile ? (
          <div className="space-y-3">
            {filtered.map((row) => (
              <Card key={row.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/admin/quotations/${row.id}`} className="font-bold text-foreground hover:text-primary">
                        {row.quote_number}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">{row.customer_name}</p>
                    </div>
                    <QuotationStatusBadge status={row.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Type</span><p className="font-medium capitalize">{row.shipment_type}</p></div>
                    <div><span className="text-muted-foreground">Total</span><p className="font-bold">{formatMoney(row.total, row.currency)}</p></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Route</span><p className="font-medium truncate">{row.origin_country} → {row.destination_country}</p></div>
                  </div>
                  <div className="flex justify-end pt-1 border-t border-border/40">
                    <RowActions row={row} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Route</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link to={`/admin/quotations/${row.id}`} className="font-semibold text-primary hover:underline">
                      {row.quote_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.customer_name}</div>
                    {row.customer_email && <div className="text-xs text-muted-foreground">{row.customer_email}</div>}
                  </TableCell>
                  <TableCell className="capitalize">{row.shipment_type}</TableCell>
                  <TableCell className="text-sm">{row.origin_country} → {row.destination_country}</TableCell>
                  <TableCell className="text-right font-semibold">{formatMoney(row.total, row.currency)}</TableCell>
                  <TableCell><QuotationStatusBadge status={row.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell><RowActions row={row} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <QuoteFormDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSaved={fetchRows} />
      <WhatsAppShareDialog open={!!waQuote} onOpenChange={(o) => !o && setWaQuote(null)} quote={waQuote} onSent={fetchRows} />
      <PdfPreviewDialog open={!!pdfQuote} onOpenChange={(o) => !o && setPdfQuote(null)} quote={pdfQuote} onUpdated={fetchRows} />
      <AlertDialog open={!!delQuote} onOpenChange={(o) => !o && setDelQuote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Delete quotation {delQuote?.quote_number}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminQuotations;