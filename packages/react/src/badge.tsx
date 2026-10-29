// Extracted from src/app/components/ui/badge.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider select-none w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground border-slate-200 dark:border-[#232D42]",
        success: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900",
        critical: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-900",
        warning: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900",
        neutral: "text-slate-650 dark:text-[#94A3B8] bg-slate-50 dark:bg-[#171E2E] border-slate-200/50 dark:border-[#232D42]",
        slate: "text-slate-650 dark:text-[#94A3B8] bg-slate-50 dark:bg-[#171E2E] border-slate-200/50 dark:border-[#232D42]",
        draft: "text-slate-500 dark:text-[#94A3B8] bg-transparent border-dashed border-slate-300 dark:border-[#232D42]",
        info: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-slate-200 dark:border-[#232D42]/50 dark:border-blue-900",
        danger: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-900",
        purple: "text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-900",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({
  className,
  variant = "neutral",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
