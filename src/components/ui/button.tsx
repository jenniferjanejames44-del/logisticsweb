import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-extrabold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tracking-wide",
  {
    variants: {
      variant: {
        /* Primary Button - Orange Gradient */
        default: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl shadow-[0_4px_12px_rgba(255,107,53,0.4)] hover:from-[#E55A28] hover:to-[#D94E1F] hover:shadow-[0_6px_20px_rgba(229,90,40,0.5)] hover:-translate-y-0.5 active:translate-y-0",

        /* Secondary Button - White */
        secondary: "bg-white text-[#1E293B] border-2 border-white rounded-xl shadow-[0_4px_12px_rgba(255,255,255,0.2)] hover:bg-[#F8FAFC] hover:-translate-y-0.5 active:translate-y-0",

        /* Ghost Button - Transparent with white text for dark backgrounds */
        ghost: "bg-white/10 text-white border border-white/30 rounded-xl hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0",

        /* Outline - Blue border */
        outline: "border-2 border-[#0EA5E9] bg-transparent text-[#0EA5E9] rounded-xl hover:bg-[#0EA5E9] hover:text-white hover:-translate-y-0.5 active:translate-y-0",

        /* Destructive */
        destructive: "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0",

        /* Link Style */
        link: "text-[#0EA5E9] underline-offset-4 hover:underline hover:text-[#0284C7] p-0 h-auto font-semibold",

        /* Navigation CTA */
        nav: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg shadow-md hover:from-[#E55A28] hover:to-[#D94E1F] hover:-translate-y-0.5 active:translate-y-0",

        /* CTA variants */
        cta: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl shadow-[0_4px_12px_rgba(255,107,53,0.4)] hover:from-[#E55A28] hover:to-[#D94E1F] hover:shadow-[0_6px_20px_rgba(229,90,40,0.5)] hover:-translate-y-0.5 active:translate-y-0",
        heroPrimary: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl shadow-[0_6px_20px_rgba(255,107,53,0.4)] hover:from-[#E55A28] hover:to-[#D94E1F] hover:-translate-y-0.5 active:translate-y-0",
        heroSecondary: "bg-white text-[#1E293B] border-2 border-white rounded-xl shadow-lg hover:bg-[#F8FAFC] hover:-translate-y-0.5 active:translate-y-0",
        heroOutline: "bg-transparent text-white border-2 border-white/40 rounded-xl hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0",
        accent: "bg-[#0C4A6E] text-white rounded-xl hover:bg-[#0C4A6E]/90 hover:-translate-y-0.5 active:translate-y-0",
        navCta: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg hover:from-[#E55A28] hover:to-[#D94E1F] hover:-translate-y-0.5 active:translate-y-0",
        navOutline: "border-2 border-[#FF6B35] bg-transparent text-[#FF6B35] rounded-lg hover:bg-[#FF6B35] hover:text-white active:translate-y-0",
        ctaOutline: "border-2 border-[#FF6B35] bg-transparent text-[#FF6B35] rounded-xl hover:bg-[#FF6B35] hover:text-white hover:-translate-y-0.5 active:translate-y-0",
        premium: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl shadow-lg hover:from-[#E55A28] hover:to-[#D94E1F] hover:-translate-y-0.5 active:translate-y-0",
        indigoOutline: "border-2 border-[#0EA5E9] bg-transparent text-[#0EA5E9] rounded-xl hover:bg-[#0EA5E9] hover:text-white hover:-translate-y-0.5 active:translate-y-0",
        dynamic: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl hover:from-[#E55A28] hover:to-[#D94E1F] hover:-translate-y-0.5 active:translate-y-0",
        quote: "bg-white text-[#1E293B] border-2 border-[#E2E8F0] rounded-xl hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 group",
        quotePrimary: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl hover:from-[#E55A28] hover:to-[#D94E1F] hover:-translate-y-0.5 active:translate-y-0 group",
        quoteAccent: "bg-[#0C4A6E] text-white rounded-xl hover:bg-[#0C4A6E]/90 hover:-translate-y-0.5 active:translate-y-0 group",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-10 w-10",
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
