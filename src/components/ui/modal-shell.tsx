import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * ModalShell — standardized modal layout for the dashboard.
 *
 * Structure (locked):
 *   ModalShell
 *     ├─ ModalHeader   (sticky top, title + close)
 *     ├─ ModalBody     (flex-1, internal scroll only)
 *     └─ ModalFooter   (sticky bottom, primary right)
 *
 * Sizing: max-w-[420px] mobile, max-w-[520px] desktop, max-h 90dvh.
 * Header and footer never scroll — only the body does.
 */

interface ModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
  /** Required for screen readers. Hidden visually if header is custom. */
  ariaTitle: string;
  ariaDescription?: string;
}

export const ModalShell = ({
  open,
  onOpenChange,
  children,
  className,
  size = "default",
  ariaTitle,
  ariaDescription,
}: ModalShellProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden flex flex-col border-border/60",
          "w-[calc(100%-1rem)] max-h-[90dvh] rounded-xl",
          size === "lg" ? "sm:max-w-[640px]" : "sm:max-w-[520px]",
          "max-w-[420px]",
          className,
        )}
      >
        <DialogTitle className="sr-only">{ariaTitle}</DialogTitle>
        {ariaDescription && (
          <DialogDescription className="sr-only">{ariaDescription}</DialogDescription>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ModalHeader = ({ title, subtitle, icon, className }: ModalHeaderProps) => (
  <div
    className={cn(
      "sticky top-0 z-10 flex items-center gap-3 border-b border-border/40 bg-background px-5 py-4 pr-12 sm:px-6",
      className,
    )}
  >
    {icon && (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {icon}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <h2 className="truncate text-base font-bold text-foreground">{title}</h2>
      {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody = ({ children, className }: ModalBodyProps) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto px-5 py-5 space-y-4 sm:px-6",
      className,
    )}
  >
    {children}
  </div>
);

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div
    className={cn(
      "sticky bottom-0 z-10 flex flex-col-reverse gap-2.5 border-t border-border/40 bg-background px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:px-6",
      className,
    )}
  >
    {children}
  </div>
);
