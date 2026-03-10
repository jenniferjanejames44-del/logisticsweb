import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-display inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold tracking-[-0.01em] ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* PRIMARY BUTTON - Brand Orange */
        default: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",

        /* SECONDARY BUTTON - Outline Navy */
        secondary: "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",

        /* ACCENT BUTTON - Alias of primary CTA */
        accent: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",

        /* Ghost Button */
        ghost: "border border-transparent bg-transparent text-muted-foreground shadow-none hover:-translate-y-px hover:border-border hover:bg-muted/70 hover:text-foreground active:translate-y-0",

        /* Outline - Navy border */
        outline: "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",

        /* Destructive */
        destructive: "border border-destructive bg-destructive text-destructive-foreground shadow-[0_10px_24px_rgba(220,38,38,0.16)] hover:-translate-y-px hover:bg-destructive/90 hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",

        /* Link Style */
        link: "!h-auto !px-0 !py-0 border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:bg-transparent hover:text-accent hover:underline",

        /* Navigation variants */
        nav: "border border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.16)] hover:-translate-y-px hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        navSecondary: "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        navOutline: "border border-primary/25 bg-transparent text-primary hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground active:translate-y-0",

        /* Hero variants */
        heroPrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.2)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        heroSecondary: "border border-white bg-white text-primary shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        heroOutline: "border border-white/70 bg-transparent text-white hover:-translate-y-px hover:bg-white/10 hover:border-white active:translate-y-0",

        /* CTA variants - Orange for high-intent actions */
        cta: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        navCta: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        ctaOutline: "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",

        /* Legacy variants - mapped to new system */
        outlineNavy: "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        premium: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        indigoOutline: "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        dynamic: "border border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.16)] hover:-translate-y-px hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        quote: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        quotePrimary: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        quoteAccent: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",

        /* Dashboard-specific variants — rounded-lg, h-12, font-semibold */
        dashPrimary: "border border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.16)] hover:-translate-y-px hover:bg-[hsl(var(--primary-hover))] hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        dashAccent: "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.18)] hover:-translate-y-px hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        dashOutline: "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.06)] hover:-translate-y-px hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
        dashGhost: "border border-transparent bg-transparent text-muted-foreground hover:-translate-y-px hover:border-border hover:bg-muted/70 hover:text-foreground active:translate-y-0",
        dashDestructive: "border border-destructive bg-destructive text-destructive-foreground shadow-[0_10px_24px_rgba(220,38,38,0.16)] hover:-translate-y-px hover:bg-destructive/90 hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)] active:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-3 text-base",
        sm: "h-11 px-4 py-3 text-[15px]",
        lg: "h-11 px-6 py-3 text-base",
        xl: "h-11 px-6 py-3 text-base font-semibold",
        icon: "h-11 w-11",
        nav: "h-11 px-5 py-3 text-[15px]",
        dash: "h-11 px-6 py-3 text-base",
        dashSm: "h-11 px-4 py-3 text-[15px]",
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
