import React from 'react';
import { EmptyState } from '@/app/components/ui';
import { ShieldKeyhole } from '@solar-icons/react';

export interface UnauthorizedAccessProps {
  role?: string;
  moduleName?: string;
}

export const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ 
  role = 'Employee', 
  moduleName = 'Succession Planning & calibration' 
}) => {
  return (
    <div className="flex flex-col gap-6 w-full pb-12 select-none">
      {/* Header Info Banner */}
      <div className="bg-white dark:bg-[#111625] p-4 rounded-xl border border-slate-200 dark:border-[#232D42] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-rose-600 uppercase tracking-wider">Security Restriction</span>
          <h2 className="text-xl text-slate-800 dark:text-[#F8FAFC] font-bold">RBAC Access Boundary</h2>
        </div>
      </div>

      <div className="max-w-2xl mx-auto my-12 w-full px-6">
        <EmptyState
          icon={ShieldKeyhole}
          title="Access Restricted"
          description={`In compliance with RegTech audit frameworks and succession planning privacy protocols, the path you requested (${moduleName}) is strictly restricted from your system role (${role}). Your session credentials are locked.`}
          variant="not_entitled"
        />
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
