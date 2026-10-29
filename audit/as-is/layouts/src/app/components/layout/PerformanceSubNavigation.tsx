import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole, SystemRole } from '../../../types/auth.types';

interface NavigationItem {
  label: string;
  path: string;
}

export const PerformanceSubNavigation: React.FC = () => {
  const location = useLocation();

  // Group 1: The Core Foundation
  const group1: NavigationItem[] = [
    { label: 'OVERVIEW', path: '/hr/performance/overview' },
    { label: 'STRATEGIC SCORECARD', path: '/hr/performance/strategic-scorecard' },
    { label: 'REVIEW CYCLES', path: '/hr/performance/reviews/cycle-settings' },
    { label: 'METHODOLOGIES', path: '/hr/performance/methodologies' }
  ];

  const { user } = useAuth();
  const activeRole = normalizeRole(user?.role);
  const isHRAdmin = activeRole === SystemRole.HR_ADMIN || activeRole === SystemRole.HR
    || activeRole === SystemRole.CEO || activeRole === SystemRole.ADMIN;

  // Group 2: The Evaluation Methodologies
  const group2: NavigationItem[] = [
    { label: 'OKRS', path: '/hr/performance/okrs' },
    { label: 'BSC', path: isHRAdmin ? '/hr/performance/scorecard' : '/hr/performance/bsc' },
    { label: 'BARS', path: isHRAdmin ? '/hr/performance/bars-manager' : '/hr/performance/bars' },
    { label: 'ENPS', path: '/hr/performance/enps' }
  ];

  // Group 3: Advanced Add-ons & Talent Outcomes
  const group3: NavigationItem[] = [
    { label: 'COMPETENCY', path: '/hr/performance/skills-competency' },
    { label: 'HYBRID ALIGNMENT', path: '/hr/performance/hybrid-alignment' },
    { label: '360 REVIEWS', path: '/hr/performance/360-reviews' },
    { label: '9-BOX GRID', path: '/hr/performance/talent-mapping' },
    { label: 'HISTORY ARCHIVES', path: '/hr/performance/history-archives' }
  ];

  const isItemActive = (label: string, pathname: string): boolean => {
    const path = pathname.replace(/\/$/, '');
    switch (label) {
      case 'OVERVIEW':
        return path === '/hr/performance/overview' || path === '/hr/performance' || path === '/hr/performance/cycles';
      case 'STRATEGIC SCORECARD':
        return path.includes('/strategic-scorecard');
      case 'REVIEW CYCLES':
        return path.includes('/reviews') || path.includes('/cycles/');
      case 'METHODOLOGIES':
        return path.includes('/methodologies');
      case 'OKRS':
        return path.includes('/okr-tree') || (path.includes('/okrs/') && path.includes('/active')) || path.includes('/okrs');
      case 'BSC':
        return path.includes('/scorecard') || path.includes('/bsc');
      case 'BARS':
        return path.includes('/bars');
      case 'ENPS':
        return path.includes('/enps');
      case 'COMPETENCY':
        return path.includes('/skills-competency');
      case 'HYBRID ALIGNMENT':
        return path.includes('/hybrid-alignment');
      case '360 REVIEWS':
        return path.includes('/360-reviews');
      case '9-BOX GRID':
        return path.includes('/talent-mapping') || path.includes('/9-box');
      case 'HISTORY ARCHIVES':
        return path.includes('/history-archives');
      default:
        return false;
    }
  };

  const renderNavGroup = (items: NavigationItem[]) => {
    return items.map((item) => {
      const isActive = isItemActive(item.label, location.pathname);
      return (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive: linkActive }) =>
            `h-full flex items-center text-sm font-bold uppercase tracking-wider border-b-2 transition-all duration-150 whitespace-nowrap shrink-0 ${
              linkActive || isActive
                ? 'text-[#FF4F00] border-[#FF4F00]'
                : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-[#F8FAFC] border-transparent hover:border-slate-350 dark:hover:border-[#232D42]'
            }`
          }
        >
          {item.label}
        </NavLink>
      );
    });
  };

  return (
    <div className="w-full border-b border-slate-200 dark:border-[#232D42] bg-white dark:bg-[#111625] px-8 flex gap-6 items-center h-14 overflow-x-auto whitespace-nowrap hide-scrollbar no-scrollbar sticky top-0 z-20 shrink-0 select-none transition-colors duration-200">
      {/* Group 1 tabs */}
      {renderNavGroup(group1)}

      {/* Group 1 to Group 2 Divider */}
      <div className="h-5 w-px bg-slate-300 dark:bg-[#232D42] mx-2 shrink-0"></div>

      {/* Group 2 tabs */}
      {renderNavGroup(group2)}

      {/* Group 2 to Group 3 Divider */}
      <div className="h-5 w-px bg-slate-300 dark:bg-[#232D42] mx-2 shrink-0"></div>

      {/* Group 3 tabs */}
      {renderNavGroup(group3)}
    </div>
  );
};

export default PerformanceSubNavigation;
