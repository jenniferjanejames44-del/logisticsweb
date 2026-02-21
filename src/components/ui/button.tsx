import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none rounded-full",
  {
    variants: {
      variant: {
        /* 🟢 PRIMARY BUTTON - Green → Yellow on hover */
        default: "bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98] shadow-sm hover:shadow-md",

        /* ⚪ SECONDARY BUTTON - Neutral/White → Green on hover */
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-[0.98]",

        /* 🟡 ACCENT BUTTON - Yellow with dark text */
        accent: "bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] active:scale-[0.98] shadow-sm font-bold",

        /* Ghost Button → Green on hover */
        ghost: "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary active:scale-[0.98]",

        /* Outline - White bg, green border → Green on hover */
        outline: "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",

        /* Link Style */
        link: "text-primary underline-offset-4 hover:text-[hsl(45,100%,45%)] hover:underline p-0 h-auto font-bold",

        /* Navigation variants */
        nav: "bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98]",
        navSecondary: "bg-background text-primary border border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        navOutline: "bg-transparent text-primary border border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",

        /* Hero variants - Primary with Yellow hover */
        heroPrimary: "bg-primary text-primary-foreground shadow-md hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroSecondary: "bg-background text-primary border-2 border-primary shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroOutline: "bg-transparent text-white border-2 border-white/60 hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:border-[hsl(45,100%,51%)] active:scale-[0.98]",

        /* CTA variants */
        cta: "bg-primary text-primary-foreground shadow-md hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        navCta: "bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98]",
        ctaOutline: "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",

        /* Legacy variants - mapped to new system */
        outlineNavy: "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        premium: "bg-primary text-primary-foreground shadow-md hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] hover:shadow-lg active:scale-[0.98]",
        indigoOutline: "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        dynamic: "bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98]",
        quote: "bg-primary text-primary-foreground hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98]",
        quotePrimary: "bg-primary text-primary-foreground shadow-md hover:bg-[hsl(45,100%,51%)] hover:text-[hsl(0,0%,13%)] active:scale-[0.98]",
        quoteAccent: "bg-[hsl(45,100%,51%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(45,100%,45%)] active:scale-[0.98] font-bold",
      },
      size: {
        default: "h-11 sm:h-12 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-[15px]",
        sm: "h-9 sm:h-10 px-3 sm:px-4 py-2 text-xs sm:text-sm",
        lg: "h-12 sm:h-[52px] px-6 sm:px-8 py-3 text-sm sm:text-base",
        xl: "h-12 sm:h-14 px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-extrabold",
        icon: "h-12 w-12",
        nav: "h-11 px-5 py-2.5 text-sm",
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
