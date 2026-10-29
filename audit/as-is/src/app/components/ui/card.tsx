import * as React from "react";
import { cn } from "./utils";

export interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "subtle" | "elevated" | "interactive";
  density?: "compact" | "default" | "spacious";
}

function Card({
  className,
  variant = "default",
  density = "default",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white text-slate-850 dark:bg-[#111625] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#232D42] shadow-sm",
    subtle: "bg-slate-50/70 text-slate-850 dark:bg-[#171E2E]/60 dark:text-[#F8FAFC] border border-slate-200/80 dark:border-[#232D42]",
    elevated: "bg-white text-slate-850 dark:bg-[#111625] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#232D42] shadow-md",
    interactive: "bg-white text-slate-850 dark:bg-[#111625] dark:text-[#F8FAFC] border border-slate-200 dark:border-[#232D42] shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer",
  };

  const densityGap = {
    compact: "gap-4",
    default: "gap-6",
    spacious: "gap-8",
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col rounded-xl transition-colors duration-200",
        variantStyles[variant],
        densityGap[density],
        className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.ComponentProps<"div"> {
  density?: "compact" | "default" | "spacious";
}

function CardHeader({ className, density = "default", ...props }: CardHeaderProps) {
  const densityPadding = {
    compact: "px-4 pt-4 [.border-b]:pb-4",
    default: "px-6 pt-6 [.border-b]:pb-6",
    spacious: "px-8 pt-8 [.border-b]:pb-8",
  };

  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] dark:[.border-b]:border-[#232D42]",
        densityPadding[density],
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-base lg:text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-snug", className)}
      {...props}
    >
      {props.children}
    </h3>
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-xs lg:text-sm text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed mt-0.5", className)}
      {...props}
    >
      {props.children}
    </p>
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end flex items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

export interface CardContentProps extends React.ComponentProps<"div"> {
  density?: "compact" | "default" | "spacious";
}

function CardContent({ className, density = "default", ...props }: CardContentProps) {
  const densityPadding = {
    compact: "px-4 [&:last-child]:pb-4",
    default: "px-6 [&:last-child]:pb-6",
    spacious: "px-8 [&:last-child]:pb-8",
  };

  return (
    <div
      data-slot="card-content"
      className={cn(densityPadding[density], className)}
      {...props}
    />
  );
}

export interface CardFooterProps extends React.ComponentProps<"div"> {
  density?: "compact" | "default" | "spacious";
}

function CardFooter({ className, density = "default", ...props }: CardFooterProps) {
  const densityPadding = {
    compact: "px-4 pb-4 [.border-t]:pt-4",
    default: "px-6 pb-6 [.border-t]:pt-6",
    spacious: "px-8 pb-8 [.border-t]:pt-8",
  };

  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center dark:[.border-t]:border-[#232D42]",
        densityPadding[density],
        className,
      )}
      {...props}
    />
  );
}

// Canonical Surface Aliases
export const Surface = Card;
export const SurfaceHeader = CardHeader;
export const SurfaceTitle = CardTitle;
export const SurfaceDescription = CardDescription;
export const SurfaceAction = CardAction;
export const SurfaceContent = CardContent;
export const SurfaceFooter = CardFooter;

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

