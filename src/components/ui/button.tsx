import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-display inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        /* PRIMARY BUTTON - Brand Orange */
        default: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:brightness-[1.03] active:scale-[0.98]",

        /* SECONDARY BUTTON - Outline Navy */
        secondary: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)]",

        /* ACCENT BUTTON - Alias of primary CTA */
        accent: "border border-accent bg-accent text-accent-foreground hover:brightness-[1.03] active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold",

        /* Ghost Button */
        ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",

        /* Outline - Navy border */
        outline: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)]",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",

        /* Link Style */
        link: "text-primary underline-offset-4 hover:text-accent hover:underline p-0 h-auto font-semibold",

        /* Navigation variants */
        nav: "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        navSecondary: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        navOutline: "bg-transparent text-primary border border-primary/18 hover:bg-primary/5 active:scale-[0.98]",

        /* Hero variants */
        heroPrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:brightness-[1.03] active:scale-[0.98] active:translate-y-0",
        heroSecondary: "bg-background text-primary border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:bg-white hover:text-primary active:scale-[0.98] active:translate-y-0",
        heroOutline: "bg-transparent text-white border border-white/55 hover:bg-white/10 hover:border-white active:scale-[0.98]",

        /* CTA variants - Orange for high-intent actions */
        cta: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:brightness-[1.03] active:scale-[0.98] active:translate-y-0",
        navCta: "border border-accent bg-accent text-accent-foreground hover:brightness-[1.03] active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        ctaOutline: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)]",

        /* Legacy variants - mapped to new system */
        outlineNavy: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",
        premium: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:brightness-[1.03] active:scale-[0.98]",
        indigoOutline: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",
        dynamic: "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] active:scale-[0.98]",
        quote: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98]",
        quotePrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:brightness-[1.03] active:scale-[0.98]",
        quoteAccent: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98] font-semibold",

        /* Dashboard-specific variants — rounded-lg, h-12, font-semibold */
        dashPrimary: "rounded-lg border border-accent bg-accent text-accent-foreground hover:brightness-[1.03] active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold",
        dashAccent: "rounded-lg border border-accent bg-accent text-accent-foreground hover:brightness-[1.03] active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold",
        dashOutline: "rounded-lg bg-background text-foreground border border-border hover:bg-muted active:scale-[0.98] font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        dashGhost: "rounded-lg bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] font-semibold",
        dashDestructive: "rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] font-semibold",
      },
      size: {
        default: "h-11 px-5 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-5 py-3 text-base",
        xl: "h-12 px-6 py-3 text-base font-semibold",
        icon: "h-11 w-11",
        nav: "h-10 px-5 py-2.5 text-[15px]",
        dash: "h-11 px-5 py-3 text-base",
        dashSm: "h-10 px-4 py-2 text-sm",
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
