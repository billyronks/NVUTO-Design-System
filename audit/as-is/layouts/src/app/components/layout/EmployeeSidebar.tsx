import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { employeeNavigationConfig } from '../../../config/employee-navigation';
import { getRequiredFeatureFlags, FeatureFlagsDTO } from '../../../services/settingsService';
import { RoleSidebarNav, type SidebarNavCategory } from './RoleSidebarNav';

export const EmployeeSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const { data: featureFlags } = useQuery<FeatureFlagsDTO>({
    queryKey: ['tenantFeatureFlags'],
    queryFn: getRequiredFeatureFlags,
    staleTime: 5 * 60 * 1000,
  });

  const rolesList = useMemo(() => {
    if (!user) return [];
    const baseRole = (user.role || '').toLowerCase().replace(/[\s_]+/g, '_');
    const arrayRoles = (user.roles || (user as any).roleClaims || (user as any).claims || []).map((r: string) =>
      String(r).toLowerCase().replace(/[\s_]+/g, '_')
    );
    return Array.from(new Set([baseRole, ...arrayRoles]));
  }, [user]);

  const isItAdmin = useMemo(() => {
    return rolesList.includes('it_admin');
  }, [rolesList]);

  const isManager = useMemo(() => {
    return rolesList.includes('manager');
  }, [rolesList]);

  const resolvedCategories: SidebarNavCategory[] = useMemo(() => {
    let config = [...employeeNavigationConfig];

    if (isManager && !config.some((cat) => cat.category === 'Team Management')) {
      const managerCategory = {
        category: 'Team Management',
        items: [
          { title: 'Team Performance', href: '/team/performance', icon: 'UsersGroupTwoRounded', requiredFeatureFlag: 'is_performance_active' as keyof FeatureFlagsDTO },
          { title: 'Approval Queue', href: '/team/approvals', icon: 'CheckCircle' },
          { title: 'Team Timesheets', href: '/team-timesheets', icon: 'ClockCircle', requiredFeatureFlag: 'is_time_attendance_active' as keyof FeatureFlagsDTO },
        ],
      };
      config.push(managerCategory);
    }

    if (isItAdmin && !config.some((cat) => cat.category === 'IT Assets Admin')) {
      const itAdminCategory = {
        category: 'IT Assets Admin',
        items: [
          { title: 'Asset Registry', href: '/hr/it-assets/registry', icon: 'Laptop', requiredFeatureFlag: 'is_it_asset_active' as keyof FeatureFlagsDTO },
          { title: 'Asset Maintenance', href: '/hr/it-assets/maintenance', icon: 'Widget2', requiredFeatureFlag: 'is_it_asset_active' as keyof FeatureFlagsDTO },
          { title: 'Software Licenses', href: '/hr/it-assets/licenses', icon: 'FileText', requiredFeatureFlag: 'is_it_asset_active' as keyof FeatureFlagsDTO },
          { title: 'Asset Assignments', href: '/hr/it-assets/assignments', icon: 'UsersGroupTwoRounded', requiredFeatureFlag: 'is_it_asset_active' as keyof FeatureFlagsDTO },
        ],
      };
      config.push(itAdminCategory);
    }

    return config
      .map((cat) => ({
        category: cat.category,
        items: cat.items
          .filter((item) => !item.requiredFeatureFlag || Boolean(featureFlags?.[item.requiredFeatureFlag]))
          .map((item) => ({
            title: item.title,
            href: item.href,
            icon: item.icon,
          })),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [isItAdmin, isManager, featureFlags]);

  const checkIsActive = (path: string, title: string) => {
    const pathname = location.pathname;

    // Direct matches
    if (pathname === path) return true;

    // Sub-route matches
    const cleanPath = pathname.toLowerCase();
    const cleanItemPath = path.toLowerCase();
    if (cleanItemPath !== '/' && cleanPath.startsWith(cleanItemPath)) {
      return true;
    }

    // Fallback checks to match employee items correctly
    const cleanTitle = title.toLowerCase();
    if (cleanTitle === 'home' && (cleanPath.includes('dashboard') || cleanPath === '' || cleanPath === '/')) return true;
    if (cleanTitle === 'chat & dms' && cleanPath.startsWith('/chat')) return true;
    if (cleanTitle === 'calendar' && (cleanPath.startsWith('/team-calendar') || cleanPath.startsWith('/calendar') || cleanPath.startsWith('/hr/calendar') || cleanPath.startsWith('/org-calendar') || cleanPath.includes('calendar'))) return true;
    if (cleanTitle === 'directory' && cleanPath.startsWith('/directory')) return true;
    if (cleanTitle === 'documents' && cleanPath.startsWith('/documents')) return true;
    if (cleanTitle === 'recruitment' && (cleanPath.startsWith('/recruitment/') || cleanPath.startsWith('/me/interviews'))) return true;
    if (cleanTitle === 'attendance' && cleanPath.startsWith('/attendance')) return true;
    if (cleanTitle === 'timesheets' && (cleanPath.startsWith('/me/timesheets') || cleanPath.startsWith('/project-timesheet'))) return true;
    if (cleanTitle === 'leave' && cleanPath.startsWith('/time-off')) return true;
    if (cleanTitle === 'compensation' && cleanPath.startsWith('/compensation')) return true;
    if (cleanTitle === 'benefits' && cleanPath.startsWith('/benefits')) return true;
    if (cleanTitle === 'ewa' && cleanPath.startsWith('/ewa')) return true;
    if (cleanTitle === 'credit wallet' && cleanPath.startsWith('/credit-wallet')) return true;
    if (cleanTitle === 'performance' && cleanPath.startsWith('/performance')) return true;
    if (cleanTitle === 'career growth' && cleanPath.startsWith('/career-growth')) return true;
    if (cleanTitle === 'learning' && (cleanPath.startsWith('/me/learning') || cleanPath.startsWith('/learning'))) return true;
    if (cleanTitle === 'it assets' && cleanPath.startsWith('/it-equipment')) return true;
    if (cleanTitle === 'requisition' && cleanPath.startsWith('/requests')) return true;
    if (cleanTitle === 'expense claims' && cleanPath.startsWith('/expenses')) return true;
    if (cleanTitle === 'employee relations' && cleanPath.startsWith('/employee-relations')) return true;
    if (cleanTitle === 'asset maintenance' && (cleanPath.startsWith('/hr/it-assets/maintenance') || cleanPath.startsWith('/hr/assets/maintenance'))) return true;
    if (cleanTitle === 'asset registry' && cleanPath.startsWith('/hr/it-assets/registry')) return true;
    if (cleanTitle === 'software licenses' && (cleanPath.startsWith('/hr/it-assets/licenses') || cleanPath.startsWith('/hr/assets/licenses'))) return true;
    if (cleanTitle === 'asset assignments' && (cleanPath.startsWith('/hr/it-assets/assignments') || cleanPath.startsWith('/hr/assets/assignments'))) return true;
    if (cleanTitle === 'exit offboarding' && (cleanPath.startsWith('/me/offboarding') || cleanPath.startsWith('/exits') || cleanPath.startsWith('/me/clearance') || cleanPath.startsWith('/offboarding/me'))) return true;

    return false;
  };

  return <RoleSidebarNav categories={resolvedCategories} checkIsActive={checkIsActive} />;
};
