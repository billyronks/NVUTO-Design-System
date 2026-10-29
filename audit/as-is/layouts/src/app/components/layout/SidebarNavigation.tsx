import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUIState } from '../../context/UIStateContext';
import { useAuth } from '../../context/AuthContext';
import { navigationConfig } from '../../../config/navigation';
import { normalizeRole as normalizeSystemRole, SystemRole } from '../../../types/auth.types';
import { getRequiredFeatureFlags, FeatureFlagsDTO } from '../../../services/settingsService';
import { RoleSidebarNav, type SidebarNavCategory } from './RoleSidebarNav';

export const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  const { activeRole: contextRole } = useUIState();
  const { user } = useAuth();

  const { data: featureFlags } = useQuery<FeatureFlagsDTO>({
    queryKey: ['tenantFeatureFlags'],
    queryFn: getRequiredFeatureFlags,
    staleTime: 5 * 60 * 1000,
  });

  // Routes through the canonical SystemRole normalizer (auth.types.ts) so
  // aliases like 'owner', 'super_admin', 'workspace_owner', 'admin',
  // 'it_admin', 'team_lead', 'supervisor', etc. all resolve correctly —
  // the previous local normalizer only special-cased 'HR', leaving every
  // other alias (most notably 'it_admin') un-normalized and unable to match
  // any allowedRoles entry in navigation.ts, producing an empty sidebar.
  const activeRole = useMemo(() => {
    const rawRole = contextRole || user?.role || 'HR Admin';
    const systemRole = normalizeSystemRole(rawRole);
    // navigation.ts only ever lists 'HR_ADMIN', never a separate 'HR' tier —
    // collapse Secondary HR into the same bucket as Primary HR here too.
    return systemRole === SystemRole.HR ? SystemRole.HR_ADMIN : systemRole;
  }, [contextRole, user]);

  // Enforce RBAC intersection check (items without user permission are
  // completely omitted), evaluate dynamic module feature flags, and resolve each item's role-specific href.
  const resolvedCategories: SidebarNavCategory[] = useMemo(() => {
    return navigationConfig
      .map((cat) => ({
        category: cat.category,
        items: cat.items
          .filter((item) => {
            const hasRoleAccess = item.allowedRoles.includes(activeRole);
            const isFeatureEnabled = !item.requiredFeatureFlag || Boolean(featureFlags?.[item.requiredFeatureFlag]);
            return hasRoleAccess && isFeatureEnabled;
          })
          .map((item) => ({
            title: item.title,
            icon: item.icon,
            href: item.roleHrefs?.[activeRole] || item.defaultHref,
          })),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [activeRole, featureFlags]);

  // Helper for visual state checks (legacy matching logic mapping sub-routes to main tabs)
  const checkIsActive = (path: string, title: string) => {
    const pathname = location.pathname;

    // Direct matches
    if (pathname === path) return true;

    // Sub-route prefix checking (avoid false positives on root index)
    const cleanPath = pathname.toLowerCase();
    const cleanItemPath = path.toLowerCase();
    if (cleanItemPath !== '/' && cleanItemPath !== '/hr/dashboard' && cleanPath.startsWith(cleanItemPath)) {
      return true;
    }

    // Casing-insensitive matches corresponding to modular contexts
    const cleanTitle = title.toLowerCase();
    if (cleanTitle === 'home' && (cleanPath.includes('dashboard') || cleanPath === '' || cleanPath === '/')) return true;
    if (cleanTitle === 'chat & dms' && (cleanPath.startsWith('/chat') || cleanPath.startsWith('/hr/chat'))) return true;
    if (cleanTitle === 'directory' && cleanPath.startsWith('/directory')) return true;
    if (cleanTitle === 'recruitment' && (cleanPath.startsWith('/recruitment') || cleanPath.startsWith('/hr/recruitment') || cleanPath.startsWith('/team/recruitment/'))) return true;
    if (cleanTitle === 'performance' && (cleanPath.startsWith('/performance') || cleanPath.startsWith('/competencies'))) return true;
    if (cleanTitle === 'attendance' && cleanPath.startsWith('/attendance')) return true;
    if (cleanTitle === 'leave' && (cleanPath.startsWith('/leave') || cleanPath.startsWith('/time-off') || cleanPath.startsWith('/leave-payroll') || cleanPath.startsWith('/leave-management') || cleanPath.startsWith('/leave-analytics'))) return true;
    if (cleanTitle === 'benefits' && cleanPath.startsWith('/benefits')) return true;
    if (cleanTitle === 'ewa' && cleanPath.startsWith('/ewa')) return true;
    if (cleanTitle === 'payroll' && (cleanPath.startsWith('/payroll') || cleanPath.startsWith('/hr/payroll') || cleanPath.startsWith('/payroll-management') || cleanPath.startsWith('/payroll-ceo') || cleanPath.startsWith('/finance/payroll') || cleanPath.startsWith('/payroll-authority') || cleanPath.startsWith('/compensation'))) return true;
    if (cleanTitle === 'eor' && cleanPath.startsWith('/eor')) return true;
    if (cleanTitle === 'contractor' && cleanPath.startsWith('/contractor')) return true;
    if (cleanTitle === 'learning' && (cleanPath.startsWith('/learning') || cleanPath.startsWith('/hr/learning') || cleanPath.startsWith('/me/learning'))) return true;
    if (cleanTitle === 'calendar' && (cleanPath.startsWith('/calendar') || cleanPath.startsWith('/team-calendar') || cleanPath.startsWith('/hr/calendar') || cleanPath.startsWith('/org-calendar') || cleanPath.includes('calendar'))) return true;
    if (cleanTitle === 'requisition' && (cleanPath.startsWith('/requisition') || cleanPath.startsWith('/requisitions') || cleanPath.startsWith('/finance/requisitions') || cleanPath.startsWith('/executive-requisitions') || cleanPath.startsWith('/requests'))) return true;
    if (cleanTitle === 'documents' && (cleanPath.startsWith('/documents') || cleanPath.startsWith('/executive-signature') || cleanPath.startsWith('/hr/documents'))) return true;
    if (cleanTitle === 'analytics' && (cleanPath.startsWith('/analytics') || cleanPath.startsWith('/strategic-reports') || cleanPath.startsWith('/strategic-horizon'))) return true;
    if (cleanTitle === 'it assets' && (cleanPath.startsWith('/it-assets') || cleanPath.startsWith('/assets') || cleanPath.startsWith('/it-equipment'))) return true;
    if (cleanTitle === 'employee relations' && cleanPath.startsWith('/employee-relations')) return true;
    if (cleanTitle === 'service requests' && cleanPath.startsWith('/service-requests')) return true;
    if (cleanTitle === 'records' && (cleanPath.startsWith('/employees') || cleanPath.startsWith('/people'))) return true;
    if (cleanTitle === 'ai intelligence' && cleanPath.startsWith('/intelligence')) return true;
    if (cleanTitle === 'configuration' && (cleanPath.startsWith('/hr/configuration') || cleanPath.startsWith('/hr/settings'))) return true;
    if (cleanTitle === 'offboarding' && (cleanPath.startsWith('/hr/offboarding') || cleanPath.startsWith('/manager/offboarding') || cleanPath.startsWith('/it/offboarding') || cleanPath.startsWith('/finance/offboarding') || cleanPath.startsWith('/me/offboarding') || cleanPath.startsWith('/exits'))) return true;

    return false;
  };

  return <RoleSidebarNav categories={resolvedCategories} checkIsActive={checkIsActive} />;
};
