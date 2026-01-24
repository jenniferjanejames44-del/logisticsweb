import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full text-sm font-semibold tracking-wide ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-md hover:shadow-lg",
          "hover:brightness-110 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-md hover:shadow-lg",
          "hover:brightness-110 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        outline: [
          "border-2 border-primary bg-transparent text-primary",
          "hover:bg-primary hover:text-primary-foreground",
          "hover:-translate-y-0.5 hover:shadow-md",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        secondary: [
          "bg-muted text-foreground",
          "shadow-sm hover:shadow-md",
          "hover:bg-muted/80 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        ghost: "hover:bg-muted hover:text-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        
        /* Primary CTA - Solid Electric Blue pill button */
        cta: [
          "bg-primary text-primary-foreground font-bold uppercase tracking-wider",
          "shadow-button hover:shadow-button-hover",
          "hover:brightness-110 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Secondary CTA - Solid Vibrant Yellow pill button */
        accent: [
          "bg-secondary text-secondary-foreground font-bold uppercase tracking-wider",
          "shadow-accent hover:shadow-accent-hover",
          "hover:brightness-110 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Outline Primary - Electric Blue outline */
        ctaOutline: [
          "border-2 border-primary bg-transparent text-primary font-bold uppercase tracking-wider",
          "hover:bg-primary hover:text-primary-foreground",
          "hover:-translate-y-1 hover:shadow-button",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Hero Outline - Glassmorphism for dark backgrounds */
        heroOutline: [
          "border-2 border-white/40 bg-white/10 text-white font-bold uppercase tracking-wider",
          "hover:bg-white hover:text-primary hover:border-white",
          "hover:-translate-y-1 hover:shadow-lg",
          "active:translate-y-0 active:scale-[0.97]",
          "backdrop-blur-sm",
        ].join(" "),
        
        /* Nav CTA - Compact solid pill for navigation */
        navCta: [
          "bg-primary text-primary-foreground font-semibold",
          "shadow-sm hover:shadow-button",
          "hover:brightness-110 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Nav Outline - Compact outline pill for navigation */
        navOutline: [
          "border-2 border-primary bg-transparent text-primary font-semibold",
          "hover:bg-primary hover:text-primary-foreground",
          "hover:-translate-y-0.5 hover:shadow-sm",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Premium - Gradient Electric Blue */
        premium: [
          "bg-gradient-to-r from-primary to-[hsl(200,100%,55%)] text-primary-foreground font-bold uppercase tracking-wider",
          "shadow-button hover:shadow-button-hover",
          "hover:brightness-110 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Blue Outline */
        blueOutline: [
          "border-2 border-primary bg-transparent text-primary font-semibold",
          "hover:bg-primary hover:text-primary-foreground",
          "hover:-translate-y-0.5 hover:shadow-md",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),

        /* Dynamic - With shine effect */
        dynamic: [
          "bg-primary text-primary-foreground font-bold uppercase tracking-wider",
          "shadow-button hover:shadow-button-hover",
          "hover:brightness-110 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.97]",
          "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
          "relative overflow-hidden",
        ].join(" "),

        /* Coral/Orange accent button */
        coral: [
          "bg-accent text-accent-foreground font-bold uppercase tracking-wider",
          "shadow-md hover:shadow-lg",
          "hover:brightness-110 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 px-5 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
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
