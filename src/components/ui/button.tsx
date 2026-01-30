import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tracking-normal select-none relative overflow-hidden",
  {
    variants: {
      variant: {
        /* Primary Button - Yellow (stays yellow, darker amber on hover) */
        default: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-md hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97] active:shadow-md active:translate-y-0",

        /* Secondary Button - Dark Blue (stays blue, subtle teal tint on hover) */
        secondary: "bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-[hsl(200,70%,28%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* Ghost Button - Transparent with subtle fill on hover */
        ghost: "bg-transparent text-muted-foreground rounded-xl hover:bg-muted hover:text-foreground active:scale-[0.97]",

        /* Outline Teal - Teal border, fills with teal on hover */
        outline: "border-2 border-accent bg-transparent text-accent rounded-xl hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* Outline Navy - Navy border, fills with navy on hover */
        outlineNavy: "border-2 border-primary bg-transparent text-primary rounded-xl hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground rounded-xl shadow-sm hover:bg-destructive/85 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* Link Style */
        link: "text-accent underline-offset-4 hover:underline hover:text-accent/80 p-0 h-auto font-medium",

        /* Navigation Primary CTA - Yellow */
        nav: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-sm hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* Navigation Secondary - Navy */
        navSecondary: "bg-primary text-primary-foreground rounded-xl shadow-sm hover:bg-[hsl(200,70%,28%)] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* Hero Primary - Yellow with enhanced shadow */
        heroPrimary: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-lg hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] active:translate-y-0",

        /* Hero Secondary - Dark Blue */
        heroSecondary: "bg-primary text-primary-foreground rounded-xl shadow-lg hover:bg-[hsl(200,70%,28%)] hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] active:translate-y-0",

        /* Hero Outline - White border for dark backgrounds */
        heroOutline: "bg-transparent text-white border-2 border-white/50 rounded-xl hover:bg-white/15 hover:border-white hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* Accent - Teal solid */
        accent: "bg-accent text-accent-foreground rounded-xl shadow-sm hover:bg-[hsl(188,78%,35%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",

        /* CTA variants */
        cta: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-lg hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] active:translate-y-0",
        navCta: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-sm hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
        navOutline: "border-2 border-primary bg-transparent text-primary rounded-xl hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
        ctaOutline: "border-2 border-accent bg-transparent text-accent rounded-xl hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
        premium: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-lg hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] active:translate-y-0",
        indigoOutline: "border-2 border-accent bg-transparent text-accent rounded-xl hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
        dynamic: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-sm hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
        quote: "bg-primary text-primary-foreground rounded-xl shadow-sm hover:bg-[hsl(200,70%,28%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 group",
        quotePrimary: "bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(42,100%,48%)] text-foreground rounded-xl shadow-lg hover:from-[hsl(40,100%,45%)] hover:to-[hsl(35,100%,42%)] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 group",
        quoteAccent: "bg-accent text-accent-foreground rounded-xl shadow-sm hover:bg-[hsl(188,78%,35%)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 group",
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
