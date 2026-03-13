import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Warehouse, Clock3, ArrowRight, ClipboardList, PackageCheck, Route, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fallbackWarehouseCountries = ["China", "United Kingdom", "United States"];

const importHighlights = [
  {
    title: "Warehouse-ready intake",
    description: "Ship from our overseas warehouse locations into your destination market.",
    icon: PackageCheck,
  },
  {
    title: "Coordinated movement",
    description: "We coordinate warehouse intake, labeling, export dispatch, and final-mile handoff.",
    icon: Route,
  },
  {
    title: "Fast workflow entry",
    description: "You can move straight into the existing shipment flow for booking or quote generation.",
    icon: FileCheck,
  },
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

const importHeroImage = "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80";

const warehouseFlagMap: Record<string, { label: string; image: string }> = {
  China: { label: "China", image: "https://flagcdn.com/w80/cn.png" },
  "United States": { label: "United States", image: "https://flagcdn.com/w80/us.png" },
  "United Kingdom": { label: "United Kingdom", image: "https://flagcdn.com/w80/gb.png" },
};

const preferredWarehouseCountryOrder = ["China", "United States", "United Kingdom"];

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
      { label: "Shipment entry point", value: "Existing shipping flow" },
      { label: "Best for", value: "Personal and business imports" },
    ],
    [],
  );

  const featuredWarehouseCountries = useMemo(
    () => preferredWarehouseCountryOrder.filter((country) => warehouseCountries.includes(country)),
    [warehouseCountries],
  );

  const additionalWarehouseCountries = useMemo(
    () => warehouseCountries.filter((country) => !(country in warehouseFlagMap)),
    [warehouseCountries],
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="hero-gradient relative flex min-h-[520px] items-center overflow-hidden bg-primary pb-16 pt-28 md:pb-20 md:pt-32">
          <div className="absolute inset-0">
            <img src={importHeroImage} alt="Import logistics containers arriving at port" className="h-full w-full object-cover" loading="eager" decoding="async" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,67,0.52),rgba(6,16,67,0.72)),radial-gradient(circle_at_top_right,rgba(223,81,1,0.22),transparent_34%)]" />
          <div className="section-container relative z-10">
            <div className="max-w-4xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
                <Globe className="h-4 w-4 text-accent" /> Import Service
              </span>
              <h1 className="mb-6 text-white">Import with RAC Logistics</h1>
              <p className="hero-subtext mb-6 max-w-3xl text-lg leading-relaxed">
                Move cargo from our supported warehouse countries into your destination market with a clear, step-by-step import workflow.
              </p>
              <div className="page-hero-actions sm:justify-start">
                <Button asChild variant="heroPrimary" size="lg">
                  <Link to="/shipping?flow=import&intent=shipment">Start Shipment</Link>
                </Button>
                <Button asChild variant="heroSecondary" size="lg">
                  <Link to="/shipping?flow=import&intent=quote">Get Shipping Quote</Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-4 lg:grid-cols-[1.3fr_0.85fr_0.85fr]">
                <div className="rounded-2xl border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.08))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:p-6">
                  <p className="text-sm font-semibold tracking-[0.01em] text-white">Supported warehouse countries</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {featuredWarehouseCountries.map((country) => (
                      <div key={country} className="flex items-center gap-3">
                        <img
                          src={warehouseFlagMap[country].image}
                          alt={`${warehouseFlagMap[country].label} flag`}
                          className="h-6 w-9 rounded-[3px] object-cover shadow-[0_6px_12px_rgba(0,0,0,0.18)]"
                          loading="lazy"
                          decoding="async"
                        />
                        <p className="text-sm font-semibold text-white sm:text-[15px]">
                          {warehouseFlagMap[country].label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {introStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur-sm shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
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
              <Card key={item.title} className="border-border/60 bg-background shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                <CardContent className="flex gap-4 p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                    <item.icon className="h-6 w-6" strokeWidth={2.3} />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-base leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
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
                {featuredWarehouseCountries.map((country) => (
                  <Card key={country} className="border-border/60 bg-card shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <CardContent className="flex items-center gap-4 p-5">
                      <img
                        src={warehouseFlagMap[country].image}
                        alt={`${warehouseFlagMap[country].label} flag`}
                        className="h-7 w-10 rounded-[3px] object-cover shadow-[0_6px_14px_rgba(15,23,42,0.12)]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{warehouseFlagMap[country]?.label ?? country}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {additionalWarehouseCountries.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {additionalWarehouseCountries.map((country) => (
                    <Card key={country} className="border-border/60 bg-card">
                      <CardContent className="flex items-center gap-3 p-4 text-sm font-medium text-foreground">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-primary">
                          <Globe className="h-5 w-5" />
                        </span>
                        {country}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
          <div className="section-container">  
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
            <div className="cta-actions mt-10">
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