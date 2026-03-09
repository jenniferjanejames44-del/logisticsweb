import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Send, Globe2, ShieldCheck, Box, ArrowRight, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const shippingRules = [
  "Use accurate product descriptions and declared values for all export items.",
  "Avoid prohibited or restricted goods for the selected destination country.",
  "Make sure sender and receiver contact details are complete before dispatch.",
];

const packagingGuidelines = [
  { title: "Protect fragile items", detail: "Use cushioning, reinforced corners, and inner box support for sensitive cargo." },
  { title: "Seal and label clearly", detail: "Apply durable outer packaging and ensure destination labels remain visible throughout transit." },
  { title: "Separate mixed items", detail: "Group SKUs and quantities clearly so customs checks and delivery handling stay accurate." },
];

const exportSteps = [
  { title: "Create the shipment", description: "Enter sender, receiver, package, and destination details in the existing shipment flow." },
  { title: "Confirm export requirements", description: "Review packaging extras, documentation, and declared value before submission." },
  { title: "Dispatch from origin", description: "We process the export booking, line-haul arrangement, and route your package internationally." },
  { title: "Track to delivery", description: "Monitor your shipment from export pickup to destination clearance and final delivery." },
];

const ExportService = () => {
  const [destinations, setDestinations] = useState<string[]>([]);

  useEffect(() => {
    const loadDestinations = async () => {
      const { data } = await supabase.from("shipping_routes").select("destination_country").eq("is_active", true);
      if (!data?.length) return;
      setDestinations([...new Set(data.map((item) => item.destination_country))].sort());
    };
    loadDestinations();
  }, []);

  const featuredDestinations = useMemo(() => destinations.slice(0, 12), [destinations]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="hero-gradient relative overflow-hidden bg-primary pb-20 pt-32 md:pb-24 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,81,1,0.18),transparent_32%)]" />
          <div className="section-container relative z-10 max-w-6xl">
            <div className="max-w-4xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
                <Send className="h-4 w-4 text-accent" /> Export Service
              </span>
              <h1 className="mb-6 text-white">Export internationally with clarity</h1>
              <p className="mb-8 max-w-3xl text-lg leading-relaxed text-white/80">
                Use RAC Logistics to move items from origin to international destinations with clear shipping rules, packaging guidance, and a defined export process.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="heroPrimary" size="lg"><Link to="/shipping?flow=export&intent=shipment">Create Shipment</Link></Button>
                <Button asChild variant="heroSecondary" size="lg"><Link to="/shipping?flow=export&intent=quote">Calculate Shipping</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding section-alt">
          <div className="section-container grid gap-6 lg:grid-cols-3">
            {shippingRules.map((rule) => (
              <Card key={rule} className="border-border/60 bg-background shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                <CardContent className="flex gap-4 p-6">
                  <span className="icon-surface h-11 w-11 shrink-0 border-primary/10 bg-primary/5"><ShieldCheck className="h-5 w-5 text-primary" /></span>
                  <p className="text-base leading-relaxed text-muted-foreground">{rule}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="section-container grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="icon-surface h-12 w-12 border-primary/10 bg-primary/5"><Globe2 className="h-5 w-5 text-primary" /></span>
                <div>
                  <h2 className="text-foreground">Supported destinations</h2>
                  <p className="text-muted-foreground">These destinations are pulled from active shipping routes already configured in the system.</p>
                </div>
              </div>
              {featuredDestinations.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredDestinations.map((country) => (
                    <Card key={country} className="border-border/60 bg-card"><CardContent className="p-5 font-medium text-foreground">{country}</CardContent></Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-border/70 bg-card">
                  <CardContent className="p-6 text-muted-foreground">Supported export destinations will appear here once active shipping routes are configured.</CardContent>
                </Card>
              )}
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
              <div className="mb-6 flex items-center gap-3">
                <span className="icon-surface h-11 w-11 border-accent/20 bg-accent/10"><Box className="h-5 w-5 text-accent" /></span>
                <div>
                  <h3 className="text-foreground">Packaging guidelines</h3>
                  <p className="text-sm text-muted-foreground">Best practices before you submit your export shipment.</p>
                </div>
              </div>
              <div className="space-y-4">
                {packagingGuidelines.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding section-alt">
          <div className="section-container max-w-5xl">
            <div className="mb-10 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                <ClipboardList className="h-4 w-4" /> Export process
              </span>
              <h2 className="text-foreground">How export shipping works</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {exportSteps.map((step, index) => (
                <Card key={step.title} className="border-border/60 bg-card">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</div>
                    <h3 className="text-foreground">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild variant="heroPrimary" size="lg"><Link to="/shipping?flow=export&intent=shipment">Create Shipment</Link></Button>
              <Button asChild variant="heroSecondary" size="lg"><Link to="/shipping?flow=export&intent=quote">Calculate Shipping <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default ExportService;