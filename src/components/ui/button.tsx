import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-button font-semibold tracking-wide ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:scale-105 hover:-translate-y-0.5",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:scale-105 hover:-translate-y-0.5",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        outline: [
          "border-2 border-primary bg-transparent text-primary rounded-xl",
          "hover:bg-primary hover:text-primary-foreground",
          "hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        secondary: [
          "bg-muted text-foreground rounded-xl",
          "shadow-sm hover:shadow-md",
          "hover:bg-muted/80 hover:scale-105 hover:-translate-y-0.5",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        ghost: "hover:bg-muted hover:text-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        
        /* Primary CTA - Vibrant Orange */
        cta: [
          "bg-secondary text-secondary-foreground font-bold rounded-xl",
          "shadow-button hover:shadow-button-hover",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Secondary CTA - Dark Navy */
        accent: [
          "bg-primary text-primary-foreground font-bold rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Outline Primary - Orange outline */
        ctaOutline: [
          "border-2 border-secondary bg-transparent text-secondary font-bold rounded-xl",
          "hover:bg-secondary hover:text-secondary-foreground",
          "hover:scale-105 hover:-translate-y-1 hover:shadow-button",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Hero Primary - Vibrant Orange for hero sections */
        heroPrimary: [
          "bg-secondary text-secondary-foreground font-bold rounded-xl",
          "shadow-button hover:shadow-button-hover",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Hero Secondary - White for hero sections */
        heroSecondary: [
          "bg-card text-primary font-bold rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:bg-muted hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Hero Outline - White border for dark backgrounds */
        heroOutline: [
          "border-2 border-white/40 bg-white/10 text-white font-bold rounded-xl",
          "hover:bg-white hover:text-primary hover:border-white",
          "hover:scale-105 hover:-translate-y-1 hover:shadow-lg",
          "active:scale-[0.98] active:translate-y-0",
          "backdrop-blur-sm",
        ].join(" "),
        
        /* Nav CTA - Orange for navigation */
        navCta: [
          "bg-secondary text-secondary-foreground font-semibold rounded-xl",
          "shadow-sm hover:shadow-button",
          "hover:scale-105 hover:-translate-y-0.5",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Nav Outline - Orange outline for navigation */
        navOutline: [
          "border-2 border-secondary bg-transparent text-secondary font-semibold rounded-xl",
          "hover:bg-secondary hover:text-secondary-foreground",
          "hover:scale-105 hover:-translate-y-0.5 hover:shadow-sm",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Premium - Gradient Orange */
        premium: [
          "bg-gradient-to-r from-secondary to-[hsl(18,100%,55%)] text-secondary-foreground font-bold rounded-xl",
          "shadow-button hover:shadow-button-hover",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),
        
        /* Orange Outline */
        indigoOutline: [
          "border-2 border-secondary bg-transparent text-secondary font-semibold rounded-xl",
          "hover:bg-secondary hover:text-secondary-foreground",
          "hover:scale-105 hover:-translate-y-0.5 hover:shadow-md",
          "active:scale-[0.98] active:translate-y-0",
        ].join(" "),

        /* Dynamic - With shine effect */
        dynamic: [
          "bg-secondary text-secondary-foreground font-bold rounded-xl",
          "shadow-button hover:shadow-button-hover",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
          "relative overflow-hidden",
        ].join(" "),

        /* Quote - Card style with animated arrow */
        quote: [
          "bg-card text-foreground font-semibold rounded-xl border border-border",
          "shadow-sm hover:shadow-card hover:border-secondary/30",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
          "group",
          "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg.arrow-icon]:group-hover:translate-x-1.5",
        ].join(" "),

        /* Quote Primary - Orange background with animated arrow */
        quotePrimary: [
          "bg-secondary text-secondary-foreground font-semibold rounded-xl",
          "shadow-button hover:shadow-button-hover",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
          "group",
          "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg.arrow-icon]:group-hover:translate-x-1.5",
        ].join(" "),

        /* Quote Accent - Navy background with animated arrow */
        quoteAccent: [
          "bg-primary text-primary-foreground font-semibold rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
          "group",
          "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg.arrow-icon]:group-hover:translate-x-1.5",
        ].join(" "),
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-11 w-11",
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
