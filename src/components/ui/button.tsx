import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const primaryButtonStyles =
  "border border-accent bg-[linear-gradient(180deg,hsl(var(--accent))_0%,hsl(var(--accent-orange-hover))_100%)] text-accent-foreground shadow-[0_14px_30px_rgba(223,81,1,0.18)] hover:-translate-y-[1px] hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_14px_30px_rgba(6,16,67,0.16)] active:translate-y-0 active:shadow-[0_8px_18px_rgba(6,16,67,0.12)]";

const secondaryButtonStyles =
  "border border-primary/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] text-primary shadow-[0_12px_28px_rgba(6,16,67,0.08)] hover:-translate-y-[1px] hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_12px_24px_rgba(223,81,1,0.14)] active:translate-y-0 active:shadow-[0_8px_16px_rgba(6,16,67,0.08)]";

const navyButtonStyles =
  "border border-primary bg-[linear-gradient(180deg,hsl(var(--primary))_0%,hsl(var(--primary-hover))_100%)] text-primary-foreground shadow-[0_14px_30px_rgba(6,16,67,0.16)] hover:-translate-y-[1px] hover:bg-[hsl(var(--primary-hover))] hover:text-primary-foreground hover:shadow-[0_16px_34px_rgba(6,16,67,0.18)] active:translate-y-0 active:shadow-[0_8px_18px_rgba(6,16,67,0.12)]";

const buttonVariants = cva(
  "font-display inline-flex min-w-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-[16px] text-[0.95rem] font-semibold tracking-[-0.01em] ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
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
        ghost: "border border-transparent bg-transparent text-muted-foreground shadow-none hover:-translate-y-[1px] hover:border-border/70 hover:bg-muted/70 hover:text-foreground active:translate-y-0",

        /* Outline - Navy border */
        outline: secondaryButtonStyles,

        /* Destructive */
        destructive: "border border-destructive bg-destructive text-destructive-foreground shadow-[0_12px_24px_rgba(220,38,38,0.14)] hover:-translate-y-[1px] hover:bg-destructive/90 hover:shadow-[0_14px_28px_rgba(220,38,38,0.16)] active:translate-y-0 active:shadow-[0_8px_16px_rgba(220,38,38,0.12)]",

        /* Link Style */
        link: "!h-auto !px-0 !py-0 border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:bg-transparent hover:text-accent hover:underline",

        /* Navigation variants */
        nav: navyButtonStyles,
        navSecondary: secondaryButtonStyles,
        navOutline: "border border-primary/18 bg-white/80 text-primary shadow-[0_8px_20px_rgba(6,16,67,0.05)] backdrop-blur-sm hover:-translate-y-[1px] hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_12px_24px_rgba(223,81,1,0.14)] active:translate-y-0",

        /* Hero variants */
        heroPrimary: primaryButtonStyles,
        heroSecondary: secondaryButtonStyles,
        heroOutline: "border border-white/60 bg-white/5 text-white shadow-[0_10px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] hover:bg-white/10 hover:border-white hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)] active:translate-y-0",

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
        dashGhost: "border border-transparent bg-transparent text-muted-foreground shadow-none hover:-translate-y-[1px] hover:border-border/70 hover:bg-muted/70 hover:text-foreground active:translate-y-0",
        dashDestructive: "border border-destructive bg-destructive text-destructive-foreground shadow-[0_12px_24px_rgba(220,38,38,0.14)] hover:-translate-y-[1px] hover:bg-destructive/90 hover:shadow-[0_14px_28px_rgba(220,38,38,0.16)] active:translate-y-0 active:shadow-[0_8px_16px_rgba(220,38,38,0.12)]",
      },
      size: {
        default: "h-11 px-5 py-3 sm:h-12 sm:px-6",
        compact: "h-10 px-4 py-2 text-sm",
        sm: "h-10 px-4 py-2 text-sm sm:h-11 sm:px-5",
        lg: "h-12 px-6 py-3 text-base sm:h-[50px]",
        xl: "h-12 px-6 py-3 text-base font-semibold sm:h-[54px] sm:px-7",
        icon: "h-11 w-11 sm:h-12 sm:w-12",
        iconSm: "h-9 w-9",
        nav: "h-11 px-4 py-3 text-sm sm:h-12 sm:px-5 sm:text-[0.95rem]",
        dash: "h-11 px-5 py-3 text-sm sm:h-12 sm:px-6 sm:text-[0.95rem]",
        dashSm: "h-10 px-4 py-2 text-sm sm:h-11 sm:px-5",
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
