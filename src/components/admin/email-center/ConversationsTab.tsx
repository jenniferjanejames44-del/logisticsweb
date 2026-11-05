import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MailOpen, RefreshCw, Send, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { listReplyThreads, listReplyItems, listReplyNotifications, replyAction, ReplyThread, ReplyItem, ReplyNotification } from '@/lib/emailReplies';
import NotificationEmailTags from './NotificationEmailTags';

export default function ConversationsTab() {
  const [threads, setThreads] = useState<ReplyThread[]>([]);
  const [items, setItems] = useState<ReplyItem[]>([]);
  const [notifications, setNotifications] = useState<ReplyNotification[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    try {
      const [allThreads, allItems, setup] = await Promise.all([listReplyThreads(), listReplyItems(), replyAction({ action: 'status' })]);
      setThreads(allThreads); setItems(allItems); setReady(setup.ready);
      setNotifications(await listReplyNotifications(allItems.filter(i => i.direction === 'received').map(i => i.id)));
      setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Conversations could not load.'); }
    setLoading(false);
  };
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 15000); return () => window.clearInterval(timer); }, []);
  const thread = threads.find(t => t.id === selected);
  const open = async (t: ReplyThread) => {
    setSelected(t.id); setEmails(t.notification_emails); setText('');
    try { await replyAction({ action: 'read', threadId: t.id, read: true }); await load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Read status failed'); }
  };
  const act = async (action: string) => {
    if (!thread) return;
    setBusy(true);
    try {
      await replyAction({ action, threadId: thread.id, ...(action === 'recipients' ? { emails } : action === 'reply' ? { text } : { read: false }) });
      if (action === 'reply') setText('');
      toast.success(action === 'reply' ? 'Reply queued' : action === 'recipients' ? 'Notification recipients saved' : 'Marked unread');
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Conversation action failed'); }
    setBusy(false);
  };
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h2 className="font-semibold">Conversations</h2><Button size="icon" variant="outline" aria-label="Refresh conversations" title="Refresh conversations" onClick={() => void load()}><RefreshCw className="h-4 w-4" /></Button></div>
    {!ready && <p role="status" className="rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">Incoming replies are awaiting receiving-domain verification. Existing email sending remains available.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="grid gap-6 lg:grid-cols-[minmax(240px,1fr)_2fr]">
      <div className="divide-y divide-border">{threads.map(t => {
        const history = items.filter(i => i.thread_id === t.id);
        const unread = history.filter(i => i.direction === 'received' && !i.read_at).length;
        const latest = history[history.length - 1];
        return <Button key={t.id} variant="ghost" className="h-auto w-full max-w-none justify-start whitespace-normal px-3 py-4 text-left" onClick={() => void open(t)}><div className="min-w-0 space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="break-words font-semibold">{t.subject}</span>{unread > 0 && <Badge>{unread} unread</Badge>}</div><p className="break-all text-xs text-muted-foreground">{t.participant_email}</p><p className="line-clamp-2 text-xs text-muted-foreground">{latest?.body_text}</p><p className="text-xs text-muted-foreground">{latest?.direction === 'received' ? 'Reply received' : 'Awaiting reply'} · {new Date(t.updated_at).toLocaleString()}</p></div></Button>;
      })}{!threads.length && <p className="py-12 text-center text-sm text-muted-foreground">No tracked conversations yet</p>}</div>
      {thread ? <section className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{thread.subject}</h3><p className="break-all text-sm text-muted-foreground">{thread.participant_email}</p></div><Button variant="outline" size="sm" disabled={busy} onClick={() => void act('read')}><Mail className="mr-2 h-4 w-4" />Mark unread</Button></div>
        <NotificationEmailTags emails={emails} onChange={setEmails} /><Button variant="outline" size="sm" disabled={busy} onClick={() => void act('recipients')}><Save className="mr-2 h-4 w-4" />Save recipients</Button>
        <div className="divide-y divide-border">{items.filter(i => i.thread_id === thread.id).map(i => <article key={i.id} className="space-y-2 py-5"><div className="flex flex-wrap items-center gap-2"><Badge variant={i.direction === 'received' ? 'default' : 'outline'}>{i.direction === 'received' ? 'Received' : 'Sent'}</Badge><span className="break-all text-xs">{i.sender_email}</span><span className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</span>{i.direction === 'received' && <MailOpen className="h-3 w-3 text-muted-foreground" />}</div><p className="whitespace-pre-wrap break-words text-sm">{i.body_text}</p><p className="text-xs text-muted-foreground">{i.status}</p>{i.error_message && <p className="text-xs text-destructive">{i.error_message}</p>}{notifications.filter(n => n.item_id === i.id).map(n => <p key={n.id} className="break-all text-xs text-muted-foreground">Notification to {n.recipient_email}: {n.status}{n.error_message && <span className="text-destructive"> · {n.error_message}</span>}</p>)}</article>)}</div>
        <Textarea aria-label="Conversation reply" value={text} onChange={e => setText(e.target.value)} placeholder="Write a reply" rows={5} /><Button disabled={busy || !ready || !text.trim()} onClick={() => void act('reply')}><Send className="mr-2 h-4 w-4" />Send reply</Button>
      </section> : <p className="py-12 text-center text-sm text-muted-foreground">Select a conversation</p>}
    </div>}
  </div>;
}