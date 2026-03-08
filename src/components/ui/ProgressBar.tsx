import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

const ProgressBar = ({
  progress,
  label,
  showPercentage = true,
  size = "md",
  variant = "default",
  className,
}: ProgressBarProps) => {
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-orange-500",
    error: "bg-red-500",
  };

  const isComplete = progress >= 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-foreground flex items-center gap-2">
              {label}
              {isComplete && (
                <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={2.5} />
              )}
            </span>
          )}
          {showPercentage && (
            <span className="text-muted-foreground font-semibold">
              {Math.min(progress, 100).toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        heightClasses[size]
      )}>
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

