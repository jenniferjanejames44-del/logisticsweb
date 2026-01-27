import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Primary Button - Orange CTA */
        default: "bg-secondary text-secondary-foreground rounded-xl hover:scale-[1.02] active:scale-[0.98]",

        /* Secondary Button - White with border */
        secondary: "bg-card text-foreground border border-border rounded-xl hover:border-secondary/50 hover:scale-[1.02] active:scale-[0.98]",

        /* Ghost Button */
        ghost: "bg-transparent text-foreground rounded-xl hover:bg-muted hover:scale-[1.02] active:scale-[0.98]",

        /* Navigation Button */
        nav: "bg-secondary text-secondary-foreground rounded-lg hover:scale-[1.02] active:scale-[0.98]",

        /* Outline */
        outline: "border border-border bg-transparent text-foreground rounded-xl hover:bg-muted hover:scale-[1.02] active:scale-[0.98]",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98]",

        /* Link Style */
        link: "text-secondary underline-offset-4 hover:underline p-0 h-auto",

        /* Legacy variants */
        cta: "bg-secondary text-secondary-foreground rounded-xl hover:scale-[1.02] active:scale-[0.98]",
        heroPrimary: "bg-secondary text-secondary-foreground rounded-xl hover:scale-[1.02] active:scale-[0.98]",
        heroSecondary: "bg-card text-foreground border border-border rounded-xl hover:scale-[1.02] active:scale-[0.98]",
        heroOutline: "bg-transparent text-white border border-white/30 rounded-xl hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]",
        accent: "bg-foreground text-background rounded-xl hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98]",
        navCta: "bg-secondary text-secondary-foreground rounded-lg hover:scale-[1.02] active:scale-[0.98]",
        navOutline: "border border-secondary bg-transparent text-secondary rounded-lg hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]",
        ctaOutline: "border border-secondary bg-transparent text-secondary rounded-xl hover:bg-secondary hover:text-secondary-foreground hover:scale-[1.02] active:scale-[0.98]",
        premium: "bg-secondary text-secondary-foreground rounded-xl hover:scale-[1.02] active:scale-[0.98]",
        indigoOutline: "border border-secondary bg-transparent text-secondary rounded-xl hover:bg-secondary hover:text-secondary-foreground hover:scale-[1.02] active:scale-[0.98]",
        dynamic: "bg-secondary text-secondary-foreground rounded-xl hover:scale-[1.02] active:scale-[0.98]",
        quote: "bg-card text-foreground border border-border rounded-xl hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group",
        quotePrimary: "bg-secondary text-secondary-foreground rounded-xl hover:scale-[1.02] active:scale-[0.98] group",
        quoteAccent: "bg-foreground text-background rounded-xl hover:scale-[1.02] active:scale-[0.98] group",
      },
      size: {
        default: "h-11 px-6 py-3 text-base",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "h-10 w-10",
        nav: "h-10 px-5 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
