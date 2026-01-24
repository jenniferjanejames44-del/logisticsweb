import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "hover:bg-primary/90 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.98]",
          "relative overflow-hidden",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-lg hover:shadow-xl",
          "hover:bg-destructive/90 hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.98]",
          "relative overflow-hidden",
        ].join(" "),
        outline: [
          "border-2 border-border bg-background text-foreground",
          "hover:bg-muted hover:border-primary/40",
          "hover:-translate-y-0.5 hover:shadow-md",
          "active:translate-y-0 active:scale-[0.98]",
        ].join(" "),
        secondary: [
          "bg-muted text-foreground",
          "shadow-md hover:shadow-lg",
          "hover:bg-muted/80 hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
        ].join(" "),
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        
        /* Premium CTA - Electric Blue gradient button */
        cta: [
          "bg-gradient-to-r from-primary to-[hsl(200,100%,55%)] text-primary-foreground font-bold",
          "shadow-button hover:shadow-button-hover",
          "hover:-translate-y-1.5",
          "active:translate-y-0 active:scale-[0.97]",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-black/10 before:to-white/15 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
          "relative overflow-hidden",
        ].join(" "),
        
        /* Accent CTA - Vibrant Yellow button */
        accent: [
          "bg-gradient-to-r from-secondary to-[hsl(45,100%,48%)] text-secondary-foreground font-bold",
          "shadow-accent hover:shadow-accent-hover",
          "hover:-translate-y-1.5",
          "active:translate-y-0 active:scale-[0.97]",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-black/5 before:to-white/25 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
          "relative overflow-hidden",
        ].join(" "),
        
        /* CTA Outline - Electric Blue outline with fill hover */
        ctaOutline: [
          "border-2 border-primary bg-transparent text-primary font-bold",
          "hover:bg-primary hover:text-primary-foreground",
          "hover:-translate-y-1.5 hover:shadow-lg",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Hero Outline - For dark/blue backgrounds */
        heroOutline: [
          "border-2 border-white/30 bg-white/10 text-white font-semibold",
          "hover:bg-white/20 hover:border-secondary hover:text-secondary",
          "hover:-translate-y-1.5 hover:shadow-lg",
          "active:translate-y-0 active:scale-[0.97]",
          "backdrop-blur-sm",
        ].join(" "),
        
        /* Nav CTA - Compact gradient button */
        navCta: [
          "bg-gradient-to-r from-primary to-[hsl(200,100%,55%)] text-primary-foreground font-bold",
          "shadow-button hover:shadow-button-hover",
          "hover:-translate-y-1",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),
        
        /* Premium Gradient Button */
        premium: [
          "bg-gradient-to-r from-primary via-[hsl(200,100%,55%)] to-primary text-primary-foreground font-bold",
          "shadow-blue hover:shadow-blue-lg",
          "hover:-translate-y-1.5",
          "active:translate-y-0 active:scale-[0.97]",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-black/10 before:to-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
          "relative overflow-hidden",
        ].join(" "),
        
        /* Blue Outline */
        blueOutline: [
          "border-2 border-primary bg-transparent text-primary font-semibold",
          "hover:bg-primary hover:text-primary-foreground",
          "hover:-translate-y-1.5 hover:shadow-lg",
          "active:translate-y-0 active:scale-[0.97]",
        ].join(" "),

        /* Dynamic gradient effect */
        dynamic: [
          "bg-gradient-to-r from-primary to-[hsl(200,80%,50%)] text-primary-foreground font-bold",
          "shadow-lg hover:shadow-xl",
          "hover:-translate-y-1.5",
          "active:translate-y-0 active:scale-[0.97]",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
          "relative overflow-hidden",
        ].join(" "),

        /* Coral/Orange accent button */
        coral: [
          "bg-gradient-to-r from-accent to-[hsl(10,100%,55%)] text-accent-foreground font-bold",
          "shadow-lg hover:shadow-xl",
          "hover:-translate-y-1.5",
          "active:translate-y-0 active:scale-[0.97]",
          "relative overflow-hidden",
        ].join(" "),
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
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
