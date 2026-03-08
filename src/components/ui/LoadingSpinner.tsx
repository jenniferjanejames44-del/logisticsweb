import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({ 
  size = "md", 
  text, 
  className,
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullScreen && "min-h-screen",
      className
    )}>
      <Loader2 
        className={cn(
          sizeClasses[size],
          "animate-spin text-primary"
        )} 
        strokeWidth={2.5}
      />
      {text && (
        <p className={cn(
          textSizeClasses[size],
          "text-muted-foreground font-medium"
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

