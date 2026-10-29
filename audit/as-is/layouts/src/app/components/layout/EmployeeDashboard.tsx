import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  SunFog as SunFogRounded,
  CalendarMark as CalendarMarkRounded,
  Checklist as ChecklistRounded,
  NotificationUnreadLines as MegaphoneRounded,
  Confetti as ConfettiRounded,
  Book,
  Wallet,
  HeartPulse as HeartPulseRounded,
  UsersGroupTwoRounded,
  PenNewSquare as PenNewSquareRounded,
  ShieldKeyhole
} from '@solar-icons/react';
import { Card } from '@/app/components/ui/card';
import {EmployeeOnboardingRequirements} from '@/components/recruiting/EmployeeOnboardingRequirements';
import {
  Button,
  Badge,
  Avatar,
  PageHeader,
  Modal,
  Input,
  Checkbox,
  EmptyState
} from '@/app/components/ui';
import { apiClient } from '../../../lib/apiClient';
import { getEmployees } from '../../../services/employeeService';
import { OffboardingClearanceTracker } from './OffboardingClearanceTracker';
import { CompanyFeed } from './CompanyFeed';
import { useAppSelector } from '../../../store';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/useToast';
import { WelcomeHeader } from './WelcomeHeader';
import { MetricCard } from './MetricCard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { AnnouncementBoard } from './AnnouncementBoard';
import { QuickActionsSection } from '../quick-actions/QuickActionsSection';

