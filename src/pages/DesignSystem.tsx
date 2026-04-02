import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle,
  Star,
  Truck,
  Shield,
  ArrowRight,
  Package,
  Globe,
  Zap,
} from "lucide-react";

const ColorSwatch = ({
  name,
  variable,
  hex,
  textClass = "text-primary-foreground",
}: {
  name: string;
  variable: string;
  hex: string;
  textClass?: string;
}) => (
  <div className="flex flex-col gap-2">
    <div
      className={`w-full h-24 rounded-xl flex items-center justify-center ${textClass} font-bold text-sm shadow-sm`}
      style={{ background: `hsl(var(${variable}))` }}
    >
      {hex}
    </div>
    <p className="text-sm font-semibold text-foreground">{name}</p>
    <p className="text-xs text-muted-foreground">{variable}</p>
  </div>
);

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="section-container text-center">
          <Badge className="bg-accent text-accent-foreground mb-6 px-4 py-1.5">
            Design System
          </Badge>
          <h1 className="text-primary-foreground mb-4">
            Brand &amp; Design System
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            The official Navy &amp; Orange design system for RAC
            Logistics. Every component, color, and typographic choice enforced
            globally.
          </p>
        </div>
      </section>

      <div className="section-padding">
        <div className="section-container space-y-20">
          {/* ───── 1. Color Palette ───── */}
          <section>
            <h2 className="mb-2">Color Palette</h2>
            <p className="mb-8">
              The core brand palette used across the entire platform.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              <ColorSwatch
                name="Primary (Navy)"
                variable="--primary"
                hex="#061043"
              />
              <ColorSwatch
                name="Accent (Orange)"
                variable="--accent"
                hex="#DF5101"
                textClass="text-accent-foreground"
              />
              <ColorSwatch
                name="Background"
                variable="--background"
                hex="#FFFFFF"
                textClass="text-foreground"
              />
              <ColorSwatch
                name="Foreground / Text"
                variable="--foreground"
                hex="#111827"
                textClass="text-primary-foreground"
              />
              <ColorSwatch
                name="Muted"
                variable="--muted"
                hex="#F7F8FA"
                textClass="text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
              <ColorSwatch
                name="Success"
                variable="--success"
                hex="#16A34A"
              />
              <ColorSwatch
                name="Warning"
                variable="--warning"
                hex="#EAB308"
              />
              <ColorSwatch
                name="Destructive"
                variable="--destructive"
                hex="#EF4444"
              />
              <ColorSwatch name="Info" variable="--info" hex="#1E40AF" />
            </div>
          </section>

          <Separator />

          {/* ───── 2. Typography ───── */}
          <section>
            <h2 className="mb-2">Typography</h2>
            <p className="mb-8">
              DM Sans is used globally with a clean SaaS hierarchy and
              strong readability across dashboard and marketing surfaces.
            </p>

            <Card>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                    H1 — Extrabold 800
                  </p>
                  <h1>The quick brown fox</h1>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                    H2 — Bold 800
                  </p>
                  <h2>The quick brown fox</h2>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                    H3 — Bold 700
                  </p>
                  <h3>The quick brown fox</h3>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                    H4 — Bold 700
                  </p>
                  <h4>The quick brown fox</h4>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
                    Body — Medium 500
                  </p>
                  <p>
                    RAC Logistics provides premium international shipping and
                    procurement services with a focus on reliability,
                    transparency, and customer satisfaction.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ───── 3. Buttons ───── */}
          <section>
            <h2 className="mb-2">Button System</h2>
            <p className="mb-8">
              Rounded app-style buttons with a clear orange primary and navy
              secondary hierarchy.
            </p>

            <div className="space-y-10">
              {/* Primary variants */}
              <Card>
                <CardHeader>
                  <CardTitle>Primary CTA Buttons</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button variant="default">Default (Orange)</Button>
                  <Button variant="accent">Accent CTA</Button>
                  <Button variant="cta">CTA Button</Button>
                  <Button variant="heroPrimary">Hero Primary</Button>
                </CardContent>
              </Card>

              {/* Secondary / outline */}
              <Card>
                <CardHeader>
                  <CardTitle>Secondary &amp; Outline Buttons</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link Style</Button>
                </CardContent>
              </Card>

              {/* Sizes */}
              <Card>
                <CardHeader>
                  <CardTitle>Button Sizes</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon">
                    <ArrowRight />
                  </Button>
                </CardContent>
              </Card>

              {/* Navigation / Hero */}
              <Card>
                <CardHeader>
                  <CardTitle>Navigation &amp; Hero Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button variant="nav" size="nav">
                      Nav Button
                    </Button>
                    <Button variant="navCta" size="nav">
                      Nav CTA
                    </Button>
                    <Button variant="navSecondary" size="nav">
                      Nav Secondary
                    </Button>
                  </div>
                  <div className="bg-primary p-6 rounded-xl flex flex-wrap gap-4">
                    <Button variant="heroPrimary" size="lg">
                      Hero Primary
                    </Button>
                    <Button variant="heroSecondary" size="lg">
                      Hero Secondary
                    </Button>
                    <Button variant="heroOutline" size="lg">
                      Hero Outline
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Destructive */}
              <Card>
                <CardHeader>
                  <CardTitle>Destructive</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button variant="destructive">Delete</Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ───── 4. Cards ───── */}
          <section>
            <h2 className="mb-2">Cards</h2>
            <p className="mb-8">
              Light cards with soft shadows on the neutral background.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Truck,
                  title: "Air Freight",
                  desc: "Express global air shipping with real‑time tracking.",
                },
                {
                  icon: Globe,
                  title: "Ocean Freight",
                  desc: "Cost‑effective sea cargo for large volumes.",
                },
                {
                  icon: Shield,
                  title: "Customs Clearance",
                  desc: "Hassle‑free import/export documentation.",
                },
              ].map((item) => (
                <Card key={item.title} className="glass-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h4>{item.title}</h4>
                    <p className="text-sm">{item.desc}</p>
                    <Button variant="link" className="px-0">
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* ───── 5. Badges ───── */}
          <section>
            <h2 className="mb-2">Badges</h2>
            <p className="mb-8">Status indicators and labels.</p>

            <div className="flex flex-wrap gap-3">
              <Badge className="bg-primary text-primary-foreground">
                Primary
              </Badge>
              <Badge className="bg-accent text-accent-foreground">
                Accent
              </Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge className="bg-destructive text-destructive-foreground">
                Destructive
              </Badge>
              <Badge className="bg-success text-success-foreground">
                <CheckCircle className="w-3 h-3 mr-1" /> Success
              </Badge>
              <Badge className="bg-warning text-warning-foreground">
                Warning
              </Badge>
            </div>
          </section>

          <Separator />

          {/* ───── 6. Form Inputs ───── */}
          <section>
            <h2 className="mb-2">Form Elements</h2>
            <p className="mb-8">
              Inputs use the orange accent focus ring for brand consistency.
            </p>

            <Card>
              <CardContent className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ds-name">Full Name</Label>
                  <Input id="ds-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ds-email">Email Address</Label>
                  <Input
                    id="ds-email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ds-tracking">Tracking Number</Label>
                  <Input id="ds-tracking" placeholder="RAC-XXXX-XXXX" />
                </div>
                <div className="sm:col-span-2">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto">
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ───── 7. Dark Section Preview ───── */}
          <section>
            <h2 className="mb-2">Dark Section (Navy)</h2>
            <p className="mb-8">
              Used for hero areas, CTAs, and premium sections.
            </p>

            <div className="bg-primary rounded-2xl p-8 sm:p-12 text-primary-foreground">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <h2 className="text-primary-foreground">
                  Ready to Ship with Confidence?
                </h2>
                <p className="text-primary-foreground/75">
                  Join thousands of businesses who trust RAC Logistics for their
                  international shipping and procurement needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="heroPrimary" size="lg">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="heroOutline" size="lg">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ───── 8. Icon Usage ───── */}
          <section>
            <h2 className="mb-2">Iconography</h2>
            <p className="mb-8">
              Lucide icons in accent orange for emphasis, primary navy for neutral
              contexts.
            </p>

            <div className="flex flex-wrap gap-6">
              {[Package, Truck, Globe, Shield, Zap, Star].map((Icon, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Icon.displayName}
                  </span>
                </div>
              ))}
              {[Package, Truck, Globe, Shield, Zap, Star].map((Icon, i) => (
                <div key={`p-${i}`} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Icon.displayName}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* ───── 9. Sidebar Preview ───── */}
          <section>
            <h2 className="mb-2">Sidebar Preview</h2>
            <p className="mb-8">
              Dashboard sidebar uses navy with orange active states and soft app-like panels.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-72 bg-primary rounded-2xl p-4 text-primary-foreground space-y-1">
                <p className="text-xs font-medium text-primary-foreground/40 uppercase tracking-wider px-4 py-2">
                  Main Menu
                </p>
                {[
                  { label: "Overview", active: true },
                  { label: "Shipments", active: false },
                  { label: "Wallet", active: false },
                  { label: "Payments", active: false },
                  { label: "Profile", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      item.active
                        ? "bg-accent text-accent-foreground shadow-lg"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    {item.label}
                  </div>
                ))}
              </div>

              <Card className="flex-1">
                <CardContent className="p-6">
                  <h4 className="mb-2">Dashboard Content Area</h4>
                  <p className="text-sm">
                    The main content sits on a light background with white cards
                    and soft shadows, ensuring strong contrast against the deep
                    blue sidebar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DesignSystem;
