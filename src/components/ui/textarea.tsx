import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
          "flex min-h-[120px] w-full rounded-[10px] border border-border bg-muted/40 px-4 py-3 text-[15px] text-foreground shadow-none",
        "ring-offset-background transition-all duration-200 ease-out",
        "placeholder:text-muted-foreground/60",
        "focus-visible:border-accent/50 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10",
          "hover:border-accent/35 hover:bg-background",
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
