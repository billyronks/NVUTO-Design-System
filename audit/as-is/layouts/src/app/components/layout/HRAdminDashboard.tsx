import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  UsersGroupRounded,
  Widget2,
  CaseMinimalistic,
  DangerCircle,
  UserPlusRounded,
  Calendar,
  Global,
  AltArrowRight,
  ClockCircle,
  Speaker
} from '@solar-icons/react';
import { MetricCard } from './MetricCard';
import { SubNavTabs } from './SubNavTabs';
import { GlobalApprovalsManager } from './GlobalApprovalsManager';
import { getHRDashboardMetrics, getAuditFeed } from '../../../services/hrDashboardService';
import { getEmployees } from '../../../services/employeeService';
import { useToast } from '../../context/useToast';
import { formatDistanceToNow } from 'date-fns';
import {
  Button,
  PageHeader,
  EmptyState
} from '@/app/components/ui';
import { Skeleton } from '@/app/components/ui/skeleton';
import { UniversalDraftsTable } from '../../../components/drafts/UniversalDraftsTable';
import { AnnouncementBoard } from './AnnouncementBoard';
import { QuickActionsSection } from '../quick-actions/QuickActionsSection';
import { BatchRoleDepartmentAssignModal } from './BatchRoleDepartmentAssignModal';

