import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { NotificationsSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Package, CreditCard, CheckCircle, Info, Trash2, Check } from "lucide-react";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  ticket_id: string | null;
  refund_id: string | null;
  shipment_id: string | null;
  created_at: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "shipment_update": return Package;
    case "payment_received": return CreditCard;
    case "ticket_reply":
    case "ticket_status_change": return Bell;
    case "refund_issued": return CheckCircle;
    case "general": return Info;
    default: return Bell;
  }
};

const getNotificationIconColor = (type: string) => {
  switch (type) {
    case "shipment_update": return "text-primary";
    case "payment_received": return "text-green-600";
    case "ticket_reply":
    case "ticket_status_change": return "text-accent";
    case "refund_issued": return "text-green-600";
    case "general": return "text-primary";
    default: return "text-muted-foreground";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching notifications:", error);
    else setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('user_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast({ title: (payload.new as Notification).title, description: (payload.new as Notification).message });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from("user_notifications").update({ is_read: true }).eq("id", id);
    if (!error) setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase.from("user_notifications").update({ is_read: true }).in("id", unreadIds);
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast({ title: "All notifications marked as read" });
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("user_notifications").delete().eq("id", id);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({ title: "Notification deleted" });
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <DashboardLayout title="Notifications" description="Loading notifications...">
        <NotificationsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Notifications"
      description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      action={
        notifications.length > 0 ? (
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="h-9 text-[13px] border-border/60">
            <Check size={14} />
            Mark all read
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          const iconColor = getNotificationIconColor(notification.type);
          return (
            <Card
              key={notification.id}
              className={`border-border/50 transition-all duration-200 hover:shadow-sm ${!notification.is_read ? 'border-l-2 border-l-accent' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${!notification.is_read ? 'bg-accent/8' : 'bg-muted/80'}`}>
                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-[13px] font-semibold text-foreground">{notification.title}</h3>
                          {!notification.is_read && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">New</Badge>}
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">{notification.message}</p>
                        {notification.link && (
                          <Link to={notification.link} className="text-accent text-[11px] hover:underline mt-1 inline-block font-medium" onClick={() => markAsRead(notification.id)}>
                            View details →
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">{formatTimeAgo(notification.created_at)}</span>
                        {!notification.is_read && (
                          <Button variant="ghost" size="iconSm" onClick={() => markAsRead(notification.id)}>
                            <CheckCircle size={13} className="text-muted-foreground" />
                          </Button>
                        )}
                        <DeleteConfirmDialog
                          title="Delete Notification"
                          description="Are you sure you want to delete this notification?"
                          onConfirm={() => deleteNotification(notification.id)}
                          trigger={
                            <Button variant="ghost" size="iconSm">
                              <Trash2 size={13} className="text-muted-foreground" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {notifications.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground/20 mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">No Notifications</h3>
              <p className="text-[12px] text-muted-foreground text-center">
                You're all caught up! We'll notify you when there are updates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
