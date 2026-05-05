import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowRight,
  Search,
  Globe2,
  User as UserIcon,
  Copy,
  Check,
} from "lucide-react";

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
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#0a1a6b]">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" aria-hidden />

      <div className="relative mx-auto max-w-[1180px] px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-3">
          {/* LEFT — Greeting + ID */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/20">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white sm:text-base truncate">
                Hello, {firstName} 👋
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/70">
                <Globe2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Shipping from {country} to the world</span>
              </div>
              {userShortId && (
                <button
                  type="button"
                  onClick={copyId}
                  className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-white/85 hover:bg-white/15 transition-colors"
                  aria-label="Copy your customer ID"
                >
                  <span>ID: {userShortId}</span>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>

          {/* CENTER — Create Shipment CTA */}
          <div className="flex justify-center">
            <Button
              asChild
              className="h-12 w-full max-w-xs rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-lg hover:bg-accent/90 hover:scale-[1.02] transition-transform"
            >
              <Link to="/dashboard/shipments/new" className="flex items-center justify-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  <Plus className="h-4 w-4" />
                </span>
                Create Shipment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* RIGHT — Tracking search */}
          <form onSubmit={handleTrackingSearch} className="lg:justify-self-end w-full lg:max-w-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Enter Tracking ID"
                className="h-11 rounded-xl bg-white pl-9 pr-24 text-sm text-foreground placeholder:text-muted-foreground/70 border-0 focus-visible:ring-2 focus-visible:ring-accent"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-accent px-3 text-xs font-semibold text-white hover:bg-accent/90"
              >
                Track
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
