import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Copy, Check } from "lucide-react";

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
    <div className="bg-white">
      <div className="mx-auto max-w-[1180px] pl-16 pr-4 py-3 sm:pl-5 sm:pr-5 sm:py-4 lg:px-6">
        {/* MOBILE / TABLET: clean vertical stack */}
        <div className="flex flex-col gap-3 lg:hidden">
          {/* Row 1: avatar + greeting + ID */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary text-[12px] font-bold ring-1 ring-primary/10">
              {initials || "U"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[14px] font-semibold text-foreground truncate">
                Hello, {firstName} 👋
              </p>
              {userShortId && (
                <button
                  type="button"
                  onClick={copyId}
                  className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-mono font-medium text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Copy your customer ID"
                >
                  <span>{userShortId}</span>
                  {copied ? <Check className="h-2.5 w-2.5 text-accent" /> : <Copy className="h-2.5 w-2.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Full-width Create Shipment */}
          <Button
            asChild
            className="h-11 w-full rounded-full bg-accent px-5 text-[14px] font-semibold text-white hover:bg-accent/90 shadow-[0_4px_14px_-4px_rgba(223,81,1,0.4)]"
          >
            <Link to="/dashboard/shipments/new" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Create Shipment
            </Link>
          </Button>

          {/* Row 3: Tracking search */}
          <form onSubmit={handleTrackingSearch} className="w-full">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Track shipment"
                className="h-11 rounded-full bg-muted/40 pl-10 pr-12 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 border border-border/60 focus-visible:ring-1 focus-visible:ring-accent focus-visible:bg-white"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
                aria-label="Track"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>

        {/* DESKTOP: 3-col layout (Africanies style) */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
          {/* LEFT — Profile */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary text-sm font-bold ring-1 ring-primary/10">
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
              className="h-11 rounded-full bg-accent px-6 text-[14px] font-semibold text-white hover:bg-accent/90 shadow-[0_4px_14px_-4px_rgba(223,81,1,0.45)]"
            >
              <Link to="/dashboard/shipments/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Create Shipment
              </Link>
            </Button>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Shipping from <span className="font-semibold text-foreground">{country}</span> to the World
            </p>
          </div>

          {/* RIGHT — Tracking */}
          <form onSubmit={handleTrackingSearch} className="justify-self-end w-full max-w-[320px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Track shipment"
                className="h-11 rounded-full bg-muted/40 pl-10 pr-12 text-[13.5px] text-foreground placeholder:text-muted-foreground/60 border border-border/60 focus-visible:ring-1 focus-visible:ring-accent focus-visible:bg-white"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
                aria-label="Track"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
