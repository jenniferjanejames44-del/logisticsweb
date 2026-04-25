import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Handshake, TrendingUp, Link2, BarChart3, ShieldCheck,
  CheckCircle2, ArrowRight, Users, Globe2, Wallet, Send,
} from "lucide-react";

const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(5, "Phone is required").max(40),
  country: z.string().trim().min(2, "Country is required").max(80),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  business_name: z.string().trim().max(120).optional().or(z.literal("")),
  social_link: z.string().trim().max(255).optional().or(z.literal("")),
  referral_plan: z.string().trim().min(5, "Tell us how you plan to refer").max(500),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

const Partners = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    business_name: "",
    social_link: "",
    referral_plan: "",
    message: "",
  });

  useEffect(() => {
    document.title = "Partner With Us — Earn Commissions | RAC Logistics";
  }, []);

  const handleChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const scrollToForm = () => {
    document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first || "Please check the form");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("partners").insert({
        ...parsed.data,
        status: "pending",
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Application submitted! We'll review and get back to you soon.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    { icon: Wallet, title: "Earn Commissions", desc: "Get paid for every customer who ships through your link." },
    { icon: BarChart3, title: "Track Referrals", desc: "Live dashboard showing clicks, signups and conversions." },
    { icon: ShieldCheck, title: "Trusted Brand", desc: "Partner with a logistics brand customers already trust." },
    { icon: Globe2, title: "Global Reach", desc: "Refer importers, exporters and businesses worldwide." },
  ];

  const steps = [
    { n: "01", icon: Send, title: "Apply", desc: "Fill out the short application form below — takes under 2 minutes." },
    { n: "02", icon: Link2, title: "Share", desc: "Get your unique referral code & link once approved. Share on socials, email, or WhatsApp." },
    { n: "03", icon: TrendingUp, title: "Earn", desc: "Earn commission on every shipment your referrals pay for." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground pt-28 pb-20 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative section-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 ring-1 ring-accent/30 px-4 py-1.5 text-sm font-medium text-accent">
              <Handshake className="w-4 h-4" /> Affiliate & Referral Program
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Partner With <span className="text-accent">RAC Logistics</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-primary-foreground/80 leading-relaxed">
              Earn commissions by referring customers who ship, import, export, or use our logistics services. No fees, no contracts — just simple, recurring income.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="accent" onClick={scrollToForm} className="px-8">
                Become a Partner <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to start earning.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{s.n}</div>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-muted/40">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Why Partner With Us</h2>
            <p className="mt-3 text-muted-foreground">Real benefits for real partners.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <Card key={b.title} className="border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <b.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="partner-form" className="py-16 sm:py-20">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Apply to Become a Partner</h2>
              <p className="mt-3 text-muted-foreground">Fill in the form and we'll review your application within 2–3 business days.</p>
            </div>

            {submitted ? (
              <Card className="border-border/60">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">Application received</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thanks, {form.full_name.split(" ")[0] || "there"}! We'll email you at <strong className="text-foreground">{form.email}</strong> once your partner account is approved.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild variant="outline"><Link to="/">Back to home</Link></Button>
                    <Button asChild variant="accent"><Link to="/auth">Create account</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full name *</Label>
                        <Input id="full_name" value={form.full_name} onChange={handleChange("full_name")} required maxLength={100} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" value={form.email} onChange={handleChange("email")} required maxLength={255} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" type="tel" value={form.phone} onChange={handleChange("phone")} required maxLength={40} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input id="country" value={form.country} onChange={handleChange("country")} required maxLength={80} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={form.city} onChange={handleChange("city")} maxLength={80} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business_name">Business name (optional)</Label>
                        <Input id="business_name" value={form.business_name} onChange={handleChange("business_name")} maxLength={120} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social_link">Social media / website (optional)</Label>
                      <Input id="social_link" value={form.social_link} onChange={handleChange("social_link")} placeholder="https://" maxLength={255} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral_plan">How do you plan to refer customers? *</Label>
                      <Textarea id="referral_plan" value={form.referral_plan} onChange={handleChange("referral_plan")} required maxLength={500} rows={3} placeholder="e.g. WhatsApp groups, Instagram, my e-commerce store, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Anything else? (optional)</Label>
                      <Textarea id="message" value={form.message} onChange={handleChange("message")} maxLength={1000} rows={3} />
                    </div>
                    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? "Submitting..." : (<>Apply Now <ArrowRight className="w-4 h-4 ml-1" /></>)}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      By applying, you agree to our partner terms and commission policy.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;