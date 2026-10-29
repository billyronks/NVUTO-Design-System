import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldKeyhole as ShieldIcon,
  User as UserIcon,
  DollarMinimalistic as FinanceIcon,
  Crown as CEOIcon,
  AltArrowDown as ChevronDownIcon,
  CheckCircle as CheckIcon,
  UsersGroupTwoRounded,
} from '@solar-icons/react';
import { useAuth } from '../../context/AuthContext';
import { useUIState } from '../../context/UIStateContext';
import type { NvutoRole } from '../../../types/api.types';
import { hasElevatedRole } from '../../../types/auth.types';

export interface RoleOption {
  key: string;
  label: string;
  badge: string;
  path: string;
  icon: React.ElementType;
}

export const SWITCHER_ROLE_MAP: Record<string, RoleOption> = {
  employee: {
    key: 'employee',
    label: 'Employee View',
    badge: 'Base Self-Service',
    path: '/employee/dashboard',
    icon: UserIcon,
  },
  manager: {
    key: 'manager',
    label: 'Manager View',
    badge: 'Team & Self-Service',
    path: '/manager/dashboard',
    icon: UsersGroupTwoRounded,
  },
  hr_admin: {
    key: 'hr_admin',
    label: 'HR Admin Workspace',
    badge: 'Platform Administration',
    path: '/hr/dashboard',
    icon: ShieldIcon,
  },
  hr: {
    key: 'hr_admin',
    label: 'HR Admin Workspace',
    badge: 'Secondary HR Admin',
    path: '/hr/dashboard',
    icon: ShieldIcon,
  },
  finance: {
    key: 'finance',
    label: 'Finance & Payroll',
    badge: 'Financial Controller',
    path: '/finance/dashboard',
    icon: FinanceIcon,
  },
  ceo: {
    key: 'ceo',
    label: 'Executive CEO Portal',
    badge: 'Executive Command',
    path: '/ceo/dashboard',
    icon: CEOIcon,
  },
};

/**
 * Pure resolver that evaluates user roles and derives the exact switcher options.
 * - Elevated roles (hr_admin, hr, finance, ceo) get their respective workspaces.
 * - Base self-service role: if user is a manager, immediately turns into "Manager View";
 *   otherwise, it renders "Employee View".
 * - IT Admin is an attached capability (attached to employee/manager sidebar) and excluded from switcher dropdown.
 */
export function resolveSwitcherOptions(rawRoles: string[], isManagerFlag?: boolean): RoleOption[] {
  const map = new Map<string, RoleOption>();
  const cleanRoles = rawRoles.map((r) => String(r).toLowerCase().replace(/[\s-]+/g, '_'));
  const isManager = cleanRoles.includes('manager') || Boolean(isManagerFlag);

  // Base self-service role turns into Manager View if manager, else Employee View
  if (isManager) {
    map.set('base_role', SWITCHER_ROLE_MAP['manager']);
  } else {
    map.set('base_role', SWITCHER_ROLE_MAP['employee']);
  }

  // Check HR Admin / Workspace Owner vs Secondary HR Admin with explicit priority (HR Admin > Secondary HR).
  const hasPrimaryHRAdmin = cleanRoles.some((c) => c === 'hr_admin' || c === 'workspace_owner' || c === 'super_admin' || c === 'admin' || c === 'owner');
  const hasSecondaryHR = cleanRoles.includes('hr');

  if (hasPrimaryHRAdmin) {
    map.set('hr_admin', SWITCHER_ROLE_MAP['hr_admin']);
  } else if (hasSecondaryHR) {
    map.set('hr_admin', SWITCHER_ROLE_MAP['hr']);
  }

  if (cleanRoles.includes('finance') || cleanRoles.includes('finance_admin')) {
    map.set('finance', SWITCHER_ROLE_MAP['finance']);
  }

  if (cleanRoles.includes('ceo')) {
    map.set('ceo', SWITCHER_ROLE_MAP['ceo']);
  }

  return Array.from(map.values());
}

