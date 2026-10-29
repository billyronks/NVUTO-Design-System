import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PenNewSquare as PenNewSquareRounded,
  WadOfMoney as WadOfMoneyRounded,
  UsersGroupTwoRounded,
  DangerTriangle as DangerTriangleRounded,
  ChartSquare as ChartSquareRounded,
  ShieldCheck as ShieldCheckRounded,
  CheckCircle as CheckCircleRounded,
  Restart as RefreshRounded
} from '@solar-icons/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import {
  Button,
  Badge,
  TableWrapper,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableLoadingSkeleton,
  TableEmptyState,
  EmptyState
} from '@/app/components/ui';
import { MetricCard } from './MetricCard';
import { AnnouncementBoard } from './AnnouncementBoard';
import { QuickActionsSection } from '../quick-actions/QuickActionsSection';
import { useToast } from '../../context/useToast';
import { WelcomeHeader } from './WelcomeHeader';
import { format } from 'date-fns';
import { useAppSelector } from '../../../store';
import { useAuth } from '../../context/AuthContext';
import {
  getBoardAggregates,
  getWellbeingRisk,
  getCultureLeaveAnalytics,
  getPendingRequisitions,
  notifyManagersOfBurnout,
  getExecutiveActivityLog,
  postExecutiveActivityLog,
  getHeadcountTrends
} from '../../../services/executiveService';
import { authorizePayrollPayout } from '../../../services/payrollExecutiveService';
import {
  approveRequisition,
  rejectRequisition
} from '../../../services/requisitionService';
import { listPayrollRuns } from '../../../services/payrollService';
import { getDepartmentHealth } from '../../../services/leaveService';

// -------------------------------------------------------------
// Custom inline ProgressBar matching NVUTO styling tokens (no text-xs)
// -------------------------------------------------------------
interface ProgressBarProps {
  value: number;
  className?: string;
  indicatorColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  indicatorColor = 'bg-[#111184]'
}) => {
  const cappedValue = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-slate-200 dark:bg-[#171E2E] rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${indicatorColor}`}
        style={{ width: `${cappedValue}%` }}
      />
    </div>
  );
};

