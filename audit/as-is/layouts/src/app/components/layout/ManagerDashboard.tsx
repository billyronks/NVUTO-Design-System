import type { ApiResponse } from '@/types/api.types';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/useToast';
import { useConfirm } from '../../context/useConfirm';
import { OffboardingClearanceTracker } from './OffboardingClearanceTracker';
import { useAppSelector } from '../../../store';
import { WelcomeHeader } from './WelcomeHeader';
import { MetricCard } from './MetricCard';
import {
  UsersGroupTwoRounded,
  InboxIn as InboxInRounded,
  CheckCircle as CheckCircleRounded,
  MapPoint as MapPointRounded,
  CalendarMark as CalendarMarkRounded,
  Target as TargetRounded,
  PenNewSquare as PenNewSquareRounded
} from '@solar-icons/react';
import { Card } from '@/app/components/ui/card';
import { ActiveTransitionsWidget } from './ActiveTransitions';
import { AnnouncementBoard } from './AnnouncementBoard';
import { QuickActionsSection } from '../quick-actions/QuickActionsSection';
import {
  Button,
  Badge,
  Avatar,
  PageHeader,
  Input
} from '@/app/components/ui';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from '@/app/components/ui/dialog';
import { listPendingSignatures, signDocument } from '../../../services/documentService';

