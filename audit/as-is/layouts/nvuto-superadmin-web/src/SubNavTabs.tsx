import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

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
  tabs = [],
  paths,
  defaultActiveTab = '',
  activeTab: controlledActiveTab,
  onTabChange,
  className = '',
}) => {
  const location = useLocation();
  const [localActiveTab, setLocalActiveTab] = useState(defaultActiveTab);
  const stickyTopClass = className.includes('top-') ? '' : 'top-0';

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

  // Notify parent of the active tab change derived from URL location path
  useEffect(() => {
    if (onTabChange && currentActiveTab) {
      onTabChange(currentActiveTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActiveTab]);

  return (
    <div role="navigation" aria-label="Section navigation" className={`nvuto-scroll-region min-w-0 max-w-full sticky ${stickyTopClass} z-20 flex items-center gap-5 sm:gap-8 px-4 sm:px-8 h-[48px] bg-white border-b border-slate-200 w-full shrink-0 overflow-x-auto overflow-y-hidden ${className}`}>
      {tabs.map((tab, index) => {
        const path = resolvedPaths[index];
        const isActive = currentActiveTab === tab;

        return (
          <NavLink
            key={tab}
            to={path}
            end
            className={() =>
              `h-full flex items-center border-b-2 transition-all duration-150 cursor-pointer font-sans text-sm font-bold tracking-wider uppercase whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-[#111184] border-[#111184]'
                  : 'text-slate-400 border-transparent hover:text-[#111184]'
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

