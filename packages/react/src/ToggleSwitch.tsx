// Extracted from src/app/components/ui/ToggleSwitch.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React from 'react';
import { cn } from './utils';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  className = '',
  disabled = false,
  id,
}) => {
  const generatedId = React.useId();
  const switchId = id || `switch-${generatedId}`;
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-start gap-3 cursor-pointer select-none text-sm font-semibold text-slate-700 dark:text-[#F8FAFC]',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={cn(
          'w-11 h-6 shrink-0 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#FF4F00]/30 focus-visible:ring-offset-2 mt-0.5',
          checked
            ? 'bg-[#FF4F00] hover:bg-[#e04500]'
            : 'bg-slate-300 dark:bg-[#232D42] hover:bg-slate-400 dark:hover:bg-[#2d3850]'
        )}
      >
        <span
          className={cn(
            'w-4 h-4 shrink-0 rounded-full bg-white shadow-md transition-transform duration-200 transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {label && <label htmlFor={switchId} className="leading-snug pt-0.5 cursor-pointer">{label}</label>}
    </div>
  );
};
export default ToggleSwitch;