export const HRAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const location = useLocation();
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/approvals')) return 'APPROVALS';
    if (path.includes('/drafts')) return 'DRAFTS';
    return 'OVERVIEW';
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    if (tab === 'APPROVALS') {
      navigate('/hr/dashboard/approvals');
    } else if (tab === 'DRAFTS') {
      navigate('/hr/dashboard/drafts');
    } else {
      navigate('/hr/dashboard');
    }
  };

  const headerMap: Record<string, { title: string; desc: string }> = {
    "OVERVIEW": {
      "title": "HR Administration Overview",
      "desc": "Review workforce metrics, monitor department status, and approve pending requests."
    },
    "APPROVALS": {
      "title": "HR Administration Approvals",
      "desc": "Approve or reject pending employee leave requests, wage advances, and profiles."
    }
  };

  // TanStack Query for dynamic overview KPIs
  const { data: dashboardRes, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['hrDashboardMetrics'],
    queryFn: getHRDashboardMetrics,
    refetchInterval: 30000,
    retry: (failureCount, error: any) => error?.status !== 403 && error?.status !== 401 && failureCount < 2,
  });
  const metrics = dashboardRes?.data;

  // TanStack Query for recent audit feed
  const { data: auditFeedRes, isLoading: isAuditFeedLoading, isError: isAuditFeedError } = useQuery({
    queryKey: ['hrDashboardAuditFeed'],
    queryFn: () => getAuditFeed(5),
    refetchInterval: 30000,
  });
  const auditFeed = auditFeedRes?.data || [];

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Check for staff members with unassigned roles or departments
  const { data: employeesRes } = useQuery({
    queryKey: ['employees', 'dashboard-unassigned-check'],
    queryFn: () => getEmployees({ limit: 100 }),
    refetchInterval: 60000,
  });
  const unassignedEmployees = useMemo(() => {
    const list = employeesRes?.data || [];
    return list.filter(
      (e) =>
        !e.jobTitle ||
        e.jobTitle.trim() === '' ||
        e.jobTitle === 'No Title' ||
        !e.department ||
        e.department.trim() === '' ||
        e.department.toLowerCase() === 'general'
    );
  }, [employeesRes]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19]">
      {/* PHASE 1: Tertiary Tabs Context */}
      <div data-tour="hr-subnav-tabs">
        <SubNavTabs
          tabs={['OVERVIEW', 'APPROVALS', 'DRAFTS']}
          defaultActiveTab="OVERVIEW"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Main Content Canvas with gap-8 spacing */}
      {activeTab === 'OVERVIEW' ? (
        <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* PHASE 2: Page Header */}
        <PageHeader
          title={headerMap[activeTab]?.title || "HR Administration Overview"}
          subtitle={headerMap[activeTab]?.desc || "Review workforce metrics, monitor department status, and approve pending requests."}
        />

        {/* Unassigned Staff Action Banner */}
        {unassignedEmployees.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50/40 dark:from-[#111625] dark:via-[#171E2E] dark:to-[#111625] border border-orange-200/80 dark:border-[#FF4F00]/30 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF4F00]/10 dark:bg-[#FF4F00]/20 text-[#FF4F00] flex items-center justify-center shrink-0">
                <CaseMinimalistic size={24} />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                    Action Required: Assign Roles & Departments
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#FF4F00] text-white">
                    {unassignedEmployees.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                  Team members created during onboarding or imported via CSV do not have an official Job Title and Department assigned.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => navigate('/hr/people?unassigned=true')}
                className="text-xs font-bold border-slate-200 dark:border-[#232D42]"
              >
                View Directory
              </Button>
              <Button
                onClick={() => setIsAssignModalOpen(true)}
                className="bg-[#FF4F00] hover:bg-[#E04500] text-white text-xs font-bold px-5 h-10 shadow-sm"
              >
                Assign Now
              </Button>
            </div>
          </div>
        )}

        {/* PHASE 2: Top KPI Metric Row */}
        <section data-tour="hr-metric-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isDashboardLoading ? (
            <>
              <Skeleton className="h-[128px] w-full bg-slate-100 dark:bg-[#171E2E] rounded-xl" />
              <Skeleton className="h-[128px] w-full bg-slate-100 dark:bg-[#171E2E] rounded-xl" />
              <Skeleton className="h-[128px] w-full bg-slate-100 dark:bg-[#171E2E] rounded-xl" />
              <Skeleton className="h-[128px] w-full bg-slate-100 dark:bg-[#171E2E] rounded-xl" />
            </>
          ) : (
            <>
              <MetricCard
                label="Total Employees"
                value={metrics?.total_employees?.toString() || "0"}
                change="Headcount in organization"
                status="ORGANIZATION"
                positive={true}
                icon={UsersGroupRounded}
              />
              <MetricCard
                label="Present Today"
                value={Math.max(metrics?.present_today ?? 0, metrics?.late_today ?? 0).toString()}
                change={`Late count: ${metrics?.late_today ?? 0}`}
                status="ATTENDANCE"
                positive={true}
                icon={Widget2}
              />
              <MetricCard
                label="Pending Onboarding"
                value={metrics?.pending_onboarding?.toString() || "0"}
                change="Pre-hire validation queue"
                status="ONBOARDING"
                positive={true}
                icon={CaseMinimalistic}
              />
              <MetricCard
                label="Pending Approvals"
                value={metrics?.pending_leave_approvals?.toString() || "0"}
                change="Action items in queue"
                status="APPROVALS"
                positive={false}
                icon={DangerCircle}
                iconClassName={metrics?.pending_leave_approvals ? "text-[#FF4F00] animate-pulse" : ""}
              />
            </>
          )}
        </section>

        {/* PHASE 4: Bottom Summary Widgets */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Card: Recent Activity */}
          <div data-tour="hr-audit-feed" className="bg-white dark:bg-[#111625] rounded-xl shadow-sm border border-slate-200 dark:border-[#232D42] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-[#232D42] pb-4 select-none">
              <div>
                <h3 className="nvuto-h3 uppercase tracking-wider">
                  Recent Activity
                </h3>
                <p className="text-sm text-slate-400 dark:text-[#94A3B8] mt-0.5">
                  Real-time HR audit log and events stream
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/hr/audit-logs')}
                className="text-sm text-[#FF4F00] font-bold hover:underline uppercase tracking-wider cursor-pointer border-0 bg-transparent h-auto p-0 hover:bg-transparent"
              >
                VIEW ALL
              </Button>
            </div>

            {/* Timeline Events List */}
            <div className="flex-1 flex flex-col gap-6 relative pl-4 border-l border-slate-150 dark:border-[#232D42] justify-center">
              {isAuditFeedLoading ? (
                <div className="flex flex-col gap-4 w-full">
                  <Skeleton className="h-10 w-full bg-slate-100 dark:bg-[#171E2E] rounded-xl animate-pulse" />
                  <Skeleton className="h-10 w-full bg-slate-100 dark:bg-[#171E2E] rounded-xl animate-pulse" />
                  <Skeleton className="h-10 w-full bg-slate-100 dark:bg-[#171E2E] rounded-xl animate-pulse" />
                </div>
              ) : isAuditFeedError ? (
                <EmptyState
                  title="Telemetry Offline"
                  description="Activity telemetry stream is currently paused."
                />
              ) : auditFeed.length === 0 ? (
                <EmptyState
                  title="No Activity"
                  description="No recent activity events recorded."
                />
              ) : (
                auditFeed.map((act) => {
                  let color = 'bg-slate-400';
                  const sev = (act.severity || '').toUpperCase();
                  if (sev === 'INFO') {
                    color = 'bg-green-500';
                  } else if (sev === 'WARNING') {
                    color = 'bg-orange-500';
                  } else if (sev === 'CRITICAL') {
                    color = 'bg-red-500';
                  }

                  let relativeTime = 'Recently';
                  try {
                    relativeTime = formatDistanceToNow(new Date(act.timestamp), { addSuffix: true });
                  } catch (e) {
                    // Fallback
                  }

                  return (
                    <div key={`${act.timestamp}:${act.event_title}`} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-[#111625] ${color}`} />
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#FF4F00] dark:group-hover:text-[#FF4F00] transition-colors leading-none">
                            {act.event_title}
                          </span>
                          <span className="text-sm text-slate-450 dark:text-[#94A3B8] mt-1 font-normal">
                            {act.event_description}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-400 dark:text-[#94A3B8] flex items-center gap-1 shrink-0 select-none">
                          <ClockCircle size={10} />
                          {relativeTime}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Card: Quick Actions Control Panel */}
          <div data-tour="hr-quick-actions" className="bg-white dark:bg-[#111625] rounded-xl shadow-sm border border-slate-200 dark:border-[#232D42] p-6 flex flex-col">
            <QuickActionsSection
              dashboardKey="hr_admin"
              title="Quick Actions"
              subtitle="Execute administrative actions and run processes"
              layout="sidebar"
              maxVisible={6}
            />
          </div>
        </section>

        {/* Announcement Board & Milestones */}
        <AnnouncementBoard />
        </div>
      ) : activeTab === 'APPROVALS' ? (
        <GlobalApprovalsManager />
      ) : (
        <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
          <UniversalDraftsTable />
        </div>
      )}

      <BatchRoleDepartmentAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
};
