import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const primaryButtonStyles =
  "border border-accent bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(223,81,1,0.16)] hover:-translate-y-[1px] hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.08)]";

const secondaryButtonStyles =
  "border border-primary bg-white text-primary shadow-[0_10px_24px_rgba(6,16,67,0.08)] hover:-translate-y-[1px] hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const navyButtonStyles =
  "border border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(6,16,67,0.14)] hover:-translate-y-[1px] hover:bg-[hsl(var(--primary-hover))] hover:text-primary-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.08)]";

const buttonVariants = cva(
  "font-display inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-base font-semibold tracking-[-0.01em] ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* PRIMARY BUTTON - Brand Orange */
        default: primaryButtonStyles,

        /* SECONDARY BUTTON - Outline Navy */
        secondary: secondaryButtonStyles,

        /* ACCENT BUTTON - Alias of primary CTA */
        accent: primaryButtonStyles,

        /* Ghost Button */
        ghost: "border border-transparent bg-transparent text-muted-foreground shadow-none hover:-translate-y-[1px] hover:border-border hover:bg-muted/70 hover:text-foreground active:translate-y-0",

        /* Outline - Navy border */
        outline: secondaryButtonStyles,

        /* Destructive */
        destructive: "border border-destructive bg-destructive text-destructive-foreground shadow-[0_10px_24px_rgba(220,38,38,0.14)] hover:-translate-y-[1px] hover:bg-destructive/90 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",

        /* Link Style */
        link: "!h-auto !px-0 !py-0 border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:bg-transparent hover:text-accent hover:underline",

        /* Navigation variants */
        nav: navyButtonStyles,
        navSecondary: secondaryButtonStyles,
        navOutline: "border border-primary/25 bg-transparent text-primary shadow-none hover:-translate-y-[1px] hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:translate-y-0",

        /* Hero variants */
        heroPrimary: primaryButtonStyles,
        heroSecondary: secondaryButtonStyles,
        heroOutline: "border border-white/70 bg-transparent text-white shadow-none hover:-translate-y-[1px] hover:bg-white/10 hover:border-white hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:translate-y-0",

        /* CTA variants - Orange for high-intent actions */
        cta: primaryButtonStyles,
        navCta: primaryButtonStyles,
        ctaOutline: secondaryButtonStyles,

        /* Legacy variants - mapped to new system */
        outlineNavy: secondaryButtonStyles,
        premium: primaryButtonStyles,
        indigoOutline: secondaryButtonStyles,
        dynamic: navyButtonStyles,
        quote: primaryButtonStyles,
        quotePrimary: primaryButtonStyles,
        quoteAccent: primaryButtonStyles,

        /* Dashboard-specific variants — rounded-lg, h-12, font-semibold */
        dashPrimary: navyButtonStyles,
        dashAccent: primaryButtonStyles,
        dashOutline: secondaryButtonStyles,
        dashGhost: "border border-transparent bg-transparent text-muted-foreground shadow-none hover:-translate-y-[1px] hover:border-border hover:bg-muted/70 hover:text-foreground active:translate-y-0",
        dashDestructive: "border border-destructive bg-destructive text-destructive-foreground shadow-[0_10px_24px_rgba(220,38,38,0.14)] hover:-translate-y-[1px] hover:bg-destructive/90 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
      },
      size: {
        default: "h-11 px-6 py-3 text-base",
        compact: "h-10 px-4 py-2.5 text-[15px]",
        sm: "h-11 px-5 py-3 text-[15px]",
        lg: "h-11 px-6 py-3 text-base",
        xl: "h-11 px-6 py-3 text-base font-semibold",
        icon: "h-11 w-11",
        iconSm: "h-9 w-9",
        nav: "h-11 px-5 py-3 text-base",
        dash: "h-11 px-6 py-3 text-base",
        dashSm: "h-11 px-5 py-3 text-[15px]",
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
