import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        /* Primary Button - Green #2D6A4F */
        default: "bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",

        /* Secondary Button - Outline Green */
        secondary: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",

        /* Ghost Button */
        ghost: "bg-transparent text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground active:scale-[0.98]",

        /* Outline - Same as secondary for consistency */
        outline: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 active:scale-[0.98]",

        /* Link Style */
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",

        /* Navigation variants */
        nav: "bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",
        navSecondary: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        navOutline: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",

        /* Hero variants */
        heroPrimary: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-[hsl(153,41%,24%)] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroSecondary: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroOutline: "bg-transparent text-white border border-white/50 rounded-lg hover:bg-white/10 hover:border-white active:scale-[0.98]",

        /* Accent - Same green */
        accent: "bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",

        /* CTA variants - all use green */
        cta: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-[hsl(153,41%,24%)] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        navCta: "bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",
        ctaOutline: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",

        /* Legacy variants mapped to green system */
        outlineNavy: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        premium: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-[hsl(153,41%,24%)] hover:shadow-md active:scale-[0.98]",
        indigoOutline: "bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        dynamic: "bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",
        quote: "bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",
        quotePrimary: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",
        quoteAccent: "bg-primary text-primary-foreground rounded-lg hover:bg-[hsl(153,41%,24%)] active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-base font-bold",
        icon: "h-11 w-11",
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
