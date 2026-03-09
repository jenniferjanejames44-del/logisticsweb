import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
        "ring-offset-background transition-all duration-200",
        "placeholder:text-muted-foreground/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
          "hover:border-primary/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "leading-relaxed resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