// Custom inline ProgressBar matching NVUTO styling tokens (no text-xs)
interface ProgressBarProps {
  value: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = 'h-3.5' }) => {
  return (
    <div className={`w-full bg-slate-100 dark:bg-[#171E2E] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// Skeletons to prevent UI pop-in
const HeaderSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 mb-6">
    <Skeleton className="w-16 h-16 rounded-full" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  </div>
);

const MetricCardSkeleton: React.FC = () => (
  <Card className="bg-white dark:bg-[#111625] p-6 border border-slate-200 dark:border-[#232D42]/80 rounded-xl shadow-sm flex flex-col gap-4">
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232D42] pb-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-5 w-5" />
    </div>
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-full mt-2" />
  </Card>
);

const TaskListSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3">
    {[1, 2].map((i) => (
      <div key={i} className="p-4 border border-slate-200 dark:border-[#232D42] rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#111625]">
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-10 w-28 shrink-0" />
      </div>
    ))}
  </div>
);

const TeamStatusSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-3 w-full border-t border-slate-200 dark:border-[#232D42]/50 pt-3 first:border-t-0 first:pt-0">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#171E2E]" />
        <div className="h-4 bg-slate-200 dark:bg-[#171E2E] rounded w-1/3" />
        <div className="h-6 bg-slate-200 dark:bg-[#171E2E] rounded w-24 ml-auto" />
      </div>
    ))}
  </div>
);

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const profile = useAppSelector((state) => state.auth.profile);
  const isProfileLoading = !profile;

  // 2. Fetch leave balance from official Leave service
  const { data: leaveBalanceRes, isLoading: isLeaveLoading } = useQuery({
    queryKey: ['leaveBalance'],
    queryFn: () => apiClient.get<any>('/leave/me/balances')
  });

  // 3. Fetch next payday disbursement info
  const { data: payrollRes, isLoading: isPayrollLoading } = useQuery({
    queryKey: ['nextPayroll'],
    queryFn: () => apiClient.get<any>('/finance/payroll/next-disbursement')
  });

  // 4. Fetch pending LMS courses from official Learning service
  const { data: coursesRes, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['pendingCourses'],
    queryFn: () => apiClient.get<any>('/lms/progress/me')
  });

  // 5. Fetch unified inbox task queue
  const { data: unifiedInboxRes, isLoading: isInboxLoading, refetch: refetchInbox } = useQuery({
    queryKey: ['unifiedInbox'],
    queryFn: () => apiClient.get<any>('/tasks/unified-inbox')
  });

  // 6. Fetch team availability/attendance status
  const { data: teamStatusRes, isLoading: isTeamStatusLoading } = useQuery({
    queryKey: ['teamStatus'],
    queryFn: () => apiClient.get<any>('/hr/api/team/status')
  });

  // 7. Fetch noticeboard announcements
  const { data: homeOverviewRes, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['homeOverview'],
    queryFn: () => apiClient.get<any>('/home/overview')
  });

  // 8. Fetch LMS course delta updates (v1 completed but v2 exists)
  const { data: deltaUpdatesRes } = useQuery({
    queryKey: ['lmsDeltaUpdates'],
    queryFn: () => apiClient.get<any>('/lms/enrollments/delta-updates')
  });

  const deltaUpdates = deltaUpdatesRes?.data || deltaUpdatesRes || [];

  // 9. Fetch employee records to announce Birthdays & Work Anniversaries on the Noticeboard
  const { data: employeesRes } = useQuery({
    queryKey: ['noticeboardEmployees'],
    queryFn: () => getEmployees({ limit: 500 }),
    staleTime: 5 * 60 * 1000,
  });
  const employeeRecords = employeesRes?.data || [];

  const employeeCelebrations = useMemo(() => {
    if (!employeeRecords.length) return [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const list: Array<{
      id: string;
      type: 'birthday' | 'anniversary';
      employeeName: string;
      role: string;
      department: string;
      avatarUrl?: string;
      dayText: string;
      detailText: string;
      isToday: boolean;
    }> = [];

    employeeRecords.forEach((emp) => {
      // Birthday
      const rawDob = emp.dob || (emp as any).date_of_birth || (emp as any).birth_date;
      if (rawDob) {
        const d = new Date(rawDob);
        if (!isNaN(d.getTime())) {
          const dobMonth = d.getMonth() + 1;
          const dobDay = d.getDate();
          if (dobMonth === currentMonth) {
            const isToday = now.getDate() === dobDay;
            list.push({
              id: `bday-${emp.id}`,
              type: 'birthday',
              employeeName: `${emp.firstName} ${emp.lastName}`,
              role: emp.jobTitle || 'Team Member',
              department: emp.department || 'Staff',
              avatarUrl: emp.profilePictureUrl || emp.profile_picture_url || undefined,
              dayText: isToday ? 'TODAY 🎉' : `Day ${dobDay}`,
              detailText: `Celebrating their Birthday this month! 🎂`,
              isToday
            });
          }
        }
      }

      // Work Anniversary
      const rawStartDate = emp.startDate || (emp as any).start_date || (emp as any).hire_date;
      if (rawStartDate) {
        const d = new Date(rawStartDate);
        if (!isNaN(d.getTime())) {
          const startYear = d.getFullYear();
          const startMonth = d.getMonth() + 1;
          const startDay = d.getDate();
          if (startMonth === currentMonth && currentYear > startYear) {
            const years = currentYear - startYear;
            const isToday = now.getDate() === startDay;
            list.push({
              id: `anniv-${emp.id}`,
              type: 'anniversary',
              employeeName: `${emp.firstName} ${emp.lastName}`,
              role: emp.jobTitle || 'Team Member',
              department: emp.department || 'Staff',
              avatarUrl: emp.profilePictureUrl || emp.profile_picture_url || undefined,
              dayText: isToday ? 'TODAY 🎊' : `Day ${startDay}`,
              detailText: `${years} Year${years > 1 ? 's' : ''} Work Anniversary Milestone! 🥳`,
              isToday
            });
          }
        }
      }
    });

    return list.sort((a, b) => (b.isToday ? 1 : 0) - (a.isToday ? 1 : 0));
  }, [employeeRecords]);

  // Signature modal state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [signatureInitials, setSignatureInitials] = useState('');

  // Signature POST mutation
  const signMutation = useMutation({
    mutationFn: ({ taskId, initials }: { taskId: string; initials: string }) =>
      apiClient.post<any>(`/tasks/unified-inbox/${taskId}/sign`, {
        typed_confirmation: initials,
        consent_text: 'I hereby confirm that I have read, understood, and agreed to the document guidelines and terms.'
      }),
    onSuccess: () => {
      refetchInbox();
      addToast('success', 'Document E-Signed', 'Document successfully e-signed and recorded in forensic audit log.');
      setShowSignModal(false);
    },
    onError: (err: any) => {
      addToast('error', 'Signing Failed', err.message || 'Failed to sign document.');
    }
  });

  // Derive unified dataset
  const user = profile;
  const leave = leaveBalanceRes?.data || leaveBalanceRes;
  const nextPay = payrollRes?.data || payrollRes;
  const courses = coursesRes?.data || coursesRes;
  const tasks = unifiedInboxRes?.data || unifiedInboxRes || [];
  const teamStatus = teamStatusRes?.data || teamStatusRes || [];
  const announcements = homeOverviewRes?.data?.announcements || homeOverviewRes?.announcements || [];
  
  const liveAnnouncements = useMemo(() => {
    const tId = profile?.tenantId || profile?.tenant_id || 'default-tenant';
    const stored = localStorage.getItem(`nvuto_announcements_${tId}`);
    if (!stored) {
      return announcements;
    }
    try {
      const list = JSON.parse(stored);
      const userDept = profile?.profile?.department || '';
      const userLoc = profile?.profile?.location || '';
      const now = new Date();
      
      const filtered = list.filter((ann: any) => {
        if (ann.status !== 'Published') return false;
        const pDate = new Date(ann.publish_date);
        const eDate = new Date(ann.expiry_date);
        if (now < pDate || now > eDate) return false;

        if (ann.visibility === 'All Employees') return true;
        if (ann.visibility === 'Specific Departments') {
          return ann.targets.some((d: string) => userDept.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(userDept.toLowerCase()));
        }
        if (ann.visibility === 'Specific Locations') {
          return ann.targets.some((l: string) => userLoc.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(userLoc.toLowerCase()));
        }
        return false;
      });

      // If no local published announcements match, fallback to seeded overview list
      return filtered.length > 0 ? filtered : announcements;
    } catch (e) {
      return announcements;
    }
  }, [profile, announcements]);

  const noticeboardItems = useMemo(() => {
    const celebrationPosts = employeeCelebrations.map((c) => ({
      category: c.type === 'birthday' ? 'BIRTHDAY 🎂' : 'WORK ANNIVERSARY 🎊',
      title: c.type === 'birthday'
        ? `Happy Birthday, ${c.employeeName}! 🎉`
        : `Work Anniversary: ${c.employeeName}! 🥳`,
      message: c.type === 'birthday'
        ? `Wishing ${c.employeeName} (${c.role}, ${c.department}) a fantastic Birthday ${c.isToday ? 'today!' : 'this month!'}`
        : `Celebrating ${c.employeeName}'s ${c.detailText} (${c.department})!`,
      isCelebration: true,
      isToday: c.isToday,
      badgeVariant: (c.type === 'birthday' ? 'warning' : 'success') as 'warning' | 'success' | 'info' | 'neutral'
    }));

    return [...celebrationPosts, ...liveAnnouncements];
  }, [employeeCelebrations, liveAnnouncements]);

  // Greeting derivations
  const userName = profile?.profile?.first_name || 'User';
  const deptName = profile?.profile?.department || 'Staff';

  // Live formatted date
  const liveDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // Payday Calculations
  const paydayText = useMemo(() => {
    const rawDate = nextPay?.date || nextPay?.disbursement_date || nextPay?.payment_date;
    if (!rawDate) return 'Not Scheduled';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(rawDate));
  }, [nextPay]);

  const relativePayday = useMemo(() => {
    const rawDate = nextPay?.date || nextPay?.disbursement_date || nextPay?.payment_date;
    if (!rawDate) return '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(rawDate);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'TODAY';
    if (diffDays < 0) return 'PAST DUE';
    return `IN ${diffDays} DAYS`;
  }, [nextPay]);

  // Leave calculations dynamically computed from official microservice values
  const availableDays = Math.max(0, leave?.annual_leave?.available ?? leave?.remaining_days ?? 0);
  const utilizedDays = leave?.ytd_total_utilized ?? leave?.utilized_days ?? 0;
  const totalDays = leave?.annual_leave?.accrued_total ?? leave?.total_entitlement ?? (availableDays + (leave?.annual_leave?.taken ?? 0));
  const leaveProgress = totalDays > 0 ? (availableDays / totalDays) * 100 : 0;

  // Course calculations dynamically filtered from active learning enrollments
  const pendingCourses = useMemo(() => {
    const rawCourses = coursesRes?.data || coursesRes;
    if (!Array.isArray(rawCourses)) return [];
    return rawCourses.filter((c: any) => c.status?.toLowerCase() !== 'completed');
  }, [coursesRes]);

  const pendingCount = pendingCourses.length;
  const courseDetail = pendingCourses.length > 0
    ? `Next up: ${pendingCourses[0]?.course || pendingCourses[0]?.title}`
    : 'LMS up to date';

  // Find high priority signature tasks for banner alerts
  const highPriorityTask = useMemo(() => {
    return tasks.find((t: any) => t.priority === 'HIGH' && t.type === 'SIGNATURE');
  }, [tasks]);

  const handleSignSubmit = () => {
    if (!agreeChecked) {
      addToast('warning', 'Agreement Required', 'Please check the box to acknowledge and agree to the guidelines.');
      return;
    }
    if (!signatureInitials.trim()) {
      addToast('warning', 'Initials Required', 'Please type your initials to electronically sign the document.');
      return;
    }
    if (selectedTask) {
      signMutation.mutate({ taskId: selectedTask.id, initials: signatureInitials });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('LEAVE') || s.includes('AWAY')) return 'warning';
    if (s.includes('REMOTE') || s.includes('HOME')) return 'info';
    return 'success';
  };

  return (
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <EmployeeOnboardingRequirements />
      {/* High-priority orange compliance banner */}
      {highPriorityTask && (
        <div className="mb-6 p-5 bg-gradient-to-r from-orange-500 to-amber-600 border border-orange-400 text-white rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none animate-pulse">
          <div className="flex items-center gap-3">
            <PenNewSquareRounded size={24} className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-base font-bold">Pending Signature Required</span>
              <span className="text-sm text-orange-100 mt-0.5">
                You have a compliance document <strong>{highPriorityTask.title}</strong> awaiting your signature.
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedTask(highPriorityTask);
              setAgreeChecked(false);
              setSignatureInitials('');
              setShowSignModal(true);
            }}
            className="bg-white dark:bg-[#111625] hover:bg-slate-50 !text-orange-600 font-bold shrink-0 border-0 h-10 px-4 text-sm shadow-xs"
          >
            Review & Sign
          </Button>
        </div>
      )}
      {/* LMS Delta Updates alerts (<DeltaUpdateWidget/>) */}
      {deltaUpdates && deltaUpdates.map((delta: any) => (
        <div key={delta.enrollment_id} className="mb-6 p-5 bg-gradient-to-r from-[#111184] to-indigo-900 border border-indigo-700 text-white rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
          <div className="flex items-center gap-3">
            <Book className="text-[#FF4F00] shrink-0" size={24} />
            <div className="flex flex-col">
              <span className="text-base font-bold">Course Update Available (Delta)</span>
              <span className="text-sm text-indigo-100 mt-0.5 font-semibold">
                {delta.delta_message} - Review the updated curriculum to maintain compliance.
              </span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/me/learning')}
            className="bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 font-bold shrink-0 h-10 px-4 text-sm shadow-sm cursor-pointer"
          >
            Start Delta Update
          </Button>
        </div>
      ))}

      {/* Offboarding Clearance Tracker (Contextually mounts if employee is in notice period) */}
      <OffboardingClearanceTracker />

      {/* PHASE 1: Welcome Header */}
      {isProfileLoading ? (
        <HeaderSkeleton />
      ) : (
        <div data-tour="emp-welcome-banner">
          <WelcomeHeader
            userName={userName}
            department={deptName}
            dateText={liveDate}
          />
        </div>
      )}

      {/* MANAGER DYNAMIC OVERLAY: Team Approvals & Direct Reports Header (when user holds Manager role) */}
      {(() => {
        const baseRole = (user?.role || '').toLowerCase().replace(/[\s_]+/g, '_');
        const rolesArr = (user?.roles || (user as any)?.roleClaims || []).map((r: string) => String(r).toLowerCase().replace(/[\s_]+/g, '_'));
        const isManagerRole = baseRole === 'manager' || rolesArr.includes('manager');

        if (!isManagerRole) return null;

        return (
          <div className="mb-8 p-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232D42] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <UsersGroupTwoRounded size={22} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider">
                    Team Management & Approval Queue
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                    Dynamic Manager Overlay: Direct Reports, Team Leave Requests, and Approval Workflows
                  </p>
                </div>
              </div>
              <Badge variant="neutral" className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs uppercase">
                Manager Role Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => navigate('/team/approvals')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-[#232D42] hover:border-purple-300 dark:hover:border-purple-800 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-bold uppercase tracking-wider">Pending Team Approvals</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">Review Requests</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs font-bold">View Queue</Button>
              </div>

              <div
                onClick={() => navigate('/team/performance')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-[#232D42] hover:border-purple-300 dark:hover:border-purple-800 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-bold uppercase tracking-wider">Team Performance</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">OKRs & Reviews</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs font-bold">Open Hub</Button>
              </div>

              <div
                onClick={() => navigate('/team-timesheets')}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-[#232D42] hover:border-purple-300 dark:hover:border-purple-800 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-bold uppercase tracking-wider">Team Timesheets</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">Timesheet Review</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs font-bold">Timesheets</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PHASE 2: Stat Cards Grid */}
      <div data-tour="emp-clock-widget" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none">
        {/* Leave Balance Card */}
        {isLeaveLoading ? (
          <MetricCardSkeleton />
        ) : (
          <div data-tour="emp-leave-balances" className="w-full">
            <MetricCard
              label="Annual Leave"
              value={`${availableDays} Days Available`}
              change={`Out of ${totalDays} total days`}
              status="LEAVE"
              positive={true}
              icon={CalendarMarkRounded}
              iconClassName="text-blue-500"
              valueClassName="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-none"
              variant="neutral"
              extra={<ProgressBar value={leaveProgress} className="h-3.5 mt-3" />}
            />
          </div>
        )}

        {/* Payday Card */}
        {isPayrollLoading ? (
          <MetricCardSkeleton />
        ) : (
          <div data-tour="emp-ewa-wallet" className="w-full">
            <MetricCard
              label="Next Payroll"
              value={paydayText}
              change=""
              status={relativePayday || 'PAYROLL'}
              positive={true}
              icon={Wallet}
              iconClassName="text-emerald-500"
              valueClassName="text-xl font-bold text-slate-800 dark:text-[#F8FAFC] leading-none"
              variant="success"
            />
          </div>
        )}

        {/* LMS Card */}
        {isCoursesLoading ? (
          <MetricCardSkeleton />
        ) : (
          <MetricCard
            label="Learning Academy"
            value={`${pendingCount} Pending Course${pendingCount === 1 ? '' : 's'}`}
            change={courseDetail}
            status={pendingCount === 0 ? 'UP TO DATE' : 'LEARNING'}
            positive={pendingCount === 0}
            icon={Book}
            iconClassName="text-orange-500"
            valueClassName="text-xl font-bold text-orange-600 dark:text-orange-400 leading-none"
            variant={pendingCount === 0 ? 'success' : 'warning'}
          />
        )}
      </div>

      {/* PHASE 2.5: Employee Self-Service Quick Actions Bar */}
      <QuickActionsSection
        dashboardKey="employee"
        title="Quick Actions"
        subtitle="Self-service shortcuts for leave, attendance, payslips, and claims"
        className="mb-8"
        maxVisible={8}
      />

      {/* PHASE 3: Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Unified Action Center & noticeboard) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Action Items Panel */}
          <div data-tour="emp-tasks-checklist">
            <Card className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42]/80 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#232D42] pb-3.5 select-none">
              <ChecklistRounded className="text-[#FF4F00] w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                Requires Your Attention
              </h2>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {isInboxLoading ? (
                <TaskListSkeleton />
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={ShieldKeyhole}
                  title="All Caught Up!"
                  description="You have no pending tasks, surveys, or signatures waiting for your action."
                />
              ) : (
                tasks.map((task: any) => (
                  <div key={task.id} className="p-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] leading-relaxed">
                        {task.title}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-[#94A3B8] font-semibold leading-none">
                        {task.description || 'Action required'}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        if (task.type === 'SIGNATURE') {
                          setSelectedTask(task);
                          setAgreeChecked(false);
                          setSignatureInitials('');
                          setShowSignModal(true);
                        } else {
                          navigate(task.action_url || task.actionUrl || '/');
                        }
                      }}
                      className="bg-blue-650 hover:bg-blue-750 text-white border-0 shadow-sm shrink-0"
                    >
                      {task.type === 'SIGNATURE' ? 'Review & Sign' : task.type === 'SURVEY' ? 'Take Survey' : 'Start Evaluation'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
          </div>

          {/* Announcements & Celebrations Noticeboard */}
          <AnnouncementBoard />

          {/* Company Activity Feed */}
          <div className="flex flex-col gap-4 mt-6">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider select-none">
              Company Activity Feed
            </h2>
            <CompanyFeed />
          </div>
        </div>

        {/* Right Column (Team Sidebar status) */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-[92px]">
          <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-[#232D42]/60 pb-3.5 select-none">
              <CalendarMarkRounded className="text-[#FF4F00] w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                Team Status
              </h2>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {isTeamStatusLoading ? (
                <TeamStatusSkeleton />
              ) : teamStatus.length === 0 ? (
                <span className="text-sm text-slate-450 italic select-none">All team members status active.</span>
              ) : (
                teamStatus.map((peer: any, idx: number) => (
                  <div key={peer.id || idx} className="flex items-center gap-3 w-full border-t border-slate-200 dark:border-[#232D42]/50 pt-3 first:border-t-0 first:pt-0">
                    <Avatar name={peer.name || peer.fullName} size="sm" />
                    <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] leading-none">
                      {peer.name || peer.fullName}
                    </span>
                    <Badge className="ml-auto text-sm shrink-0 uppercase" variant={getStatusBadgeVariant(peer.status)}>
                      {peer.statusText || peer.status || 'Active'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Compliance e-Signature Modal */}
      {showSignModal && selectedTask && (
        <Modal isOpen={showSignModal} onClose={() => setShowSignModal(false)}>
          <div className="flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19] flex justify-between items-center select-none">
              <h3 className="text-lg font-bold text-slate-850 flex items-center gap-2">
                <PenNewSquareRounded className="text-orange-600" />
                Review & E-Sign Compliance Document
              </h3>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] leading-relaxed">
                  {selectedTask.title}
                </span>
                <span className="text-sm text-slate-500 dark:text-[#94A3B8]">
                  Dispatched: {selectedTask.dispatched_at || selectedTask.dispatchedAt || 'Today'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl max-h-[180px] overflow-y-auto text-sm text-slate-655 leading-relaxed scrollbar-thin flex flex-col gap-2">
                <p>
                  This document requires your official signature to ensure compliance with company regulations and data security policy.
                </p>
                <p>
                  By signing this agreement, you confirm that you adhere to all guidelines, keep data confidential, and report security events promptly.
                </p>
                <div className="text-xs text-slate-600 dark:text-[#94A3B8] bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                  <span className="shrink-0 text-base">🛡️</span>
                  <span><strong>Forensic Audit Notice:</strong> Submitting this digital confirmation records your verified session identity, user ID, client IP address, and server timestamp in the authoritative compliance audit log.</span>
                </div>
              </div>

              <div className="flex items-start mt-2 select-none">
                 <Checkbox
                   id="agree-check-dash"
                   checked={agreeChecked}
                   onChange={(e) => setAgreeChecked(e.target.checked)}
                   label="I hereby confirm that I have read, understood, and agreed to the document guidelines and terms."
                   className="mt-0.5"
                 />
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] uppercase">
                  Type Initials to Sign
                </span>
                <Input
                  placeholder="Type initials..."
                  type="text"
                  value={signatureInitials}
                  onChange={(e) => setSignatureInitials(e.target.value)}
                  className="h-10 text-base"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-end gap-3 select-none">
              <Button
                variant="outline"
                onClick={() => setShowSignModal(false)}
                className="h-11 min-h-[44px] px-5 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#111625] rounded-lg cursor-pointer"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleSignSubmit}
                disabled={signMutation.isPending}
                className="h-11 min-h-[44px] px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white border-0 shadow-sm rounded-lg cursor-pointer disabled:opacity-50"
              >
                {signMutation.isPending ? 'Signing...' : 'Sign Contract'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeDashboard;
