import * as React from 'react';
import { cn } from './utils';

/** Nvuto styling with native keyboard, option and form-validation semantics. */
export const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      data-slot="native-select"
      className={cn(
        'nvuto-input-text min-h-[44px] w-full min-w-0 rounded-md border border-slate-200 bg-input-background px-3 py-2 text-slate-900 outline-none transition-colors dark:border-[#232D42] dark:bg-[#171E2E] dark:text-[#F8FAFC] focus-visible:border-[#FF4F00] focus-visible:ring-2 focus-visible:ring-[#FF4F00]/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
NativeSelect.displayName = 'NativeSelect';
