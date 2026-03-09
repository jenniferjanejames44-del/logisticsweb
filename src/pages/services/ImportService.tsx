import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Warehouse, Clock3, ArrowRight, ClipboardList, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fallbackWarehouseCountries = ["China", "United Kingdom", "United States"];

const importHighlights = [
  "Ship from our overseas warehouse locations into your destination market.",
  "We coordinate warehouse intake, labeling, export dispatch, and final-mile handoff.",
  "You can move straight into the existing shipment flow for booking or quote generation.",
];

const timeline = [
  { title: "Warehouse intake", detail: "1–3 business days after supplier delivery" },
  { title: "Inspection & consolidation", detail: "1–2 business days for sorting and prep" },
  { title: "International dispatch", detail: "3–7 business days depending on service lane" },
  { title: "Arrival & final delivery", detail: "2–5 business days after customs release" },
];

const steps = [
  { title: "Send items to a RAC warehouse", description: "Deliver or have your supplier send your cargo to one of our supported warehouse countries." },
  { title: "Create your shipment request", description: "Open the shipment flow, choose the receiving destination, and enter package details." },
  { title: "Review charges and documentation", description: "Confirm declared value, packaging extras, and any notes before submission." },
  { title: "Track delivery to completion", description: "Once booked, your shipment moves through customs, line-haul, and final delivery with live tracking." },
];

const ImportService = () => {
  const [warehouseCountries, setWarehouseCountries] = useState<string[]>(fallbackWarehouseCountries);

  useEffect(() => {
    const loadWarehouses = async () => {
      const { data } = await supabase.from("warehouses").select("country").eq("is_active", true);
      if (!data?.length) return;
      const countries = [...new Set(data.map((item) => item.country))].sort();
      setWarehouseCountries(countries);
    };
    loadWarehouses();
  }, []);

  const introStats = useMemo(
    () => [
      { label: "Supported warehouse countries", value: `${warehouseCountries.length}+` },
      { label: "Shipment entry point", value: "Existing shipping flow" },
      { label: "Best for", value: "Personal and business imports" },
    ],
    [warehouseCountries.length],
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="hero-gradient relative overflow-hidden bg-primary pb-20 pt-32 md:pb-24 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,81,1,0.18),transparent_32%)]" />
          <div className="section-container relative z-10 max-w-6xl">
            <div className="max-w-4xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
                <Globe className="h-4 w-4 text-accent" /> Import Service
              </span>
              <h1 className="mb-6 text-white">Import with RAC Logistics</h1>
              <p className="mb-8 max-w-3xl text-lg leading-relaxed text-white/80">
                Move cargo from our supported warehouse countries into your destination market with a clear, step-by-step import workflow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="heroPrimary" size="lg">
                  <Link to="/shipping?flow=import&intent=shipment">Start Shipment</Link>
                </Button>
                <Button asChild variant="heroSecondary" size="lg">
                  <Link to="/shipping?flow=import&intent=quote">Get Shipping Quote</Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {introStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-sm text-white/70">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding section-alt">
          <div className="section-container grid gap-6 lg:grid-cols-3">
            {importHighlights.map((item) => (
              <Card key={item} className="border-border/60 bg-background shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                <CardContent className="flex gap-4 p-6">
                  <span className="icon-surface h-11 w-11 shrink-0 border-primary/10 bg-primary/5">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </span>
                  <p className="text-base leading-relaxed text-muted-foreground">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="section-container grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <span className="icon-surface h-12 w-12 border-primary/10 bg-primary/5"><Warehouse className="h-5 w-5 text-primary" /></span>
                <div>
                  <h2 className="text-foreground">Supported warehouse countries</h2>
                  <p className="text-muted-foreground">Loaded from active warehouse locations already configured in the platform.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {warehouseCountries.map((country) => (
                  <Card key={country} className="border-border/60 bg-card">
                    <CardContent className="p-5 font-medium text-foreground">{country}</CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
              <div className="mb-6 flex items-center gap-3">
                <span className="icon-surface h-11 w-11 border-accent/20 bg-accent/10"><Clock3 className="h-5 w-5 text-accent" /></span>
                <div>
                  <h3 className="text-foreground">Estimated delivery timeline</h3>
                  <p className="text-sm text-muted-foreground">Typical checkpoints for standard import handling.</p>
                </div>
              </div>
              <div className="space-y-4">
                {timeline.map((item) => (
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
                <ClipboardList className="h-4 w-4" /> Step-by-step process
              </span>
              <h2 className="text-foreground">How the import service works</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {steps.map((step, index) => (
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
              <Button asChild variant="heroPrimary" size="lg"><Link to="/shipping?flow=import&intent=shipment">Start Shipment</Link></Button>
              <Button asChild variant="heroSecondary" size="lg"><Link to="/shipping?flow=import&intent=quote">Get Shipping Quote <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default ImportService;