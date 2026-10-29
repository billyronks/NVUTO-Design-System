import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Magnifer, Widget2, AltArrowRight } from '@solar-icons/react';
import { useUIState } from '../../context/UIStateContext';
import { useAuth } from '../../context/AuthContext';
import { PrimarySidebar } from './PrimarySidebar';
import { SecondarySidebar } from './SecondarySidebar';
import { GlobalHeader } from './GlobalHeader';
import { HRAssistantFAB } from '../../../components/ai/HRAssistantFAB';
import { useRoleSync } from '../../../hooks/useRoleSync';
import { getAppSettings } from '../../../services/userPreferencesService';
import { ProductTourOverlay } from '../tour/ProductTourOverlay';
import { ROLE_TOURS, CURRENT_TOUR_VERSION } from '../tour/tourStepsData';
import { normalizeRole, SystemRole } from '../../../types/auth.types';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { observeResponsiveWorkspace } from '../../../lib/responsiveWorkspace';
import { EmptyState, InteractiveGridBackground } from '@/app/components/ui';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  useRoleSync();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isSuperadminPath = location.pathname.startsWith('/superadmin');
  const { mobileMenuOpen, setMobileMenuOpen } = useUIState();
  const mainScrollContainerRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const navigationTriggerRef = useRef<HTMLElement | null>(null);
  const compactNavigation = useMediaQuery('(max-width: 1023px)');
  useEffect(() => observeResponsiveWorkspace(mainScrollContainerRef.current), []);

  useEffect(() => {
    // React 18 does not serialize the inert boolean attribute. Use the native
    // property so a closed drawer cannot receive keyboard/screen-reader focus.
    if (compactNavigation && mobileMenuOpen) {
      // Capture before applying inert: browsers blur a focused descendant as
      // soon as its containing workspace becomes inert.
      navigationTriggerRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement : document.querySelector<HTMLElement>('[aria-controls="workspace-navigation"]');
    }
    if (navigationRef.current) navigationRef.current.inert = compactNavigation && !mobileMenuOpen;
    if (workspaceRef.current) workspaceRef.current.inert = compactNavigation && mobileMenuOpen;
  }, [compactNavigation, mobileMenuOpen]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname, setMobileMenuOpen]);

  useEffect(() => {
    if (!compactNavigation) setMobileMenuOpen(false);
    if (!compactNavigation || !mobileMenuOpen) return;
    const previousFocus = navigationTriggerRef.current;
    const panel = navigationRef.current;
    panel?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
      if (event.key !== 'Tab' || !panel) return;
      const targets = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex="0"]'))
        .filter((element) => element.getClientRects().length > 0);
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Passive cleanups run before the next inert effect. Unlock the trigger's
      // subtree before restoring focus when dismissing or rotating the drawer.
      if (workspaceRef.current) workspaceRef.current.inert = false;
      previousFocus?.focus();
      navigationTriggerRef.current = null;
    };
  }, [compactNavigation, mobileMenuOpen, setMobileMenuOpen]);

  // Invalidate tenantFeatureFlags query whenever a 403 MODULE_DEACTIVATED occurs mid-session
  useEffect(() => {
    const handleModuleDeactivated = () => {
      queryClient.invalidateQueries({ queryKey: ['tenantFeatureFlags'] });
    };
    window.addEventListener('nvuto:module-deactivated', handleModuleDeactivated);
    return () => {
      window.removeEventListener('nvuto:module-deactivated', handleModuleDeactivated);
    };
  }, [queryClient]);

  // Product Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);

  const { data: prefRes } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: getAppSettings,
    staleTime: 1000 * 60 * 5,
  });

  // Prompt Section 59: AI Entitlement must fail closed on preference/governance loading failure
  const enableAiCopilot = prefRes?.data ? (prefRes.data.enableAiCopilot ?? false) : false;
  const completedTourVersion = prefRes?.data?.completedTourVersion;

  // Determine active role & matching tour steps
  const activeRoleName = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/it-assets')) return 'ITAdmin';
    if (path.includes('/finance')) return 'FinanceAdmin';
    if (path.includes('/manager')) return 'Manager';
    if (path.includes('/ceo')) return 'CEO';
    if (path.includes('/employee')) return 'Employee';
    if (path.includes('/hr')) return 'HRAdmin';
    
    // Fallback to normalized user role
    const norm = normalizeRole(user?.role);
    if (norm === SystemRole.EMPLOYEE) return 'Employee';
    if (norm === SystemRole.MANAGER) return 'Manager';
    if (norm === SystemRole.FINANCE) return 'FinanceAdmin';
    if (norm === SystemRole.CEO) return 'CEO';
    if (norm === SystemRole.IT_ADMIN) return 'ITAdmin';
    if (norm === SystemRole.HR_ADMIN || norm === SystemRole.HR || norm === SystemRole.ADMIN) return 'HRAdmin';
    return 'Employee';
  }, [location.pathname, user?.role]);

  const activeTourSteps = useMemo(() => {
    return ROLE_TOURS[activeRoleName] || ROLE_TOURS['HRAdmin'];
  }, [activeRoleName]);

  // Auto-trigger tour on genuinely first session post-activation or when tour version updates
  useEffect(() => {
    if (!user || isSuperadminPath) return;

    // Check if user is fully onboarded and has not completed current tour version
    const isFullyActivated = user.onboardingCompleted || user.isFullyOnboarded || (user as any).status === 'ACTIVE';
    const hasSeenCurrentVersion = completedTourVersion === CURRENT_TOUR_VERSION;

    // ProductTourOverlay force-navigates to each step's route as soon as it opens
    // (see its own effect keyed on currentStepIndex), which is correct once the
    // tour is actually running - but only auto-*launch* it when the user is
    // already on the tour's landing route. Otherwise a first-time user who
    // deep-links straight to e.g. Settings/Security gets silently yanked back
    // to the dashboard before ever seeing the page they asked for.
    const tourLandingRoute = activeTourSteps[0]?.route;
    const isOnTourLandingRoute = !tourLandingRoute || location.pathname === tourLandingRoute;

    // Ensure preferences query has loaded (prefRes?.data !== undefined) before making trigger decision
    if (isFullyActivated && prefRes?.data !== undefined && !hasSeenCurrentVersion && isOnTourLandingRoute) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, prefRes?.data, completedTourVersion, isSuperadminPath, activeTourSteps, location.pathname]);

  // Command Palette States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Seeded catalog representation for Command Palette searches
  const paletteItems = useMemo(() => [
    { name: "Finance Ledger", path: "/finance/dashboard", category: "Finance" },
    { name: "Billing", path: "/finance/requisitions", category: "Finance" },
    { name: "Expenses", path: "/leave-payroll", category: "Finance" },
    { name: "Banking Reconciliation", path: "/finance/credit-settlement", category: "Finance" },
    { name: "Planning & Budgets (FP&A)", path: "/budget-management", category: "Finance" },
    { name: "Sales CRM", path: "/hr/chat", category: "Sales" },
    { name: "Quotes (CPQ)", path: "/hr/chat", category: "Sales" },
    { name: "Sales Orders", path: "/finance/requisitions", category: "Sales" },
    { name: "Marketing Automation", path: "/hr/chat", category: "Marketing" },
    { name: "Commerce Storefront", path: "/commerce", category: "Commerce" },
    { name: "Point of Sale (POS)", path: "/commerce", category: "Commerce" },
    { name: "Procurement", path: "/finance/requisitions", category: "Supply Chain" },
    { name: "Inventory Control", path: "/commerce", category: "Supply Chain" },
    { name: "Vendors Directory", path: "/hr/directory", category: "Supply Chain" },
    { name: "Projects Workspace", path: "/project-timesheet", category: "Projects" },
    { name: "Timesheets Approval", path: "/hr/attendance/timesheets", category: "Projects" },
    { name: "People Directory", path: "/hr/dashboard", category: "People" },
    { name: "Payroll runs", path: "/hr/payroll/overview", category: "People" },
    { name: "Recruitment (ATS)", path: "/hr/recruitment/pipeline", category: "People" },
    { name: "Performance OKRs", path: "/hr/performance", category: "People" },
    { name: "Attendance tracker", path: "/hr/attendance", category: "People" },
    { name: "Leave requests", path: "/hr/leave", category: "People" },
    { name: "Benefits Enrollment", path: "/hr/benefits", category: "People" },
    { name: "Learning Management (LMS)", path: "/hr/learning", category: "People" },
    { name: "IT Assets Registry", path: "/hr/it-assets/registry", category: "IT & Developer" },
    { name: "System Configuration", path: "/hr/configuration", category: "Platform & Admin" },
    { name: "Security Auditing", path: "/hr/configuration/security", category: "Platform & Admin" }
  ], []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isPaletteOpen]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return paletteItems.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return paletteItems.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q)
    );
  }, [searchQuery, paletteItems]);

  const handleNavigate = (path: string) => {
    setIsPaletteOpen(false);
    const isEmployeeOrManager = activeRoleName === 'Employee' || activeRoleName === 'Manager';
    if (isEmployeeOrManager) {
      if (path === '/hr/benefits') return navigate('/benefits');
      if (path === '/hr/leave') return navigate('/time-off');
      if (path === '/hr/attendance') return navigate('/attendance');
      if (path === '/hr/performance') return navigate('/performance');
      if (path === '/hr/payroll/overview') return navigate('/compensation');
    }
    navigate(path);
  };

  return (
    <div className="nvuto-app-shell w-full min-w-0 flex overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-200">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-3 focus:bg-[#111184] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl"
      >
        Skip to main content
      </a>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Dual Sidebar Panels */}
      {!isSuperadminPath && (
        <div
          ref={navigationRef}
          id="workspace-navigation"
          role={compactNavigation ? 'dialog' : undefined}
          aria-modal={compactNavigation && mobileMenuOpen ? true : undefined}
          aria-label="Workspace navigation"
          tabIndex={-1}
          className={`flex shrink-0 transition-transform duration-300 ease-in-out z-50
            nvuto-navigation max-lg:fixed max-lg:inset-y-0 max-lg:left-0 outline-none
            ${mobileMenuOpen ? 'translate-x-0' : 'max-lg:-translate-x-full'}
          `}
        >
          {compactNavigation && <button type="button" onClick={() => setMobileMenuOpen(false)} className="nvuto-navigation-close" aria-label="Close navigation">×</button>}
          <PrimarySidebar />
          {location.pathname !== '/onboarding/setup' && <SecondarySidebar />}
        </div>
      )}

      {/* Main Scrollable Dashboard Content */}
      <div ref={workspaceRef} className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden relative">
        {!isSuperadminPath && location.pathname !== '/onboarding/setup' && <GlobalHeader />}
        
        {/* Persistent Onboarding Banner */}
        {user && (() => {
          const normRole = normalizeRole(user.role);
          // normalizeRole() already folds 'owner'/'super_admin'/'workspace_owner'/
          // 'admin' aliases into HR_ADMIN (and SYSTEM_ADMIN isn't a SystemRole
          // member at all) — HR_ADMIN alone captures the original intent.
          return normRole === SystemRole.HR_ADMIN;
        })() && !user.isFullyOnboarded && location.pathname !== '/onboarding/setup' && location.pathname !== '/hr/configuration/profile' && (
          <div className="w-full bg-[#FF4F00]/5 border-b border-[#FF4F00]/10 px-4 sm:px-6 py-3 flex flex-wrap gap-3 items-center justify-between text-slate-800 dark:text-[#F8FAFC] z-30 select-none">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4F00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF4F00]"></span>
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-[#F8FAFC]">Your ERP configuration is incomplete.</span>
            </div>
            <button
              onClick={() => navigate('/onboarding/setup')}
              className="text-xs font-black bg-[#FF4F00] hover:bg-[#e04500] text-white px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm shadow-[#FF4F00]/25 cursor-pointer min-h-[44px]"
            >
              Resume Setup
            </button>
          </div>
        )}
        
        {/* Main body landmark scroll view */}
        <main
          id="main-scroll-container"
          ref={mainScrollContainerRef}
          data-testid="main-scroll-container"
          tabIndex={-1}
          className="nvuto-workspace flex-1 min-w-0 min-h-0 flex flex-col overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B0F19] relative transition-colors duration-200 outline-none"
        >
          <InteractiveGridBackground
            parentRef={mainScrollContainerRef}
            positionMode="fixed"
            theme="auto"
            className="pointer-events-none z-0 opacity-40"
          />
          <span id="main-content" className="sr-only" />
          <div className="nvuto-workspace-content relative z-10 flex-1 min-w-0 flex flex-col min-h-full">
            <ErrorBoundary fallbackLevel="shell" title="Workspace Error">
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Global Command Palette Overlay (⌘K) */}
      {isPaletteOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99999] flex items-start justify-center pt-[10vh] px-4">
          <div 
            className="w-full max-w-2xl max-h-[80dvh] bg-white/95 dark:bg-[#111625]/95 border border-slate-200/80 dark:border-[#232D42] rounded-xl shadow-2xl overflow-hidden flex flex-col scale-in animate-in fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Wrapper */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[#232D42]">
              <Magnifer size={20} className="text-slate-400 dark:text-[#94A3B8] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search workspaces, apps, categories... (Esc to close)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] text-base font-medium h-8 focus:ring-0 focus:border-0 focus:outline-none"
              />
              <span className="bg-slate-100 dark:bg-[#171E2E] border border-slate-200 dark:border-[#232D42] text-slate-500 dark:text-[#94A3B8] rounded px-2 py-0.5 text-sm font-bold uppercase tracking-wider select-none shrink-0">
                ESC
              </span>
            </div>

            {/* Results Body */}
            <div className="p-3 min-h-0 max-h-[380px] overflow-y-auto flex flex-col gap-1">
              <div className="px-3 py-1.5 text-sm font-bold text-[#FF4F00] uppercase tracking-wider select-none">
                {searchQuery.trim() ? "Search Results" : "Recent Workspaces"}
              </div>

              {filteredItems.length === 0 ? (
                <EmptyState title="No matching capabilities found." className="border-0 p-8" />
              ) : (
                filteredItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full px-3 py-3 rounded-xl flex items-center justify-between text-left hover:bg-[#EEF0FA] dark:hover:bg-[#171E2E] group transition-colors cursor-pointer min-h-[44px]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-[#171E2E] text-slate-900 dark:text-[#F8FAFC] flex items-center justify-center shrink-0 group-hover:bg-[#111184] dark:group-hover:bg-[#FF4F00] group-hover:text-white transition-colors">
                        <Widget2 size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] group-hover:text-[#FF4F00] dark:group-hover:text-[#FF4F00] transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-sm text-slate-400 dark:text-[#94A3B8] font-semibold truncate">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <AltArrowRight size={18} className="text-slate-350 dark:text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>

            {/* Palette Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-between text-sm text-slate-400 dark:text-[#94A3B8] font-semibold select-none">
              <span>Use ↑↓ keys to select, Enter to route</span>
              <span>⌘K to toggle</span>
            </div>
          </div>
        </div>
      )}
      {/* Product Tour Overlay */}
      <ProductTourOverlay
        steps={activeTourSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        roleName={activeRoleName}
      />

      {/* Global NVUTO HR AI Assistant FAB */}
      {!isSuperadminPath && enableAiCopilot && <HRAssistantFAB />}
    </div>
  );
};
