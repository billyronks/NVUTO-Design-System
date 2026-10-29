// Extracted from src/app/components/ui/button.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F00] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F19] cursor-pointer disabled:opacity-50 disabled:pointer-events-none min-h-[44px]",
  {
    variants: {
      variant: {
        default: "bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white border-0 rounded-lg shadow-sm font-bold",
        primary: "bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white border-0 rounded-lg shadow-sm font-bold",
        outline: "border border-slate-200 dark:border-[#232D42] bg-white dark:bg-[#171E2E] text-slate-900 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#232D42] rounded-lg",
        ghost: "text-slate-650 dark:text-[#94A3B8] hover:text-[#FF4F00] dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#171E2E] rounded-lg",
        danger: "bg-[#BE123C] hover:bg-[#9F1239] text-white rounded-lg shadow-sm",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 rounded-lg",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        fab: "bg-[#FF4F00] hover:bg-[#e04500] text-white rounded-[18px] shadow-md hover:shadow-lg hover:shadow-[#FF4F00]/20 hover:scale-105 active:scale-95 transition-all w-14 h-14 flex items-center justify-center shrink-0 border-0",
      },
      size: {
        default: "h-11 min-h-[44px] px-5 py-2.5 nvuto-btn-text rounded-lg gap-2",
        sm: "h-9 min-h-[36px] px-3.5 py-1.5 nvuto-btn-text-compact rounded-md gap-1.5",
        md: "h-11 min-h-[44px] px-5 py-2.5 nvuto-btn-text rounded-lg gap-2",
        lg: "h-12 min-h-[48px] px-6 py-3 text-base font-bold rounded-xl gap-2.5",
        icon: "size-11 min-h-[44px] min-w-[44px] rounded-lg p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ComponentType<any>;
  rightIcon?: React.ComponentType<any>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isFab = variant === "fab";

    if (asChild) {
      return (
        <Slot
          ref={ref as any}
          data-slot="button"
          className={cn(buttonVariants({ variant, size: isFab ? undefined : size, className }))}
          aria-disabled={disabled || isLoading ? true : undefined}
          {...props}
          tabIndex={disabled || isLoading ? -1 : props.tabIndex}
          aria-busy={isLoading || undefined}
          onClickCapture={(e) => {
            if (disabled || isLoading) { e.preventDefault(); e.stopPropagation(); }
            else props.onClickCapture?.(e as React.MouseEvent<HTMLButtonElement>);
          }}
          onKeyDownCapture={(e) => {
            if ((disabled || isLoading) && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); }
            else props.onKeyDownCapture?.(e as React.KeyboardEvent<HTMLButtonElement>);
          }}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        type="button"
        ref={ref}
        disabled={disabled || isLoading}
        data-slot="button"
        className={cn(buttonVariants({ variant, size: isFab ? undefined : size, className }))}
        {...props}
        aria-busy={isLoading || undefined}
      >
        {isLoading ? (
          <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-nvuto-spin shrink-0" />
        ) : (
          LeftIcon && <LeftIcon size={isFab ? 24 : 16} className="shrink-0" />
        )}

        {children}

        {!isFab && !isLoading && RightIcon && (
          <RightIcon size={16} className="shrink-0" />
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
