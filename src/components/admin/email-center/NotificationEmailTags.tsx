import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { notificationAddresses } from '../../../../supabase/functions/_shared/email-reply-core';
import { toast } from 'sonner';

export default function NotificationEmailTags({ emails, onChange, label = 'Reply notifications to' }: { emails: string[]; onChange: (emails: string[]) => void; label?: string }) {
  const [entry, setEntry] = useState('');
  const add = () => {
    try {
      onChange(notificationAddresses([...emails, ...entry.split(/[,;\s]+/).filter(Boolean)]));
      setEntry('');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Invalid email address'); }
  };
  return <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex gap-2"><Input aria-label={label} value={entry} onChange={e => setEntry(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="Email address" /><Button type="button" variant="outline" size="icon" aria-label="Add notification email" title="Add notification email" onClick={add}><Plus className="h-4 w-4" /></Button></div>
    <div className="flex flex-wrap gap-2">{emails.map(email => <span key={email} className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted px-2 text-xs"><span className="break-all">{email}</span><Button type="button" size="icon" variant="ghost" aria-label={`Remove ${email}`} title={`Remove ${email}`} onClick={() => onChange(emails.filter(e => e !== email))}><X className="h-3 w-3" /></Button></span>)}</div>
  </div>;
}