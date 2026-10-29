import React from 'react';
import { Button } from '@/app/components/ui';
import { useNavigate } from 'react-router-dom';
import { Magnifer, BellBing, UserCircle, HamburgerMenu, Buildings as BuildingsRounded, Sun2, MoonStars, Wallet2 as WalletIcon } from '@solar-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUIState } from '../../context/UIStateContext';
import { Input } from '@/app/components/ui';
import { GlobalSearchBar } from './GlobalSearchBar';
import { RoleSwitcher } from './RoleSwitcher';
import { getAppearanceSettings, getTenantBranding } from '../../../services/settingsService';
import { getUnreadCount, getSSETicket } from '../../../services/notificationService';
import { getAppSettings } from '../../../services/userPreferencesService';
import { getCorporateWallet, TenantWalletDTO } from '../../../services/corporateWalletService';
import { useAppSelector } from '../../../store';
import { useAuth } from '../../context/AuthContext';

import { getApiBaseUrl } from '../../../lib/apiClient';

interface GlobalHeaderProps {
  className?: string;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = () => {
  const navigate = useNavigate();
  const { setMobileMenuOpen, setActiveSubMenu, activeRole } = useUIState();
  const queryClient = useQueryClient();
  const profile = useAppSelector((state) => state.auth.profile);
  const { user } = useAuth();

  // Determine if current active role or user is HR/HR Admin, Finance, or CEO
  const isWalletEligibleRole = React.useMemo(() => {
    const normActiveRole = String(activeRole || '').toLowerCase().replace(/[\s-]+/g, '_');
    const eligibleRoles = ['hr_admin', 'hr', 'finance', 'finance_admin', 'ceo', 'workspace_owner', 'super_admin', 'admin', 'owner'];
    if (eligibleRoles.includes(normActiveRole)) return true;

    const userRole = String(user?.role || '').toLowerCase().replace(/[\s-]+/g, '_');
    if (eligibleRoles.includes(userRole)) return true;

    if (Array.isArray(user?.roles)) {
      return user.roles.some((r) => eligibleRoles.includes(String(r).toLowerCase().replace(/[\s-]+/g, '_')));
    }
    return false;
  }, [activeRole, user?.role, user?.roles]);

  // Query dedicated corporate wallet for real-time header balance
  const { data: wallet, isLoading: isWalletLoading } = useQuery<TenantWalletDTO>({
    queryKey: ['corporateWallet'],
    queryFn: getCorporateWallet,
    enabled: isWalletEligibleRole,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const formattedWalletBalance = React.useMemo(() => {
    if (!wallet) return '₦0.00';
    const amountNaira = (wallet.available_balance_kobo || 0) / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amountNaira);
  }, [wallet]);

  // Fetch per-user application preferences
  const { data: prefRes } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: getAppSettings,
    staleTime: 1000 * 60 * 5,
  });

  const prefTheme = prefRes?.data?.theme;
  const prefDensity = prefRes?.data?.density;

  // Theme State
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('nvuto_theme');
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Reactive side-effect: sync documentElement 'dark' class and localStorage whenever isDarkMode state toggles
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nvuto_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nvuto_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync initial backend preference if available and no local override exists
  React.useEffect(() => {
    if (!prefTheme) return;
    const storedTheme = localStorage.getItem('nvuto_theme');
    if (!storedTheme) {
      if (prefTheme === 'dark') {
        setIsDarkMode(true);
      } else if (prefTheme === 'light') {
        setIsDarkMode(false);
      } else if (prefTheme === 'system') {
        const matchesDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(matchesDark);
      }
    }
  }, [prefTheme]);

  // Sync state when theme-change event is dispatched externally
  React.useEffect(() => {
    const handleThemeChange = () => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDarkNow);
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, []);

