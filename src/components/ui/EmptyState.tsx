import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  children?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action, children }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-muted/80 to-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-border/30">
        <Icon className="w-9 h-9 sm:w-12 sm:h-12 text-muted-foreground/60" strokeWidth={2} />
      </div>
      <h3 className="font-bold text-xl sm:text-2xl text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <Button 
          variant="dashAccent" 
          size="dash" 
          onClick={action.onClick}
          asChild={!!action.href}
          className="shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all duration-200"
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            <span>{action.label}</span>
          )}
        </Button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;

