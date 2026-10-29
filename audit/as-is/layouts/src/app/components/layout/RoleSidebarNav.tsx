import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as SolarIcons from '@solar-icons/react';
import { useUIState } from '../../context/UIStateContext';

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: string;
  badge?: React.ReactNode;
}

export interface SidebarNavCategory {
  category: string;
  items: SidebarNavItem[];
}

export interface RoleSidebarNavProps {
  categories: SidebarNavCategory[];
  checkIsActive: (path: string, title: string) => boolean;
}

// Shared rendering shell for the role-specific sidebars (EmployeeSidebar,
// ManagerSidebar, SidebarNavigation). Route-matching heuristics and config
// resolution (RBAC filtering, role-href overrides, dynamic category
// injection) genuinely differ per role and stay in each thin wrapper -
// only the markup/styling that was independently duplicated three times
// (and had drifted out of sync) lives here.
export const RoleSidebarNav: React.FC<RoleSidebarNavProps> = ({ categories, checkIsActive }) => {
  const { secondaryExpanded } = useUIState();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryName: string, currentIsOpen: boolean) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryName]: !currentIsOpen,
    }));
  };

  const CaretIcon = SolarIcons.AltArrowDown;

  return (
    <div className="min-h-0 min-w-0 flex-1 flex flex-col gap-4 select-none overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
      {categories.map((cat) => {
        const hasActiveChild = cat.items.some((item) => checkIsActive(item.href, item.title));
        const isOpen = openCategories[cat.category] !== undefined
          ? openCategories[cat.category]
          : hasActiveChild;

        return (
          <div key={cat.category} className="flex flex-col">
            {/* Category Header */}
            {secondaryExpanded ? (
              <button
                type="button"
                onClick={() => toggleCategory(cat.category, isOpen)}
                className="flex items-center justify-between w-full py-1.5 px-4 nvuto-h3 font-extrabold uppercase tracking-widest text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer whitespace-nowrap overflow-hidden"
              >
                <span className="truncate mr-2">{cat.category}</span>
                <CaretIcon
                  size={12}
                  className="shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                />
              </button>
            ) : (
              <div className="h-[1px] bg-slate-200 dark:bg-[#232D42] my-2 mx-3 shrink-0" />
            )}

            {/* Collapsible Nested Links using smooth grid height transition */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen || !secondaryExpanded
                  ? 'grid-rows-[1fr] opacity-100 mt-1.5'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden flex flex-col gap-0.5">
                {cat.items.map((item) => {
                  const active = checkIsActive(item.href, item.title);
                  const IconComponent = (SolarIcons as any)[item.icon] || SolarIcons.Widget2;

                  return (
                    <NavLink
                      key={item.title}
                      to={item.href}
                      className={`w-full py-2.5 rounded-lg transition-all relative flex items-center ${
                        active
                          ? 'text-[#1E2132] dark:text-[#F8FAFC] font-bold bg-white dark:bg-[#171E2E] shadow-sm'
                          : 'text-slate-600 dark:text-[#94A3B8] font-normal hover:bg-white/40 dark:hover:bg-[#171E2E]/60 hover:text-[#1E2132] dark:hover:text-[#F8FAFC]'
                      } ${
                        !secondaryExpanded ? 'justify-center px-0' : 'justify-start px-3'
                      }`}
                      title={item.title}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-[#FF4F00] rounded-r" />
                      )}
                      <IconComponent
                        size={20}
                        className={`shrink-0 select-none ${
                          active ? 'text-[#FF4F00]' : 'text-slate-400 dark:text-[#94A3B8]'
                        }`}
                      />
                      {secondaryExpanded && (
                        item.badge ? (
                          <div className="ml-2.5 flex items-center justify-between flex-1 min-w-0 pr-1">
                            <span className="text-sm tracking-wide leading-none whitespace-nowrap truncate mr-1.5" title={item.title}>
                              {item.title}
                            </span>
                            {item.badge}
                          </div>
                        ) : (
                          <span className="ml-2.5 text-sm tracking-wide leading-none whitespace-nowrap truncate" title={item.title}>
                            {item.title}
                          </span>
                        )
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleSidebarNav;
