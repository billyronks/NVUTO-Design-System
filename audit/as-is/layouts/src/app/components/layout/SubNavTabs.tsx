import type { ApiResponse } from '@/types/api.types';
import React, { useState, useEffect, useRef, useTransition } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getSecuritySettings, getActiveSessions, getAuditLogs } from '../../../services/settingsService';
import { getCorporateNineBox, getBSCCorporate, getBSCCorporateReadOnly } from '../../../services/performanceService';
import { getHomeOverview, getHomeActivityStream, getHomeApprovals, getHomePreferences } from '../../../services/homeService';
import { apiClient } from '../../../lib/apiClient';

interface SubNavTabsProps {
  tabs?: string[];
  paths?: string[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const SubNavTabs: React.FC<SubNavTabsProps> = ({
  tabs = ['OVERVIEW', 'ANALYTICS', 'LEDGERS', 'APPROVALS', 'REPORTS'],
  paths,
  defaultActiveTab = 'ANALYTICS',
  activeTab: controlledActiveTab,
  onTabChange,
  className = '',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();
  const [localActiveTab, setLocalActiveTab] = useState(defaultActiveTab);
  const stickyTopClass = className.includes('top-') ? '' : 'top-0';
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  // Compute basePath e.g. "/hr/settings" from "/hr/settings/roles-permissions"
  const parts = location.pathname.split('/');
  const basePath = parts.slice(0, 3).join('/');

  // Generate resolved absolute paths for every tab
  const resolvedPaths = paths || tabs.map((tab, index) => {
    if (index === 0) return basePath;
    return `${basePath}/${slugify(tab)}`;
  });

  // Determine active tab index from location pathname
  const activeIndex = resolvedPaths.findIndex(p => {
    const cleanPath = location.pathname.replace(/\/$/, '');
    const cleanP = p.replace(/\/$/, '');
    return cleanPath === cleanP || cleanPath === `/hr${cleanP}` || `/hr${cleanPath}` === cleanP;
  });

  const currentActiveTab = controlledActiveTab !== undefined 
    ? controlledActiveTab 
    : (activeIndex !== -1 ? tabs[activeIndex] : localActiveTab);

  // Auto-scroll active tab into view horizontally on mount or location/tab change
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeTab = activeTabRef.current;

      const containerWidth = container.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;

      const targetScrollLeft = tabLeft - containerWidth / 2 + tabWidth / 2;
      container.scrollLeft = Math.max(0, targetScrollLeft);
    }
  }, [currentActiveTab, location.pathname]);

  // Notify parent of the active tab change derived from URL location path
  useEffect(() => {
    if (onTabChange && currentActiveTab) {
      onTabChange(currentActiveTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActiveTab]);

  const handlePrefetch = (path: string) => {
    const cleanPath = path.toLowerCase();
    
    if (cleanPath.includes('/hr/settings/security') || cleanPath.includes('/hr/configuration/security')) {
      queryClient.prefetchQuery({
        queryKey: ['securitySettings'],
        queryFn: getSecuritySettings,
        staleTime: 5 * 60 * 1000
      });
      queryClient.prefetchQuery({
        queryKey: ['activeSessions'],
        queryFn: getActiveSessions,
        staleTime: 5 * 60 * 1000
      });
      queryClient.prefetchQuery({
        queryKey: ['auditLogs', '', 'All Modules', 'Last 30 Days', 1],
        queryFn: () => getAuditLogs({ page: 1, page_size: 5 }),
        staleTime: 5 * 60 * 1000
      });
    } else if (cleanPath.includes('/hr/settings/profile') || cleanPath.includes('/hr/configuration/profile')) {
      queryClient.prefetchQuery({
        queryKey: ['settingsCompanyProfile'],
        queryFn: () => apiClient.get<ApiResponse<unknown>>('/hr/settings/company-profile').then((res) => res.data).catch(() => null),
        staleTime: 5 * 60 * 1000
      });
      queryClient.prefetchQuery({
        queryKey: ['settingsBranding'],
        queryFn: () => apiClient.get<ApiResponse<unknown>>('/hr/settings/branding').then((res) => res.data).catch(() => null),
        staleTime: 5 * 60 * 1000
      });
    } else if (cleanPath.includes('/talent-mapping') || cleanPath.includes('/9-box')) {
      queryClient.prefetchQuery({
        queryKey: ['corporateNineBox'],
        queryFn: getCorporateNineBox,
        staleTime: 5 * 60 * 1000
      });
    } else if (cleanPath.includes('/scorecard') || cleanPath.includes('/bsc')) {
      queryClient.prefetchQuery({
        queryKey: ['corpBscFull'],
        queryFn: () => getBSCCorporate(),
        staleTime: 5 * 60 * 1000
      });
      queryClient.prefetchQuery({
        queryKey: ['corpBscReadOnly'],
        queryFn: () => getBSCCorporateReadOnly(),
        staleTime: 5 * 60 * 1000
      });
    } else if (cleanPath.includes('/home/overview')) {
      queryClient.prefetchQuery({
        queryKey: ['homeOverview'],
        queryFn: getHomeOverview,
        staleTime: 5 * 60 * 1000
      });
      queryClient.prefetchQuery({
        queryKey: ['homeActivityStream'],
        queryFn: getHomeActivityStream,
        staleTime: 5 * 60 * 1000
      });
      queryClient.prefetchQuery({
        queryKey: ['homeApprovals'],
        queryFn: getHomeApprovals,
        staleTime: 5 * 60 * 1000
      });
      queryClient.prefetchQuery({
        queryKey: ['homePreferences'],
        queryFn: getHomePreferences,
        staleTime: 5 * 60 * 1000
      });
    }
  };

  return (
    <div
      ref={containerRef}
      role="navigation"
      aria-label="Section navigation"
      className={`nvuto-scroll-region min-w-0 max-w-full sticky ${stickyTopClass} z-20 flex items-center gap-5 sm:gap-8 px-4 sm:px-8 h-[48px] bg-white dark:bg-[#111625] border-b border-slate-200 dark:border-[#232D42] w-full shrink-0 overflow-x-auto overflow-y-hidden transition-colors duration-200 ${className}`}
    >
      {tabs.map((tab, index) => {
        const path = resolvedPaths[index];
        const isActive = currentActiveTab === tab;

        return (
          <NavLink
            key={tab}
            ref={isActive ? activeTabRef : null}
            to={path}
            end
            onMouseEnter={() => handlePrefetch(path)}
            onClick={(e) => {
              e.preventDefault();
              startTransition(() => {
                navigate(path);
              });
            }}
            className={() =>
              `h-full flex items-center border-b-2 transition-all duration-150 cursor-pointer nvuto-btn-text uppercase whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-[#FF4F00] font-bold border-[#FF4F00]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent'
              }`
            }
          >
            {tab}
          </NavLink>
        );
      })}
    </div>
  );
};
