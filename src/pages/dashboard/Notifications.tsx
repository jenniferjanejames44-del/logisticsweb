import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { NotificationsSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Package, CreditCard, CheckCircle, AlertCircle, Info, Trash2, Check } from "lucide-react";
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
    case "shipment_update":
      return Package;
    case "payment_received":
      return CreditCard;
    case "ticket_reply":
    case "ticket_status_change":
      return Bell;
    case "refund_issued":
      return CheckCircle;
    case "general":
      return Info;
    default:
      return Bell;
  }
};

const getNotificationIconColor = (type: string) => {
  switch (type) {
    case "shipment_update":
      return "text-primary";
    case "payment_received":
      return "text-success";
    case "ticket_reply":
    case "ticket_status_change":
      return "text-accent";
    case "refund_issued":
      return "text-green-600";
    case "general":
      return "text-info";
    default:
      return "text-muted-foreground";
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
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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

    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast({
            title: (payload.new as Notification).title,
            description: (payload.new as Notification).message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast({
        title: "All notifications marked as read",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from("user_notifications")
      .delete()
      .eq("id", id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({
        title: "Notification deleted",
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <DashboardLayout 
        title="Notifications" 
        description="Loading notifications..."
      >
        <NotificationsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Notifications" 
      description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="h-11 sm:h-12 px-6"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check size={16} className="mr-2" />
            Mark all as read
          </Button>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          const iconColor = getNotificationIconColor(notification.type);
          
          return (
            <Card 
              key={notification.id} 
              className={`border-border/50 card-premium hover:shadow-card-hover transition-all duration-300 ${
                !notification.read ? 'border-l-4 border-l-accent bg-accent/5' : ''
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notification.is_read ? 'bg-accent/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base">{notification.title}</h3>
                          {!notification.is_read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm">{notification.message}</p>
                        {notification.link && (
                          <Link
                            to={notification.link}
                            className="text-accent text-xs sm:text-sm hover:underline mt-1 inline-block"
                            onClick={() => markAsRead(notification.id)}
                          >
                            View details →
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        <div className="flex gap-1">
                          {!notification.is_read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-11 sm:w-11"
              onClick={() => markAsRead(notification.id)}
            >
              <CheckCircle size={16} className="text-muted-foreground hover:text-accent" />
            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 sm:h-11 sm:w-11"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {notifications.length === 0 && (
          <Card className="border-border/50 card-premium">
            <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground text-sm sm:text-base text-center">
                You're all caught up! We'll notify you when there are updates to your shipments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
