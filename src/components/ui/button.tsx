import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-display inline-flex transform-gpu select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-semibold ring-offset-background transition-all duration-200 ease-out will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* PRIMARY BUTTON - Brand Orange */
        default: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(223,81,1,0.2)] active:scale-[0.98]",

        /* SECONDARY BUTTON - Outline Navy */
        secondary: "bg-background text-primary border border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:bg-primary/5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] active:scale-[0.98]",

        /* ACCENT BUTTON - Alias of primary CTA */
        accent: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(223,81,1,0.2)] active:scale-[0.98]",

        /* Ghost Button */
        ghost: "bg-transparent text-muted-foreground hover:-translate-y-px hover:bg-muted hover:text-foreground active:scale-[0.98]",

        /* Outline - Navy border */
        outline: "bg-background text-primary border border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:bg-primary/5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] active:scale-[0.98]",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground shadow-[0_4px_20px_rgba(220,38,38,0.14)] hover:-translate-y-px hover:bg-destructive/90 hover:shadow-[0_12px_24px_rgba(220,38,38,0.18)] active:scale-[0.98]",

        /* Link Style */
        link: "text-primary underline-offset-4 hover:text-accent hover:underline p-0 h-auto font-semibold",

        /* Navigation variants */
        nav: "bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_14px_30px_rgba(6,16,67,0.16)] active:scale-[0.98]",
        navSecondary: "bg-background text-primary border border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:bg-primary/5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] active:scale-[0.98]",
        navOutline: "bg-transparent text-primary border border-primary/18 hover:-translate-y-px hover:bg-primary/5 active:scale-[0.98]",

        /* Hero variants */
        heroPrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_16px_34px_rgba(6,16,67,0.24)] active:scale-[0.98] active:translate-y-0",
        heroSecondary: "border border-white/80 bg-white text-primary shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_16px_34px_rgba(223,81,1,0.22)] active:scale-[0.98] active:translate-y-0",
        heroOutline: "bg-transparent text-white border border-white/55 hover:-translate-y-px hover:bg-white/10 hover:border-white active:scale-[0.98]",

        /* CTA variants - Orange for high-intent actions */
        cta: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_16px_34px_rgba(223,81,1,0.24)] active:scale-[0.98] active:translate-y-0",
        navCta: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(223,81,1,0.2)] active:scale-[0.98]",
        ctaOutline: "bg-background text-primary border border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:bg-primary/5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] active:scale-[0.98]",

        /* Legacy variants - mapped to new system */
        outlineNavy: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",
        premium: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(223,81,1,0.2)] active:scale-[0.98]",
        indigoOutline: "bg-background text-primary border border-primary/20 hover:-translate-y-px hover:bg-primary/5 active:scale-[0.98]",
        dynamic: "bg-primary text-primary-foreground hover:-translate-y-px hover:bg-[hsl(var(--primary-hover))] active:scale-[0.98]",
        quote: "bg-accent text-accent-foreground hover:-translate-y-px hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98]",
        quotePrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(223,81,1,0.2)] active:scale-[0.98]",
        quoteAccent: "bg-accent text-accent-foreground font-semibold hover:-translate-y-px hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98]",

        /* Dashboard-specific variants — rounded-lg, h-12, font-semibold */
        dashPrimary: "rounded-lg border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(223,81,1,0.2)] active:scale-[0.98]",
        dashAccent: "rounded-lg border border-accent bg-accent text-accent-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_14px_30px_rgba(223,81,1,0.2)] active:scale-[0.98]",
        dashOutline: "rounded-lg bg-background text-foreground border border-border shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-semibold hover:-translate-y-px hover:bg-muted hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] active:scale-[0.98]",
        dashGhost: "rounded-lg bg-transparent text-muted-foreground font-semibold hover:-translate-y-px hover:bg-muted hover:text-foreground active:scale-[0.98]",
        dashDestructive: "rounded-lg bg-destructive text-destructive-foreground font-semibold hover:-translate-y-px hover:bg-destructive/90 active:scale-[0.98]",
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
