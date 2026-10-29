// Extracted from src/app/components/ui/checkbox.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckCircle as CheckIcon } from "@solar-icons/react";
import { cn } from "./utils";
import { Label } from "./label";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  error?: string;
  required?: boolean;
  onChange?: (e: any) => void;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, error, required, id, onChange, onCheckedChange, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || `checkbox-${generatedId}`;

  const handleCheckedChange = (checked: CheckboxPrimitive.CheckedState) => {
    onCheckedChange?.(checked);
    if (onChange) {
      const isChecked = checked === true;
      onChange({
        target: { checked: isChecked, value: isChecked },
        currentTarget: { checked: isChecked, value: isChecked },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as any);
    }
  };

  if (label || error) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <CheckboxPrimitive.Root
            id={checkboxId}
            ref={ref}
            data-slot="checkbox"
            onCheckedChange={handleCheckedChange}
            className={cn(
              "peer border-slate-200 dark:border-[#232D42] data-[state=checked]:bg-[#111184] dark:data-[state=checked]:bg-[#FF4F00] data-[state=checked]:text-white dark:data-[state=checked]:text-white data-[state=checked]:border-[#111184] dark:data-[state=checked]:border-[#FF4F00] focus-visible:border-[#00D1B2] focus-visible:ring-2 focus-visible:ring-[#00D1B2]/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-md border shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center",
              className
            )}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              data-slot="checkbox-indicator"
              className="flex items-center justify-center text-current transition-none"
            >
              <CheckIcon className="size-3.5" />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          <label
            htmlFor={checkboxId}
            className="cursor-pointer select-none text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] hover:text-slate-900 transition-colors"
          >
            {label}
            {required && <span className="text-[#BE123C] dark:text-rose-400 ml-1">*</span>}
          </label>
        </div>
        {error && (
          <span className="text-sm text-[#BE123C] font-semibold mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <CheckboxPrimitive.Root
      id={id}
      ref={ref}
      data-slot="checkbox"
      onCheckedChange={handleCheckedChange}
      className={cn(
        "peer border-slate-200 dark:border-[#232D42] data-[state=checked]:bg-[#111184] dark:data-[state=checked]:bg-[#FF4F00] data-[state=checked]:text-white dark:data-[state=checked]:text-white data-[state=checked]:border-[#111184] dark:data-[state=checked]:border-[#FF4F00] focus-visible:border-[#00D1B2] focus-visible:ring-2 focus-visible:ring-[#00D1B2]/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-md border shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
