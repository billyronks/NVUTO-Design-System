"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "./utils";

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base font-extrabold",
};

export interface NvutoAvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  NvutoAvatarProps
>(({ className, name, src, size = "md", children, ...props }, ref) => {
  if (name !== undefined || src !== undefined) {
    const initials = name
      ? name
          .trim()
          .split(/\s+/)
          .map((word) => word[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "??";

    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full font-bold shadow-sm border border-slate-200 dark:border-[#232D42]",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={name || "Avatar"}
          className="aspect-square size-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="bg-gradient-to-br from-[#111184]/10 to-[#111184]/20 text-slate-900 dark:text-[#F8FAFC] dark:from-[#FF4F00]/20 dark:to-[#FF4F00]/30 dark:text-[#FF4F00] flex size-full items-center justify-center font-bold"
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }

  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("aspect-square size-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "bg-muted flex size-full items-center justify-center rounded-full font-bold",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
