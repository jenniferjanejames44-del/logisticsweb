import { CheckCircle2, Clock, Package, Warehouse, Truck, MapPin, Home } from "lucide-react";

interface TimelineStep {
  status: string;
  label: string;
  description: string;
  icon: any;
}

interface ShipmentTimelineProps {
  currentStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

const trackingSteps: TimelineStep[] = [
  { status: "shipment_created", label: "Shipment Created", description: "Your shipment request has been received", icon: Package },
  { status: "awaiting_warehouse", label: "Awaiting Warehouse", description: "Package is being prepared for warehouse arrival", icon: Clock },
  { status: "received_warehouse", label: "Received at Warehouse", description: "Package has arrived at our warehouse", icon: Warehouse },
  { status: "processing", label: "Processing", description: "Package is being processed and prepared for shipping", icon: Package },
  { status: "in_transit", label: "In Transit", description: "Package is on its way to destination", icon: Truck },
  { status: "arrived_nigeria", label: "Arrived at Destination", description: "Package has arrived in destination country", icon: MapPin },
  { status: "ready_for_pickup", label: "Ready for Pickup", description: "Package is ready for collection or delivery", icon: Home },
  { status: "delivered", label: "Delivered", description: "Package has been successfully delivered", icon: CheckCircle2 },
];

const getStatusIndex = (status: string): number => {
  const index = trackingSteps.findIndex((step) => step.status === status);
  return index === -1 ? 0 : index;
};

const ShipmentTimeline = ({ currentStatus, createdAt, updatedAt }: ShipmentTimelineProps) => {
  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />
      <div 
        className="absolute left-[23px] top-0 w-0.5 bg-primary transition-all duration-500"
        style={{ height: `${(currentIndex / (trackingSteps.length - 1)) * 100}%` }}
      />

      {/* Timeline Steps */}
      <div className="space-y-0">
        {trackingSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = step.icon;
          
          return (
            <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                  : 'bg-muted text-muted-foreground border-2 border-border'
              } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <StepIcon className="w-5 h-5" strokeWidth={2.5} />
                )}
              </div>
              <div className="flex-1 pt-2">
                <h4 className={`font-semibold text-sm sm:text-base transition-colors ${
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{step.description}</p>
                {isCurrent && updatedAt && (
                  <p className="text-xs text-primary mt-1.5 font-medium">
                    Updated {new Date(updatedAt).toLocaleString()}
                  </p>
                )}
                {index === 0 && createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipmentTimeline;

