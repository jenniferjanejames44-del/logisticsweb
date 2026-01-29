import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tracking-normal select-none",
  {
    variants: {
      variant: {
        /* Primary Button - Orange Gradient with refined shadows */
        default: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98] active:shadow-sm",

        /* Secondary Button - Clean white with subtle border */
        secondary: "bg-white text-foreground border border-border rounded-lg shadow-sm hover:bg-muted hover:border-muted-foreground/20 active:scale-[0.98]",

        /* Ghost Button - Transparent with subtle hover */
        ghost: "bg-transparent text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground active:scale-[0.98]",

        /* Outline - Clean border style */
        outline: "border border-border bg-transparent text-foreground rounded-lg hover:bg-muted hover:border-muted-foreground/30 active:scale-[0.98]",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground rounded-lg shadow-sm hover:bg-destructive/90 active:scale-[0.98]",

        /* Link Style */
        link: "text-accent underline-offset-4 hover:underline p-0 h-auto font-medium",

        /* Navigation CTA */
        nav: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98]",

        /* CTA variants - refined with subtle effects */
        cta: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]",
        heroPrimary: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]",
        heroSecondary: "bg-white text-foreground border border-white/20 rounded-lg shadow-md hover:bg-white/95 active:scale-[0.98]",
        heroOutline: "bg-transparent text-white border border-white/40 rounded-lg hover:bg-white/10 hover:border-white/60 active:scale-[0.98]",
        accent: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 active:scale-[0.98]",
        navCta: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98]",
        navOutline: "border border-[#FF6B35] bg-transparent text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/10 active:scale-[0.98]",
        ctaOutline: "border border-[#FF6B35] bg-transparent text-[#FF6B35] rounded-lg hover:bg-[#FF6B35] hover:text-white active:scale-[0.98]",
        premium: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98]",
        indigoOutline: "border border-accent bg-transparent text-accent rounded-lg hover:bg-accent/10 active:scale-[0.98]",
        dynamic: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98]",
        quote: "bg-white text-foreground border border-border rounded-lg shadow-sm hover:shadow-md hover:border-muted-foreground/30 active:scale-[0.98] group",
        quotePrimary: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] group",
        quoteAccent: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 active:scale-[0.98] group",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-11 px-6 py-3 text-base",
        xl: "h-12 px-8 py-3.5 text-base",
        icon: "h-10 w-10",
        nav: "h-10 px-5 py-2.5 text-sm",
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
