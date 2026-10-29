// Extracted from src/app/components/ui/EmptyState.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React from 'react';
import {
  FileText,
  Magnifer,
  CheckCircle,
  Settings,
  ShieldKeyhole,
  Danger,
  InfoCircle,
} from '@solar-icons/react';
import { cn } from './utils';
import { Button } from './button';

export type EmptyStateVariant =
  | 'default'
  | 'first_use'
  | 'no_results'
  | 'cleared'
  | 'not_configured'
  | 'not_entitled'
  | 'error';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ComponentType<any>;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  onRetry?: () => void;
}

const variantConfig: Record<
  EmptyStateVariant,
  {
    defaultIcon: React.ComponentType<any>;
    defaultTitle: string;
    defaultDescription: string;
    iconColor: string;
    containerBorder: string;
  }
> = {
  default: {
    defaultIcon: FileText,
    defaultTitle: 'No records found',
    defaultDescription: 'There are no items to display right now.',
    iconColor: 'text-slate-400 dark:text-[#94A3B8]',
    containerBorder: 'border-slate-200 dark:border-[#232D42]',
  },
  first_use: {
    defaultIcon: FileText,
    defaultTitle: 'No items created yet',
    defaultDescription: 'Get started by creating your first entry.',
    iconColor: 'text-[#FF4F00]',
    containerBorder: 'border-slate-200 dark:border-[#232D42]',
  },
  no_results: {
    defaultIcon: Magnifer,
    defaultTitle: 'No matching results',
    defaultDescription: 'No records match your active search or filter criteria.',
    iconColor: 'text-slate-400 dark:text-[#94A3B8]',
    containerBorder: 'border-slate-200 dark:border-[#232D42]',
  },
  cleared: {
    defaultIcon: CheckCircle,
    defaultTitle: "You're all caught up!",
    defaultDescription: 'There are no pending tasks or items awaiting your review.',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    containerBorder: 'border-emerald-200/60 dark:border-emerald-900/40',
  },
  not_configured: {
    defaultIcon: Settings,
    defaultTitle: 'Configuration required',
    defaultDescription: 'This module needs to be configured before data can be processed.',
    iconColor: 'text-amber-500 dark:text-amber-400',
    containerBorder: 'border-amber-200/60 dark:border-amber-900/40',
  },
  not_entitled: {
    defaultIcon: ShieldKeyhole,
    defaultTitle: 'Restricted access',
    defaultDescription: 'You do not have administrative permission to view this resource.',
    iconColor: 'text-slate-400 dark:text-[#94A3B8]',
    containerBorder: 'border-slate-200 dark:border-[#232D42]',
  },
  error: {
    defaultIcon: Danger,
    defaultTitle: 'Unable to load data',
    defaultDescription: 'An unexpected issue occurred while fetching records. Please try again.',
    iconColor: 'text-rose-500 dark:text-rose-400',
    containerBorder: 'border-rose-200/60 dark:border-rose-900/40',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  icon: CustomIcon,
  title,
  subtitle,
  description,
  className = '',
  action,
  actionLabel,
  onAction,
  children,
  onRetry,
}) => {
  const cfg = variantConfig[variant] || variantConfig.default;
  const ResolvedIcon = CustomIcon || cfg.defaultIcon;
  const displayTitle = title ?? cfg.defaultTitle;
  const displayDescription = description ?? subtitle ?? cfg.defaultDescription;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex flex-col items-center justify-center p-8 lg:p-12 text-center rounded-xl bg-white dark:bg-[#111625] border border-dashed transition-all duration-200',
        cfg.containerBorder,
        className
      )}
    >
      <div
        className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center mb-3.5 bg-slate-50 dark:bg-[#171E2E] border border-slate-200/80 dark:border-[#232D42]',
          cfg.iconColor
        )}
      >
        <ResolvedIcon size={28} />
      </div>

      {displayTitle && (
        <h3 className="text-base font-bold text-slate-850 dark:text-[#F8FAFC] tracking-tight leading-snug mb-1">
          {displayTitle}
        </h3>
      )}

      {displayDescription && (
        <p className="text-xs lg:text-sm text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed max-w-sm mb-4">
          {displayDescription}
        </p>
      )}

      {(action || actionLabel || children || onRetry) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {actionLabel && onAction && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
          {action || children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
