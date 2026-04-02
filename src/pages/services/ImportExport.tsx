import { Link } from "react-router-dom";
import { Globe, ArrowRight, Send } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ImportExport = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="hero-gradient relative overflow-hidden bg-primary pb-20 pt-32 md:pb-24 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,81,1,0.18),transparent_32%)]" />
          <div className="section-container relative z-10 text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
              <Globe className="h-4 w-4 text-accent" /> Trade Services
            </span>
            <h1 className="mb-6 text-white">Choose the right international workflow</h1>
            <p className="hero-subtext mx-auto mb-6 max-w-3xl text-lg leading-relaxed">
              Import and export now have dedicated service pages so customers can move into the correct shipment workflow with less confusion.
            </p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="section-container grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Import Service",
                description: "Use this path when goods are moving from a supported RAC warehouse country into the final destination market.",
                href: "/services/import",
              },
              {
                title: "Export Service",
                description: "Use this path when you are shipping internationally to a supported destination country.",
                href: "/services/export",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/60 bg-card shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                <CardContent className="p-8">
                  <span className="icon-surface mb-5 h-12 w-12 border-primary/10 bg-primary/5"><Send className="h-5 w-5 text-primary" /></span>
                  <h2 className="text-foreground">{item.title}</h2>
                  <p className="mt-3 text-muted-foreground">{item.description}</p>
                  <Button asChild variant="default" className="mt-6">
                    <Link to={item.href}>Open service page <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default ImportExport;
