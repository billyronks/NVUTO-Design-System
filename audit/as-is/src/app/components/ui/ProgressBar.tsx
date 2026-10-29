import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  indicatorColor = 'bg-[#FF4F00]',
  ...props
}) => {
  const cappedValue = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`w-full bg-slate-100 dark:bg-[#171E2E] rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        className={`h-full rounded-full transition-all duration-350 ${indicatorColor}`}
        style={{ width: `${cappedValue}%` }}
      />
    </div>
  );
};
export default ProgressBar;
