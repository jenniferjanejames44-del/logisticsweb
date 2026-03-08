import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none rounded-md",
  {
    variants: {
      variant: {
        /* PRIMARY BUTTON - Brand Orange */
        default: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98] shadow-[0_10px_24px_rgba(223,81,1,0.22)] hover:shadow-[0_14px_30px_rgba(223,81,1,0.28)]",

        /* SECONDARY BUTTON - Outline Navy */
        secondary: "bg-background text-primary border border-primary/15 hover:bg-primary/5 active:scale-[0.98] shadow-none",

        /* ACCENT BUTTON - Alias of primary CTA */
        accent: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98] shadow-[0_10px_24px_rgba(223,81,1,0.22)] font-semibold",

        /* Ghost Button */
        ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",

        /* Outline - Navy border */
        outline: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",

        /* Link Style */
        link: "text-primary underline-offset-4 hover:text-accent hover:underline p-0 h-auto font-semibold",

        /* Navigation variants */
        nav: "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] active:scale-[0.98] shadow-[0_10px_24px_rgba(6,16,67,0.18)]",
        navSecondary: "bg-background text-primary border border-primary/15 hover:bg-primary/5 active:scale-[0.98]",
        navOutline: "bg-transparent text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",

        /* Hero variants */
        heroPrimary: "bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.24)] hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_16px_34px_rgba(223,81,1,0.28)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroSecondary: "bg-background text-primary border border-white/50 shadow-sm hover:bg-white hover:text-primary hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroOutline: "bg-transparent text-white border border-white/55 hover:bg-white/10 hover:border-white active:scale-[0.98]",

        /* CTA variants - Orange for high-intent actions */
        cta: "bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(223,81,1,0.24)] hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_16px_34px_rgba(223,81,1,0.28)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        navCta: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98] shadow-[0_10px_24px_rgba(223,81,1,0.22)]",
        ctaOutline: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",

        /* Legacy variants - mapped to new system */
        outlineNavy: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",
        premium: "bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.22)] hover:bg-[hsl(var(--accent-orange-hover))] hover:shadow-[0_14px_30px_rgba(223,81,1,0.28)] active:scale-[0.98]",
        indigoOutline: "bg-background text-primary border border-primary/20 hover:bg-primary/5 active:scale-[0.98]",
        dynamic: "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] active:scale-[0.98]",
        quote: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98]",
        quotePrimary: "bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.22)] hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98]",
        quoteAccent: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98] font-semibold",

        /* Dashboard-specific variants — rounded-lg, h-12, font-semibold */
        dashPrimary: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98] shadow-[0_10px_24px_rgba(223,81,1,0.2)] rounded-md font-semibold",
        dashAccent: "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-orange-hover))] active:scale-[0.98] shadow-[0_10px_24px_rgba(223,81,1,0.2)] rounded-md font-semibold",
        dashOutline: "bg-background text-foreground border border-border hover:bg-muted active:scale-[0.98] rounded-md font-semibold",
        dashGhost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] rounded-md font-semibold",
        dashDestructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] rounded-md font-semibold",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-base font-extrabold",
        icon: "h-11 w-11",
        nav: "h-10 px-5 py-2.5 text-sm",
        dash: "h-12 px-5 py-3 text-sm",
        dashSm: "h-10 px-4 py-2.5 text-sm",
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
