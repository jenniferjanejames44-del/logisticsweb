import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold tracking-wide ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Primary Button - Orange CTA (Main Actions) */
        default: [
          "bg-secondary text-secondary-foreground rounded-xl",
          "shadow-lg hover:shadow-xl hover:shadow-secondary/30",
          "hover:bg-[hsl(25,95%,48%)] hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        /* Secondary Button - White with Navy Border */
        secondary: [
          "bg-card text-foreground border-2 border-foreground rounded-xl",
          "shadow-sm hover:shadow-lg",
          "hover:bg-foreground hover:text-card hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        /* Ghost Button - For Dark Backgrounds */
        ghost: [
          "bg-transparent text-primary-foreground border-2 border-primary-foreground/40 rounded-xl",
          "hover:bg-primary-foreground hover:text-foreground hover:border-primary-foreground hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
          "backdrop-blur-sm",
        ].join(" "),

        /* Navigation Button - Orange (Header CTA) */
        nav: [
          "bg-secondary text-secondary-foreground font-semibold rounded-lg",
          "shadow-sm hover:shadow-lg hover:shadow-secondary/30",
          "hover:bg-[hsl(25,95%,48%)]",
          "active:scale-[0.98]",
        ].join(" "),

        /* Outline - Orange Border */
        outline: [
          "border-2 border-secondary bg-transparent text-secondary rounded-xl",
          "hover:bg-secondary hover:text-secondary-foreground",
          "hover:scale-105 hover:shadow-lg hover:shadow-secondary/20",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        /* Destructive */
        destructive: [
          "bg-destructive text-destructive-foreground rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:bg-destructive/90 hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        /* Link Style */
        link: "text-secondary underline-offset-4 hover:underline hover:text-secondary/80 p-0 h-auto min-h-0",

        /* Legacy Variants - Mapped to New System */
        cta: [
          "bg-secondary text-secondary-foreground rounded-xl",
          "shadow-lg hover:shadow-xl hover:shadow-secondary/30",
          "hover:bg-[hsl(25,95%,48%)] hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        heroPrimary: [
          "bg-secondary text-secondary-foreground rounded-xl",
          "shadow-lg hover:shadow-xl hover:shadow-secondary/30",
          "hover:bg-[hsl(25,95%,48%)] hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        heroSecondary: [
          "bg-card text-foreground border-2 border-foreground rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:bg-foreground hover:text-card hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        heroOutline: [
          "bg-transparent text-primary-foreground border-2 border-primary-foreground/40 rounded-xl",
          "hover:bg-primary-foreground hover:text-foreground hover:border-primary-foreground hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
          "backdrop-blur-sm",
        ].join(" "),

        accent: [
          "bg-foreground text-background rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:bg-foreground/90 hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        navCta: [
          "bg-secondary text-secondary-foreground font-semibold rounded-lg",
          "shadow-sm hover:shadow-lg hover:shadow-secondary/30",
          "hover:bg-[hsl(25,95%,48%)]",
          "active:scale-[0.98]",
        ].join(" "),

        navOutline: [
          "border-2 border-secondary bg-transparent text-secondary font-semibold rounded-lg",
          "hover:bg-secondary hover:text-secondary-foreground",
          "hover:shadow-sm",
          "active:scale-[0.98]",
        ].join(" "),

        ctaOutline: [
          "border-2 border-secondary bg-transparent text-secondary rounded-xl",
          "hover:bg-secondary hover:text-secondary-foreground",
          "hover:scale-105 hover:shadow-lg hover:shadow-secondary/20",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        premium: [
          "bg-gradient-to-r from-secondary to-[hsl(25,95%,58%)] text-secondary-foreground rounded-xl",
          "shadow-lg hover:shadow-xl hover:shadow-secondary/30",
          "hover:scale-105",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        indigoOutline: [
          "border-2 border-secondary bg-transparent text-secondary font-semibold rounded-xl",
          "hover:bg-secondary hover:text-secondary-foreground",
          "hover:scale-105 hover:shadow-md",
          "active:scale-[0.98]",
          "min-h-[48px]",
        ].join(" "),

        dynamic: [
          "bg-secondary text-secondary-foreground rounded-xl",
          "shadow-lg hover:shadow-xl hover:shadow-secondary/30",
          "hover:scale-105",
          "active:scale-[0.98]",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
          "relative overflow-hidden",
          "min-h-[48px]",
        ].join(" "),

        quote: [
          "bg-card text-foreground font-semibold rounded-xl border border-border",
          "shadow-sm hover:shadow-lg hover:border-secondary/30",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98]",
          "group",
          "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg.arrow-icon]:group-hover:translate-x-1.5",
          "min-h-[48px]",
        ].join(" "),

        quotePrimary: [
          "bg-secondary text-secondary-foreground font-semibold rounded-xl",
          "shadow-lg hover:shadow-xl hover:shadow-secondary/30",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98]",
          "group",
          "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg.arrow-icon]:group-hover:translate-x-1.5",
          "min-h-[48px]",
        ].join(" "),

        quoteAccent: [
          "bg-foreground text-background font-semibold rounded-xl",
          "shadow-lg hover:shadow-xl",
          "hover:scale-105 hover:-translate-y-1",
          "active:scale-[0.98]",
          "group",
          "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg.arrow-icon]:group-hover:translate-x-1.5",
          "min-h-[48px]",
        ].join(" "),
      },
      size: {
        default: "h-12 px-8 py-3.5 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-12 w-12",
        nav: "h-10 px-6 py-2.5 text-sm",
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
