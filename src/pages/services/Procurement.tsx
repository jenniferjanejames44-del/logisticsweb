import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, ArrowRight, CheckCircle2, BadgeDollarSign, ClipboardList, Truck, Plane, Ship, Star, Quote, Phone, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import HeaderLogo from "@/components/layout/HeaderLogo";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import {
  calculateProcessingFeeFromBands,
  fetchProcessingFeeBands,
  formatProcessingFeeBand,
  type ProcessingFeeBand,
} from "@/lib/procurementFees";
import { savePendingShoppingOrder, SHOPPING_ORDER_PAYMENT_ROUTE } from "@/lib/shoppingOrders";

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
      savePendingShoppingOrder({
        productName: form.productName,
        productLink: form.productLink,
        itemDescription: form.specialInstructions || form.productName,
        itemValue: estimatedOrderValue,
        quantity,
        processingFee,
        totalCost: estimatedTotal,
        additionalNotes: form.specialInstructions,
      });
      localStorage.setItem("post_auth_redirect", SHOPPING_ORDER_PAYMENT_ROUTE);
      toast({ title: "Log in required", description: "Please log in to continue to payment for this request." });
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

      const { data, error } = await supabase.from("shopping_orders").insert({
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
        status: "pending_payment",
        payment_status: "unpaid",
      }).select("id").single();

      if (error) throw error;

      toast({ title: "Procurement request submitted", description: "Continue to payment to confirm your order." });
      navigate(`${SHOPPING_ORDER_PAYMENT_ROUTE}?orderId=${data.id}`);
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

  const heroImages = [
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
  ];

  const categories = [
    { name: "Phones & Gadgets", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" },
    { name: "Laptops & Computers", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" },
    { name: "Household Equipment", img: "https://images.unsplash.com/photo-1583845112203-29329902332e?auto=format&fit=crop&w=800&q=80" },
    { name: "Car Parts & Vehicles", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
    { name: "Fashion & Luxury", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
    { name: "Industrial Equipment", img: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&w=800&q=80" },
    { name: "Medical Equipment", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
    { name: "Bulk Business Supplies", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80" },
  ];

  const testimonials = [
    { name: "Funke Adeyemi", quote: "I shipped my car and personal items from the U.S. without any hassle. I got updates every step of the way. Super professional!" },
    { name: "Emeka Nnamdi", quote: "My electronics arrived safely and on time. The container shipping option saved me real money and stress. Amazing service." },
    { name: "Chinedu Obed", quote: "RAC made online purchase stress-free! My container arrived in 3 weeks, exactly as promised. Highly reliable." },
  ];

  const faqs = [
    { q: "Can I pay in Naira?", a: "Yes. We accept Naira payments through our secure Paystack checkout, and we handle the USD conversion for you." },
    { q: "Do you buy from any website?", a: "Yes. We buy from Amazon, Walmart, eBay, Alibaba, AliExpress, dealerships, manufacturers and trusted private suppliers." },
    { q: "Can you procure vehicles?", a: "Yes. We handle vehicle purchases, dealership coordination and full export documentation to Nigeria." },
    { q: "Is my item insured?", a: "Yes. Insurance options are available on every shipment and recommended for high-value electronics and machinery." },
    { q: "What happens if the seller delays shipment?", a: "We track every order and escalate directly with the seller on your behalf, keeping you updated until the item is secured." },
    { q: "How do I know what the final cost will be?", a: "We share a clear, itemised cost breakdown — product cost, procurement fee and shipping — for your approval before any purchase." },
  ];

  return (
    <div className="min-h-screen">
      {/* Minimal Africanies-style header — only on this procurement page */}
      <header className="sticky top-0 z-50 bg-primary py-4 shadow-lg">
        <div className="section-container flex items-center justify-center">
          <Link to="/" aria-label="RAC Logistics home" className="flex items-center">
            <span className="rounded-full bg-white px-5 py-2 shadow-md">
              <HeaderLogo className="block h-8 w-auto" />
            </span>
          </Link>
        </div>
      </header>
      <main>
        {/* HERO — Navy split with image collage */}
        <section className="relative overflow-hidden bg-primary pb-16 pt-28 md:pb-24 md:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,81,1,0.22),transparent_45%)]" />
          <div className="section-container relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-lg">
                Attention!!! Online Shoppers
              </span>
              <h1 className="mb-6 font-serif text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-6xl">
                We Buy Anything For You Globally — Tax-Free, And Deliver It Safely To Nigeria
              </h1>
              <ul className="mb-8 space-y-2 text-lg text-white/90">
                <li className="flex items-center gap-2"><span className="text-accent">•</span> Pay in Naira</li>
                <li className="flex items-center gap-2"><span className="text-accent">•</span> Verified Suppliers Only</li>
                <li className="flex items-center gap-2"><span className="text-accent">•</span> Fully Insured Delivery</li>
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-accent to-orange-600 px-8 text-base font-semibold text-white shadow-xl hover:opacity-95">
                  <Link to="#procurement-form">Sign Up For Tax-Free Shopping</Link>
                </Button>
              </div>
              <p className="mt-3 text-sm text-white/70">Takes less than 2 minutes. No obligation.</p>
            </div>

            {/* Image collage */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroImages.map((src, i) => (
                <div key={i} className={`overflow-hidden rounded-2xl bg-white/5 shadow-2xl ${i === 0 ? "row-span-2" : ""}`}>
                  <img src={src} alt="Procurement showcase" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTRO STRIP */}
        <section className="bg-background py-14">
          <div className="section-container text-center">
            <h2 className="mx-auto max-w-4xl text-2xl font-bold text-foreground md:text-3xl">
              We help you buy from Amazon, Walmart, eBay, Alibaba, dealerships, manufacturers, or private suppliers.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              We handle payment, verification, purchase, shipping, and delivery to Nigeria — safely and fast.
            </p>

            {/* Brand strip */}
            <div className="mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-6">
              {["amazon", "Walmart", "eBay", "Alibaba", "AliExpress", "Shopify"].map((brand) => (
                <span
                  key={brand}
                  className="font-serif text-2xl font-extrabold tracking-tight text-primary/80 transition-colors hover:text-primary"
                >
                  {brand}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-accent to-orange-600 px-8 text-base font-semibold text-white shadow-xl hover:opacity-95">
                <Link to="#procurement-form">Sign Up For A Tax-Free Shopping</Link>
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">Takes less than 2 minutes. No obligation.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-muted/30 py-20">
          <div className="section-container">
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">Simple Steps</span>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">From request to your doorstep — five clear steps backed by our procurement team.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {[
                { n: "01", t: "You Tell Us", d: "Send the items you want and your budget." },
                { n: "02", t: "We Confirm", d: "We verify availability with trusted suppliers." },
                { n: "03", t: "Quality Check", d: "We verify item quality, specs and pricing." },
                { n: "04", t: "Cost Breakdown", d: "We share a clear final breakdown for approval." },
                { n: "05", t: "Purchase & Ship", d: "You approve, we buy and ship to your door." },
              ].map((step) => (
                <Card key={step.n} className="group relative overflow-hidden border-border/50 bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-6">
                    <span className="absolute right-4 top-3 font-serif text-5xl font-bold text-accent/15 transition-colors group-hover:text-accent/30">{step.n}</span>
                    <h3 className="relative mt-2 text-lg font-bold text-foreground">{step.t}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES — What can we buy for you */}
        <section className="bg-background py-20">
          <div className="section-container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">What Can We Buy For You?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Electronics, vehicles, fashion, industrial machinery, medical equipment and more.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((cat) => (
                <div key={cat.name} className="group relative overflow-hidden rounded-2xl shadow-md transition-all hover:-translate-y-1 hover:shadow-2xl">
                  <div className="aspect-square overflow-hidden">
                    <img src={cat.img} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-base font-bold text-white md:text-lg">{cat.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SHIPPING OPTIONS */}
        <section className="relative overflow-hidden bg-primary py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(223,81,1,0.18),transparent_45%)]" />
          <div className="section-container relative z-10">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl">Our Shipping Options</h2>
              <p className="mx-auto mt-3 max-w-2xl text-white/75">Choose the speed and cost that fits your order.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { Icon: Plane, title: "Express Shipping", duration: "3 – 5 Business Days", desc: "Fastest air-freight delivery for urgent and high-value items.", img: "https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=900&q=80" },
                { Icon: Truck, title: "Aircargo Shipping", duration: "5 – 10 Business Days", desc: "Balanced speed and cost for everyday electronics, fashion and gadgets.", img: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=80" },
                { Icon: Ship, title: "Container Shipping", duration: "6 – 8 Weeks", desc: "Bulk and oversized procurement for businesses and full-vehicle imports.", img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=80" },
              ].map((opt) => {
                const Icon = opt.Icon;
                return (
                  <div key={opt.title} className="group overflow-hidden rounded-3xl bg-white shadow-2xl transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(223,81,1,0.25)]">
                    <div className="relative h-56 overflow-hidden">
                      <img src={opt.img} alt={opt.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />
                      <span className="absolute left-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="absolute bottom-4 left-5 right-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{opt.duration}</p>
                        <h3 className="mt-1 text-xl font-bold uppercase text-white">{opt.title}</h3>
                      </div>
                    </div>
                    <p className="p-6 text-sm leading-relaxed text-muted-foreground">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-accent to-orange-600 px-8 text-base font-semibold text-white shadow-xl hover:opacity-95">
                <Link to="#procurement-form">Sign Up For A Tax-Free Shopping</Link>
              </Button>
              <p className="mt-3 text-sm text-white/70">Takes less than 2 minutes. No obligation.</p>
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="bg-background py-20">
          <div className="section-container grid items-center gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80" alt="Happy customer with package" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div>
              <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">Why RAC Logistics</span>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">What You Get When You Choose Us To Procure For You</h2>
              <ul className="space-y-4">
                {[
                  "Instant tracking updates once your item is secured and shipped",
                  "We handle everything — sourcing, purchase, shipping and delivery",
                  "No middlemen. No guesswork. Verified suppliers only",
                  "Trusted by individuals and businesses across Nigeria",
                  "Clear, transparent pricing and reliable timelines",
                  "Gadgets, machines and household items — delivered fast",
                  "24/7 premium support to guide you at every step",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-base text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-muted/30 py-20">
          <div className="section-container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Hear From Our Happy Customers</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Shipped and delivered procurement orders across Nigeria.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="relative border-border/50 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-7">
                    <Quote className="mb-4 h-8 w-8 text-accent/30" />
                    <p className="text-base leading-relaxed text-foreground">"{t.quote}"</p>
                    <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">Verified customer</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-background py-20">
          <div className="section-container max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60">
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-accent md:text-lg">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-10 text-center">
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-accent to-orange-600 px-8 text-base font-semibold text-white shadow-xl hover:opacity-95">
                <Link to="#procurement-form">Sign Up For A Tax-Free Shopping</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FORM + FEES (logic preserved) */}
        <section id="procurement-form" className="bg-muted/30 py-20">
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

            <Card className="border-border/60 bg-card shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
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

                  <Button type="submit" variant="default" size="lg" className="w-full" disabled={submitting || loadingFees}>
                    {submitting ? "Submitting request..." : loadingFees ? "Loading fee configuration..." : "Submit Procurement Request"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Africanies-style minimal procurement footer */}
      <footer className="bg-primary text-white">
        <div className="section-container py-14">
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full bg-white px-5 py-2 shadow-md">
              <HeaderLogo className="block h-8 w-auto" />
            </span>

            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-5 w-5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Nigeria</p>
                <a href="tel:+2348185956707" className="text-base font-semibold hover:text-accent">+234 818 595 6707</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Mail className="h-5 w-5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Email</p>
                <a href="mailto:info@raclogisticltd.com" className="text-base font-semibold hover:text-accent">info@raclogisticltd.com</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Lagos Office</p>
                <p className="text-sm text-white/85">29b Osolo Way, Ajao Estate, Isolo, Lagos</p>
              </div>
            </div>

            <p className="mt-10 max-w-4xl text-sm leading-relaxed text-white/70">
              <span className="font-semibold text-white">Disclaimer:</span> RAC Logistics acts solely as a procurement and shipping coordination service. While we take all reasonable steps to verify suppliers, inspect items, and ensure proper handling, we do not manufacture or own the products being procured. Delivery timelines are estimates and may be affected by factors beyond our control, including customs, port operations, or regulatory processes. For container shipping, clients are responsible for ensuring all items loaded inside vehicles comply with shipping and customs regulations.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold">
              <Link to="/privacy" className="text-white/85 hover:text-accent">Privacy Policy</Link>
              <Link to="/contact" className="text-white/85 hover:text-accent">Contact</Link>
              <Link to="/terms" className="text-white/85 hover:text-accent">Terms &amp; Conditions</Link>
            </div>

            <p className="mt-8 text-xs text-white/50">Copyright {new Date().getFullYear()} © RAC Logistics. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
      <LiveChat />
    </div>
  );
};

export default Procurement;
