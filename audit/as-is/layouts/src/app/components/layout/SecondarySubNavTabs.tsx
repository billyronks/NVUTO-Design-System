import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SecondarySubNavTabsProps {
  tabs: string[];
  paths?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const SecondarySubNavTabs: React.FC<SecondarySubNavTabsProps> = ({
  tabs,
  paths,
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  // Compute base path of the current secondary nav tab parent route (e.g. "/hr/performance/skills-competency")
  const parts = location.pathname.split('/');
  const basePath = parts.slice(0, 4).join('/');

  // If paths not provided, auto-generate them
  const resolvedPaths = paths || tabs.map((tab, index) => {
    if (index === 0) return basePath;
    return `${basePath}/${slugify(tab)}`;
  });

  const activeIndex = resolvedPaths.findIndex(p => {
    const cleanPath = location.pathname.replace(/\/$/, '');
    const cleanP = p.replace(/\/$/, '');
    return cleanPath === cleanP || cleanPath === `/hr${cleanP}` || `/hr${cleanPath}` === cleanP;
  });

  const currentActiveTab = controlledActiveTab || (activeIndex !== -1 ? tabs[activeIndex] : tabs[0]);

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

  useEffect(() => {
    if (onTabChange && currentActiveTab) {
      onTabChange(currentActiveTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActiveTab]);

  return (
    <div
      ref={containerRef}
      className="sticky top-[48px] z-10 flex items-center gap-6 px-8 h-[40px] bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-[#232D42] w-full shrink-0 overflow-x-auto overflow-y-hidden no-scrollbar transition-colors duration-200"
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
            className={() =>
              `h-full flex items-center border-b-2 transition-all duration-150 cursor-pointer text-sm font-bold tracking-wider uppercase whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-[#FF4F00] border-[#FF4F00]'
                  : 'text-slate-400 dark:text-[#94A3B8] border-transparent hover:text-[#FF4F00] dark:hover:text-[#F8FAFC]'
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
