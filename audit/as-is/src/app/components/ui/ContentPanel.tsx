import React from 'react';
import { cn } from './utils';

export interface ContentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated';
  density?: 'compact' | 'default' | 'spacious';
  children: React.ReactNode;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  variant = 'default',
  density = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-sm',
    subtle: 'bg-slate-50/70 dark:bg-[#171E2E]/60 border border-slate-200/80 dark:border-[#232D42]',
    elevated: 'bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-md',
  };

  const densityGap = {
    compact: 'gap-4',
    default: 'gap-6',
    spacious: 'gap-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl flex flex-col transition-colors duration-200 overflow-hidden',
        variantClasses[variant],
        densityGap[density],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ContentPanelHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<any>;
  actions?: React.ReactNode;
  density?: 'compact' | 'default' | 'spacious';
}

export const ContentPanelHeader: React.FC<ContentPanelHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  density = 'default',
  className = '',
  ...props
}) => {
  const densityPadding = {
    compact: 'px-5 py-4 border-b border-slate-100 dark:border-[#232D42]',
    default: 'px-6 py-5 border-b border-slate-100 dark:border-[#232D42]',
    spacious: 'px-8 py-6 border-b border-slate-100 dark:border-[#232D42]',
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none',
        densityPadding[density],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#171E2E] border border-slate-200/80 dark:border-[#232D42] flex items-center justify-center shrink-0 text-[#FF4F00]">
            <Icon size={20} />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-bold text-slate-850 dark:text-[#F8FAFC] tracking-tight leading-snug truncate">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};

export interface ContentPanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: 'compact' | 'default' | 'spacious';
  children: React.ReactNode;
}

export const ContentPanelBody: React.FC<ContentPanelBodyProps> = ({
  density = 'default',
  className = '',
  children,
  ...props
}) => {
  const densityPadding = {
    compact: 'p-4 lg:p-5',
    default: 'p-6',
    spacious: 'p-8',
  };

  return (
    <div className={cn(densityPadding[density], className)} {...props}>
      {children}
    </div>
  );
};

export interface ContentPanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: 'compact' | 'default' | 'spacious';
  children: React.ReactNode;
}

export const ContentPanelFooter: React.FC<ContentPanelFooterProps> = ({
  density = 'default',
  className = '',
  children,
  ...props
}) => {
  const densityPadding = {
    compact: 'px-5 py-3.5',
    default: 'px-6 py-4',
    spacious: 'px-8 py-5',
  };

  return (
    <div
      className={cn(
        'border-t border-slate-100 dark:border-[#232D42] bg-slate-50/50 dark:bg-[#171E2E]/40 flex items-center justify-end gap-3',
        densityPadding[density],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  actions,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-[#232D42]">
          <div>
            {title && (
              <h4 className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
};
