import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[10px] border border-border bg-muted/40 px-4 py-3 text-[15px] text-foreground shadow-none",
          "ring-offset-background transition-all duration-200 ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/60",
          "focus-visible:border-accent/50 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10",
          "hover:border-accent/35 hover:bg-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
