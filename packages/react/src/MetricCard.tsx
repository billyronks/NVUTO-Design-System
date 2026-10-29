// Extracted from src/app/components/ui/MetricCard.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React from 'react';
import { cn } from './utils';

export interface MetricCardProps {
  label?: string;
  title?: string;
  value: React.ReactNode;
  change?: string;
  status?: string;
  positive?: boolean;
  icon?: React.ComponentType<any>;
  subtext?: string;
  iconClassName?: string;
  iconColorClass?: string;
  variant?: 'success' | 'warning' | 'critical' | 'neutral';
  valueClassName?: string;
  valueColorClass?: string;
  /** Optional extra content (e.g. a progress bar) rendered below the value/subtext, above the footer divider. */
  extra?: React.ReactNode;
  children?: React.ReactNode;
  changeClassName?: string;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  title,
  value,
  change,
  status,
  positive = true,
  icon: Icon,
  subtext,
  iconClassName,
  iconColorClass,
  variant,
  valueClassName,
  valueColorClass,
  extra,
  children,
  changeClassName,
  className,
  onClick,
}) => {
  const displayLabel = label || title;
  const resolvedIconClass = iconClassName || iconColorClass;
  const resolvedValueClass = valueClassName || valueColorClass;
  const getBadgeClasses = () => {
    if (variant) {
      switch (variant) {
        case 'success':
          return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60';
        case 'critical':
          return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60';
        case 'warning':
          return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60';
        case 'neutral':
          return 'text-slate-650 dark:text-[#94A3B8] bg-slate-100/80 dark:bg-[#171E2E] border border-slate-200/60 dark:border-[#232D42]';
      }
    }
    return positive
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60'
      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60';
  };

  const getChangeClasses = () => {
    if (variant) {
      switch (variant) {
        case 'success':
          return 'text-emerald-600 dark:text-emerald-400';
        case 'critical':
          return 'text-rose-600 dark:text-rose-400';
        case 'warning':
          return 'text-amber-600 dark:text-amber-400';
        case 'neutral':
          return 'text-slate-500 dark:text-[#94A3B8]';
      }
    }
    return positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-[#111625] rounded-xl p-5 lg:p-6 border border-slate-200 dark:border-[#232D42] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-w-0 select-none',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Top row: Icon and pill badge */}
      {(Icon || status) && (
        <div className="flex items-start justify-between mb-4 gap-2">
          {Icon ? (
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#171E2E] flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-[#232D42]">
              <Icon size={20} className={resolvedIconClass || 'text-[#FF4F00]'} strokeWidth={2} />
            </div>
          ) : (
            <div />
          )}
          {status && (
            <span
              className={cn(
                'nvuto-btn-text-compact px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none truncate shrink-0',
                getBadgeClasses()
              )}
              title={status}
            >
              {status}
            </span>
          )}
        </div>
      )}

      {/* Numerical metric display - strictly Poppins */}
      <div className="min-w-0">
        <div className="nvuto-metric-value-container">
        <div
          className={cn('nvuto-metric-value nvuto-display-xl tracking-tight leading-none mb-1 break-words [overflow-wrap:anywhere]', resolvedValueClass)}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </div>
        </div>
        {subtext && (
          <div className="nvuto-caption mt-1 select-none break-words text-slate-500 dark:text-[#94A3B8]" title={subtext}>
            {subtext}
          </div>
        )}
        {extra ?? children}
      </div>

      {/* Label and change details */}
      {(displayLabel || change) && (
        <div className="flex flex-col gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-[#232D42] min-w-0">
          {displayLabel && (
            <span className="nvuto-h3 uppercase tracking-wider break-words animate-none block text-slate-500 dark:text-[#94A3B8]" title={displayLabel}>
              {displayLabel}
            </span>
          )}
          {change && (
            <span className={cn('nvuto-caption font-medium break-words', getChangeClasses(), changeClassName)} title={change}>
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const KPICard = MetricCard;
export default MetricCard;
