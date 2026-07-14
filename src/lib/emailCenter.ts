import { supabase } from "@/integrations/supabase/client";

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  position: string | null;
  country: string | null;
  industry: string | null;
  status: string;
  tags: string[];
  notes: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  subject: string;
  body_html: string;
  is_system: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  subject: string;
  body_html: string;
  to_recipients: string[];
  cc_recipients: string[];
  bcc_recipients: string[];
  attachments: AttachmentMeta[];
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  error_message: string | null;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  scheduled_at: string | null;
  template_name: string | null;
  from_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttachmentMeta {
  name: string;
  path: string;
  size: number;
  contentType?: string;
}

export interface Settings {
  id: number;
  company_name: string;
  slogan: string;
  logo_url: string;
  website: string;
  address: string;
  phone: string;
  support_email: string;
  primary_color: string;
  accent_color: string;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  whatsapp_url: string | null;
}

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await (supabase as any).from("email_center_company_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}
export async function updateSettings(patch: Partial<Settings>) {
  const { error } = await (supabase as any).from("email_center_company_settings").update(patch).eq("id", 1);
  if (error) throw error;
}

export async function listContacts(): Promise<Contact[]> {
  const { data, error } = await (supabase as any).from("email_center_contacts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Contact[]) || [];
}
export async function upsertContact(c: Partial<Contact> & { email: string; full_name: string }) {
  const { data, error } = await (supabase as any).from("email_center_contacts").upsert(c as any, { onConflict: "email" }).select().single();
  if (error) throw error;
  return data as Contact;
}
export async function deleteContact(id: string) {
  const { error } = await (supabase as any).from("email_center_contacts").delete().eq("id", id);
  if (error) throw error;
}

export async function listTemplates(): Promise<Template[]> {
  const { data, error } = await (supabase as any).from("email_center_templates").select("*").order("is_system", { ascending: false }).order("name");
  if (error) throw error;
  return (data as Template[]) || [];
}
export async function saveTemplate(t: Partial<Template> & { id?: string; name: string; subject: string; body_html: string; category?: string }) {
  if (t.id) {
    const { error } = await (supabase as any).from("email_center_templates").update({ name: t.name, subject: t.subject, body_html: t.body_html, category: t.category || "general" }).eq("id", t.id);
    if (error) throw error;
  } else {
    const { error } = await (supabase as any).from("email_center_templates").insert({ name: t.name, subject: t.subject, body_html: t.body_html, category: t.category || "general" });
    if (error) throw error;
  }
}
export async function deleteTemplate(id: string) {
  const { error } = await (supabase as any).from("email_center_templates").delete().eq("id", id);
  if (error) throw error;
}
export async function duplicateTemplate(t: Template) {
  const { error } = await (supabase as any).from("email_center_templates").insert({
    name: `${t.name} (copy)`, subject: t.subject, body_html: t.body_html, category: t.category,
  });
  if (error) throw error;
}

export async function listMessages(status?: string): Promise<Message[]> {
  let q = (supabase as any).from("email_center_messages").select("*").order("updated_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Message[]) || [];
}
export async function saveDraft(m: Partial<Message> & { id?: string }) {
  if (m.id) {
    const { error } = await (supabase as any).from("email_center_messages").update({
      subject: m.subject, body_html: m.body_html,
      to_recipients: m.to_recipients, cc_recipients: m.cc_recipients, bcc_recipients: m.bcc_recipients,
      attachments: m.attachments,
      template_name: m.template_name ?? null,
      from_name: m.from_name ?? null,
    }).eq("id", m.id);
    if (error) throw error;
    return m.id;
  }
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await (supabase as any).from("email_center_messages").insert({
    subject: m.subject || "", body_html: m.body_html || "",
    to_recipients: m.to_recipients || [], cc_recipients: m.cc_recipients || [], bcc_recipients: m.bcc_recipients || [],
    attachments: m.attachments || [],
    template_name: m.template_name ?? null,
    from_name: m.from_name ?? null,
    created_by: user.user?.id,
    status: "draft",
  }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function scheduleMessage(id: string, scheduledAt: Date) {
  const { error } = await (supabase as any).from("email_center_messages")
    .update({ status: "scheduled", scheduled_at: scheduledAt.toISOString() })
    .eq("id", id);
  if (error) throw error;
}
export async function unscheduleMessage(id: string) {
  const { error } = await (supabase as any).from("email_center_messages")
    .update({ status: "draft", scheduled_at: null })
    .eq("id", id);
  if (error) throw error;
}

export async function sendTestEmail(m: { subject: string; bodyHtml: string; testTo: string; fromName?: string; attachments?: AttachmentMeta[] }) {
  const { data, error } = await supabase.functions.invoke("send-branded-email", {
    body: {
      subject: m.subject, bodyHtml: m.bodyHtml,
      to: [], testTo: m.testTo, fromName: m.fromName, attachments: m.attachments,
      personalize: true,
    },
  });
  if (error) throw error;
  return data;
}
export async function deleteMessage(id: string) {
  const { error } = await (supabase as any).from("email_center_messages").delete().eq("id", id);
  if (error) throw error;
}

export async function sendMessage(m: {
  id: string;
  subject: string; bodyHtml: string;
  to: string[]; cc?: string[]; bcc?: string[];
  attachments?: AttachmentMeta[];
  fromName?: string;
}) {
  await (supabase as any).from("email_center_messages").update({ status: "sending" }).eq("id", m.id);
  const { data, error } = await supabase.functions.invoke("send-branded-email", {
    body: {
      messageId: m.id, subject: m.subject, bodyHtml: m.bodyHtml,
      to: m.to, cc: m.cc, bcc: m.bcc, attachments: m.attachments,
      fromName: m.fromName, personalize: true,
    },
  });
  if (error) {
    await (supabase as any).from("email_center_messages").update({ status: "failed", error_message: error.message }).eq("id", m.id);
    throw error;
  }
  return data as { sent: number; failed: number; errors?: string[] };
}

export async function uploadAttachment(file: File): Promise<AttachmentMeta> {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
  const { error } = await supabase.storage.from("email-attachments").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return { name: file.name, path, size: file.size, contentType: file.type };
}
export async function removeAttachment(path: string) {
  await supabase.storage.from("email-attachments").remove([path]);
}
