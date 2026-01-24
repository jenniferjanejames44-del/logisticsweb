import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Package, CreditCard, CheckCircle, AlertCircle, Info } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "shipment",
    title: "Shipment Delivered",
    message: "Your shipment RAC12345678 has been delivered successfully.",
    time: "2 hours ago",
    read: false,
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Received",
    message: "We have received your payment of $150.00 for shipment RAC87654321.",
    time: "1 day ago",
    read: false,
    icon: CreditCard,
    iconColor: "text-secondary",
  },
  {
    id: 3,
    type: "shipment",
    title: "Shipment In Transit",
    message: "Your shipment RAC11223344 is now in transit and expected to arrive in 3 days.",
    time: "2 days ago",
    read: true,
    icon: Package,
    iconColor: "text-primary",
  },
  {
    id: 4,
    type: "alert",
    title: "Action Required",
    message: "Please update your payment method to avoid service interruption.",
    time: "3 days ago",
    read: true,
    icon: AlertCircle,
    iconColor: "text-orange-500",
  },
  {
    id: 5,
    type: "info",
    title: "New Feature Available",
    message: "You can now track your shipments in real-time with our new tracking system.",
    time: "1 week ago",
    read: true,
    icon: Info,
    iconColor: "text-blue-500",
  },
];

const Notifications = () => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout 
      title="Notifications" 
      description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
    >
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`border-border/50 hover:shadow-card transition-shadow ${
              !notification.read ? 'border-l-4 border-l-secondary' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !notification.read ? 'bg-secondary/10' : 'bg-muted'
                }`}>
                  <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{notification.message}</p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
