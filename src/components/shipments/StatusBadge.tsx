import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Clock, 
  Warehouse, 
  Truck, 
  MapPin, 
  Home, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<string, { 
  label: string;
  color: string;
  icon: any;
}> = {
  shipment_created: {
    label: "Shipment Created",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: Package,
  },
  awaiting_warehouse: {
    label: "Awaiting Warehouse",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: Clock,
  },
  received_warehouse: {
    label: "Received at Warehouse",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: Warehouse,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: Loader2,
  },
  in_transit: {
    label: "In Transit",
    color: "bg-orange-100 text-orange-700 border-orange-300",
    icon: Truck,
  },
  arrived_nigeria: {
    label: "Arrived at Destination",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: MapPin,
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: Home,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: AlertCircle,
  },
};

const StatusBadge = ({ status, showIcon = true, size = "md" }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.shipment_created;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs sm:text-sm px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <Badge 
      className={`${config.color} ${sizeClasses[size]} font-semibold border inline-flex items-center whitespace-nowrap`}
    >
      {showIcon && (
        <Icon 
          className={`${iconSizes[size]} ${status === 'processing' ? 'animate-spin' : ''}`} 
          strokeWidth={2.5} 
        />
      )}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;

