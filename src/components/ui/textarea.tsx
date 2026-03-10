import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
          "flex min-h-[120px] w-full rounded-lg border border-[#E5E7EB] bg-white px-[14px] py-[10px] text-base text-foreground shadow-none",
        "ring-offset-background transition-all duration-200 ease-in-out",
        "placeholder:text-muted-foreground/60",
        "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/15",
          "hover:border-primary/20",
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
