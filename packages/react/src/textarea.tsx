// Extracted from src/app/components/ui/textarea.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import * as React from "react";
import { cn } from "./utils";
import { Label } from "./label";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      required,
      id,
      containerClassName = "",
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedtextareaId = React.useId();
    const textareaId = id || `textarea-${generatedtextareaId}`;

    if (label || error || containerClassName) {
      return (
        <div className={cn("flex flex-col w-full", containerClassName)}>
          {label && (
            <Label htmlFor={textareaId} required={required}>
              {label}
            </Label>
          )}
          <div className="relative w-full">
            <textarea
              id={textareaId}
              ref={ref}
              rows={rows}
              data-slot="textarea"
              className={cn(
                "border-slate-200 dark:border-[#232D42] placeholder:text-muted-foreground dark:placeholder:text-[#94A3B8] focus-visible:border-[#00D1B2] focus-visible:ring-2 focus-visible:ring-[#00D1B2]/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-[#171E2E] dark:text-[#F8FAFC] flex min-h-[80px] w-full rounded-md border bg-input-background px-3 py-2 text-base transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none leading-relaxed",
                error && "ring-2 ring-red-500/50 bg-red-50/20 dark:bg-red-950/30 border-red-500",
                className
              )}
              {...props}
              required={required}
              aria-invalid={error ? true : props['aria-invalid']}
              aria-describedby={[props['aria-describedby'], error && `${textareaId}-error`].filter(Boolean).join(' ') || undefined}
            />
          </div>
          {error && (
            <span id={`${textareaId}-error`} className="text-sm text-[#BE123C] font-semibold mt-1">
              {error}
            </span>
          )}
        </div>
      );
    }

    return (
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        data-slot="textarea"
        className={cn(
          "border-slate-200 dark:border-[#232D42] placeholder:text-muted-foreground dark:placeholder:text-[#94A3B8] focus-visible:border-[#00D1B2] focus-visible:ring-2 focus-visible:ring-[#00D1B2]/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-[#171E2E] dark:text-[#F8FAFC] flex min-h-[80px] w-full rounded-md border bg-input-background px-3 py-2 text-base transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none leading-relaxed",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