export const RoleSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeRole, setActiveRole, setActiveSubMenu } = useUIState();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // The authenticated claims are the sole source for header visibility and
  // options. Never merge a role-settings response or active UI context here:
  // either can be stale and previously leaked HR Admin into Employee headers.
  const rawRoles: string[] = React.useMemo(() => {
    if (Array.isArray(user?.roles) && user.roles.length > 0) {
      return user.roles;
    }
    return [user?.role || 'employee'];
  }, [user?.role, user?.roles]);

  // Clean roles array normalized to snake_case
  const cleanRoles = React.useMemo(() => {
    return rawRoles.map((r) => String(r).toLowerCase().replace(/[\s-]+/g, '_'));
  }, [rawRoles]);

  const isManager = React.useMemo(() => {
    return cleanRoles.includes('manager') || Boolean(user?.isManager || (user as any)?.is_manager);
  }, [cleanRoles, user?.isManager, (user as any)?.is_manager]);

  const availableOptions = React.useMemo(() => {
    return resolveSwitcherOptions(cleanRoles, isManager);
  }, [cleanRoles, isManager]);

  // Determine current active option based on activeRole context or active URL
  const currentActiveKey = React.useMemo(() => {
    const norm = String(activeRole).toLowerCase().replace(/[\s-]+/g, '_');
    if (norm === 'finance') return 'finance';
    if (norm === 'ceo') return 'ceo';
    if (norm === 'hr_admin' || norm === 'hr' || norm === 'workspace_owner') return 'hr_admin';
    if (norm === 'manager') return 'manager';
    return isManager ? 'manager' : 'employee';
  }, [activeRole, isManager]);

  const activeOption = SWITCHER_ROLE_MAP[currentActiveKey] || (isManager ? SWITCHER_ROLE_MAP['manager'] : SWITCHER_ROLE_MAP['employee']);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (option: RoleOption) => {
    setIsOpen(false);
    
    let targetRole: NvutoRole = 'Employee';
    if (option.key === 'hr_admin' || option.key === 'hr') targetRole = 'HR Admin';
    else if (option.key === 'finance') targetRole = 'Finance';
    else if (option.key === 'ceo') targetRole = 'CEO';
    else if (option.key === 'manager') targetRole = 'Manager';

    setActiveRole(targetRole);

    // Navigate to target workspace dashboard
    if (option.key === 'hr_admin') {
      setActiveSubMenu('home');
      navigate('/hr/dashboard');
    } else if (option.key === 'finance') {
      setActiveSubMenu('home');
      navigate('/finance/dashboard');
    } else if (option.key === 'ceo') {
      setActiveSubMenu('home');
      navigate('/ceo/dashboard');
    } else if (option.key === 'manager') {
      setActiveSubMenu('home');
      navigate('/manager/dashboard');
    } else {
      setActiveSubMenu('home');
      navigate('/employee/dashboard');
    }
  };

  // Check if user holds at least one elevated workspace role (finance, ceo, primary hr, secondary hr).
  // Employee, Manager, and IT Admin users without elevated roles MUST NOT see the role switcher.
  const hasSwitcherAccess = React.useMemo(() => {
    return hasElevatedRole(rawRoles);
  }, [rawRoles]);

  // Do not render switcher if user lacks elevated switcher roles or has no alternative workspace options
  if (!hasSwitcherAccess || availableOptions.length <= 1) {
    return null;
  }

  const ActiveIcon = activeOption.icon;

  return (
    <div className="nvuto-role-switcher relative min-w-0 inline-block text-left" ref={dropdownRef} onKeyDown={(event) => {
      if (event.key === 'Escape') { setIsOpen(false); dropdownRef.current?.querySelector('button')?.focus(); }
    }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex min-h-[44px] max-w-full items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#232D42] bg-white/80 dark:bg-[#111625]/80 backdrop-blur-md text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#171E2E] shadow-sm transition-all duration-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF4F00]/40"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Switch active role workspace"
      >
        <div className="w-5 h-5 rounded-md bg-[#FF4F00]/10 dark:bg-[#FF4F00]/20 text-[#FF4F00] flex items-center justify-center shrink-0">
          <ActiveIcon size={14} />
        </div>
        <div className="flex flex-col items-start text-left leading-tight">
          <span className="nvuto-btn-text-compact truncate max-w-[120px]">
            {activeOption.label}
          </span>
        </div>
        <ChevronDownIcon
          size={14}
          className={`text-slate-400 dark:text-[#94A3B8] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#FF4F00]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="nvuto-role-menu absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-xl dark:shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-[#171E2E]/80 border-b border-slate-100 dark:border-[#232D42]">
            <p className="nvuto-h3">
              Switch Active Role Context
            </p>
            <p className="nvuto-caption mt-0.5">
              Select workspace environment for this session
            </p>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto scrollbar-thin">
            {availableOptions.map((opt) => {
              const isSelected = opt.key === activeOption.key;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectRole(opt)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#FF4F00]/10 dark:bg-[#FF4F00]/20 text-[#FF4F00] font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-[#171E2E] text-slate-700 dark:text-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#FF4F00] text-white shadow-sm shadow-[#FF4F00]/30'
                          : 'bg-slate-100 dark:bg-[#171E2E] text-slate-500 dark:text-[#94A3B8]'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="nvuto-btn-text-compact truncate">{opt.label}</span>
                      <span className="nvuto-caption truncate">
                        {opt.badge}
                      </span>
                    </div>
                  </div>
                  {isSelected && <CheckIcon size={16} className="text-[#FF4F00] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
