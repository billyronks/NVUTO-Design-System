import React from 'react';
import { UsersGroupRounded, AltArrowLeft, HamburgerMenu } from '@solar-icons/react';
import { NavLink } from 'react-router-dom';
import { useUIState } from '../../context/UIStateContext';
import { useAuth } from '../../context/AuthContext';
import { NvutoLogo } from './NvutoLogo';
import { useAppSelector } from '../../../store';
import { useConfirm } from '../../context/useConfirm';

const LogoutIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const PrimarySidebar: React.FC = () => {
  const {
    primaryExpanded,
    togglePrimary,
    activeModule,
    setActiveModule,
    setSecondaryExpanded,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useUIState();
  const { user, logout } = useAuth();
  const profile = useAppSelector((state) => state.auth.profile);
  const confirm = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of your NVUTO session? Any unsaved changes may be lost.',
      confirmText: 'Log Out',
      variant: 'destructive'
    });
    if (ok) {
      logout();
    }
  };

  const storedAdminName = typeof window !== 'undefined' ? localStorage.getItem('nvuto_admin_name') : null;
  const storedAdminEmail = typeof window !== 'undefined' ? localStorage.getItem('nvuto_admin_email') : null;

  let rawName = (profile?.profile?.first_name && !profile.profile.first_name.toLowerCase().includes('hr admin') && !profile.profile.first_name.toLowerCase().includes('workspace admin'))
    ? `${profile.profile.first_name} ${profile.profile.last_name || ''}`.trim()
    : ((user as any)?.firstName && !(user as any).firstName.toLowerCase().includes('hr admin') ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : (user?.fullName || ''));

  if ((!rawName || rawName.toLowerCase() === 'hr admin' || rawName.toLowerCase() === 'workspace admin') && storedAdminName && storedAdminName.toLowerCase() !== 'hr admin') {
    rawName = storedAdminName;
  }

  const displayName = rawName || 'Administrator';
  const displayEmail = profile?.email || user?.email || storedAdminEmail || '';

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(displayName);

  const modules = [
    { id: 'hr', icon: UsersGroupRounded, label: 'HR', path: '/hr/dashboard' },
  ];

  return (
    <div
      data-navigation-rail="primary"
      className={`bg-[#1E2132] dark:bg-[#0B0F19] border-r border-white/5 dark:border-[#232D42] text-white flex flex-col shrink-0 h-screen transition-all duration-300 ease-in-out relative z-55 ${
        primaryExpanded ? 'w-[240px]' : 'w-[80px]'
      }`}
    >
      {/* Brand Header / Toggle Action combined */}
      <div
        className={`px-4 border-b border-white/5 dark:border-[#232D42] select-none shrink-0 flex items-center transition-all duration-300 ${
          primaryExpanded ? 'h-24 py-6' : 'h-[128px] pt-6 pb-2 flex-col justify-start'
        } relative overflow-hidden`}
      >
        {primaryExpanded ? (
          <div className="flex items-center justify-between w-full relative">
            {/* Logo container (non-clickable in expanded state) */}
            <div className="flex items-center justify-start">
              <NvutoLogo />
            </div>

            {/* Collapse Button */}
            <button
              onClick={togglePrimary}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 dark:hover:bg-[#171E2E] transition-colors cursor-pointer"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar Navigation"
            >
              <AltArrowLeft size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Logo container (non-clickable in collapsed state) */}
            <div className="flex items-center justify-center h-9">
              <NvutoLogo />
            </div>

            {/* Menu Expand CTA Button */}
            <button
              onClick={togglePrimary}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 dark:hover:bg-[#171E2E] transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar Navigation"
            >
              <HamburgerMenu size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Module Navigation List */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isModuleActive = activeModule === mod.id;
          return (
            <NavLink
              key={mod.id}
              to={mod.path}
              onClick={() => {
                setSecondaryExpanded(true);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center rounded-xl p-3.5 transition-all group ${
                isModuleActive
                  ? 'bg-[#1C1C93] dark:bg-[#FF4F00] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5 dark:hover:bg-[#171E2E]'
              } ${!primaryExpanded ? 'justify-center' : 'justify-start'}`}
              title={mod.label}
              aria-label={`${mod.label} Navigation Module`}
            >
              <Icon size={20} className="shrink-0" />
              {primaryExpanded && (
                <span className={`ml-3 text-sm font-bold uppercase tracking-wider leading-none transition-colors ${
                  isModuleActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                }`}>
                  {mod.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="mt-auto px-4 py-5 border-t border-white/5 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 overflow-hidden">
            {(() => {
              const avatarSrc = user?.avatarUrl || profile?.profile?.avatar_url || '';

              return avatarSrc ? (
                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0 shadow-sm">
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#D63F00] flex items-center justify-center shrink-0 font-extrabold text-white text-sm tracking-wider shadow-sm">
                  {initials}
                </div>
              );
            })()}
            {primaryExpanded && (
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white truncate">
                  {displayName}
                </div>
                <div className="text-sm text-white/40 truncate">
                  {displayEmail}
                </div>
              </div>
            )}
          </div>
          {primaryExpanded && (
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-[#FF4F00] hover:bg-white/10 transition-colors cursor-pointer"
              title="Logout"
              aria-label="Log Out of NVUTO Session"
            >
              <LogoutIcon size={18} />
            </button>
          )}
        </div>
        {!primaryExpanded && (
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-[#FF4F00] hover:bg-white/5 transition-colors cursor-pointer"
            title="Logout"
            aria-label="Log Out of NVUTO Session"
          >
            <LogoutIcon size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
