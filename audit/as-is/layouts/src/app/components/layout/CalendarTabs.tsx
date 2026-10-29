import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUIState } from '../../context/UIStateContext';
import { SubNavTabs } from './SubNavTabs';

interface CalendarTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export const CalendarTabs: React.FC<CalendarTabsProps> = ({
  activeTab: controlledActiveTab,
  onTabChange,
  className = '',
}) => {
  const { user } = useAuth();
  const { activeRole } = useUIState();
  const location = useLocation();

  // Evaluate if current user has permission to view/manage calendar settings: strictly HR or HR Admin
  const canManageCalendarSettings = useMemo(() => {
    const rawRole = (user?.role || '').toLowerCase().replace(/[\s_-]+/g, '');
    const isBaseHR =
      rawRole === 'hr' ||
      rawRole === 'hradmin' ||
      rawRole === 'hradministrator' ||
      (Array.isArray(user?.roles) &&
        user.roles.some((r) => {
          const c = (r || '').toLowerCase().replace(/[\s_-]+/g, '');
          return c === 'hr' || c === 'hradmin' || c === 'hradministrator';
        }));

    if (!isBaseHR) return false;

    if (activeRole) {
      const cleanActive = activeRole.toLowerCase().replace(/[\s_-]+/g, '');
      if (cleanActive !== 'hr' && cleanActive !== 'hradmin' && cleanActive !== 'hradministrator') {
        return false;
      }
    }

    return true;
  }, [user, activeRole]);

  const tabs = useMemo(() => {
    return [
      'OVERVIEW',
      'COMPANY CALENDAR',
      ...(canManageCalendarSettings ? ['SETTINGS'] : []),
    ];
  }, [canManageCalendarSettings]);

  const paths = useMemo(() => {
    return [
      '/hr/calendar',
      '/hr/calendar/agenda',
      ...(canManageCalendarSettings ? ['/hr/calendar/settings'] : []),
    ];
  }, [canManageCalendarSettings]);

  // Derive active tab from current URL if not explicitly controlled
  const activeTab = useMemo(() => {
    if (controlledActiveTab) return controlledActiveTab;
    const cleanPath = location.pathname.replace(/\/$/, '');
    if (cleanPath.endsWith('/settings')) return 'SETTINGS';
    if (cleanPath.endsWith('/agenda') || cleanPath.endsWith('/company')) return 'COMPANY CALENDAR';
    return 'OVERVIEW';
  }, [controlledActiveTab, location.pathname]);

  return (
    <SubNavTabs
      tabs={tabs}
      paths={paths}
      defaultActiveTab="OVERVIEW"
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={className}
    />
  );
};

export default CalendarTabs;
