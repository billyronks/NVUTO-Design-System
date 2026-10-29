import React from 'react';
import { PageTitle, PageSubtitle } from './Typography';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  leftControls?: React.ReactNode;
  rightControls?: React.ReactNode;
  className?: string;
  layout?: 'default' | 'inline';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  leftControls,
  rightControls,
  className = '',
  layout = 'default'
}) => {
  const hasControls = leftControls || rightControls;

  if (layout === 'inline') {
    return (
      <div className={`nvuto-page-header min-w-0 flex flex-wrap flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ${className}`}>
        <div className="min-w-0 max-w-full flex flex-col gap-1">
          <div className="flex flex-wrap min-w-0 items-center gap-3">
            {typeof title === 'string' ? (
              <PageTitle>{title}</PageTitle>
            ) : (
              <div className="nvuto-display-lg">{title}</div>
            )}
            {badge}
          </div>
          {subtitle && (
            typeof subtitle === 'string' ? (
              <PageSubtitle>{subtitle}</PageSubtitle>
            ) : (
              <div className="nvuto-body-lg">{subtitle}</div>
            )
          )}
        </div>

        {hasControls && (
          <div className="nvuto-page-actions min-w-0 max-w-full flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end select-none">
            {leftControls}
            {rightControls}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`nvuto-page-header min-w-0 flex flex-col mb-6 ${className}`}>
      <div className="min-w-0 max-w-full flex flex-col gap-1">
        <div className="flex flex-wrap min-w-0 items-center gap-3">
          {typeof title === 'string' ? (
            <PageTitle>{title}</PageTitle>
          ) : (
            <div className="nvuto-display-lg">{title}</div>
          )}
          {badge}
        </div>
        {subtitle && (
          typeof subtitle === 'string' ? (
            <PageSubtitle>{subtitle}</PageSubtitle>
          ) : (
            <div className="nvuto-body-lg">{subtitle}</div>
          )
        )}
      </div>

      {hasControls && (
        <div className="nvuto-page-toolbar min-w-0 flex flex-wrap flex-col md:flex-row gap-4 justify-between items-center mt-6 bg-white dark:bg-[#111625] p-4 rounded-xl border border-slate-200 dark:border-[#232D42] w-full shadow-sm transition-colors duration-200">
          {leftControls && (
            <div className="nvuto-page-filters min-w-0 max-w-full flex flex-wrap flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              {leftControls}
            </div>
          )}

          {rightControls && (
            <div className="nvuto-page-actions min-w-0 max-w-full flex flex-wrap items-center gap-3 w-full md:w-auto justify-end ml-auto">
              {rightControls}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default PageHeader;
