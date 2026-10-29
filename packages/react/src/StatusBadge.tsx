// Extracted from src/app/components/ui/StatusBadge.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React from 'react';
import { cn } from './utils';
import { badgeVariants } from './badge';

export type StatusCategory = 'success' | 'warning' | 'error' | 'neutral';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: StatusCategory;
  className?: string;
  children?: React.ReactNode;
}

// Delegates color values to badge.tsx's badgeVariants so there's a single
// color source shared between Badge and StatusBadge (they previously kept
// two independently-maintained color tables that could drift apart).
const categoryToBadgeVariant: Record<StatusCategory, 'success' | 'warning' | 'critical' | 'neutral'> = {
  success: 'success',
  warning: 'warning',
  error: 'critical',
  neutral: 'neutral',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = '',
  variant,
  className = '',
  children,
  ...props
}) => {
  const normalizedKey = status.trim().toLowerCase();
  const category: StatusCategory = variant || 'neutral';
  const label = children || status;

  return (
    <span
      className={cn(
        badgeVariants({ variant: categoryToBadgeVariant[category] }),
        'font-semibold',
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
