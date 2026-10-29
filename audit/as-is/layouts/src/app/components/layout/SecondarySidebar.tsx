import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Home2, UserCircle, UsersGroupRounded, UserMinus, UserPlus, ChartSquare, ClockCircle, Calendar, MedalStar, Case,
  Global, UserCheck, Book, Box, FileText, Chart, Laptop, AltArrowLeft, HamburgerMenu, Wallet, ChatLine,
  ShieldWarning, Widget2, Buildings as BuildingsRounded, Stars
} from '@solar-icons/react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIState } from '../../context/UIStateContext';
import { useAuth } from '../../context/AuthContext';
import nvutoHrSvg from '../../../assets/NVUTO HR.svg';
import nvutoHrWhiteSvg from '../../../assets/NVUTO HR White.svg';
import { getCompanyInfo } from '../../../services/settingsService';
import { SidebarNavigation } from './SidebarNavigation';
import { EmployeeSidebar } from './EmployeeSidebar';
import { ManagerSidebar } from './ManagerSidebar';
import { useAppSelector } from '../../../store';
import { normalizeRole as normalizeSystemRole, SystemRole } from '../../../types/auth.types';

export const SecondarySidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const {
    secondaryExpanded,
    toggleSecondary,
    activeModule,
    activeRole,
  } = useUIState();

  const profile = useAppSelector((state) => state.auth.profile);
  const currentRole = activeRole || profile?.role || user?.role || 'Employee';

  const isEmployee = React.useMemo(() => {
    const rawRole = activeRole || currentRole || 'Employee';
    const norm = normalizeSystemRole(rawRole);
    return norm === SystemRole.EMPLOYEE || norm === SystemRole.IT_ADMIN;
  }, [activeRole, currentRole]);

  const isManager = React.useMemo(() => {
    const rawRole = activeRole || currentRole || 'Employee';
    const norm = normalizeSystemRole(rawRole);
    return norm === SystemRole.MANAGER;
  }, [activeRole, currentRole]);

  const { data: companyInfoResponse } = useQuery({
    queryKey: ['companyInfo'],
    queryFn: getCompanyInfo,
    staleTime: 5 * 60 * 1000,
  });

  const profileTrading = companyInfoResponse?.data?.trading_name?.trim();
  const profileLegal = companyInfoResponse?.data?.legal_company_name?.trim();
  const tenantCompany = user?.tenant?.company_name?.trim();
  const tenantTrading = (user?.tenant as any)?.trading_name?.trim();
  const tenantLegal = (user?.tenant as any)?.legal_name?.trim();

  const companyName =
    (profileTrading && profileTrading !== 'Company Workspace' ? profileTrading : '') ||
    (profileLegal && profileLegal !== 'Company Workspace' ? profileLegal : '') ||
    (tenantTrading && tenantTrading !== 'Company Workspace' ? tenantTrading : '') ||
    (tenantCompany && tenantCompany !== 'Company Workspace' ? tenantCompany : '') ||
    (tenantLegal && tenantLegal !== 'Company Workspace' ? tenantLegal : '') ||
    (user as any)?.companyName?.trim() ||
    (user as any)?.tenant_name?.trim() ||
    'NVUTO Technologies';

  const subMenuMapping = {
    home: [
      { id: 'overview', label: 'Overview', icon: Home2, path: '/home/overview' },
      { id: 'apps', label: 'All Apps', icon: Widget2, path: '/home/apps' },
      { id: 'solutions', label: 'Solutions', icon: BuildingsRounded, path: '/home/solutions' },
      { id: 'marketplace', label: 'Marketplace', icon: Stars, path: '/home/marketplace' },
    ],
  };

  const checkIsActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div
      data-navigation-rail="secondary"
      className={`bg-[#EEF0FA] dark:bg-[#111625] border-r border-[#D9DBE9]/60 dark:border-[#232D42] flex flex-col shrink-0 h-screen transition-all duration-300 ease-in-out z-40 relative ${
        secondaryExpanded ? 'w-[264px]' : 'w-[80px]'
      }`}
    >
      {/* Title / Module Header */}
      {secondaryExpanded ? (
        <div className="px-5 py-6 border-b border-[#D9DBE9]/60 dark:border-[#232D42] flex items-center justify-between shrink-0 overflow-hidden select-none h-24">
          <div className="flex flex-col max-w-[165px] overflow-hidden">
            <img src={nvutoHrSvg} alt="NVUTO HR Logo" className="h-8 w-auto shrink-0 object-contain object-left dark:hidden" />
            <img src={nvutoHrWhiteSvg} alt="NVUTO HR Logo" className="h-8 w-auto shrink-0 object-contain object-left hidden dark:block" />
            <span className="text-xs font-bold text-slate-600 dark:text-[#94A3B8] tracking-wider uppercase mt-1 truncate max-w-[165px]" title={companyName}>
              {companyName}
            </span>
          </div>
          <button
            onClick={toggleSecondary}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-[#1E2132] dark:hover:text-[#F8FAFC] hover:bg-slate-200 dark:bg-[#171E2E]/50 dark:hover:bg-[#171E2E] transition-colors cursor-pointer min-h-[44px]"
            title="Collapse Submenu"
            aria-label="Collapse Submenu"
          >
            <AltArrowLeft size={18} />
          </button>
        </div>
      ) : (
        <div className="px-4 py-6 border-b border-[#D9DBE9]/60 dark:border-[#232D42] flex items-center justify-center shrink-0 h-24">
          <button
            onClick={toggleSecondary}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-[#1C1C93] dark:text-[#F8FAFC] hover:bg-slate-200 dark:bg-[#171E2E]/50 dark:hover:bg-[#171E2E] transition-colors cursor-pointer min-h-[44px]"
            title="Expand Submenu"
            aria-label="Expand Submenu"
          >
            <HamburgerMenu size={20} />
          </button>
        </div>
      )}

      {/* Navigation Sub-Menu */}
      {activeModule === 'home' ? (
        <nav className="flex-1 py-3 overflow-y-auto flex flex-col gap-0.5">
          {subMenuMapping.home.map((item) => {
            const Icon = item.icon;
            const active = checkIsActive(item.path);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`w-full py-2.5 text-left transition-all relative flex items-center text-sm min-h-[44px] ${
                  active
                    ? 'text-[#1E2132] dark:text-[#F8FAFC] font-bold bg-white dark:bg-[#171E2E]'
                    : 'text-slate-600 dark:text-[#94A3B8] font-normal hover:text-[#1E2132] dark:hover:text-[#F8FAFC] hover:bg-white/40 dark:hover:bg-[#171E2E]/50'
                } ${!secondaryExpanded ? 'justify-center px-0' : 'justify-start px-6'}`}
                title={item.label}
              >
                {active && (
                  <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-[#FF4F00]" />
                )}
                
                <Icon size={18} className="shrink-0" />
                
                {secondaryExpanded && (
                  <span className="ml-3 text-sm tracking-wide leading-none">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      ) : isEmployee ? (
        <EmployeeSidebar />
      ) : isManager ? (
        <ManagerSidebar />
      ) : (
        <SidebarNavigation />
      )}
    </div>
  );
};

