import React from 'react';
import { cn } from './utils';

export interface KanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn("nvuto-scroll-region min-w-0 max-w-full flex gap-4 sm:gap-6 overflow-x-auto min-h-[500px] pb-4 w-full select-none", className)}
      tabIndex={0}
      role="region"
      aria-label="Board — scroll horizontally for more columns"
      {...props}
    >
      {children}
    </div>
  );
};

export interface KanbanColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  count: number;
  badgeVariant?: 'success' | 'critical' | 'warning' | 'neutral' | 'draft' | 'slate' | 'info' | 'danger' | 'purple';
  children: React.ReactNode;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  badgeVariant = 'neutral',
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn("w-[min(320px,85vw)] bg-slate-50 dark:bg-[#0B0F19] rounded-xl p-4 flex flex-col gap-4 border border-slate-200 dark:border-[#232D42] shadow-sm min-h-[500px] shrink-0", className)}
      {...props}
    >
      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-[#232D42] select-none">
        <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
          {title}
        </span>
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium uppercase tracking-wider border",
          badgeVariant === 'success' && 'text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-emerald-950/30 border-green-200/50 dark:border-emerald-900',
          badgeVariant === 'warning' && 'text-orange-700 dark:text-amber-400 bg-orange-50 dark:bg-amber-950/30 border-orange-200/50 dark:border-amber-900',
          badgeVariant === 'critical' && 'text-red-700 dark:text-rose-400 bg-red-50 dark:bg-rose-950/30 border-red-200/50 dark:border-rose-900',
          badgeVariant === 'neutral' && 'text-slate-650 dark:text-[#94A3B8] bg-slate-50 dark:bg-[#171E2E] border-slate-200/50 dark:border-[#232D42]',
          badgeVariant === 'info' && 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-slate-200 dark:border-[#232D42]/50 dark:border-blue-900',
          badgeVariant === 'purple' && 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200/50 dark:border-purple-900',
          badgeVariant === 'danger' && 'text-red-700 dark:text-rose-400 bg-red-50 dark:bg-rose-950/30 border-red-200/50 dark:border-rose-900'
        )}>
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1 flex-1">
        {children}
      </div>
    </div>
  );
};
export default KanbanBoard;
