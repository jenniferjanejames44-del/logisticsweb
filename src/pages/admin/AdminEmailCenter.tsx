import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, PenSquare, FileText, Users, Send, Settings as SettingsIcon, Loader2, Calendar, Activity, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ComposerWizard from "@/components/admin/email-center/ComposerWizard";
import ContactsTab from "@/components/admin/email-center/ContactsTab";
import TemplatesTab from "@/components/admin/email-center/TemplatesTab";
import SettingsTab from "@/components/admin/email-center/SettingsTab";
import MessagesTab from "@/components/admin/email-center/MessagesTab";
import DeliveryTab from "@/components/admin/email-center/DeliveryTab";
import { Contact, Message, Settings, Template, countEmailsSent, fetchSettings, listContacts, listMessages, listTemplates } from "@/lib/emailCenter";

function EmailSuspensionNotice() {
  return (
    <div role="alert" className="mb-6 flex items-start gap-3 border border-destructive/40 bg-destructive/5 p-4 text-foreground">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <div>
        <p className="font-semibold">Email sending is suspended</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sending from <span className="font-medium text-foreground">notify.raclogisticltd.com</span> has been disabled by Lovable, even though the domain is verified. Emails cannot be delivered until Lovable Support reviews and lifts the suspension.
        </p>
        <p className="mt-2 text-sm font-medium">You can still create, save, and preview drafts. Sending, test emails, scheduling, and retries are paused.</p>
      </div>
    </div>
  );
}