// Custom inline ProgressBar matching NVUTO styling tokens (strictly no text-xs)
interface ProgressBarProps {
  value: number;
  className?: string;
  indicatorColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = 'h-3.5',
  indicatorColor = 'bg-blue-600'
}) => {
  return (
    <div className={`w-full bg-slate-100 dark:bg-[#171E2E] rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${indicatorColor} transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

interface ApprovalRequest {
  id: number;
  applicant: string;
  type: 'leave' | 'timesheet';
  details: string;
  bgClass: string;
  borderClass: string;
}

export const ManagerDashboard: React.FC = () => {
  const profile = useAppSelector((state) => state.auth.profile);
  const user = profile;

  const { user: authUser } = useAuth();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  // Parallel TanStack Queries
  const { data: kpisRes } = useQuery({
    queryKey: ['teamKpis'],
    queryFn: () => apiClient.get<any>('/team/dashboard/kpis')
  });
  const kpis = kpisRes?.data || {
    present_count: 0,
    total_count: 0,
    leave_count: 0,
    inbox_count: 0,
    goals_percentage: 0
  };

  const { data: approvalsRes, refetch: refetchApprovals } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => apiClient.get<ApiResponse<any[]>>('/team/approvals/pending')
  });
  const approvalsList = approvalsRes?.data || [];

  const { data: projectsRes } = useQuery({
    queryKey: ['activeTeamProjects'],
    queryFn: () => apiClient.get<ApiResponse<any[]>>('/team/projects/active')
  });
  const teamProjects = projectsRes?.data || [];

  const { data: attendanceRes } = useQuery({
    queryKey: ['teamAttendanceToday'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/team/attendance/today');
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    }
  });
  const attendanceToday = Array.isArray(attendanceRes) ? attendanceRes : (attendanceRes?.data || []);

  const { data: upcomingEventsRes } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => apiClient.get<ApiResponse<any[]>>('/me/calendar/upcoming')
  });
  const upcomingEvents = upcomingEventsRes?.data || [];

  // E-Signature pending queue states
  const { data: pendingSigsResponse } = useQuery({
    queryKey: ['managerPendingSignatures'],
    queryFn: () => listPendingSignatures()
  });
  const pendingSigsList = pendingSigsResponse?.data || [];
  const pendingSig = pendingSigsList?.[0]; // Grab the first pending signature

  const [showSignModal, setShowSignModal] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [signatureInitials, setSignatureInitials] = useState('');

  const signMutation = useMutation({
    mutationFn: (payload: { signature_id: string; signature_data?: string; notes?: string }) =>
      signDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerPendingSignatures'] });
      addToast('success', 'Document E-Signed', 'Document successfully e-signed and archived in your personal vault.');
      setShowSignModal(false);
      setAgreeChecked(false);
      setSignatureInitials('');
    },
    onError: (err: any) => {
      addToast('danger', 'Sign Failed', err.message || 'Could not sign document.');
    }
  });

  const handleSignSubmit = () => {
    if (!agreeChecked) {
      addToast('warning', 'Validation Warning', 'Please check the box to acknowledge and agree to the guidelines.');
      return;
    }
    if (!signatureInitials.trim()) {
      addToast('warning', 'Validation Warning', 'Please type your initials to electronically sign the document.');
      return;
    }
    if (!pendingSig) return;

    signMutation.mutate({
      signature_id: pendingSig.id,
      signature_data: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50"><text x="10" y="35" font-family="serif" font-size="28" font-style="italic" fill="#111184">${signatureInitials}</text></svg>`,
      notes: 'Approved and e-signed via dashboard widget'
    });
  };


  const handleReview = async (request: any) => {
    const approveOk = await confirm({
      title: 'Review Pending Request',
      message: `Do you want to APPROVE ${request.applicant}'s request: "${request.details}"? Clicking Cancel will prompt to reject the request.`,
      confirmText: 'Approve'
    });

    if (approveOk) {
      try {
        await apiClient.patch(`/manager/approvals/${request.type}/${request.id}/decide`, { action: 'approve' });
        addToast('success', 'Request Approved', `Success! ${request.applicant}'s request has been approved.`);
        refetchApprovals();
      } catch (err) {
        addToast('error', 'Error', 'Failed to approve request.');
      }
      return;
    }

    const rejectOk = await confirm({
      title: 'Reject Request',
      message: `Would you like to REJECT ${request.applicant}'s request?`,
      confirmText: 'Reject',
      variant: 'destructive'
    });

    if (rejectOk) {
      try {
        await apiClient.patch(`/manager/approvals/${request.type}/${request.id}/decide`, { action: 'reject', reason: 'Rejected by manager' });
        addToast('warning', 'Request Rejected', `${request.applicant}'s request has been rejected.`);
        refetchApprovals();
      } catch (err) {
        addToast('error', 'Error', 'Failed to reject request.');
      }
    }
  };

  const handleReviewAll = async () => {
    if (approvalsList.length === 0) {
      addToast('info', 'Queue Empty', 'Your approval queue is already empty!');
      return;
    }
    const ok = await confirm({
      title: 'Approve All Requests',
      message: `Are you sure you want to approve all ${approvalsList.length} pending requests in your queue?`,
      confirmText: 'Approve All'
    });
    if (!ok) return;
    try {
      await Promise.all(approvalsList.map((a: any) =>
        apiClient.patch(`/manager/approvals/${a.type}/${a.id}/decide`, { action: 'approve' })
      ));
      addToast('success', 'Bulk Approval Complete', 'All pending requests in your inbox have been approved.');
      refetchApprovals();
    } catch (err) {
      addToast('error', 'Error', 'Failed to approve some requests.');
      refetchApprovals();
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Format timesheet/leave details text for action card subtext
  const getPendingApprovalsText = () => {
    const leaveCount = approvalsList.filter(a => a.type === 'leave').length;
    const tsCount = approvalsList.filter(a => a.type === 'timesheet').length;

    if (leaveCount > 0 && tsCount > 0) {
      return `${tsCount} Timesheet${tsCount > 1 ? 's' : ''}, ${leaveCount} Leave Request${leaveCount > 1 ? 's' : ''}`;
    } else if (leaveCount > 0) {
      return `${leaveCount} Leave Request${leaveCount > 1 ? 's' : ''} pending`;
    } else if (tsCount > 0) {
      return `${tsCount} Timesheet${tsCount > 1 ? 's' : ''} pending`;
    } else {
      return 'All clear! No pending actions.';
    }
  };

  return (
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start bg-[#F8FAFC] dark:bg-[#0B0F19]">
      {pendingSig && (
        <div className="mb-6 p-5 bg-gradient-to-r from-orange-500 to-amber-600 border border-orange-400 text-white rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none animate-pulse">
          <div className="flex items-center gap-3">
            <PenNewSquareRounded size={24} className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-base font-bold">Pending Signature Required</span>
              <span className="text-sm text-orange-100 mt-0.5">
                You have a compliance document <strong>{pendingSig.title || pendingSig.document_name}</strong> awaiting your signature.
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setAgreeChecked(false);
              setSignatureInitials('');
              setShowSignModal(true);
            }}
            className="bg-white dark:bg-[#111625] hover:bg-slate-50 !text-orange-600 font-bold shrink-0 border-0 h-10 px-4 text-sm shadow-xs cursor-pointer"
          >
            Review & Sign
          </Button>
        </div>
      )}

      {/* Offboarding Clearance Tracker (Contextually mounts if manager is in notice period) */}
      <OffboardingClearanceTracker />

      {/* Active Team Transitions */}
      <ActiveTransitionsWidget />

      {/* PHASE 1: Welcome Header & Command KPIs */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        {/* Welcome Block */}
        <WelcomeHeader
          userName={profile?.profile?.first_name || authUser?.fullName?.split(' ')[0] || 'Manager'}
          department={profile?.profile?.department || 'Operations'}
          dateText={todayDateStr}
        />

        {/* Action Cluster */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleReviewAll}
            leftIcon={InboxInRounded}
            className="h-11 min-h-[44px] px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white border-0 shadow-sm rounded-lg cursor-pointer"
          >
            Review Approvals
          </Button>
        </div>
      </div>

      {/* Command KPIs Grid */}
      <div data-tour="mgr-team-banner" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none">
        {/* KPI 1: Team Attendance */}
        <div onClick={() => addToast('info', 'Navigation', 'Opening Team Attendance directory...')} className="cursor-pointer hover:-translate-y-0.5 transition-transform duration-200">
          <MetricCard
            label="Team Attendance"
            value={`${kpis.present_count} of ${kpis.total_count} Present`}
            change={
              typeof kpis.leave_count === 'number' && kpis.leave_count > 0
                ? `${kpis.leave_count} on Leave`
                : `${Math.max(0, kpis.total_count - kpis.present_count)} Not Clocked In`
            }
            status="ATTENDANCE"
            positive={true}
            icon={UsersGroupTwoRounded}
            iconClassName="text-emerald-500"
            valueClassName="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed"
            variant="success"
          />
        </div>

        {/* KPI 2: Action Inbox */}
        <div
          onClick={() => {
            const el = document.getElementById('authorization-inbox');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="cursor-pointer hover:-translate-y-0.5 transition-transform duration-200"
        >
          <MetricCard
            label="Action Inbox"
            value={`${approvalsList.length} ${approvalsList.length === 1 ? 'Request' : 'Requests'}`}
            change={getPendingApprovalsText()}
            status={approvalsList.length === 0 ? 'CLEAR' : 'PENDING'}
            positive={approvalsList.length === 0}
            icon={InboxInRounded}
            iconClassName="text-orange-500"
            valueClassName="text-2xl font-bold text-orange-600 dark:text-orange-400 leading-relaxed"
            variant={approvalsList.length === 0 ? 'success' : 'warning'}
          />
        </div>

        {/* KPI 3: Team Goals (OKRs) */}
        <div onClick={() => addToast('info', 'Navigation', 'Navigating to Q2 OKR Performance tree...')} className="cursor-pointer hover:-translate-y-0.5 transition-transform duration-200">
          <MetricCard
            label="Team Goals (OKRs)"
            value={`${kpis.goals_percentage}% On Track`}
            change="Q2 Objectives Progress"
            status="OKRS"
            positive={true}
            icon={TargetRounded}
            iconClassName="text-blue-500"
            valueClassName="text-xl font-bold text-blue-600 dark:text-blue-400 leading-relaxed"
            variant="neutral"
            extra={<ProgressBar value={kpis.goals_percentage} className="h-3.5 mt-3" indicatorColor="bg-blue-600" />}
          />
        </div>
      </div>

      {/* PHASE 1.5: Manager Team Quick Actions Bar */}
      <QuickActionsSection
        dashboardKey="manager"
        title="Team Quick Actions"
        subtitle="Shortcuts for team attendance, leave reviews, 1-on-1s, and approvals"
        className="mb-8"
        maxVisible={8}
      />

      {/* PHASE 2: Dashboard Layout (Asymmetrical Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (Span 8): The Manager's Inbox & Execution Hub */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Card 1: Approval Inbox */}
          <div data-tour="mgr-approvals-queue">
            <Card
              id="authorization-inbox"
              className="bg-white dark:bg-[#111625] border border-orange-200 dark:border-orange-800/40 rounded-xl p-6 shadow-sm flex flex-col gap-4"
            >
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#232D42] pb-3.5 select-none">
              <InboxInRounded className="text-orange-500 w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                Requires Your Authorization
              </h2>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {approvalsList.length > 0 ? (
                approvalsList.map(req => (
                  <div
                    key={req.id}
                    className={`p-4 ${req.type === 'leave' ? 'bg-orange-50/50 border-orange-100' : 'bg-white dark:bg-[#111625] border-slate-200 dark:border-[#232D42]'} border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={req.applicant} size="md" />
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] leading-relaxed">
                          {req.applicant}
                        </span>
                        <span className="text-base text-slate-700 dark:text-[#F8FAFC] block leading-relaxed">
                          {req.details}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={req.type === 'leave' ? 'primary' : 'outline'}
                      onClick={() => handleReview(req)}
                      className={req.type === 'leave' ? "bg-orange-650 hover:bg-orange-750 text-white border-0 shadow-sm shrink-0" : "shrink-0"}
                    >
                      Review
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#0B0F19] border border-dashed border-slate-200 dark:border-[#232D42] rounded-lg select-none">
                  <CheckCircleRounded className="text-emerald-500 mx-auto mb-2 shrink-0" size={32} />
                  <span className="text-base font-semibold text-slate-600 dark:text-[#94A3B8] block leading-relaxed">
                    All requests authorized!
                  </span>
                  <span className="text-sm text-slate-400 block mt-1">
                    Your team is unblocked and running smoothly.
                  </span>
                </div>
              )}
            </div>
          </Card>
          </div>

          {/* Card 3: Active Delivery & Projects */}
          <div data-tour="mgr-ninebox-grid">
            <Card className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42]/80 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#232D42] pb-3.5 select-none">
                <TargetRounded className="text-[#FF4F00] w-5 h-5 shrink-0" />
                <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                  Team Execution
                </h2>
              </div>

              <div className="flex flex-col mt-2">
                {teamProjects.length > 0 ? (
                  teamProjects.map((proj: any, idx: number) => {
                    let badgeVariant: 'success' | 'warning' | 'danger' | 'default' = 'default';
                    let barColor = 'bg-slate-400';
                    let statusText = proj.status || 'NO DATA';

                    if (proj.status === 'ON TRACK' || proj.status === 'ON_TRACK') {
                      badgeVariant = 'success';
                      barColor = 'bg-green-600';
                    } else if (proj.status === 'AT RISK' || proj.status === 'AT_RISK') {
                      badgeVariant = 'warning';
                      barColor = 'bg-orange-500';
                    }

                    return (
                      <React.Fragment key={proj.id}>
                        {idx > 0 && <div className="border-t border-slate-100 dark:border-[#232D42] my-4" />}
                        <div className="flex flex-col items-start gap-1 pt-2">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] leading-relaxed">
                              {proj.name}
                            </span>
                            <Badge variant={badgeVariant} className="ml-3 shrink-0">
                              {statusText}
                            </Badge>
                          </div>
                          <span className="text-base text-slate-700 dark:text-[#F8FAFC] mt-1 leading-relaxed block">
                            Led by {proj.lead_name || 'Unassigned'} • {proj.progress}% Complete
                          </span>
                          <div className="mt-2 w-full">
                            <ProgressBar value={proj.progress} className="h-2" indicatorColor={barColor} />
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-[#94A3B8]">NO PROJECTS ACTIVE</div>
                )}
              </div>
            </Card>
          </div>

          {/* Announcement Board & Milestones */}
          <AnnouncementBoard />
        </div>

        {/* Right Column (Span 4): The Team Roster & Schedule */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-[92px]">

          {/* Card 1: Daily Team Status */}
          <div data-tour="mgr-open-reqs">
            <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-[#232D42]/60 pb-3.5 select-none">
              <MapPointRounded className="text-[#FF4F00] w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                Who's In Today
              </h2>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {attendanceToday.length > 0 ? (
                attendanceToday.map((member: any, idx: number) => {
                  let badgeVar: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default';
                  if (member.status === 'IN OFFICE') {
                    badgeVar = 'success';
                  } else if (member.status === 'REMOTE') {
                    badgeVar = 'info';
                  } else if (member.status === 'SICK') {
                    badgeVar = 'danger';
                  } else if (member.status === 'LEAVE') {
                    badgeVar = 'warning';
                  }

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 w-full ${idx > 0 ? 'border-t border-slate-200 dark:border-[#232D42]/60 pt-3' : ''}`}
                    >
                      <Avatar name={member.name} size="sm" />
                      <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] leading-none">
                        {member.name}
                      </span>
                      <Badge className="ml-auto text-sm shrink-0" variant={badgeVar}>
                        {member.status}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-[#94A3B8]">NO TEAM MEMBERS ON DUTY</div>
              )}
            </div>
          </Card>
          </div>

          {/* Card 2: Upcoming Milestones */}
          <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-[#232D42]/60 pb-3.5 select-none">
              <CalendarMarkRounded className="text-[#FF4F00] w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                Upcoming Events
              </h2>
            </div>

            <div className="flex flex-col gap-3.5 mt-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((evt: any, idx: number) => {
                  let displayDate = evt.date;
                  try {
                    const parsedDate = new Date(evt.date);
                    displayDate = parsedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                  } catch (e) { }

                  return (
                    <div key={evt.id} className={`flex flex-col ${idx > 0 ? 'border-t border-slate-200 dark:border-[#232D42]/60 pt-3.5' : ''}`}>
                      <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] leading-normal">
                        {evt.title}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-[#94A3B8] font-semibold mt-0.5 block leading-none">
                        {displayDate}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-[#94A3B8]">NO UPCOMING EVENTS</div>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* E-Signature Modal using Dialog */}
      <Dialog open={showSignModal && !!pendingSig} onOpenChange={(open) => { if (!open) setShowSignModal(false); }}>
        <DialogContent className="max-w-lg w-full p-6">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19] flex flex-row items-center gap-2 select-none -mx-6 -mt-6 px-6">
            <PenNewSquareRounded className="text-orange-600 shrink-0" size={20} />
            <div className="flex flex-col">
              <DialogTitle className="text-lg font-bold text-slate-850">
                Review & E-Sign Compliance Document
              </DialogTitle>
              <DialogDescription className="sr-only">
                Review document details and apply digital signature
              </DialogDescription>
            </div>
          </DialogHeader>

          {pendingSig && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] leading-relaxed">
                  {pendingSig.title || pendingSig.document_name}
                </span>
                <span className="text-sm text-slate-500 dark:text-[#94A3B8]">
                  Due Date: {pendingSig.due_date || (pendingSig.created_at ? new Date(pendingSig.created_at).toLocaleDateString() : 'N/A')} • Category: {pendingSig.category || pendingSig.folder_category || 'Compliance'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl max-h-[160px] overflow-y-auto text-sm text-slate-655 leading-relaxed scrollbar-thin">
                <p className="mb-3">
                  This document requires your official signature to ensure compliance with the company regulations and data security policy.
                </p>
                <p>
                  By signing this agreement, you confirm that you will adhere to all guidelines, keep customer data confidential, and report security events promptly.
                </p>
              </div>

              <div className="flex items-start gap-2.5 mt-2 select-none">
                <Checkbox
                  id="agree-check-dash-mgr"
                  checked={agreeChecked}
                  onCheckedChange={(checked) => setAgreeChecked(!!checked)}
                  className="mt-1 cursor-pointer animate-none"
                />
                <Label htmlFor="agree-check-dash-mgr" className="text-sm font-medium text-slate-700 dark:text-[#F8FAFC] cursor-pointer leading-normal select-none">
                  I hereby confirm that I have read, understood, and agreed to the document guidelines and terms.
                </Label>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] uppercase">
                  Type Initials to Sign
                </span>
                <Input
                  placeholder="e.g., TM"
                  type="text"
                  value={signatureInitials}
                  onChange={(e) => setSignatureInitials(e.target.value)}
                  className="h-10 text-base"
                />
              </div>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-slate-100 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-end gap-3 select-none -mx-6 -mb-6 mt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-11 min-h-[44px] px-5 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#111625] rounded-lg cursor-pointer"
              >
                Close
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={handleSignSubmit}
              className="h-11 min-h-[44px] px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white border-0 shadow-sm rounded-lg cursor-pointer"
            >
              Sign Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
