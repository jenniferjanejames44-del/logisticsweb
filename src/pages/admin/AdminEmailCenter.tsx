import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, PenSquare, FileText, Users, Send, Settings as SettingsIcon, History, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import ComposerTab from "@/components/admin/email-center/ComposerTab";
import ContactsTab from "@/components/admin/email-center/ContactsTab";
import TemplatesTab from "@/components/admin/email-center/TemplatesTab";
import SettingsTab from "@/components/admin/email-center/SettingsTab";
import MessagesTab from "@/components/admin/email-center/MessagesTab";
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
      sent_at: null, created_at: "", updated_at: "",
    } as any);
    setTab("compose");
  };

  const editDraft = (m: Message) => { setInitialCompose(m); setTab("compose"); };

  if (loading || !settings) {
    return <AdminLayout title="Email Center"><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary"/></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Email Center" description="Compose branded business emails, manage contacts and templates.">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-white border border-border/50 mb-6 flex-wrap h-auto">
          <TabsTrigger value="compose"><PenSquare className="w-4 h-4 mr-2"/>Compose</TabsTrigger>
          <TabsTrigger value="drafts"><Mail className="w-4 h-4 mr-2"/>Drafts <span className="ml-1.5 text-xs text-muted-foreground">({drafts.length})</span></TabsTrigger>
          <TabsTrigger value="scheduled"><Calendar className="w-4 h-4 mr-2"/>Scheduled <span className="ml-1.5 text-xs text-muted-foreground">({scheduled.length})</span></TabsTrigger>
          <TabsTrigger value="sent"><Send className="w-4 h-4 mr-2"/>Sent</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="w-4 h-4 mr-2"/>Templates</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="w-4 h-4 mr-2"/>Contacts</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2"/>History</TabsTrigger>
          <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-2"/>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <ComposerTab
            settings={settings} contacts={contacts} templates={templates}
            initial={initialCompose}
            onSent={() => { setInitialCompose(null); refresh(); }}
            onDrafted={refresh}
          />
        </TabsContent>
        <TabsContent value="drafts">
          <MessagesTab messages={drafts} mode="drafts" onEdit={editDraft} onChange={refresh}/>
        </TabsContent>
        <TabsContent value="scheduled">
          <MessagesTab messages={scheduled} mode="drafts" onEdit={editDraft} onChange={refresh}/>
        </TabsContent>
        <TabsContent value="sent">
          <MessagesTab messages={sent} mode="sent" onEdit={editDraft} onChange={refresh}/>
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab templates={templates} settings={settings} onChange={refresh} onUseTemplate={composeFromTemplate}/>
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTab contacts={contacts} onChange={refresh}/>
        </TabsContent>
        <TabsContent value="history">
          <MessagesTab messages={messages} mode="history" onChange={refresh}/>
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab settings={settings} onSaved={refresh}/>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
