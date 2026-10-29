// Extracted from src/app/components/ui/Toast.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React from 'react';
import {
  CheckCircle as CheckCircleRounded,
  DangerCircle as DangerCircleRounded,
  DangerTriangle as DangerTriangleRounded,
  InfoCircle as InfoCircleRounded,
  CloseCircle as CloseCircleRounded
} from '@solar-icons/react';
import { Button } from './button';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'danger' | 'critical';
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  onClose
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          leftBorder: 'border-l-emerald-500',
          icon: <CheckCircleRounded size={24} className="text-emerald-500 shrink-0" />
        };
      case 'error':
      case 'danger':
      case 'critical':
        return {
          leftBorder: 'border-l-rose-500',
          icon: <DangerCircleRounded size={24} className="text-rose-500 shrink-0" />
        };
      case 'warning':
        return {
          leftBorder: 'border-l-amber-500',
          icon: <DangerTriangleRounded size={24} className="text-amber-500 shrink-0" />
        };
      case 'info':
        return {
          leftBorder: 'border-l-blue-500',
          icon: <InfoCircleRounded size={24} className="text-blue-500 shrink-0" />
        };
      default:
        return {
          leftBorder: 'border-l-rose-500',
          icon: <DangerCircleRounded size={24} className="text-rose-500 shrink-0" />
        };
    }
  };

  const { leftBorder, icon } = getTypeStyles();

  return (
    <div
      role="alert"
      className={`flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/80 dark:border-[#232D42] border-l-4 ${leftBorder} bg-white/95 dark:bg-[#111625]/95 shadow-xl backdrop-blur-md w-full max-w-md pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-right-8`}
    >
      {icon}

      <div className="flex-1 flex flex-col gap-1 select-none">
        <h4 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] leading-snug">
          {title}
        </h4>
        {message && (
          <p className="text-sm font-semibold text-slate-650 dark:text-[#94A3B8] leading-relaxed">
            {message}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] !p-1 !h-auto !min-w-0 rounded-full shrink-0"
        title="Dismiss Notification"
      >
        <CloseCircleRounded size={20} />
      </Button>
    </div>
  );
};
export default Toast;
