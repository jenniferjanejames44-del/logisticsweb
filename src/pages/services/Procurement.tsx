import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Upload, ArrowRight, CheckCircle2, BadgeDollarSign, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  calculateProcessingFeeFromBands,
  fetchProcessingFeeBands,
  formatProcessingFeeBand,
  type ProcessingFeeBand,
} from "@/lib/procurementFees";

const Procurement = () => {
  const { user } = useAuth();
  const { formatUsd } = useCurrency();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [feeBands, setFeeBands] = useState<ProcessingFeeBand[]>([]);
  const [loadingFees, setLoadingFees] = useState(true);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [form, setForm] = useState({
    productName: "",
    productLink: "",
    quantity: "1",
    estimatedPrice: "",
    specialInstructions: "",
  });

  useEffect(() => {
    fetchProcessingFeeBands().then((bands) => {
      setFeeBands(bands);
      setLoadingFees(false);
    });
  }, []);

  const quantity = Math.max(1, parseInt(form.quantity || "1", 10) || 1);
  const estimatedUnitPrice = parseFloat(form.estimatedPrice) || 0;
  const estimatedOrderValue = quantity * estimatedUnitPrice;
  const processingFee = useMemo(() => calculateProcessingFeeFromBands(estimatedOrderValue, feeBands), [estimatedOrderValue, feeBands]);
  const estimatedTotal = estimatedOrderValue + processingFee;

  const updateField = (field: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a file under 5MB.", variant: "destructive" });
      return;
    }
    setAttachment(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      localStorage.setItem("post_auth_redirect", "/services/procurement");
      toast({ title: "Log in required", description: "Please log in to submit your procurement request." });
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl: string | null = null;
      if (attachment) {
        const ext = attachment.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("shopping-images").upload(path, attachment);
        if (!uploadErr) {
          const { data: publicUrl } = supabase.storage.from("shopping-images").getPublicUrl(path);
          fileUrl = publicUrl.publicUrl;
        }
      }

      const { error } = await supabase.from("shopping_orders").insert({
        user_id: user.id,
        order_number: "",
        product_name: form.productName,
        product_link: form.productLink || null,
        item_description: form.specialInstructions || form.productName,
        item_value: estimatedOrderValue,
        quantity,
        processing_fee: processingFee,
        total_cost: estimatedTotal,
        product_image_url: fileUrl,
        additional_notes: form.specialInstructions || null,
      });

      if (error) throw error;

      toast({ title: "Procurement request submitted", description: "Your request has been added to the existing procurement queue." });
      navigate("/dashboard/shopping-orders");
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="hero-gradient relative overflow-hidden bg-primary pb-20 pt-32 md:pb-24 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,81,1,0.18),transparent_32%)]" />
          <div className="section-container relative z-10 max-w-6xl">
            <div className="max-w-4xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
                <ShoppingBag className="h-4 w-4 text-accent" /> Buy For Me / Procurement Service
              </span>
              <h1 className="mb-6 text-white">Let RAC buy and ship on your behalf</h1>
              <p className="mb-6 max-w-3xl text-lg leading-relaxed text-white/80">
                Share the product you want from Amazon, Alibaba, supplier catalogs, or direct sellers. We purchase it for you, add the request to the existing procurement system, and keep fulfillment moving in one workflow.
              </p>
              <div className="page-hero-actions sm:justify-start">
                <Button asChild variant="heroPrimary" size="lg"><Link to="#procurement-form">Submit Procurement Request</Link></Button>
                <Button asChild variant="heroSecondary" size="lg"><Link to="/dashboard/shopping-orders">View Existing Requests</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding section-alt">
          <div className="section-container grid gap-6 lg:grid-cols-3">
            {[
              "Tell us what to buy, where to source it, how many units you need, and any special handling notes.",
              "Our team reviews the request, confirms pricing, and purchases the item through the existing procurement workflow.",
              "Once purchased, the order is prepared for shipment and can continue through the normal logistics journey.",
            ].map((item) => (
              <Card key={item} className="border-border/60 bg-background shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                <CardContent className="flex gap-4 p-6">
                  <span className="icon-surface h-11 w-11 shrink-0 border-primary/10 bg-primary/5"><CheckCircle2 className="h-5 w-5 text-primary" /></span>
                  <p className="text-base leading-relaxed text-muted-foreground">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="section-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                  <BadgeDollarSign className="h-4 w-4" /> Procurement fees
                </span>
	                <h2 className="text-foreground">Processing / Procurement Fee Structure</h2>
                <p className="mt-2 text-muted-foreground">These fee tiers are read from the admin-managed processing fee configuration and applied to the estimated order value.</p>
              </div>

              <Card className="border-border/60 bg-card shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order value</TableHead>
                        <TableHead>Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingFees ? (
                        <TableRow><TableCell colSpan={2} className="py-8 text-center text-muted-foreground">Loading fee tiers...</TableCell></TableRow>
                      ) : (
                        feeBands.map((band) => {
                          const { rangeLabel, feeLabel } = formatProcessingFeeBand(band, formatUsd);
                          return (
                            <TableRow key={`${band.min_value}-${band.max_value}`}>
                              <TableCell className="font-medium">{rangeLabel}</TableCell>
                              <TableCell>{feeLabel}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="icon-surface h-11 w-11 border-primary/10 bg-primary/5"><ClipboardList className="h-5 w-5 text-primary" /></span>
                    <div>
                      <h3 className="text-foreground">How procurement works</h3>
                      <p className="text-sm text-muted-foreground">A simple public workflow, backed by the existing order system.</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">1.</span> Submit product details, supplier link, quantity, price estimate, and any supporting file.</p>
                    <p><span className="font-semibold text-foreground">2.</span> RAC reviews the request and processes it inside the current procurement queue.</p>
                    <p><span className="font-semibold text-foreground">3.</span> After purchase, the goods continue into the standard shipment and delivery journey.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card id="procurement-form" className="border-border/60 bg-card shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-foreground">Submit a buy request</h2>
                  <p className="mt-2 text-muted-foreground">If you are not logged in, you will be redirected to sign in before the request is submitted.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product name</Label>
                    <Input id="productName" value={form.productName} onChange={(e) => updateField("productName", e.target.value)} placeholder="e.g. Nike Air Force 1" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productLink">Product link (Amazon / Alibaba / etc)</Label>
                    <Input id="productLink" type="url" value={form.productLink} onChange={(e) => updateField("productLink", e.target.value)} placeholder="https://..." />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" min="1" value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedPrice">Estimated price (per unit, USD)</Label>
                      <Input id="estimatedPrice" type="number" min="0" step="0.01" value={form.estimatedPrice} onChange={(e) => updateField("estimatedPrice", e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special instructions</Label>
                    <Textarea id="specialInstructions" value={form.specialInstructions} onChange={(e) => updateField("specialInstructions", e.target.value)} placeholder="Color, size, preferred seller, quality expectations, consolidation notes, etc." rows={5} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment">File upload</Label>
                    <label htmlFor="attachment" className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                      <span>{attachment ? attachment.name : "Upload a screenshot, reference image, or PDF under 5MB"}</span>
                      <Upload className="h-4 w-4 text-primary" />
                    </label>
                    <Input id="attachment" type="file" accept="image/*,.pdf" className="hidden" onChange={handleAttachmentChange} />
                  </div>

                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Estimated order value</span>
                      <span className="font-medium text-foreground">{formatUsd(estimatedOrderValue)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Estimated procurement fee</span>
                      <span className="font-medium text-foreground">{formatUsd(processingFee)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-primary/10 pt-3 text-base font-semibold text-foreground">
                      <span>Estimated total</span>
                      <span>{formatUsd(estimatedTotal)}</span>
                    </div>
                  </div>

                  <Button type="submit" variant="heroPrimary" size="lg" className="w-full" disabled={submitting || loadingFees}>
                    {submitting ? "Submitting request..." : loadingFees ? "Loading fee configuration..." : "Submit Procurement Request"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Procurement;
