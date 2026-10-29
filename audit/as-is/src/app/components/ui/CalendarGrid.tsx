import React from 'react';

export interface CalendarGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`grid grid-cols-7 auto-rows-[minmax(120px,_1fr)] bg-slate-50 dark:bg-[#0B0F19]/20 border-t border-slate-200/80 dark:border-[#232D42] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default CalendarGrid;
