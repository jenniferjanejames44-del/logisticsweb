import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Handshake, Copy, ExternalLink, Users, CheckCircle2, Clock, Wallet, ArrowRight, Share2, Mail, Send, Facebook, Twitter, MessageCircle, RotateCcw } from "lucide-react";

interface PartnerRecord {
  id: string;
  status: string;
  full_name: string;
  email: string;
  referral_code: string | null;
  commission_percentage: number;
  created_at: string;
}
interface ReferralRow {
  id: string;
  is_converted: boolean;
  commission_amount: number;
  commission_status: string;
  created_at: string;
}

const formatNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const Partner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<PartnerRecord | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [shareMessage, setShareMessage] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      // Match by user_id OR by email (since application may have been submitted before signup)
      const { data: byUserId } = await (supabase as any)
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      let p = byUserId as PartnerRecord | null;
      if (!p && user.email) {
        const { data: byEmail } = await (supabase as any)
          .from("partners")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();
        p = (byEmail as PartnerRecord | null) || null;
        // Best-effort: link partner row to this user_id for future RLS reads
        if (p && !byUserId) {
          await (supabase as any).from("partners").update({ user_id: user.id }).eq("id", p.id);
        }
      }
      setPartner(p);

      if (p?.id) {
        const { data: refs } = await (supabase as any)
          .from("referrals")
          .select("*")
          .eq("partner_id", p.id)
          .order("created_at", { ascending: false });
        setReferrals((refs as ReferralRow[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const referralLink = partner?.referral_code
    ? `${window.location.origin}/auth?ref=${partner.referral_code}`
    : "";

  const defaultMessage = referralLink
    ? `Ship smarter with RAC Logistics! Use my referral link to sign up and get started: ${referralLink}`
    : "";

  // Load saved message (per partner) from localStorage, fall back to default
  useEffect(() => {
    if (!partner?.id) return;
    const saved = localStorage.getItem(`rac_partner_share_msg_${partner.id}`);
    setShareMessage(saved && saved.trim().length > 0 ? saved : defaultMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.id, referralLink]);

  const persistMessage = (val: string) => {
    setShareMessage(val);
    if (partner?.id) {
      localStorage.setItem(`rac_partner_share_msg_${partner.id}`, val);
    }
  };

  const resetMessage = () => {
    persistMessage(defaultMessage);
    toast.success("Message reset to default");
  };

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied`);
  };

  const openShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  // Ensure the referral link is always present in the outgoing message,
  // even if the user removes it from the editable field.
  const messageWithLink = shareMessage.includes(referralLink)
    ? shareMessage
    : `${shareMessage.trim()}\n\n${referralLink}`.trim();

  const shareTargets = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      className: "bg-[#25D366] hover:bg-[#1faa53] text-white border-transparent",
      url: () => `https://wa.me/?text=${encodeURIComponent(messageWithLink)}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: Send,
      className: "bg-[#229ED9] hover:bg-[#1b86b8] text-white border-transparent",
      url: () => `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`,
    },
    {
      key: "twitter",
      label: "X / Twitter",
      icon: Twitter,
      className: "bg-foreground hover:bg-foreground/90 text-background border-transparent",
      url: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(messageWithLink)}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: Facebook,
      className: "bg-[#1877F2] hover:bg-[#145fc5] text-white border-transparent",
      url: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      className: "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent",
      url: () => `mailto:?subject=${encodeURIComponent("Try RAC Logistics")}&body=${encodeURIComponent(messageWithLink)}`,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RAC Logistics — Partner referral",
          text: shareMessage,
          url: referralLink,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy(messageWithLink, "Message");
    }
  };

  const totalReferrals = referrals.length;
  const successful = referrals.filter((r) => r.is_converted).length;
  const estimatedCommission = referrals.reduce((sum, r) => sum + Number(r.commission_amount || 0), 0);
  const paidCommission = referrals
    .filter((r) => r.commission_status === "paid")
    .reduce((sum, r) => sum + Number(r.commission_amount || 0), 0);

  return (
    <DashboardLayout title="Partner Program" description="Refer customers and earn commission on their shipments.">
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Loading partner info…</div>
      ) : !partner ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Handshake className="w-7 h-7" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">You're not a partner yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Apply to our partner program to start earning commissions for every customer you refer.
            </p>
            <Button asChild variant="accent" className="mt-6">
              <Link to="/partners">Apply Now <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      ) : partner.status === "pending" ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Application under review</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Thanks for applying! Our team is reviewing your application. You'll be notified once you're approved.
            </p>
          </CardContent>
        </Card>
      ) : partner.status === "rejected" ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">Application not approved</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Unfortunately, your partner application wasn't approved at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Status banner */}
          <Card className="border-accent/30 bg-accent/[0.04]">
            <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">You're an approved partner</p>
                  <p className="text-xs text-muted-foreground">Earning {partner.commission_percentage}% on every paid shipment from your referrals.</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Active</Badge>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Referrals" value={totalReferrals.toString()} />
            <StatCard icon={CheckCircle2} label="Successful" value={successful.toString()} />
            <StatCard icon={Wallet} label="Estimated Commission" value={formatNGN(estimatedCommission)} />
            <StatCard icon={Wallet} label="Paid Out" value={formatNGN(paidCommission)} />
          </div>

          {/* Referral code & link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your referral link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Referral code</label>
                <div className="mt-1 flex gap-2">
                  <Input readOnly value={partner.referral_code || ""} className="font-mono" />
                  <Button variant="outline" size="icon" onClick={() => copy(partner.referral_code || "", "Code")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Shareable link</label>
                <div className="mt-1 flex gap-2">
                  <Input readOnly value={referralLink} className="text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copy(referralLink, "Link")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={referralLink} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a>
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Anyone who signs up through this link is permanently linked to your account.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Your share message</Label>
                  <Button variant="ghost" size="sm" onClick={resetMessage} className="h-8 text-xs">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                  </Button>
                </div>
                <Textarea
                  value={shareMessage}
                  onChange={(e) => persistMessage(e.target.value)}
                  rows={3}
                  className="mt-2 text-sm"
                  placeholder="Write the message your contacts will see…"
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Saved on this device. Your referral link is always appended automatically.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => copy(messageWithLink, "Message")} className="h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Share with one tap</Label>
                  <Button variant="ghost" size="sm" onClick={handleNativeShare} className="h-8 text-xs">
                    <Share2 className="w-3.5 h-3.5 mr-1.5" /> More
                  </Button>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {shareTargets.map((t) => (
                    <Button
                      key={t.key}
                      type="button"
                      variant="outline"
                      onClick={() => openShare(t.url())}
                      className={`justify-center gap-2 ${t.className}`}
                    >
                      <t.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{t.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tap a channel to send your custom message with your referral link.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Referrals list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No referrals yet. Share your link to get started.
                </p>
              ) : (
                <div className="divide-y divide-border/60">
                  {referrals.slice(0, 20).map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {r.is_converted ? "Converted referral" : "Pending signup"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {Number(r.commission_amount) > 0 ? formatNGN(Number(r.commission_amount)) : "—"}
                        </p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {r.commission_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Partner;