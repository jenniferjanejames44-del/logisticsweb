import { supabase } from "@/integrations/supabase/client";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled" | "failed";

export interface AudienceFilter {
  scope?: "all" | "active" | "inactive" | "partners" | "customers";
  countries?: string[];
  account_types?: string[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  template_id: string | null;
  subject: string;
  preheader: string | null;
  heading: string | null;
  body_html: string | null;
  cta_label: string | null;
  cta_url: string | null;
  secondary_cta_label: string | null;
  secondary_cta_url: string | null;
  banner_url: string | null;
  footer_text: string | null;
  audience_filter: AudienceFilter;
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  category: string;
  subject: string;
  heading: string | null;
  body_html: string | null;
  cta_label: string | null;
  cta_url: string | null;
  banner_url: string | null;
  footer_text: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSubscriber {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  account_type: string;
  source: string;
  marketing_opt_in: boolean;
  last_activity_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

export async function listCampaigns() {
  const { data, error } = await supabase.from("email_campaigns" as any).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as EmailCampaign[];
}

export async function getCampaign(id: string) {
  const { data, error } = await supabase.from("email_campaigns" as any).select("*").eq("id", id).single();
  if (error) throw error;
  return data as unknown as EmailCampaign;
}

export async function listTemplates() {
  const { data, error } = await supabase.from("email_templates" as any).select("*").order("name");
  if (error) throw error;
  return (data || []) as unknown as EmailTemplate[];
}

export async function listSubscribers(opts?: { search?: string; country?: string; accountType?: string }) {
  let q = supabase.from("email_subscribers" as any).select("*").order("created_at", { ascending: false }).limit(500);
  if (opts?.country) q = q.eq("country", opts.country);
  if (opts?.accountType) q = q.eq("account_type", opts.accountType);
  if (opts?.search) q = q.ilike("email", `%${opts.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as EmailSubscriber[];
}

export async function sendCampaign(campaign_id: string, opts?: { test_email?: string }) {
  const { data, error } = await supabase.functions.invoke("send-campaign", { body: { campaign_id, ...opts } });
  if (error) throw error;
  return data;
}

export async function audienceCount(filter: AudienceFilter): Promise<number> {
  let q = supabase.from("email_subscribers" as any).select("id", { count: "exact", head: true }).eq("marketing_opt_in", true);
  const scope = filter.scope || "all";
  if (scope === "partners") q = q.eq("account_type", "partner");
  else if (scope === "customers") q = q.eq("account_type", "customer");
  else if (scope === "active") q = q.gte("last_activity_at", new Date(Date.now() - 30 * 86400000).toISOString());
  else if (scope === "inactive") q = q.lt("last_activity_at", new Date(Date.now() - 30 * 86400000).toISOString());
  if (filter.countries?.length) q = q.in("country", filter.countries);
  if (filter.account_types?.length) q = q.in("account_type", filter.account_types);
  const { count, error } = await q;
  if (error) throw error;
  return count || 0;
}