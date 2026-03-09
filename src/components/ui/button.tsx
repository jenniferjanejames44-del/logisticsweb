import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-display inline-flex transform-gpu select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold tracking-[-0.01em] ring-offset-background transition-all duration-300 ease-out will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* PRIMARY BUTTON - Brand Orange */
        default: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-0 active:scale-[0.985]",

        /* SECONDARY BUTTON - Outline Navy */
        secondary: "border border-primary/15 bg-background text-primary shadow-[0_12px_24px_rgba(6,16,67,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:shadow-[0_18px_32px_rgba(6,16,67,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] active:translate-y-0 active:scale-[0.985]",

        /* ACCENT BUTTON - Alias of primary CTA */
        accent: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-0 active:scale-[0.985]",

        /* Ghost Button */
        ghost: "border border-transparent bg-transparent text-muted-foreground shadow-none hover:-translate-y-0.5 hover:border-border/70 hover:bg-muted/70 hover:text-foreground active:translate-y-0 active:scale-[0.985]",

        /* Outline - Navy border */
        outline: "border border-primary/15 bg-background text-primary shadow-[0_12px_24px_rgba(6,16,67,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:shadow-[0_18px_32px_rgba(6,16,67,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] active:translate-y-0 active:scale-[0.985]",

        /* Destructive */
        destructive: "border border-destructive bg-destructive text-destructive-foreground shadow-[0_12px_26px_rgba(220,38,38,0.18),inset_0_1px_0_rgba(255,255,255,0.14)] hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-[0_18px_32px_rgba(220,38,38,0.24)] active:translate-y-0 active:scale-[0.985]",

        /* Link Style */
        link: "text-primary underline-offset-4 hover:text-accent hover:underline p-0 h-auto font-semibold",

        /* Navigation variants */
        nav: "border border-primary bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(6,16,67,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_18px_34px_rgba(6,16,67,0.24)] active:translate-y-0 active:scale-[0.985]",
        navSecondary: "border border-primary/15 bg-background text-primary shadow-[0_12px_24px_rgba(6,16,67,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:shadow-[0_18px_32px_rgba(6,16,67,0.12)] active:translate-y-0 active:scale-[0.985]",
        navOutline: "border border-primary/16 bg-transparent text-primary hover:-translate-y-0.5 hover:border-primary/24 hover:bg-primary/5 active:translate-y-0 active:scale-[0.985]",

        /* Hero variants */
        heroPrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_18px_36px_rgba(6,16,67,0.24)] active:translate-y-0 active:scale-[0.985]",
        heroSecondary: "border border-white/80 bg-white text-primary shadow-[0_12px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_18px_36px_rgba(223,81,1,0.22)] active:translate-y-0 active:scale-[0.985]",
        heroOutline: "border border-white/55 bg-transparent text-white hover:-translate-y-0.5 hover:bg-white/10 hover:border-white active:translate-y-0 active:scale-[0.985]",

        /* CTA variants - Orange for high-intent actions */
        cta: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",
        navCta: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",
        ctaOutline: "border border-primary/15 bg-background text-primary shadow-[0_12px_24px_rgba(6,16,67,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:shadow-[0_18px_32px_rgba(6,16,67,0.12)] active:translate-y-0 active:scale-[0.985]",

        /* Legacy variants - mapped to new system */
        outlineNavy: "border border-primary/15 bg-background text-primary shadow-[0_12px_24px_rgba(6,16,67,0.08)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 active:translate-y-0 active:scale-[0.985]",
        premium: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",
        indigoOutline: "border border-primary/15 bg-background text-primary shadow-[0_12px_24px_rgba(6,16,67,0.08)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 active:translate-y-0 active:scale-[0.985]",
        dynamic: "border border-primary bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(6,16,67,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_18px_34px_rgba(6,16,67,0.24)] active:translate-y-0 active:scale-[0.985]",
        quote: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",
        quotePrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",
        quoteAccent: "border border-accent bg-accent text-accent-foreground font-semibold shadow-[0_12px_28px_rgba(223,81,1,0.18)] hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",

        /* Dashboard-specific variants — rounded-lg, h-12, font-semibold */
        dashPrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] font-semibold hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",
        dashAccent: "border border-accent bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] font-semibold hover:-translate-y-0.5 hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_18px_36px_rgba(223,81,1,0.24)] active:translate-y-0 active:scale-[0.985]",
        dashOutline: "border border-border bg-background text-foreground shadow-[0_12px_24px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] font-semibold hover:-translate-y-0.5 hover:border-primary/18 hover:bg-muted/70 hover:shadow-[0_18px_30px_rgba(15,23,42,0.1)] active:translate-y-0 active:scale-[0.985]",
        dashGhost: "border border-transparent bg-transparent text-muted-foreground font-semibold hover:-translate-y-0.5 hover:border-border/70 hover:bg-muted/70 hover:text-foreground active:translate-y-0 active:scale-[0.985]",
        dashDestructive: "border border-destructive bg-destructive text-destructive-foreground font-semibold shadow-[0_12px_26px_rgba(220,38,38,0.18)] hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-[0_18px_32px_rgba(220,38,38,0.24)] active:translate-y-0 active:scale-[0.985]",
      },
      size: {
        default: "h-11 px-5 py-3 text-[15px]",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-12 px-6 py-3 text-base font-semibold",
        icon: "h-11 w-11",
        nav: "h-11 px-5 py-2.5 text-[15px]",
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
