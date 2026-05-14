import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Send, Users, FileText, BarChart3, Calendar, Loader2 } from "lucide-react";
import EmailPreview from "@/components/admin/email/EmailPreview";
import ImageUpload from "@/components/admin/email/ImageUpload";
import { listCampaigns, listTemplates, listSubscribers, sendCampaign, audienceCount, type EmailCampaign, type EmailTemplate, type EmailSubscriber, type AudienceFilter } from "@/lib/emailCampaigns";
import { supabase } from "@/integrations/supabase/client";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-muted text-foreground",
  scheduled: "bg-blue-100 text-blue-800",
  sending: "bg-amber-100 text-amber-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminEmail() {
  const [tab, setTab] = useState("dashboard");
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [c, t, s] = await Promise.all([listCampaigns(), listTemplates(), listSubscribers()]);
      setCampaigns(c); setTemplates(t); setSubscribers(s);
    } catch (e: any) { toast.error(e.message || "Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => {
    const sent = campaigns.reduce((a, c) => a + (c.sent_count || 0), 0);
    const opened = campaigns.reduce((a, c) => a + (c.opened_count || 0), 0);
    const clicked = campaigns.reduce((a, c) => a + (c.clicked_count || 0), 0);
    const optedIn = subscribers.filter(s => s.marketing_opt_in).length;
    return {
      sent, opened, clicked, optedIn,
      openRate: sent ? Math.round((opened / sent) * 100) : 0,
      clickRate: sent ? Math.round((clicked / sent) * 100) : 0,
    };
  }, [campaigns, subscribers]);

  return (
    <AdminLayout title="Email Campaigns" description="Create campaigns, manage subscribers, and send branded emails.">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-white border border-border/50 mb-6 flex-wrap h-auto">
          <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-2"/>Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns"><Mail className="w-4 h-4 mr-2"/>Campaigns</TabsTrigger>
          <TabsTrigger value="create"><Send className="w-4 h-4 mr-2"/>Create</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="w-4 h-4 mr-2"/>Templates</TabsTrigger>
          <TabsTrigger value="subscribers"><Users className="w-4 h-4 mr-2"/>Subscribers</TabsTrigger>
          <TabsTrigger value="scheduled"><Calendar className="w-4 h-4 mr-2"/>Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Subscribers", value: stats.optedIn },
              { label: "Emails sent", value: stats.sent },
              { label: "Open rate", value: `${stats.openRate}%` },
              { label: "Click rate", value: `${stats.clickRate}%` },
            ].map(s => (
              <Card key={s.label} className="p-5">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-primary">{s.value}</p>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border/50"><h3 className="font-semibold">Recent campaigns</h3></div>
            <div className="divide-y divide-border/40">
              {campaigns.slice(0,8).map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{c.sent_count}/{c.total_recipients} sent</span>
                    <Badge className={STATUS_COLOR[c.status]}>{c.status}</Badge>
                  </div>
                </div>
              ))}
              {!campaigns.length && !loading && <div className="p-8 text-center text-muted-foreground text-sm">No campaigns yet.</div>}
              {loading && <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline"/></div>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Status</th><th className="text-left p-3">Recipients</th><th className="text-left p-3">Sent</th><th className="text-left p-3">Opened</th><th className="text-left p-3">Created</th></tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td className="p-3"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.subject}</p></td>
                      <td className="p-3"><Badge className={STATUS_COLOR[c.status]}>{c.status}</Badge></td>
                      <td className="p-3">{c.total_recipients}</td>
                      <td className="p-3">{c.sent_count}</td>
                      <td className="p-3">{c.opened_count}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!campaigns.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No campaigns yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <CampaignBuilder templates={templates} onSaved={refresh} />
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <Card key={t.id} className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold">{t.name}</p>
                  <Badge variant="outline" className="text-[10px] uppercase">{t.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{t.subject}</p>
                <p className="text-[11px] text-muted-foreground">/{t.slug}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold">{subscribers.length} subscribers</h3>
              <span className="text-xs text-muted-foreground">{subscribers.filter(s => s.marketing_opt_in).length} opted in</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground"><tr>
                  <th className="text-left p-3">Email</th><th className="text-left p-3">Name</th><th className="text-left p-3">Type</th><th className="text-left p-3">Country</th><th className="text-left p-3">Opt-in</th>
                </tr></thead>
                <tbody className="divide-y divide-border/40">
                  {subscribers.map(s => (
                    <tr key={s.id}>
                      <td className="p-3 font-medium">{s.email}</td>
                      <td className="p-3">{s.full_name || "-"}</td>
                      <td className="p-3"><Badge variant="outline">{s.account_type}</Badge></td>
                      <td className="p-3">{s.country || "-"}</td>
                      <td className="p-3">{s.marketing_opt_in ? <Badge className="bg-green-100 text-green-800">Yes</Badge> : <Badge variant="outline">No</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="overflow-hidden">
            <div className="divide-y divide-border/40">
              {campaigns.filter(c => c.status === "scheduled").map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                  <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">Sends {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : ""}</p></div>
                  <Button variant="outline" size="sm" onClick={async () => { await supabase.from("email_campaigns" as any).update({ status: "cancelled" }).eq("id", c.id); refresh(); }}>Cancel</Button>
                </div>
              ))}
              {!campaigns.some(c => c.status === "scheduled") && <div className="p-8 text-center text-muted-foreground text-sm">No scheduled campaigns.</div>}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function CampaignBuilder({ templates, onSaved }: { templates: EmailTemplate[]; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("<p>Hi {{name}},</p><p>Write your message here.</p>");
  const [ctaLabel, setCtaLabel] = useState("Visit RAC Logistics");
  const [ctaUrl, setCtaUrl] = useState("https://raclogisticltd.com");
  const [secCtaLabel, setSecCtaLabel] = useState("");
  const [secCtaUrl, setSecCtaUrl] = useState("");
  const [banner, setBanner] = useState("");
  const [footer, setFooter] = useState("RAC Logistics — moving the world for you.");
  const [scope, setScope] = useState<AudienceFilter["scope"]>("all");
  const [scheduleAt, setScheduleAt] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { audienceCount({ scope }).then(setCount).catch(() => setCount(null)); }, [scope]);

  const applyTemplate = (slug: string) => {
    const t = templates.find(x => x.slug === slug); if (!t) return;
    setSubject(t.subject); setHeading(t.heading || ""); setBody(t.body_html || "");
    setCtaLabel(t.cta_label || ""); setCtaUrl(t.cta_url || ""); setBanner(t.banner_url || ""); setFooter(t.footer_text || "");
    if (!name) setName(t.name);
  };

  const save = async (status: "draft" | "scheduled" | "send_now"): Promise<void> => {
    if (!name || !subject) { toast.error("Name and subject are required"); return; }
    setBusy(true);
    try {
      const payload: any = {
        name, subject, preheader, heading, body_html: body,
        cta_label: ctaLabel, cta_url: ctaUrl,
        secondary_cta_label: secCtaLabel || null, secondary_cta_url: secCtaUrl || null,
        banner_url: banner || null, footer_text: footer,
        audience_filter: { scope },
        status: status === "send_now" ? "draft" : status,
        scheduled_at: status === "scheduled" && scheduleAt ? new Date(scheduleAt).toISOString() : null,
      };
      const { data, error } = await supabase.from("email_campaigns" as any).insert(payload).select().single();
      if (error) throw error;
      if (status === "send_now") {
        await sendCampaign((data as any).id);
        toast.success("Campaign sent");
      } else if (status === "scheduled") {
        toast.success("Campaign scheduled");
      } else {
        toast.success("Draft saved");
      }
      onSaved();
    } catch (e: any) { toast.error(e.message || "Save failed"); }
    setBusy(false);
  };

  const sendTest = async () => {
    if (!testEmail) { toast.error("Enter a test email"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.from("email_campaigns" as any).insert({
        name: name || "Test campaign", subject, preheader, heading, body_html: body,
        cta_label: ctaLabel, cta_url: ctaUrl,
        secondary_cta_label: secCtaLabel || null, secondary_cta_url: secCtaUrl || null,
        banner_url: banner || null, footer_text: footer,
        audience_filter: { scope }, status: "draft",
      }).select().single();
      if (error) throw error;
      await sendCampaign((data as any).id, { test_email: testEmail });
      toast.success(`Test sent to ${testEmail}`);
    } catch (e: any) { toast.error(e.message || "Test failed"); }
    setBusy(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-6">
        {/* SECTION: Template */}
        <section className="space-y-2">
          <SectionTitle>1. Start from a template</SectionTitle>
          <Select onValueChange={applyTemplate}>
            <SelectTrigger><SelectValue placeholder="Choose a template (optional)…"/></SelectTrigger>
            <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.slug}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </section>

        {/* SECTION: Setup */}
        <section className="space-y-3 border-t border-border/50 pt-5">
          <SectionTitle>2. Campaign setup</SectionTitle>
          <div><Label>Campaign name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="December Promo"/></div>
          <div><Label>Subject line</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Special holiday rates inside"/></div>
          <div>
            <Label>Preheader text <span className="text-xs text-muted-foreground font-normal">(preview snippet in inbox)</span></Label>
            <Input value={preheader} onChange={e => setPreheader(e.target.value)} placeholder="A short hook your subscribers see before opening"/>
          </div>
        </section>

        {/* SECTION: Hero image */}
        <section className="space-y-3 border-t border-border/50 pt-5">
          <SectionTitle>3. Hero banner</SectionTitle>
          <ImageUpload value={banner} onChange={setBanner} label="" hint="Recommended 1200×400px. Used at the top of your email." />
        </section>

        {/* SECTION: Content */}
        <section className="space-y-3 border-t border-border/50 pt-5">
          <SectionTitle>4. Content</SectionTitle>
          <div><Label>Headline</Label><Input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Save big this season"/></div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Body</Label>
              <span className="text-[11px] text-muted-foreground">HTML supported · use {"{{name}}"} to personalize</span>
            </div>
            <Textarea ref={bodyRef} rows={8} value={body} onChange={e => setBody(e.target.value)} className="font-mono text-[13px]"/>
            <InsertImageButton onInsert={(url) => {
              const tag = `\n<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;"/>\n`;
              const el = bodyRef.current;
              if (el) {
                const start = el.selectionStart || body.length;
                setBody(body.slice(0, start) + tag + body.slice(start));
              } else { setBody(body + tag); }
            }}/>
          </div>
        </section>

        {/* SECTION: CTAs */}
        <section className="space-y-3 border-t border-border/50 pt-5">
          <SectionTitle>5. Call to action</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Primary button</Label><Input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="Get a quote"/></div>
            <div><Label>Primary link</Label><Input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="https://…"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Secondary button <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label><Input value={secCtaLabel} onChange={e => setSecCtaLabel(e.target.value)} placeholder="Learn more"/></div>
            <div><Label>Secondary link</Label><Input value={secCtaUrl} onChange={e => setSecCtaUrl(e.target.value)} placeholder="https://…"/></div>
          </div>
          <div><Label>Footer note</Label><Input value={footer} onChange={e => setFooter(e.target.value)}/></div>
        </section>

        {/* SECTION: Audience */}
        <section className="space-y-3 border-t border-border/50 pt-5">
          <SectionTitle>6. Audience</SectionTitle>
          <Label className="text-sm font-semibold">Audience</Label>
          <Select value={scope} onValueChange={(v: any) => setScope(v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subscribers</SelectItem>
              <SelectItem value="active">Active (last 30 days)</SelectItem>
              <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
              <SelectItem value="customers">Customers only</SelectItem>
              <SelectItem value="partners">Partners only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{count ?? "—"} matching subscribers (opted in)</p>
        </section>

        {/* SECTION: Schedule + Test */}
        <section className="space-y-3 border-t border-border/50 pt-5">
          <SectionTitle>7. Schedule &amp; test</SectionTitle>
          <div>
            <Label>Send at <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
            <Input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} />
          </div>
          <div>
            <Label>Send a test to your inbox</Label>
            <div className="flex gap-2">
              <Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="you@example.com" type="email"/>
              <Button variant="outline" disabled={busy} onClick={sendTest}>Send test</Button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <Button variant="outline" disabled={busy} onClick={() => save("draft")}>Save draft</Button>
          <Button variant="outline" disabled={busy || !scheduleAt} onClick={() => save("scheduled")}>Schedule</Button>
          <Button disabled={busy} onClick={() => save("send_now")}>{busy ? <Loader2 className="w-4 h-4 animate-spin"/> : "Send now"}</Button>
        </div>
      </Card>

      <div className="lg:sticky lg:top-6 self-start">
        <EmailPreview
          subject={subject}
          preheader={preheader}
          heading={heading}
          bodyHtml={body}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          secondaryCtaLabel={secCtaLabel}
          secondaryCtaUrl={secCtaUrl}
          bannerUrl={banner}
          footerText={footer}
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-semibold uppercase tracking-wider text-primary">{children}</h3>;
}

function InsertImageButton({ onInsert }: { onInsert: (url: string) => void }) {
  return (
    <div className="mt-2">
      <ImageUpload value="" onChange={(url) => url && onInsert(url)} label="Insert image into body" aspect="aspect-[6/1]" hint="Uploaded image will be inserted at your cursor position." />
    </div>
  );
}