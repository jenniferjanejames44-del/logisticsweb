import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

export interface ReplyThread { id: string; subject: string; participant_email: string; notification_emails: string[]; updated_at: string; original_message_id: string | null }
export interface ReplyItem { id: string; thread_id: string; direction: string; sender_email: string; subject: string; body_text: string; status: string; error_message: string | null; read_at: string | null; created_at: string }
export interface ReplyNotification { id: string; item_id: string; recipient_email: string; status: string; error_message: string | null }

export async function replyAction(body: unknown) {
  const { data, error } = await supabase.functions.invoke('email-reply-admin', { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const response = await error.context.json().catch(() => null);
      throw new Error(response?.error || error.message);
    }
    throw error;
  }
  return data;
}
export async function listReplyThreads(): Promise<ReplyThread[]> {
  const { data, error } = await supabase.from('email_reply_threads').select('id,subject,participant_email,notification_emails,updated_at,original_message_id').order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function listReplyItems(threadId?: string): Promise<ReplyItem[]> {
  let query = supabase.from('email_reply_items').select('id,thread_id,direction,sender_email,subject,body_text,status,error_message,read_at,created_at').order('created_at', { ascending: true });
  if (threadId) query = query.eq('thread_id', threadId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
export async function listReplyNotifications(itemIds: string[]): Promise<ReplyNotification[]> {
  if (!itemIds.length) return [];
  const { data, error } = await supabase.from('email_reply_notifications').select('id,item_id,recipient_email,status,error_message').in('item_id', itemIds);
  if (error) throw error;
  return data || [];
}