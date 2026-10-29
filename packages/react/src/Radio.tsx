// Extracted from src/app/components/ui/Radio.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, id, ...props }, ref) => {
    const generatedradioId = React.useId();
    const radioId = id || `radio-${generatedradioId}`;

    return (
      <label
        htmlFor={radioId}
        className="flex min-h-[44px] items-center gap-3 cursor-pointer select-none text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] hover:text-slate-900 transition-colors"
      >
        <input
          id={radioId}
          type="radio"
          ref={ref}
          className={`appearance-none w-5 h-5 border border-slate-350 dark:border-[#232D42] rounded-full bg-white dark:bg-[#111625] checked:bg-[#111184] dark:checked:bg-[#FF4F00] checked:border-[#111184] dark:checked:border-[#FF4F00] focus:outline-none focus:ring-2 focus:ring-[#111184]/20 transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-1.5 after:top-1.5 after:w-2 after:h-2 after:rounded-full after:bg-white dark:bg-[#111625] ${className}`}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
export default Radio;