export const CEODashboard: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // Authenticated User & Dynamic Identity
  const profile = useAppSelector((state) => state.auth.profile);
  const { user: authUser } = useAuth();
  const userName = profile?.profile?.first_name || authUser?.fullName || 'Executive';
  const executiveFullName = profile?.profile?.first_name 
    ? `${profile.profile.first_name}${profile.profile.last_name ? ' ' + profile.profile.last_name : ''}` 
    : (authUser?.fullName || 'Authorized Signatory');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');
  const currentMonthYear = format(new Date(), 'MMMM yyyy');

  // React Query: Fetch payroll runs to get the active cycle and status
  const { data: payrollRunsRes } = useQuery({
    queryKey: ['payroll', 'runs'],
    queryFn: () => listPayrollRuns({ limit: 5 })
  });
  const payrollRuns = payrollRunsRes?.data || [];
  const activePayrollRun = payrollRuns.find((r: any) => {
    const s = (r.status || '').toUpperCase();
    return s === 'PENDING_MD_APPROVAL' || s === 'DRAFT' || s === 'COMPUTED' || s === 'APPROVED';
  }) || payrollRuns[0];
  const activePayrollCycle = activePayrollRun?.period || currentMonthYear;

  // Derived authorization status from active payroll run
  const isPayrollAuthorized = useMemo(() => {
    if (!activePayrollRun) return false;
    const status = (activePayrollRun.status || '').toUpperCase();
    return (
      status === 'READY_FOR_EXECUTION' ||
      status === 'APPROVED' ||
      status === 'EXECUTED' ||
      status === 'PAID' ||
      status === 'DISBURSED' ||
      status === 'COMPLETED' ||
      Boolean((activePayrollRun as any)?.md_approved_at)
    );
  }, [activePayrollRun]);
  const [showSignModal, setShowSignModal] = useState(false);

  // React Query: Fetch pending requisitions
  const { data: requisitionsResponse } = useQuery({
    queryKey: ['executive', 'requisitions'],
    queryFn: getPendingRequisitions
  });

  const requisitions = useMemo(() => {
    if (!requisitionsResponse?.data) return [];
    return requisitionsResponse.data.map((req: any) => ({
      id: req.id,
      title: req.title,
      department: req.submitted_by?.department || 'Operations',
      amount: req.amount_kobo / 100,
      status: 'PENDING' as const
    }));
  }, [requisitionsResponse]);

  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // State for Burnout Alerts
  const [notifiedManagers, setNotifiedManagers] = useState(false);

  // React Query: Fetch executive activity log
  const { data: activityLogRes, isLoading: loadingActivities } = useQuery({
    queryKey: ['executive', 'activities'],
    queryFn: getExecutiveActivityLog
  });
  const activities = activityLogRes?.data || [];

  // React Query: Fetch board aggregates, wellbeing risk, and culture analytics
  const { data: boardAggregatesRes } = useQuery({
    queryKey: ['executive', 'boardAggregates'],
    queryFn: getBoardAggregates
  });

  const { data: wellbeingRiskRes } = useQuery({
    queryKey: ['executive', 'wellbeingRisk'],
    queryFn: getWellbeingRisk
  });

  const { data: cultureLeaveRes } = useQuery({
    queryKey: ['executive', 'cultureLeave'],
    queryFn: getCultureLeaveAnalytics
  });

  // React Query: Fetch headcount trends
  const { data: headcountTrendsRes } = useQuery({
    queryKey: ['executive', 'headcountTrends'],
    queryFn: getHeadcountTrends
  });
  const headcountTrends = headcountTrendsRes?.data || [];
  const latestTrend = headcountTrends.length > 0 ? headcountTrends[headcountTrends.length - 1] : null;
  const headcountChangeText = latestTrend 
    ? (latestTrend.net_change >= 0 ? `+${latestTrend.net_change} Net change this period` : `${latestTrend.net_change} Net change this period`)
    : '+0 New Hires this month';

  // React Query: Fetch department health for Organizational Pulse
  const { data: deptHealthRes } = useQuery({
    queryKey: ['leave', 'departmentHealth'],
    queryFn: getDepartmentHealth
  });
  const departmentList = deptHealthRes?.data || [];

  const aggregates = boardAggregatesRes?.data;
  const wellbeing = wellbeingRiskRes?.data;
  const culture = cultureLeaveRes?.data;

  // Derived Calculations
  const monthlyBurnRate = aggregates?.monthly_burn_rate_ngn ?? 0;
  const payrollTotalNet = activePayrollRun?.net_amount_kobo
    ? activePayrollRun.net_amount_kobo / 100
    : monthlyBurnRate;
  const activeWorkforceCount = aggregates?.active_employee_count ?? 0;
  const burnoutRiskCount = wellbeing?.critical_hoarders_count ?? 0;

  const totalDeptEmployees = useMemo(() => {
    return departmentList.reduce((acc: number, d: any) => acc + (d.employee_count || 0), 0) || activeWorkforceCount || 1;
  }, [departmentList, activeWorkforceCount]);

  // Department colors palette
  const deptColors = ['bg-[#111184]', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500'];

  // Formatting Helper
  const formatCurrency = (val: number) => {
    if (!val || val === 0) return '₦0';
    return '₦' + val.toLocaleString('en-NG');
  };

  // Button Actions
  const handleDownloadBoardReport = () => {
    setIsDownloadingReport(true);
    try {
      const reportLines = [
        '====================================================',
        '       NVUTO ENTERPRISE - EXECUTIVE BOARD REPORT    ',
        '====================================================',
        `Generated: ${format(new Date(), 'PPPPpp')}`,
        `Signatory / Executive: ${executiveFullName} (CEO)`,
        '',
        '--- EXECUTIVE METRICS OVERVIEW ---',
        `Active Workforce:      ${activeWorkforceCount} Employees`,
        `Monthly Burn Rate:     ${formatCurrency(monthlyBurnRate)}`,
        `Workforce Net Growth:  ${headcountChangeText}`,
        `Burnout Watchlist:     ${burnoutRiskCount} Employees At Risk`,
        `Pending Requisitions:  ${requisitions.length} High-Value Requests`,
        '',
        '--- PAYROLL DISBURSEMENT STATUS ---',
        `Active Payroll Cycle:  ${activePayrollCycle}`,
        `Cycle Authorization:   ${isPayrollAuthorized ? 'AUTHORIZED & SIGNED' : 'PENDING EXECUTIVE SIGNATURE'}`,
        `Net Payroll Liability: ${formatCurrency(payrollTotalNet)}`,
        '',
        '--- ORGANIZATIONAL DEPARTMENT METRICS ---',
        departmentList.length > 0
          ? departmentList.map((d: any) => `* ${d.department}: ${d.employee_count} Employees (Utilization: ${d.avg_utilization}%, Score: ${d.wellbeing_score})`).join('\n')
          : 'No department metrics available.',
        '',
        '====================================================',
        'CONFIDENTIAL & PROPRIETARY — STRICTLY FOR BOARD AUDIT',
        '===================================================='
      ].join('\n');

      const reportBlob = new Blob([reportLines], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Executive_Board_Report_${format(new Date(), 'yyyy_MM_dd')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      addToast('success', 'Download Complete', 'Executive Board Report generated and downloaded successfully.');
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleOpenSignModal = () => {
    if (isPayrollAuthorized) {
      addToast('warning', 'Already Authorized', `${activePayrollCycle} Payroll is already authorized and approved.`);
      return;
    }
    if (!activePayrollRun?.id) {
      addToast('warning', 'No Run Found', 'No active payroll run available to authorize.');
      return;
    }
    setShowSignModal(true);
  };

  const logMutation = useMutation({
    mutationFn: postExecutiveActivityLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executive', 'activities'] });
    }
  });

  const authorizePayrollMutation = useMutation({
    mutationFn: async () => {
      if (!activePayrollRun?.id) throw new Error('No active payroll run selected for authorization');
      return authorizePayrollPayout(activePayrollRun.id, {
        notes: `Authorized net disbursement of ${activePayrollCycle} Payroll by CEO`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'runs'] });
      queryClient.invalidateQueries({ queryKey: ['executive', 'activities'] });
      logMutation.mutate({
        action: `${activePayrollCycle} Global Payroll Authorized`,
        details: `Authorized net disbursement of ${formatCurrency(payrollTotalNet || monthlyBurnRate)}`,
        status: 'SUCCESS'
      });
      setShowSignModal(false);
      addToast('success', 'Payroll Authorized', `Successful executive payout authorization applied to ${activePayrollCycle} Payroll.`);
    },
    onError: (err: any) => {
      addToast('error', 'Authorization Failed', err.message || 'Failed to authorize payroll run.');
    }
  });

  const handleConfirmSignature = () => {
    authorizePayrollMutation.mutate();
  };

  const handleReviewRequisition = (req: any) => {
    if (req.status !== 'PENDING') {
      addToast('warning', 'Request Handled', `This request has already been ${req.status.toLowerCase()}.`);
      return;
    }
    setSelectedReq(req);
  };

  const decideReqMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      if (status === 'APPROVED') {
        return approveRequisition(id, { comment: 'Approved by CEO' });
      } else {
        return rejectRequisition(id, { reason: 'Rejected by CEO' });
      }
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['executive', 'requisitions'] });
      logMutation.mutate({
        action: `${variables.status === 'APPROVED' ? 'Approved' : 'Rejected'} Requisition: ${selectedReq?.title}`,
        details: `Requested by ${selectedReq?.department} • Amount: ${formatCurrency(selectedReq?.amount || 0)}`,
        status: variables.status === 'APPROVED' ? 'SUCCESS' : 'WARNING'
      });
      addToast('success', 'Requisition Updated', `Requisition for ${selectedReq?.title} has been ${variables.status.toLowerCase()}.`);
      setSelectedReq(null);
    },
    onError: (err: any) => {
      addToast('error', 'Requisition Update Failed', err.message || 'Failed to update requisition on the server.');
    }
  });

  const handleApproveRequisition = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedReq) return;
    decideReqMutation.mutate({ id: selectedReq.id, status });
  };

  const notifyManagersMutation = useMutation({
    mutationFn: (departmentHeads: string[]) => notifyManagersOfBurnout({ department_heads: departmentHeads }),
    onSuccess: () => {
      setNotifiedManagers(true);
      addToast('success', 'Notifications Dispatched', 'Alert notification emails dispatched to respective department heads regarding burnout risks.');
    },
    onError: (err: any) => {
      addToast('error', 'Notification Failed', err.message || 'Failed to notify department heads.');
    }
  });

  const handleNotifyManagers = () => {
    if (notifiedManagers) return;
    const departments = Array.from(
      new Set(
        (culture?.leaveHoarders || [])
          .map((h: any) => h.department)
          .filter((d: string) => d && d !== '')
      )
    );
    notifyManagersMutation.mutate(departments.length > 0 ? departments : ['Engineering', 'Product']);
  };

  return (
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start bg-[#F8FAFC] dark:bg-[#0B0F19]">
      
      {/* PHASE 1: Welcome Header & Executive KPIs */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        
        {/* Welcome Block */}
        <WelcomeHeader
          userName={userName}
          subtitle={`${todayFormatted} • Executive Overview`}
        />

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            leftIcon={isDownloadingReport ? RefreshRounded : undefined}
            isLoading={isDownloadingReport}
            onClick={handleDownloadBoardReport}
            className="h-11 px-5 text-sm font-bold text-slate-800 dark:text-[#F8FAFC] border-slate-350 hover:bg-slate-50 dark:bg-[#0B0F19] shadow-sm"
          >
            {isDownloadingReport ? 'Preparing Report...' : 'Download Board Report'}
          </Button>
        </div>
      </div>

      {/* Responsive Grid of 4 Metric Cards */}
      <div data-tour="ceo-health-banner" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Metric 1: Executive Signatures */}
        <MetricCard
          label="Pending Authorization"
          value={isPayrollAuthorized ? "0 Pending Items" : "1 Critical Item"}
          change={isPayrollAuthorized ? "All items signed off" : `${activePayrollCycle} payroll queue awaiting e-sign`}
          status={isPayrollAuthorized ? "COMPLETED" : `${activePayrollCycle.toUpperCase()} PAYROLL`}
          positive={isPayrollAuthorized}
          icon={PenNewSquareRounded}
          iconClassName="text-orange-500"
          valueClassName="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]"
          variant={isPayrollAuthorized ? "success" : "warning"}
        />

        {/* Metric 2: Financial Pulse */}
        <MetricCard
          label="Monthly Burn Rate"
          value={formatCurrency(monthlyBurnRate)}
          change={monthlyBurnRate > 0 ? "Tracking against active run" : "Tracking on budget"}
          status="BUDGET"
          positive={true}
          icon={WadOfMoneyRounded}
          iconClassName="text-blue-500"
          valueClassName="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]"
          variant="success"
        />

        {/* Metric 3: Headcount */}
        <MetricCard
          label="Active Workforce"
          value={`${activeWorkforceCount} Employees`}
          change={headcountChangeText}
          status="HEADCOUNT"
          positive={true}
          icon={UsersGroupTwoRounded}
          iconClassName="text-purple-500"
          valueClassName="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]"
          variant="neutral"
        />

        {/* Metric 4: Org Health */}
        <MetricCard
          label="Burnout Risk"
          value={`${burnoutRiskCount} Employees`}
          change="High leave accrual without PTO"
          status="BURNOUT RISK"
          positive={false}
          icon={DangerTriangleRounded}
          iconClassName="text-rose-500"
          valueClassName="text-2xl font-bold text-rose-600 dark:text-rose-400"
          variant="critical"
        />
      </div>

      {/* PHASE 1.5: Executive Quick Actions Bar */}
      <QuickActionsSection
        dashboardKey="ceo"
        title="Executive Quick Actions"
        subtitle="Direct executive authorizations, requisitions, signatures, and board reporting"
        className="mb-8"
        maxVisible={6}
      />

      {/* PHASE 2: Dashboard Layout (Asymmetrical Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (col-span-8): Signatures, Requisitions, and Logs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Card 1: Executive Signature Center */}
          <div data-tour="ceo-approval-escalations">
            <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] shadow-sm rounded-xl flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#232D42] pb-3 select-none">
                <PenNewSquareRounded className="text-slate-800 dark:text-[#F8FAFC] w-5 h-5 shrink-0" />
                <h3 className="text-base font-extrabold text-slate-850 uppercase tracking-wider leading-relaxed">
                  Requires Executive Authorization
                </h3>
              </div>

              {/* Signature Queue */}
              <div className="flex flex-col gap-4 mt-4">
                <div className="p-5 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                      <WadOfMoneyRounded size={36} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] leading-normal">
                        {activePayrollCycle} Global Payroll
                      </span>
                      <span className="text-base text-slate-700 dark:text-[#F8FAFC] block mt-1 leading-normal">
                        Net Disbursement: {payrollTotalNet > 0 ? formatCurrency(payrollTotalNet) : (monthlyBurnRate > 0 ? formatCurrency(monthlyBurnRate) : 'Pending Verification')} • Verified by Finance
                      </span>
                    </div>
                  </div>

                  {!isPayrollAuthorized ? (
                    <Button
                      type="button"
                      onClick={handleOpenSignModal}
                      className="bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white w-full md:w-auto font-bold h-11 min-h-[44px] px-5 text-base shadow-sm border-0 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheckRounded size={18} />
                      Review & Authorize
                    </Button>
                  ) : (
                    <Badge variant="success" className="h-10 px-4 flex items-center font-bold text-base select-none shrink-0">
                      AUTHORIZED & COMPLETED
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Card 2: High-Value Requisitions */}
          <div data-tour="ceo-okr-scorecard">
            <Card className="p-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-sm rounded-xl flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#232D42] pb-3 select-none">
                <ChartSquareRounded className="text-slate-850 w-5 h-5 shrink-0" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                  Strategic Capital Approvals (&gt; ₦1M)
                </h3>
              </div>

              {/* Requisition List */}
              <div className="flex flex-col gap-4 mt-4">
                {requisitions.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
                    No pending strategic requisitions requiring CEO approval.
                  </div>
                ) : (
                  requisitions.map(req => (
                    <div
                      key={req.id}
                      className="p-4 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
                          {req.title}
                        </span>
                        <span className="text-base text-slate-600 dark:text-[#94A3B8] mt-0.5">
                          Requested by {req.department} • Amount: {formatCurrency(req.amount)}
                        </span>
                      </div>

                      {req.status === 'PENDING' ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleReviewRequisition(req)}
                          className="border-slate-300 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:bg-[#171E2E] font-bold text-base h-10 px-4 select-none shrink-0"
                        >
                          Review Request
                        </Button>
                      ) : (
                        <Badge variant={req.status === 'APPROVED' ? 'success' : 'danger'} className="h-9 px-3.5 flex items-center font-bold text-sm select-none shrink-0">
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Card 3: live executive activity table ledger */}
          <Card className="p-0 border border-slate-200 dark:border-[#232D42] rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#111625]">
            <CardHeader className="border-b border-slate-200 dark:border-[#232D42]/80 px-6 py-5 flex-row justify-between items-center bg-slate-50 dark:bg-[#0B0F19]/50">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
                  Recent Executive Actions & Decisions Log
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TableWrapper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wide">ACTION DESCRIPTION</TableHeaderCell>
                      <TableHeaderCell className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wide">DETAILS</TableHeaderCell>
                      <TableHeaderCell className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wide">TIMESTAMP</TableHeaderCell>
                      <TableHeaderCell className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8] uppercase tracking-wide">STATUS</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingActivities ? (
                      <TableLoadingSkeleton colSpan={4} rows={4} />
                    ) : activities.length > 0 ? (
                      activities.map((act) => (
                        <TableRow key={act.id}>
                          <TableCell className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                            {act.action}
                          </TableCell>
                          <TableCell className="text-base text-slate-600 dark:text-[#94A3B8]">
                            {act.details}
                          </TableCell>
                          <TableCell className="text-base text-slate-550">
                            {act.timestamp ? new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ' ' + new Date(act.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </TableCell>
                          <TableCell className="text-base">
                            <Badge variant={act.status === 'SUCCESS' ? 'success' : act.status === 'WARNING' ? 'danger' : 'neutral'}>
                              {act.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableEmptyState
                        colSpan={4}
                        variant="first_use"
                        title="No Audit Actions Logged"
                        description="No executive actions or approvals have been recorded in the audit ledger yet."
                      />
                    )}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (col-span-4): Pulse, Watchlist */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-[92px]">
          
          {/* Card 1: Headcount & Diversity Pulse */}
          <div data-tour="ceo-diversity-analytics">
            <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#232D42]/60 pb-3 select-none">
                <UsersGroupTwoRounded className="text-slate-800 dark:text-[#F8FAFC] shrink-0" size={24} />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                  Organizational Pulse
                </h3>
              </div>

              <div className="mt-4 flex flex-col gap-5">
                <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
                  Department Breakdown:
                </span>

                {departmentList.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500 dark:text-[#94A3B8]">
                    No department breakdown available.
                  </div>
                ) : (
                  departmentList.map((dept: any, idx: number) => {
                    const count = dept.employee_count || 0;
                    const pct = totalDeptEmployees > 0 ? Math.round((count / totalDeptEmployees) * 100) : 0;
                    const color = deptColors[idx % deptColors.length];
                    return (
                      <div key={dept.department || idx} className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-slate-700 dark:text-[#F8FAFC]">
                            {dept.department || 'Department'}
                          </span>
                          <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
                            {count} Employees ({pct}%)
                          </span>
                        </div>
                        <ProgressBar value={pct} className="h-2 mt-2" indicatorColor={color} />
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Card 2: Culture & Wellness Audit */}
          <Card className="p-6 bg-rose-50 border border-slate-200 dark:border-[#232D42] shadow-sm rounded-xl flex flex-col">
            <div className="flex items-center gap-2.5 border-b border-rose-200/65 pb-3 select-none">
              <DangerTriangleRounded className="text-rose-600 w-5 h-5 shrink-0" />
              <h3 className="text-base font-extrabold text-rose-900 uppercase tracking-wider leading-relaxed">
                Burnout Watchlist
              </h3>
            </div>

            <p className="text-sm text-slate-700 dark:text-[#F8FAFC] mb-4 mt-3 leading-relaxed select-none">
              Employees carrying dangerously high leave balances who have not taken PTO in over 8 months.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              {(!culture?.leaveHoarders || culture.leaveHoarders.length === 0) ? (
                <div className="p-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-lg flex flex-col items-center justify-center select-none">
                  <span className="text-sm text-slate-500 dark:text-[#94A3B8]">No employees on burnout watchlist.</span>
                </div>
              ) : (
                culture.leaveHoarders.map((hoarder: any) => (
                  <div key={hoarder.id || hoarder.name} className="p-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-lg flex flex-col gap-0.5 select-none">
                    <span className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                      {hoarder.name} ({hoarder.jobTitle || hoarder.department || 'Staff'})
                    </span>
                    <span className="text-base font-bold text-rose-600 block mt-1">
                      {hoarder.unusedDays} Days Accrued
                    </span>
                  </div>
                ))
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={notifiedManagers}
              onClick={handleNotifyManagers}
              className={`w-full mt-5 font-bold h-11 text-base transition-colors ${
                notifiedManagers
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  : 'text-rose-700 border-rose-350 hover:bg-rose-100/30'
              }`}
            >
              {notifiedManagers ? 'Managers Notified ✓' : 'Notify Respective Managers'}
            </Button>
          </Card>

          {/* Announcement Board & Milestones */}
          <AnnouncementBoard />
        </div>
      </div>

      {/* Signature Confirmation Modal Overlay */}
      {showSignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] rounded-xl w-full max-w-lg shadow-sm border border-slate-200 dark:border-[#232D42] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-[#232D42] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
              <div className="flex items-center gap-3 select-none">
                <ShieldCheckRounded className="text-[#FF4F00] w-5 h-5 shrink-0" strokeWidth={2.5} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Executive Payroll Authorization
                </h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] font-bold text-base bg-slate-100 dark:bg-[#171E2E] hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-base text-slate-700 dark:text-[#F8FAFC] leading-relaxed">
                Applying your executive authorization will seal the {activePayrollCycle} Payroll Cycle register and authorize treasury to begin electronic disbursements to partner bank accounts.
              </p>

              <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl select-none">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-[#232D42]/50">
                  <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Authorized Signatory:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">{executiveFullName} (CEO)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-[#232D42]/50">
                  <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Total Net Liabilities:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">{formatCurrency(payrollTotalNet || monthlyBurnRate)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Status:</span>
                  <span className="text-base font-bold text-orange-600 uppercase">Awaiting CEO Payout Authorization</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-[#232D42] bg-[#F8FAFC] dark:bg-[#0B0F19] flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSignModal(false)}
                className="text-slate-700 dark:text-[#F8FAFC] border-slate-350 dark:border-[#232D42] font-bold h-11 px-5 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSignature}
                disabled={authorizePayrollMutation.isPending}
                className="bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white font-bold h-11 min-h-[44px] px-5 text-sm border-0 shadow-sm rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircleRounded size={18} />
                {authorizePayrollMutation.isPending ? 'Authorizing Payout...' : 'Authorize Payout'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Requisition Review Modal Overlay */}
      {selectedReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] rounded-xl w-full max-w-lg shadow-sm border border-slate-200 dark:border-[#232D42] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-[#232D42] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
              <div className="flex items-center gap-3 select-none">
                <ChartSquareRounded className="text-slate-800 dark:text-[#F8FAFC] w-5 h-5 shrink-0" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Review Capital Expenditure
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] font-bold text-base bg-slate-100 dark:bg-[#171E2E] hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-base text-slate-700 dark:text-[#F8FAFC] leading-relaxed">
                Review capital allocation details for this high-value requisition:
              </p>

              <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl select-none">
                <div className="flex flex-col py-1.5 border-b border-slate-200 dark:border-[#232D42]/50">
                  <span className="text-sm text-slate-500 dark:text-[#94A3B8] font-bold uppercase tracking-wider">Item:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-0.5">{selectedReq.title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-[#232D42]/50">
                  <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Department:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">{selectedReq.department}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Total Amount:</span>
                  <span className="text-base font-extrabold text-blue-700">{formatCurrency(selectedReq.amount)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-[#232D42] bg-[#F8FAFC] dark:bg-[#0B0F19] flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleApproveRequisition('REJECTED')}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold h-11 px-5 text-sm"
              >
                Reject Request
              </Button>
              <Button
                type="button"
                onClick={() => handleApproveRequisition('APPROVED')}
                className="bg-slate-800 hover:bg-slate-755 text-white font-bold h-11 px-5 text-sm border-0 shadow-sm"
              >
                Approve Allocation
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default CEODashboard;
