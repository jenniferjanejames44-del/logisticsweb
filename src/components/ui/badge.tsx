import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.02em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/[0.08] text-primary hover:bg-primary/[0.12]",
        secondary: "border-border/70 bg-muted/[0.22] text-muted-foreground hover:bg-muted/[0.32]",
        destructive: "border-destructive/15 bg-destructive/[0.08] text-destructive hover:bg-destructive/[0.12]",
        outline: "border-border/70 bg-white text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
        /* Status variants */
        success: "border-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)] text-white hover:bg-[hsl(160,84%,35%)]",
        warning: "border-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)] text-[hsl(221,26%,17%)] hover:bg-[hsl(38,92%,45%)]",
        error: "border-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%)] text-white hover:bg-[hsl(0,84%,55%)]",
        info: "border-[hsl(217,91%,60%)] bg-[hsl(217,91%,60%)] text-white hover:bg-[hsl(217,91%,55%)]",
        /* Outline status variants */
        successOutline: "border-[hsl(160,84%,39%)/0.3] text-[hsl(160,84%,34%)] bg-[hsl(160,84%,39%)/0.08]",
        warningOutline: "border-[hsl(38,92%,50%)/0.3] text-[hsl(38,92%,40%)] bg-[hsl(38,92%,50%)/0.1]",
        errorOutline: "border-[hsl(0,84%,60%)/0.3] text-[hsl(0,84%,58%)] bg-[hsl(0,84%,60%)/0.08]",
        infoOutline: "border-[hsl(217,91%,60%)/0.3] text-[hsl(217,91%,55%)] bg-[hsl(217,91%,60%)/0.08]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
