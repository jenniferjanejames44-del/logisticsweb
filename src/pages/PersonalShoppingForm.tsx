import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  calculateProcessingFeeFromBands,
  fetchProcessingFeeBands,
  formatProcessingFeeBand,
  type ProcessingFeeBand,
} from "@/lib/procurementFees";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { savePendingShoppingOrder, SHOPPING_ORDER_PAYMENT_ROUTE } from "@/lib/shoppingOrders";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  CheckCircle,
  DollarSign,
  Package,
  FileText,
} from "lucide-react";

const PersonalShoppingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feeBands, setFeeBands] = useState<ProcessingFeeBand[]>([]);
  const [loadingFees, setLoadingFees] = useState(true);

  const [form, setForm] = useState({
    productName: "",
    productLink: "",
    itemDescription: "",
    itemValue: "",
    quantity: "1",
    additionalNotes: "",
  });

  const itemValue = parseFloat(form.itemValue) || 0;
  const quantity = parseInt(form.quantity) || 1;
  const totalItemValue = itemValue * quantity;
  const processingFee = calculateProcessingFeeFromBands(totalItemValue, feeBands);
  const totalCost = totalItemValue + processingFee;

  useEffect(() => {
    fetchProcessingFeeBands().then((bands) => {
      setFeeBands(bands);
      setLoadingFees(false);
    });
  }, []);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) {
      savePendingShoppingOrder({
        productName: form.productName,
        productLink: form.productLink,
        itemDescription: form.itemDescription,
        itemValue: totalItemValue,
        quantity,
        processingFee,
        totalCost,
        additionalNotes: form.additionalNotes,
      });
      localStorage.setItem("post_auth_redirect", SHOPPING_ORDER_PAYMENT_ROUTE);
      toast({ title: "Please sign in", description: "Continue to secure payment after login.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("shopping-images").upload(path, imageFile);
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("shopping-images").getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      const { data, error } = await supabase.from("shopping_orders").insert({
        user_id: user.id,
        order_number: "", // trigger generates this
        product_name: form.productName,
        product_link: form.productLink || null,
        item_description: form.itemDescription,
        item_value: totalItemValue,
        quantity,
        processing_fee: processingFee,
        total_cost: totalCost,
        product_image_url: imageUrl,
        additional_notes: form.additionalNotes || null,
        status: "pending_payment",
        payment_status: "unpaid",
      }).select("id").single();

      if (error) throw error;

      toast({ title: "Shopping request submitted!", description: "Continue to payment to confirm your order." });
      navigate(`${SHOPPING_ORDER_PAYMENT_ROUTE}?orderId=${data.id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = form.productName && form.itemDescription && itemValue > 0 && quantity >= 1;
  const canProceedStep2 = true; // optional fields

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-sm mb-4">
              <ShoppingBag className="w-7 h-7" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Personal Shopping Request</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tell us what you want to buy and we'll handle the rest
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Product Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5 text-primary" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={form.productName}
                    onChange={(e) => updateForm("productName", e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max"
                  />
                </div>
                <div>
                  <Label>Product Link (optional)</Label>
                  <Input
                    value={form.productLink}
                    onChange={(e) => updateForm("productLink", e.target.value)}
                    placeholder="https://store.example.com/product"
                  />
                </div>
                <div>
                  <Label>Item Description *</Label>
                  <Textarea
                    value={form.itemDescription}
                    onChange={(e) => updateForm("itemDescription", e.target.value)}
                    placeholder="Describe the item — color, size, model, specifications..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Value (USD) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.itemValue}
                      onChange={(e) => updateForm("itemValue", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => updateForm("quantity", e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Product Image (optional)</Label>
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  {imagePreview ? (
                    <div className="relative mt-2 inline-block rounded-lg border border-border/60 bg-muted/30 p-2">
                      <img src={imagePreview} alt="Preview" className="rounded-md max-h-40 object-cover block" />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md ring-2 ring-background hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-2 gap-2 w-full"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </Button>
                  )}
                </div>

                <div>
                  <Label>Additional Notes (optional)</Label>
                  <Textarea
                    value={form.additionalNotes}
                    onChange={(e) => updateForm("additionalNotes", e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                  />
                </div>

                <Button
                  variant="dashAccent"
                  size="dash"
                  className="w-full gap-2"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Price Summary */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Price Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item Value ({quantity}x)</span>
                    <span className="font-medium text-foreground">${totalItemValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span className="font-medium text-foreground">${processingFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total Cost</span>
                    <span className="font-bold text-primary text-lg">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Fee Structure</p>
                  {loadingFees ? (
                    <p className="text-xs">Loading current fee bands...</p>
                  ) : (
                    <ul className="space-y-0.5 text-xs">
                      {feeBands.map((band) => {
                        const { rangeLabel, feeLabel } = formatProcessingFeeBand(band);
                        return <li key={`${band.min_value}-${band.max_value}`}>{rangeLabel} → {feeLabel}</li>;
                      })}
                    </ul>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="dashOutline" size="dash" className="flex-1 gap-2" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button variant="dashAccent" size="dash" className="flex-1 gap-2" onClick={() => setStep(3)}>
                    Review <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  Review & Submit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium text-foreground">{form.productName}</span>
                  </div>
                  {form.productLink && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Link</span>
                      <a href={form.productLink} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate max-w-[200px]">
                        View Product
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium text-foreground text-right max-w-[200px] truncate">{form.itemDescription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium text-foreground">{quantity}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item Value</span>
                    <span className="font-medium">${totalItemValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span className="font-medium">${processingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-1">
                    <span>Total</span>
                    <span className="text-primary">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {imagePreview && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Attached Image</p>
                    <img src={imagePreview} alt="Product" className="rounded-lg max-h-32 object-cover" />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="dashOutline" size="dash" className="flex-1 gap-2" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    variant="dashAccent"
                    size="dash"
                    className="flex-1 gap-2"
                    disabled={submitting || loadingFees}
                    onClick={handleSubmit}
                  >
                    {submitting ? "Submitting..." : loadingFees ? "Loading fees..." : "Submit Request"}
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalShoppingForm;
