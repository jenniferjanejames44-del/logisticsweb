import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tracking-normal select-none",
  {
    variants: {
      variant: {
        /* Primary Button - Orange Gradient with visible hover */
        default: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:shadow-sm active:translate-y-0",

        /* Secondary Button - Clean white with visible hover */
        secondary: "bg-white text-foreground border border-border rounded-lg shadow-sm hover:bg-secondary hover:text-secondary-foreground hover:border-secondary hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",

        /* Ghost Button - Transparent with visible hover */
        ghost: "bg-transparent text-muted-foreground rounded-lg hover:bg-accent/10 hover:text-accent active:scale-[0.98]",

        /* Outline - Clean border style with visible hover */
        outline: "border border-border bg-transparent text-foreground rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground rounded-lg shadow-sm hover:bg-destructive/80 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",

        /* Link Style */
        link: "text-accent underline-offset-4 hover:underline hover:text-accent/80 p-0 h-auto font-medium",

        /* Navigation CTA */
        nav: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",

        /* CTA variants - with visible hover effects */
        cta: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroPrimary: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroSecondary: "bg-white text-foreground border border-white/20 rounded-lg shadow-md hover:bg-secondary hover:text-secondary-foreground hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        heroOutline: "bg-transparent text-white border border-white/40 rounded-lg hover:bg-white/20 hover:border-white hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        accent: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/80 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        navCta: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        navOutline: "border border-[#FF6B35] bg-transparent text-[#FF6B35] rounded-lg hover:bg-[#FF6B35] hover:text-white hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        ctaOutline: "border border-[#FF6B35] bg-transparent text-[#FF6B35] rounded-lg hover:bg-[#FF6B35] hover:text-white hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        premium: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        indigoOutline: "border border-accent bg-transparent text-accent rounded-lg hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        dynamic: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-sm hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
        quote: "bg-white text-foreground border border-border rounded-lg shadow-sm hover:bg-secondary hover:text-secondary-foreground hover:border-secondary hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 group",
        quotePrimary: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:from-[#FF8C42] hover:to-[#FFA94D] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 group",
        quoteAccent: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/80 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 group",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-11 px-6 py-3 text-base",
        xl: "h-12 px-8 py-3.5 text-base",
        icon: "h-10 w-10",
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
