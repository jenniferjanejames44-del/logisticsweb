import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, PenSquare, FileText, Users, Send, Settings as SettingsIcon, Loader2, Calendar, Activity } from "lucide-react";
import { toast } from "sonner";
import ComposerWizard from "@/components/admin/email-center/ComposerWizard";
import ContactsTab from "@/components/admin/email-center/ContactsTab";
import TemplatesTab from "@/components/admin/email-center/TemplatesTab";
import SettingsTab from "@/components/admin/email-center/SettingsTab";
import MessagesTab from "@/components/admin/email-center/MessagesTab";
import DeliveryTab from "@/components/admin/email-center/DeliveryTab";
import { Contact, Message, Settings, Template, fetchSettings, listContacts, listMessages, listTemplates } from "@/lib/emailCenter";

export default function AdminEmailCenter() {
  const [tab, setTab] = useState("compose");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [initialCompose, setInitialCompose] = useState<Message | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [s, c, t, m] = await Promise.all([fetchSettings(), listContacts(), listTemplates(), listMessages()]);
      setSettings(s); setContacts(c); setTemplates(t); setMessages(m);
    } catch (e: any) { toast.error(e.message || "Failed to load"); }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const drafts = messages.filter(m => m.status === "draft");
  const scheduled = messages.filter(m => m.status === "scheduled");
  const sent = messages.filter(m => m.status === "sent" || m.status === "sending" || m.status === "failed");

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

  if (loading || !settings) {
    return <AdminLayout title="Email Center"><div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Email Center" description="Send professional proposals and business emails, then track every delivery.">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 h-auto flex-wrap border border-border/50 bg-white">
          <TabsTrigger value="compose"><PenSquare className="mr-2 h-4 w-4" />Compose</TabsTrigger>
          <TabsTrigger value="delivery"><Activity className="mr-2 h-4 w-4" />Delivery</TabsTrigger>
          <TabsTrigger value="drafts"><Mail className="mr-2 h-4 w-4" />Drafts <span className="ml-1.5 text-xs text-muted-foreground">({drafts.length})</span></TabsTrigger>
          <TabsTrigger value="scheduled"><Calendar className="mr-2 h-4 w-4" />Scheduled <span className="ml-1.5 text-xs text-muted-foreground">({scheduled.length})</span></TabsTrigger>
          <TabsTrigger value="sent"><Send className="mr-2 h-4 w-4" />Sent</TabsTrigger>
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
          <MessagesTab messages={drafts} mode="drafts" onEdit={editDraft} onChange={refresh} />
        </TabsContent>
        <TabsContent value="scheduled">
          <MessagesTab messages={scheduled} mode="drafts" onEdit={editDraft} onChange={refresh} />
        </TabsContent>
        <TabsContent value="sent">
          <MessagesTab messages={sent} mode="sent" onEdit={editDraft} onChange={refresh} />
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
