import { Clock, Package, Warehouse, Truck, MapPin, CheckCircle2, AlertCircle, DollarSign, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  type: "status" | "payment" | "update" | "system";
}

interface ActivityLogProps {
  activities: ActivityEvent[];
  maxHeight?: string;
}

const getActivityIcon = (type: string, event: string) => {
  if (event.toLowerCase().includes("created")) return Package;
  if (event.toLowerCase().includes("warehouse")) return Warehouse;
  if (event.toLowerCase().includes("transit") || event.toLowerCase().includes("dispatched")) return Truck;
  if (event.toLowerCase().includes("arrived") || event.toLowerCase().includes("destination")) return MapPin;
  if (event.toLowerCase().includes("delivered")) return CheckCircle2;
  if (event.toLowerCase().includes("cancelled")) return AlertCircle;
  if (event.toLowerCase().includes("payment") || event.toLowerCase().includes("paid")) return DollarSign;
  if (event.toLowerCase().includes("updated") || event.toLowerCase().includes("modified")) return User;
  return Clock;
};

const getActivityColor = (type: string, event: string) => {
  if (event.toLowerCase().includes("delivered")) return "text-green-600 bg-green-50 border-green-200";
  if (event.toLowerCase().includes("cancelled")) return "text-red-600 bg-red-50 border-red-200";
  if (event.toLowerCase().includes("payment") || event.toLowerCase().includes("paid")) return "text-accent bg-accent/10 border-accent/20";
  if (event.toLowerCase().includes("transit")) return "text-primary bg-primary/10 border-primary/20";
  return "text-muted-foreground bg-muted border-border";
};

const ActivityLog = ({ activities, maxHeight = "400px" }: ActivityLogProps) => {
  if (activities.length === 0) {
    return (
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" strokeWidth={2.5} />
            </div>
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground/50" strokeWidth={2.5} />
            </div>
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" strokeWidth={2.5} />
          </div>
          Activity Log
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {activities.length} {activities.length === 1 ? "event" : "events"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ maxHeight }}>
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type, activity.event);
              const colorClass = getActivityColor(activity.type, activity.event);
              
              return (
                <div key={activity.id} className="flex gap-3 group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass} transition-all duration-200 group-hover:scale-110`}>
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-foreground">{activity.event}</p>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(activity.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;