  // Apply Data Density Preference (Comfortable / Compact)
  React.useEffect(() => {
    if (prefDensity === 'compact') {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
  }, [prefDensity]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Query tenant branding from database via TanStack Query (caching the logo globally)
  const { data: brandingRes } = useQuery({
    queryKey: ['tenantBranding'],
    queryFn: getTenantBranding
  });
  const companyLogoUrl = brandingRes?.data?.light_logo_url || null;

  // Query unread count from database
  const { data: unreadRes } = useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // periodic poll safety fallback
    retry: (failureCount, error: any) => error?.status !== 403 && error?.status !== 401 && failureCount < 2,
  });
  const unreadCount = unreadRes?.data?.unread_count ?? 0;

  // Real-time EventSource listener using short-lived SSE tickets & cookies (no raw JWT in URL)
  React.useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;

    const scheduleReconnect = () => {
      if (!isMounted || reconnectTimer) return;
      const jitter = Math.floor(Math.random() * 500) - 250;
      const delay = Math.max(500, reconnectDelay + jitter);
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void connectSSE();
      }, delay);
    };

    const connectSSE = async () => {
      const baseUrl = getApiBaseUrl();
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');

      let streamUrl = '';
      try {
        const ticketRes = await getSSETicket();
        if (ticketRes?.data?.ticket) {
          streamUrl = `${cleanBaseUrl}/notifications/stream?ticket=${encodeURIComponent(ticketRes.data.ticket)}`;
        } else {
          scheduleReconnect();
          return;
        }
      } catch (err) {
        // Polling remains active; retry ticket acquisition without opening an
        // unauthenticated stream that can only produce repeated 401s.
        scheduleReconnect();
        return;
      }

      if (!isMounted) return;

      eventSource = new EventSource(streamUrl, { withCredentials: true });

      eventSource.addEventListener('connected', (e: any) => {
        reconnectDelay = 1000;
        try {
          const payload = JSON.parse(e.data);
          if (typeof payload.unread_count === 'number') {
            queryClient.setQueryData(['unreadNotificationsCount'], {
              data: { unread_count: payload.unread_count },
              message: 'SSE Sync',
              status: 200,
            });
          }
        } catch (err) {
          console.error('Failed to parse SSE connected payload:', err);
        }
      });

      eventSource.addEventListener('notification', () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        scheduleReconnect();
      };
    };

    connectSSE();

    return () => {
      isMounted = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (eventSource) {
        eventSource.onerror = null;
        eventSource.close();
      }
    };
  }, [queryClient]);

  return (
    <header className="nvuto-global-header flex items-center justify-between gap-3 px-4 xl:px-8 w-full min-w-0 border-b border-slate-200/50 dark:border-[#232D42] bg-[#EEF0FA] dark:bg-[#0B0F19] min-h-[72px] shrink-0 transition-colors duration-200">
      {/* Left segment: Mobile Menu Button & Search Bar */}
      <div className="nvuto-header-search flex-1 flex items-center gap-3 justify-start min-w-0 max-w-xl">
        <Button
          variant="ghost"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 hover:bg-slate-200 dark:bg-[#171E2E]/50 dark:hover:bg-[#171E2E] rounded-xl transition-colors text-slate-900 dark:text-[#F8FAFC] shrink-0 min-h-[44px] min-w-[44px]"
          title="Open Navigation"
          aria-label="Open Mobile Navigation Menu"
          aria-controls="workspace-navigation"
        >
          <HamburgerMenu size={22} />
        </Button>
        <GlobalSearchBar />
      </div>

      {/* Right segment: Action Cluster Container */}
      <div className="nvuto-header-actions min-w-0 flex flex-wrap items-center gap-2 justify-end">
        {/* Existing Utility Icons */}
        <div className="flex items-center gap-1">
          {/* Light / Dark Mode Toggle Button */}
          <Button
            variant="ghost"
            onClick={toggleDarkMode}
            className="p-2 text-slate-900 dark:text-[#F8FAFC] hover:bg-slate-200 dark:bg-[#171E2E]/50 dark:hover:bg-[#171E2E] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun2 size={20} className="text-[#FF4F00] hover:rotate-45 transition-transform duration-300" />
            ) : (
              <MoonStars size={20} className="text-[#FF4F00] hover:-rotate-12 transition-transform duration-300" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            onClick={() => setActiveSubMenu('notifications')}
            className="relative p-2 text-slate-900 dark:text-[#F8FAFC] hover:bg-slate-200 dark:bg-[#171E2E]/50 dark:hover:bg-[#171E2E] rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            title="Notifications"
            aria-label={`Notifications panel (${unreadCount} unread notification${unreadCount === 1 ? '' : 's'})`}
          >
            <BellBing size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF4F00] rounded-full ring-2 ring-[#EEF0FA] dark:ring-[#0B0F19]" />
            )}
          </Button>
        </div>

        {/* Real-time Corporate Wallet Balance Pill (HR / HR Admin, Finance, CEO) */}
        {isWalletEligibleRole && (
          <button
            type="button"
            onClick={() => navigate('/hr/payroll/wallet')}
            className="group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#121826] hover:bg-white dark:hover:bg-[#1A2234] border border-slate-200/80 dark:border-[#232D42] shadow-sm hover:shadow transition-all duration-200 text-left min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#FF4F00]/30 cursor-pointer"
            title="Corporate Wallet Balance — Click to manage funds & ledger"
            aria-label={`Corporate Wallet Balance: ${formattedWalletBalance}`}
          >
            <div className="w-7 h-7 rounded-lg bg-[#FF4F00]/10 dark:bg-[#FF4F00]/20 flex items-center justify-center text-[#FF4F00] group-hover:scale-105 transition-transform duration-200 shrink-0">
              <WalletIcon size={16} />
            </div>
            <div className="flex flex-col pr-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-[#FF4F00] transition-colors leading-none hidden sm:inline">
                Corporate Wallet
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-tight mt-0.5">
                {isWalletLoading ? '...' : formattedWalletBalance}
              </span>
            </div>
          </button>
        )}

        {/* Multi-Role Switcher Control */}
        <RoleSwitcher />

        {/* User Profile Avatar */}
        <Button
          variant="ghost"
          onClick={() => setActiveSubMenu('profile')}
          className="relative rounded-xl w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center overflow-hidden transition-all shadow-sm cursor-pointer border border-slate-200 dark:border-[#232D42] !p-0"
          title="User profile"
          aria-label={`User Profile Menu for ${profile?.profile?.first_name || user?.fullName?.split(' ')[0] || 'User'}`}
        >
          {(() => {
            const rawAvatar = profile?.profile?.avatar_url || user?.avatarUrl;
            const isMockUnsplash = rawAvatar?.includes('unsplash.com');
            const validAvatar = rawAvatar && !isMockUnsplash ? rawAvatar : null;
            const storedAdminName = typeof window !== 'undefined' ? localStorage.getItem('nvuto_admin_name') : null;
            let rawFirst = profile?.profile?.first_name || user?.fullName?.split(' ')[0] || (user as any)?.firstName || '';
            if ((!rawFirst || rawFirst.toLowerCase() === 'hr' || rawFirst.toLowerCase() === 'workspace') && storedAdminName && storedAdminName.toLowerCase() !== 'hr admin') {
              rawFirst = storedAdminName.split(' ')[0] || rawFirst;
            }
            const firstName = rawFirst;
            const initial = firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

            return validAvatar ? (
              <img src={validAvatar} alt={firstName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#111184] dark:bg-[#171E2E] flex items-center justify-center text-white dark:text-[#F8FAFC] text-sm font-bold">
                {initial}
              </div>
            );
          })()}
        </Button>

        {/* The Visual Divider */}
        <div className="hidden xl:block w-px h-8 bg-slate-200 dark:bg-[#232D42] mx-1" />

        {/* Company Logo Frame */}
        <div className="hidden xl:flex w-10 h-10 rounded-full bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-sm overflow-hidden items-center justify-center shrink-0">
          {companyLogoUrl ? (
            <img src={companyLogoUrl} alt="Company Name" className="w-full h-full object-cover" />
          ) : (
            <BuildingsRounded className="text-slate-400 dark:text-[#94A3B8] text-xl" />
          )}
        </div>
      </div>
    </header>
  );
};
