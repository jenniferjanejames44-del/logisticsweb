import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, CheckCircle2, XCircle, Settings, Wallet } from "lucide-react";

interface Partner {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  business_name: string | null;
  social_link: string | null;
  referral_plan: string | null;
  message: string | null;
  status: string;
  referral_code: string | null;
  commission_percentage: number;
  created_at: string;
}
interface ReferralRow {
  id: string;
  partner_id: string;
  referred_user_id: string;
  is_converted: boolean;
  commission_amount: number;
  commission_status: string;
  created_at: string;
}
interface PartnerSettings {
  id: number;
  default_commission_percentage: number;
  minimum_payout_threshold: number;
}

const AdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [settings, setSettings] = useState<PartnerSettings | null>(null);
  const [viewing, setViewing] = useState<Partner | null>(null);
  const [editPct, setEditPct] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }, { data: s }] = await Promise.all([
      (supabase as any).from("partners").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("referrals").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("partner_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    setPartners((p as Partner[]) || []);
    setReferrals((r as ReferralRow[]) || []);
    setSettings((s as PartnerSettings) || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (partner: Partner, status: "approved" | "rejected") => {
    const update: any = { status };
    if (status === "rejected") update.rejected_at = new Date().toISOString();
    const { error } = await (supabase as any).from("partners").update(update).eq("id", partner.id);
    if (error) return toast.error(error.message);
    toast.success(`Partner ${status}`);

    // Re-fetch the partner to get the auto-generated referral_code (set by trigger on approval)
    try {
      const { data: fresh } = await (supabase as any)
        .from("partners")
        .select("*")
        .eq("id", partner.id)
        .single();
      const p = (fresh as Partner) || partner;

      if (status === "approved") {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "partner_approved",
            data: {
              partner_email: p.email,
              partner_name: p.full_name,
              referral_code: p.referral_code,
            },
          },
        });
      } else {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "partner_rejected",
            data: {
              partner_email: p.email,
              partner_name: p.full_name,
            },
          },
        });
      }
    } catch (emailErr) {
      console.error("Partner status email failed:", emailErr);
    }

    load();
  };

  const updateCommission = async () => {
    if (!viewing) return;
    const pct = parseFloat(editPct);
    if (isNaN(pct) || pct < 0 || pct > 100) return toast.error("Enter a valid percentage (0–100)");
    const { error } = await (supabase as any).from("partners").update({ commission_percentage: pct }).eq("id", viewing.id);
    if (error) return toast.error(error.message);
    toast.success("Commission updated");
    setViewing({ ...viewing, commission_percentage: pct });
    load();
  };

  const markPaid = async (refId: string) => {
    const { error } = await (supabase as any)
      .from("referrals")
      .update({ commission_status: "paid", paid_at: new Date().toISOString() })
      .eq("id", refId);
    if (error) return toast.error(error.message);
    toast.success("Marked as paid");
    load();
  };

  const saveSettings = async () => {
    if (!settings) return;
    const { error } = await (supabase as any)
      .from("partner_settings")
      .update({
        default_commission_percentage: settings.default_commission_percentage,
        minimum_payout_threshold: settings.minimum_payout_threshold,
      })
      .eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return <Badge variant="outline" className={map[s] || ""}>{s}</Badge>;
  };

  const referralStats = (partnerId: string) => {
    const rs = referrals.filter((r) => r.partner_id === partnerId);
    return {
      total: rs.length,
      converted: rs.filter((r) => r.is_converted).length,
      earned: rs.reduce((sum, r) => sum + Number(r.commission_amount || 0), 0),
    };
  };

  return (
    <AdminLayout title="Partners" description="Manage affiliate applications, commissions and payouts.">
      <Tabs defaultValue="applications" className="space-y-5">
        <TabsList>
          <TabsTrigger value="applications">Partners</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
              ) : partners.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No applications yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((p) => {
                      const st = referralStats(p.id);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.full_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                          <TableCell className="text-sm">{p.country || "—"}</TableCell>
                          <TableCell>{statusBadge(p.status)}</TableCell>
                          <TableCell className="font-mono text-xs">{p.referral_code || "—"}</TableCell>
                          <TableCell className="text-sm">{p.commission_percentage}%</TableCell>
                          <TableCell className="text-sm">{st.converted}/{st.total}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => { setViewing(p); setEditPct(p.commission_percentage.toString()); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {p.status !== "approved" && (
                                <Button size="icon" variant="ghost" onClick={() => updateStatus(p, "approved")} title="Approve">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </Button>
                              )}
                              {p.status !== "rejected" && (
                                <Button size="icon" variant="ghost" onClick={() => updateStatus(p, "rejected")} title="Reject">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {referrals.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No referrals yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Converted</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((r) => {
                      const partner = partners.find((p) => p.id === r.partner_id);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-sm">{partner?.full_name || "—"}</TableCell>
                          <TableCell>{r.is_converted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                          <TableCell className="font-medium">{Number(r.commission_amount).toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline">{r.commission_status}</Badge></TableCell>
                          <TableCell className="text-right">
                            {r.commission_status !== "paid" && r.is_converted && (
                              <Button size="sm" variant="outline" onClick={() => markPaid(r.id)}>
                                <Wallet className="w-3.5 h-3.5 mr-1" /> Mark Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-6 max-w-md space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Settings className="w-4 h-4" /> Global partner settings
              </div>
              {settings && (
                <>
                  <div className="space-y-2">
                    <Label>Default commission %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={settings.default_commission_percentage}
                      onChange={(e) => setSettings({ ...settings, default_commission_percentage: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Applied to new partners on approval (existing partners keep their own rate).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum payout threshold</Label>
                    <Input
                      type="number"
                      min={0}
                      step="100"
                      value={settings.minimum_payout_threshold}
                      onChange={(e) => setSettings({ ...settings, minimum_payout_threshold: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Button onClick={saveSettings}>Save settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Partner detail dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.full_name}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <Row label="Email" value={viewing.email} />
              <Row label="Phone" value={viewing.phone || "—"} />
              <Row label="Country / City" value={`${viewing.country || "—"} / ${viewing.city || "—"}`} />
              <Row label="Business" value={viewing.business_name || "—"} />
              <Row label="Social / Site" value={viewing.social_link || "—"} />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Referral plan</p>
                <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{viewing.referral_plan || "—"}</p>
              </div>
              {viewing.message && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                  <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{viewing.message}</p>
                </div>
              )}
              <Row label="Status" value={viewing.status} />
              <Row label="Referral code" value={viewing.referral_code || "— (assigned on approval)"} />
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label>Commission percentage</Label>
                <div className="flex gap-2">
                  <Input type="number" min={0} max={100} step="0.5" value={editPct} onChange={(e) => setEditPct(e.target.value)} />
                  <Button onClick={updateCommission}>Update</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground text-right break-all">{value}</span>
  </div>
);

export default AdminPartners;