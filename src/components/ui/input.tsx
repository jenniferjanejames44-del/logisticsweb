import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[16px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,250,252,0.96)_100%)] px-4 py-3 text-[15px] text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          "ring-offset-background transition-all duration-200 ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/60",
          "focus-visible:border-primary/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/8",
          "hover:border-primary/20 hover:shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
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
