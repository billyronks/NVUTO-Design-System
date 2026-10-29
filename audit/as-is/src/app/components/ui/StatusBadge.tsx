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

const statusMap: Record<string, StatusCategory> = {
  // Success states
  active: 'success',
  approved: 'success',
  present: 'success',
  completed: 'success',
  assigned: 'success',
  paid: 'success',
  healthy: 'success',
  published: 'success',

  // Warning states
  pending: 'warning',
  'in review': 'warning',
  in_review: 'warning',
  on_leave: 'warning',
  'on leave': 'warning',
  maintenance: 'warning',
  expiring: 'warning',

  // Error states
  inactive: 'error',
  rejected: 'error',
  absent: 'error',
  overdue: 'error',
  failed: 'error',
  terminated: 'error',
  decommissioned: 'error',

  // Neutral states
  draft: 'neutral',
  archived: 'neutral',
  unassigned: 'neutral',
  scheduled: 'neutral',
};

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
  const category: StatusCategory = variant || statusMap[normalizedKey] || 'neutral';
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
