import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Copy, Check, Package } from "lucide-react";

const DashboardHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; country: string | null } | null>(null);
  const [trackingQuery, setTrackingQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, country")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({ full_name: data.full_name ?? null, country: data.country ?? null });
      });
  }, [user]);

  const fullName =
    profile?.full_name ||
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email?.split("@")[0] ||
    "there";
  const firstName = fullName.split(" ")[0];
  const country =
    profile?.country ||
    (user?.user_metadata as { country?: string } | undefined)?.country ||
    "Nigeria";
  const userShortId = user?.id ? `RAC-${user.id.slice(0, 8).toUpperCase()}` : "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackingQuery.trim();
    if (!q) return;
    navigate(`/track?id=${encodeURIComponent(q)}`);
  };

  const copyId = async () => {
    if (!userShortId) return;
    try {
      await navigator.clipboard.writeText(userShortId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="bg-card">
      <div className="mx-auto max-w-[1180px] px-4 py-3 sm:px-5 lg:px-6">
        {/* MOBILE / TABLET: reference-style structured stack */}
        <div className="lg:hidden">
          <div className="grid grid-cols-[40px_1fr] items-center gap-3 pl-12">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[12px] font-bold ring-1 ring-border/60">
              {initials || "U"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[13px] font-bold text-foreground truncate">
                Hello, {firstName} 👋
              </p>
              {userShortId && (
                <button
                  type="button"
                  onClick={copyId}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono font-medium text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Copy your customer ID"
                >
                  <span>{userShortId}</span>
                  {copied ? <Check className="h-2.5 w-2.5 text-accent" /> : <Copy className="h-2.5 w-2.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.2fr] sm:items-center sm:pl-12">
            <Button
              asChild
              className="h-11 rounded-md bg-accent px-5 text-[13px] font-bold text-accent-foreground hover:bg-accent/90 shadow-sm"
            >
              <Link to="/dashboard/shipments/new" className="flex items-center justify-center gap-2">
                <Package className="h-4 w-4" strokeWidth={2.4} />
                Create Shipment
              </Link>
            </Button>

            <div className="flex items-center justify-center rounded-full bg-accent/10 px-4 py-1.5 text-center text-[11px] font-medium leading-tight text-accent">
              You are currently shipping from {country} to the World
            </div>
          </div>

          <form onSubmit={handleTrackingSearch} className="mt-3 w-full sm:pl-12">
            <div className="relative rounded-full bg-muted/60">
              <Input
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Track shipment"
                className="h-12 rounded-full border-0 bg-transparent pl-5 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-accent"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-accent/70 text-accent-foreground hover:bg-accent transition-colors"
                aria-label="Track"
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>

        {/* DESKTOP: 3-col layout (Africanies style) */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
          {/* LEFT — Profile */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold ring-1 ring-border/60">
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-foreground leading-tight">
                Hello, {firstName} 👋
              </p>
              {userShortId && (
                <button
                  type="button"
                  onClick={copyId}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] font-mono font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>{userShortId}</span>
                  {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>

          {/* CENTER — Create Shipment */}
          <div className="flex flex-col items-center">
            <Button
              asChild
              className="h-11 rounded-md bg-accent px-7 text-[14px] font-bold text-accent-foreground hover:bg-accent/90 shadow-sm"
            >
              <Link to="/dashboard/shipments/new" className="flex items-center gap-2">
                <Package className="h-4 w-4" strokeWidth={2.5} />
                Create Shipment
              </Link>
            </Button>
            <p className="mt-1.5 rounded-full bg-accent/10 px-4 py-1 text-[11px] font-medium text-accent">
              You are currently shipping from {country} to the World
            </p>
          </div>

          {/* RIGHT — Tracking */}
          <form onSubmit={handleTrackingSearch} className="justify-self-end w-full max-w-[320px]">
            <div className="relative rounded-full bg-muted/60">
              <Input
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Track shipment"
                className="h-12 rounded-full border-0 bg-transparent pl-8 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-accent"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-accent/70 text-accent-foreground hover:bg-accent transition-colors"
                aria-label="Track"
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