export default function AdminEmailCenter() {
  const [tab, setTab] = useState("compose");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [initialCompose, setInitialCompose] = useState<Message | null>(null);
  const [totals, setTotals] = useState<{ sent: number; failed: number; pending: number }>({ sent: 0, failed: 0, pending: 0 });

  const refresh = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      fetchSettings(), listContacts(), listTemplates(), listMessages(), countEmailsSent(),
    ]);
    const failures: string[] = [];
    const [settingsResult, contactsResult, templatesResult, messagesResult, totalsResult] = results;

    if (settingsResult.status === "fulfilled" && settingsResult.value) setSettings(settingsResult.value);
    else failures.push("company settings");
    if (contactsResult.status === "fulfilled") setContacts(contactsResult.value);
    else failures.push("contacts");
    if (templatesResult.status === "fulfilled") setTemplates(templatesResult.value);
    else failures.push("templates");
    if (messagesResult.status === "fulfilled") setMessages(messagesResult.value);
    else failures.push("email history");
    if (totalsResult.status === "fulfilled") setTotals(totalsResult.value);
    else failures.push("delivery totals");

    const errorMessage = failures.length
      ? `Couldn't load ${failures.join(", ")}. Check the connection and try again.`
      : null;
    setLoadError(errorMessage);
    if (errorMessage) toast.error(errorMessage);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const drafts = messages.filter(m => m.status === "draft");
  const scheduled = messages.filter(m => m.status === "scheduled");
  const sent = messages.filter(m => m.status === "sent" || m.status === "sending");
  const failed = messages.filter(m => m.status === "failed" || m.failed_count > 0);

  const composeFromTemplate = (t: Template) => {
    setInitialCompose({
      id: "", subject: t.subject, body_html: t.body_html,
      to_recipients: [], cc_recipients: [], bcc_recipients: [], attachments: [],
      status: "draft", error_message: null, sent_count: 0, failed_count: 0,
      sent_at: null, scheduled_at: null, template_name: t.name, from_name: null,
      created_at: "", updated_at: "",
    } as any);
    setTab("compose");
  };

  const editDraft = (m: Message) => { setInitialCompose(m); setTab("compose"); };

  if (loading) {
    return <AdminLayout title="Email Center"><EmailSuspensionNotice /><div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AdminLayout>;
  }

  if (!settings) {
    return (
      <AdminLayout title="Email Center">
        <EmailSuspensionNotice />
        <div role="alert" className="border border-border bg-card p-6">
          <h2 className="font-semibold">Email Center data is unavailable</h2>
          <p className="mt-1 text-sm text-muted-foreground">{loadError || "Company settings could not be loaded."} No email actions have been performed.</p>
          <Button className="mt-4" onClick={refresh}>Try again</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Email Center" description="Create polished, on-brand customer communications and track every delivery.">
      <EmailSuspensionNotice />
      {loadError && (
        <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{loadError} Some Email Center sections may be incomplete.</p>
          <Button variant="outline" size="sm" onClick={refresh}>Retry loading</Button>
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {([
          { label: "Emails sent (all time)", value: totals.sent, tab: "sent", icon: Send, tone: "text-emerald-600 bg-emerald-50", ring: "hover:border-emerald-300" },
          { label: "Pending delivery", value: totals.pending, tab: "delivery", icon: Calendar, tone: "text-amber-600 bg-amber-50", ring: "hover:border-amber-300" },
          { label: "Failed to send", value: totals.failed, tab: "failed", icon: AlertTriangle, tone: "text-red-600 bg-red-50", ring: "hover:border-red-300" },
        ] as const).map(s => (
          <button
            key={s.tab}
            type="button"
            onClick={() => setTab(s.tab)}
            className={`group flex items-center justify-between rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${s.ring}`}
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value.toLocaleString()}</p>
              <p className="mt-1 text-[11px] font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">View details →</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
          </button>
        ))}
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 h-auto flex-wrap border border-border bg-card p-1 shadow-sm">
          <TabsTrigger value="compose"><PenSquare className="mr-2 h-4 w-4" />Compose</TabsTrigger>
          <TabsTrigger value="delivery"><Activity className="mr-2 h-4 w-4" />Delivery</TabsTrigger>
          <TabsTrigger value="drafts"><Mail className="mr-2 h-4 w-4" />Drafts <span className="ml-1.5 text-xs text-muted-foreground">({drafts.length})</span></TabsTrigger>
          <TabsTrigger value="scheduled"><Calendar className="mr-2 h-4 w-4" />Scheduled <span className="ml-1.5 text-xs text-muted-foreground">({scheduled.length})</span></TabsTrigger>
          <TabsTrigger value="sent"><Send className="mr-2 h-4 w-4" />Sent</TabsTrigger>
          <TabsTrigger value="failed"><AlertTriangle className="mr-2 h-4 w-4" />Failed <span className="ml-1.5 text-xs text-muted-foreground">({failed.length})</span></TabsTrigger>
          <TabsTrigger value="templates"><FileText className="mr-2 h-4 w-4" />Templates</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="mr-2 h-4 w-4" />Contacts</TabsTrigger>
          <TabsTrigger value="settings"><SettingsIcon className="mr-2 h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <ComposerWizard
            settings={settings} contacts={contacts} templates={templates}
            initial={initialCompose}
            onSent={() => { setInitialCompose(null); refresh(); }}
            onDrafted={refresh}
          />
        </TabsContent>
        <TabsContent value="delivery">
          <DeliveryTab messages={messages} onChange={refresh} />
        </TabsContent>
        <TabsContent value="drafts">
          <MessagesTab messages={drafts} mode="drafts" settings={settings} onEdit={editDraft} onChange={refresh} />
        </TabsContent>
        <TabsContent value="scheduled">
          <MessagesTab messages={scheduled} mode="drafts" settings={settings} onEdit={editDraft} onChange={refresh} />
        </TabsContent>
        <TabsContent value="sent">
          <MessagesTab messages={sent} mode="sent" settings={settings} onEdit={editDraft} onChange={refresh} />
        </TabsContent>
        <TabsContent value="failed">
          <MessagesTab messages={failed} mode="failed" settings={settings} onEdit={editDraft} onChange={refresh} />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab templates={templates} settings={settings} onChange={refresh} onUseTemplate={composeFromTemplate} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTab contacts={contacts} onChange={refresh} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab settings={settings} onSaved={refresh} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
