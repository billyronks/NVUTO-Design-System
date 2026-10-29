// Extracted from src/app/components/ui/input.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import * as React from "react";
import { cn } from "./utils";
import { Label } from "./label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  leftIcon?: React.ComponentType<any>;
  rightIcon?: React.ComponentType<any>;
  containerClassName?: string;
}

const triggerDatePicker = (target: HTMLInputElement) => {
  if (target.type === "date" && typeof target.showPicker === "function") {
    try {
      target.showPicker();
    } catch (_) {}
  }
};

// Date-picker handling is scoped to this control, never the host document.

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      required,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      id,
      containerClassName = "",
      onClick,
      onFocus,
      ...props
    },
    ref
  ) => {
    const generatedinputId = React.useId();
    const inputId = id || `input-${generatedinputId}`;
    const [showPassword, setShowPassword] = React.useState(false);

    const isPasswordType = type === "password";
    const isDateType = type === "date";
    const resolvedType = isPasswordType ? (showPassword ? "text" : "password") : type;

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      if (isDateType) triggerDatePicker(e.currentTarget);
      onClick?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (isDateType) triggerDatePicker(e.currentTarget);
      onFocus?.(e);
    };

    // If label, error, leftIcon, rightIcon or password toggle is used, render the enhanced wrapper container
    if (label || error || LeftIcon || RightIcon || isPasswordType || containerClassName) {
      return (
        <div className={cn("flex flex-col w-full", containerClassName)}>
          {label && (
            <Label htmlFor={inputId} required={required}>
              {label}
            </Label>
          )}
          <div className="relative w-full flex items-center">
            {LeftIcon && (
              <div className="absolute left-3.5 text-slate-400 dark:text-[#94A3B8] pointer-events-none select-none flex items-center justify-center">
                <LeftIcon size={18} />
              </div>
            )}

            <input
              id={inputId}
              type={resolvedType}
              ref={ref}
              data-slot="input"
              onClick={handleClick}
              onFocus={handleFocus}
              className={cn(
                "file:text-foreground nvuto-input-text dark:bg-[#171E2E] border-slate-200 dark:border-[#232D42] flex min-h-[44px] w-full min-w-0 rounded-md border px-3 py-2 bg-input-background transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:border-[#00D1B2] focus-visible:ring-2 focus-visible:ring-[#00D1B2]/40",
                isDateType && "cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                LeftIcon && "pl-11",
                (RightIcon || isPasswordType) && "pr-11",
                error && "ring-2 ring-red-500/50 bg-red-50/20 dark:bg-red-950/30 border-red-500",
                className
              )}
              {...props}
              required={required}
              aria-invalid={error ? true : props['aria-invalid']}
              aria-describedby={[props['aria-describedby'], error && `${inputId}-error`].filter(Boolean).join(' ') || undefined}
            />

            {isPasswordType ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0.5 min-w-[44px] min-h-[44px] text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] select-none flex items-center justify-center cursor-pointer transition-colors bg-transparent border-0 p-0 focus-visible:ring-2 focus-visible:ring-[#FF4F00]"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            ) : (
              RightIcon && (
                <div className="absolute right-3.5 text-slate-400 dark:text-[#94A3B8] pointer-events-none select-none flex items-center justify-center">
                  <RightIcon size={18} />
                </div>
              )
            )}
          </div>
          {error && (
            <span id={`${inputId}-error`} className="text-sm text-[#BE123C] font-semibold mt-1">
              {error}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        id={id}
        type={type}
        ref={ref}
        data-slot="input"
        onClick={handleClick}
        onFocus={handleFocus}
        className={cn(
          "file:text-foreground text-slate-900 dark:text-[#F8FAFC] placeholder:text-muted-foreground dark:placeholder:text-[#94A3B8] dark:bg-[#171E2E] border-slate-200 dark:border-[#232D42] flex min-h-[44px] w-full min-w-0 rounded-md border px-3 py-2 text-base bg-input-background transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-[#00D1B2] focus-visible:ring-2 focus-visible:ring-[#00D1B2]/40",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          isDateType && "cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          className
        )}
        {...props}
        required={required}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
