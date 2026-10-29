import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <label
        htmlFor={radioId}
        className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] hover:text-slate-900 transition-colors"
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
