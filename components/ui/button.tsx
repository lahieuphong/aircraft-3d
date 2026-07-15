"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,opacity,transform] outline-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_24px_rgb(242_140_40_/_0.14)] hover:bg-[#ffad5b]",
        secondary:
          "border border-border bg-secondary/80 text-secondary-foreground hover:border-white/15 hover:bg-accent",
        outline:
          "border border-border bg-black/10 text-foreground hover:border-white/20 hover:bg-white/[0.06]",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        hud: "border border-white/10 bg-[#292a30]/82 text-[#adaeb5] hover:border-primary/25 hover:bg-[#36373e] hover:text-white data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary",
        destructive:
          "border border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/18",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-5",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
