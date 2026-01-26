import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        /* Status variants */
        success: "border-transparent bg-[hsl(160,84%,39%)] text-white hover:bg-[hsl(160,84%,35%)]",
        warning: "border-transparent bg-[hsl(38,92%,50%)] text-[hsl(221,26%,17%)] hover:bg-[hsl(38,92%,45%)]",
        error: "border-transparent bg-[hsl(0,84%,60%)] text-white hover:bg-[hsl(0,84%,55%)]",
        info: "border-transparent bg-[hsl(217,91%,60%)] text-white hover:bg-[hsl(217,91%,55%)]",
        /* Outline status variants */
        successOutline: "border-[hsl(160,84%,39%)] text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)/0.1]",
        warningOutline: "border-[hsl(38,92%,50%)] text-[hsl(38,92%,45%)] bg-[hsl(38,92%,50%)/0.1]",
        errorOutline: "border-[hsl(0,84%,60%)] text-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%)/0.1]",
        infoOutline: "border-[hsl(217,91%,60%)] text-[hsl(217,91%,60%)] bg-[hsl(217,91%,60%)/0.1]",
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
