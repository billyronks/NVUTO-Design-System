import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Safe2 as BankRounded,
  WadOfMoney as WadOfMoneyRounded,
  WadOfMoney,
  Bill as BillRounded,
  ChartSquare as ChartSquareRounded,
  DangerTriangle as DangerTriangleRounded,
  TransferHorizontal as TransferHorizontalRounded,
  ShieldCheck as ShieldCheckRounded,
  ClockCircle as ClockCircleRounded
} from '@solar-icons/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import {
  Button,
  Badge,
  Select,
  TableWrapper,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  PageHeader,
  Input
} from '@/app/components/ui';
import { MetricCard } from './MetricCard';
import { AnnouncementBoard } from './AnnouncementBoard';
import { QuickActionsSection } from '../quick-actions/QuickActionsSection';
import { useToast } from '../../context/useToast';
import { useConfirm } from '../../context/useConfirm';
import {
  getReconciliationStatus,
  executeFinanceDisbursement,
  getFinanceLedger,
  getFinanceDisbursements,
  getTaxRemittances,
  approvePayrollAudit,
  startPayrollDisbursement,
  exportGLCSV
} from '../../../services/financePayrollService';
import {
  lockPayrollRun,
  clearAnomalyFlag,
  listPayrollRuns,
  markTaxRemittancePaid,
  listPayrollLineItems
} from '../../../services/payrollService';
import { format, subMonths } from 'date-fns';

interface DisbursementItem {
  id: string;
  type: string;
  itemsCount: string;
  amount: number;
  status: 'READY TO FUND' | 'FUNDED' | 'OVERDUE';
}

interface OutflowItem {
  id: string;
  name: string;
  amount: number;
  date: string;
}

interface ComplianceItem {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  status: 'Unpaid' | 'Paid';
}

export const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  // Dynamic cycle calculations
  const currentPeriod = format(new Date(), 'MMMM yyyy');

  // Stepper state
  const [payrollPhase, setPayrollPhase] = useState<'Draft' | 'Approved' | 'Disbursed'>('Draft');
  const [anomaliesResolved, setAnomaliesResolved] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<string>(currentPeriod);

  // React Query: Fetch reconciliation logs and active payroll run cycle
  const { data: runsResponse } = useQuery({
    queryKey: ['payrollRuns'],
    queryFn: () => listPayrollRuns()
  });

  const runs = runsResponse?.data || [];
  
  // Find in-flight run or default to most recent
  const activeRun = React.useMemo(() => {
    if (selectedCycle) {
      const cycleMatch = runs.find(r => r.period?.toLowerCase() === selectedCycle.toLowerCase());
      if (cycleMatch) return cycleMatch;
    }
    return runs.find((r) => {
      const s = String(r.status || '').trim().toUpperCase();
      return [
        'DISBURSING',
        'PARTIALLY_DISBURSED',
        'AUTHORIZED_FOR_DISBURSEMENT',
        'READY_FOR_EXECUTION',
        'MDAPPROVED',
        'PENDING_EXECUTIVE_APPROVAL',
        'PENDING_MD_APPROVAL',
        'PENDING_FINANCE_SCHEDULER',
        'PENDING_AUDIT',
        'DRAFT',
        'PROCESSING'
      ].includes(s);
    }) || runs[0];
  }, [runs, selectedCycle]);

  const activeCycleName = activeRun?.period || selectedCycle || currentPeriod;

  // Sync internal phase state with live run status
  React.useEffect(() => {
    if (!activeRun?.status) return;
    const s = String(activeRun.status).trim().toUpperCase();
    if (['EXECUTED', 'DISBURSED', 'PAID', 'COMPLETED', 'RECONCILED', 'DISBURSING', 'PARTIALLY_DISBURSED'].includes(s)) {
      setPayrollPhase('Disbursed');
    } else if ([
      'PENDING_MD_APPROVAL',
      'PENDING_EXECUTIVE_APPROVAL',
      'PENDING_FINANCE_SCHEDULER',
      'AUTHORIZED_FOR_DISBURSEMENT',
      'READY_FOR_EXECUTION',
      'MDAPPROVED'
    ].includes(s)) {
      setPayrollPhase('Approved');
    } else {
      setPayrollPhase('Draft');
    }
  }, [activeRun?.status]);

  const { data: lineItemsResponse } = useQuery({
    queryKey: ['payrollLineItems', activeRun?.id],
    queryFn: () => listPayrollLineItems(activeRun?.id || ''),
    enabled: !!activeRun?.id
  });

  const lineItems = React.useMemo(() => lineItemsResponse?.data || [], [lineItemsResponse]);

  const anomalies = React.useMemo(() => {
    return lineItems.filter(item => item.has_anomaly && !item.anomaly_cleared);
  }, [lineItems]);

  const isAnomaliesResolved = anomalies.length === 0 || anomaliesResolved;

  React.useEffect(() => {
    if (lineItems.length > 0) {
      setAnomaliesResolved(anomalies.length === 0);
    }
  }, [anomalies, lineItems]);

  const totalGross = activeRun?.gross_amount_kobo ? activeRun.gross_amount_kobo / 100 : 0;
  const totalNet = activeRun?.net_amount_kobo ? activeRun.net_amount_kobo / 100 : 0;
  
  const totalEwaDeductions = React.useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (Number(item.ewa_deduction) || 0), 0);
  }, [lineItems]);

  const statutoryDeductions = React.useMemo(() => {
    if (lineItems.length === 0) return Math.max(0, totalGross - totalNet - totalEwaDeductions);
    return lineItems.reduce((sum, item) => sum + (Number(item.statutory_deductions) || 0) + (Number(item.paye_tax) || 0), 0);
  }, [lineItems, totalGross, totalNet, totalEwaDeductions]);

  const { data: reconResponse } = useQuery({
    queryKey: ['finance', 'reconciliation'],
    queryFn: getReconciliationStatus
  });

  // Fetch disbursements from Go API
  const { data: disbursementsResponse, isError: isDisbursementsError } = useQuery({
    queryKey: ['finance', 'disbursements'],
    queryFn: getFinanceDisbursements
  });

  const disbursements = React.useMemo(() => {
    return disbursementsResponse?.data || [];
  }, [disbursementsResponse]);

  // Fetch statutory tax remittances from Go API
  const { data: remittancesResponse } = useQuery({
    queryKey: ['finance', 'remittances'],
    queryFn: getTaxRemittances
  });

  const complianceItems = React.useMemo(() => {
    return remittancesResponse?.data || [];
  }, [remittancesResponse]);

  // Fetch recent ledger entries for outflows from Go API
  const { data: ledgerResponse } = useQuery({
    queryKey: ['finance', 'ledger'],
    queryFn: () => getFinanceLedger()
  });

  const outflows = React.useMemo(() => {
    const list = ledgerResponse?.data?.entries || [];
    return list.map((item: any) => ({
      id: item.id,
      name: item.gl_description || item.memo || 'General Outflow',
      amount: item.amount_cents / 100,
      date: item.created_at ? `PAID ${new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}` : 'PAID'
    }));
  }, [ledgerResponse]);

  // Treasury KPIs derived dynamically
  const unremittedTaxes = React.useMemo(() => {
    return complianceItems.filter(c => c.status === 'Unpaid').reduce((acc, curr) => acc + curr.amount, 0);
  }, [complianceItems]);

  const pendingDisbursements = React.useMemo(() => {
    return disbursements.filter(d => d.status === 'READY TO FUND' || d.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);
  }, [disbursements]);

  // Stage determination for 4-phase dynamic stepper
  const currentStatus = String(activeRun?.status || '').trim().toUpperCase();
  const normalizedDisbursementStatus = String(activeRun?.disbursement_status || '').trim().toLowerCase();
  const isAwaitingLiquidity = normalizedDisbursementStatus === 'awaiting_provider_liquidity'
    || (normalizedDisbursementStatus === 'failed' && String(activeRun?.notes || '').toLowerCase().includes('insufficient corporate balance'));

  const isDisbursedFinal = ['EXECUTED', 'DISBURSED', 'PAID', 'COMPLETED', 'RECONCILED'].includes(currentStatus);
  const isDisbursingInProgress = currentStatus === 'DISBURSING' || currentStatus === 'PARTIALLY_DISBURSED' || isAwaitingLiquidity;
  const isReadyForDisbursement = ['AUTHORIZED_FOR_DISBURSEMENT', 'READY_FOR_EXECUTION', 'MDAPPROVED'].includes(currentStatus);

  const isExecutiveApproved = isDisbursedFinal || isDisbursingInProgress || isReadyForDisbursement;
  const isExecutiveApprovalPending = ['PENDING_MD_APPROVAL', 'PENDING_EXECUTIVE_APPROVAL', 'PENDING_FINANCE_SCHEDULER'].includes(currentStatus);

  const isDraftComplete = isExecutiveApprovalPending || isExecutiveApproved;

  const isCollationComplete = Boolean(
    lineItemsResponse?.data?.length ||
    (activeRun && (activeRun.employee_count || 0) > 0) ||
    activeRun?.aggregated_at ||
    (currentStatus && currentStatus !== 'NOT_STARTED')
  );

  const stage1State: 'completed' | 'active' | 'pending' = isCollationComplete
    ? 'completed'
    : activeRun ? 'active' : 'pending';

  const stage2State: 'completed' | 'active' | 'pending' = isDraftComplete
    ? 'completed'
    : (stage1State === 'completed' ? 'active' : 'pending');

  const stage3State: 'completed' | 'active' | 'pending' = isExecutiveApproved
    ? 'completed'
    : (isExecutiveApprovalPending ? 'active' : 'pending');

  const stage4State: 'completed' | 'active' | 'pending' = isDisbursedFinal
    ? 'completed'
    : (isDisbursingInProgress || isReadyForDisbursement ? 'active' : 'pending');

  const renderStep = (
    label: string,
    state: 'completed' | 'active' | 'pending',
    completedSubtitle: string,
    activeSubtitle: string,
    pendingSubtitle: string
  ) => {
    if (state === 'completed') {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center relative shrink-0 shadow-sm">
            <ShieldCheckRounded className="text-emerald-500 text-3xl" size={28} />
          </div>
          <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-2">
            {label}
          </span>
          <span className="text-sm text-slate-500 dark:text-[#94A3B8]">{completedSubtitle}</span>
        </div>
      );
    }
    if (state === 'active') {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-slate-200 dark:border-[#232D42] dark:border-blue-800 flex items-center justify-center relative shrink-0 ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-sm">
            <ChartSquareRounded className="text-blue-600 dark:text-blue-400 text-3xl" size={26} />
          </div>
          <span className="text-base font-bold text-blue-700 dark:text-blue-400 mt-2">
            {label}
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-300">{activeSubtitle}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#171E2E] border border-slate-200 dark:border-[#232D42] flex items-center justify-center shrink-0">
          <ClockCircleRounded size={24} className="text-slate-400 dark:text-slate-500" />
        </div>
        <span className="text-base font-medium text-slate-400 dark:text-slate-500 mt-2">
          {label}
        </span>
        <span className="text-sm text-slate-400 dark:text-slate-500">{pendingSubtitle}</span>
      </div>
    );
  };

  // Modals state
  const [showAnomaliesModal, setShowAnomaliesModal] = useState(false);
  const [showRunPayrollModal, setShowRunPayrollModal] = useState(false);
  const [payrollPaymentDate, setPayrollPaymentDate] = useState('');

  // Mutation to clear anomaly
  const clearAnomalyMutation = useMutation({
    mutationFn: ({ runId, employeeId }: { runId: string; employeeId: string }) =>
      clearAnomalyFlag(runId, employeeId),
    onSuccess: () => {
      setShowAnomaliesModal(false);
      queryClient.invalidateQueries({ queryKey: ['finance', 'reconciliation'] });
      queryClient.invalidateQueries({ queryKey: ['payrollLineItems', activeRun?.id] });
      addToast({
        title: 'Anomaly Resolved',
        description: 'Timesheet discrepancy has been resolved on the server.',
        variant: 'success'
      });
    },
    onError: (err: any) => {
      addToast({
        title: 'Failed to Resolve Anomaly',
        description: err.message || 'Error occurred.',
        variant: 'danger'
      });
    }
  });

  const handleResolveAnomalies = () => {
    if (activeRun && anomalies.length > 0) {
      anomalies.forEach((anomaly) => {
        clearAnomalyMutation.mutate({ runId: activeRun.id, employeeId: anomaly.employee_id });
      });
    } else {
      setAnomaliesResolved(true);
      setShowAnomaliesModal(false);
      addToast({
        title: 'Local Override',
        description: 'Anomalies resolved locally as no active run is present.',
        variant: 'success'
      });
    }
  };

  // Run payroll trigger
  const handleRunPayroll = () => {
    if (!isAnomaliesResolved) {
      addToast({
        title: 'Unresolved Anomalies',
        description: 'Cannot process payroll while unresolved anomalies remain.',
        variant: 'warning'
      });
      return;
    }
    setShowRunPayrollModal(true);
  };

  // Stage 2 mutation: Finance approves the audited ledger for CEO review.
  const executePayrollMutation = useMutation({
    mutationFn: (runId: string) => approvePayrollAudit(runId, 'Finance dashboard audit approved', payrollPaymentDate),
    onSuccess: () => {
      setPayrollPhase('Approved');
      setShowRunPayrollModal(false);
      queryClient.invalidateQueries({ queryKey: ['payroll', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['payroll', 'runs'] });
      addToast({
        title: 'Audit Approved',
        description: 'The payroll ledger is locked and awaiting CEO authorization.',
        variant: 'success'
      });
    },
    onError: (err: any) => {
      addToast({
        title: 'Audit Approval Failed',
        description: err.message || 'Failed to approve the payroll audit.',
        variant: 'danger'
      });
    }
  });

  const confirmRunPayroll = () => {
    if (!payrollPaymentDate) {
      addToast({ title: 'Payment Date Required', description: 'Select the scheduled bank payment date before approving the audit.', variant: 'warning' });
      return;
    }
    if (activeRun) {
      executePayrollMutation.mutate(activeRun.id);
    } else {
      setPayrollPhase('Approved');
      setShowRunPayrollModal(false);
      addToast({
        title: 'No Pending Audit',
        description: 'There is no live payroll run awaiting Finance audit.',
        variant: 'success'
      });
    }
  };

  // Start the authorized payroll disbursement. Reconciliation is a separate,
  // later lifecycle step and must never be used to initiate a payout.
  const disburseMutation = useMutation({
    mutationFn: (runId: string) => startPayrollDisbursement(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'runs'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'disbursements'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'reconciliation'] });
      addToast({
        title: 'Disbursement Started',
        description: 'The authorized payroll batch has been submitted to the treasury connector.',
        variant: 'success'
      });
    },
    onError: (err: any) => {
      addToast({
        title: 'Disbursement Failed',
        description: err.message || 'Execution failed.',
        variant: 'danger'
      });
    }
  });

  // Process Batch funding helper
  const handleProcessBatch = async () => {
    if (isDisbursementsError) {
      addToast({
        title: 'Funding Queue Unavailable',
        description: 'The payroll funding queue could not be loaded. Refresh and retry before disbursing funds.',
        variant: 'danger'
      });
      return;
    }
    const readyPayrollBatch = activeRun
      ? disbursements.find(d => d.id === activeRun.id && d.status === 'READY TO FUND')
      : undefined;
    if (!readyPayrollBatch) {
      addToast({
        title: 'No Batches Ready',
        description: 'No authorized payroll batch is ready to fund in this cycle.',
        variant: 'warning'
      });
      return;
    }

    const confirmDisbursement = await confirm({
      title: 'Disburse funds?',
      message: `Proceed to disburse ₦${readyPayrollBatch.amount.toLocaleString()} for ${readyPayrollBatch.type}?`,
      confirmText: 'Disburse',
      variant: 'warning'
    });
    if (confirmDisbursement) {
      disburseMutation.mutate(readyPayrollBatch.id);
    }
  };

  // Payroll execution must use the authoritative Payroll run, not the Finance
  // dashboard's consolidated expense/benefit queue. The wallet reservation is
  // created during executive authorization, so an authorized run is already a
  // complete, executable funding instruction even when that secondary read
  // model is temporarily unavailable.
  const handleDisburseAuthorizedPayroll = async () => {
    if (!activeRun?.id) {
      addToast({
        title: 'No Authorized Payroll',
        description: 'There is no active payroll run available for disbursement.',
        variant: 'warning'
      });
      return;
    }

    const normalizedStatus = String(activeRun.status || '').trim().toUpperCase().replace(/\s+/g, '_');
    const isAuthorized = [
      'AUTHORIZED_FOR_DISBURSEMENT',
      'READY_FOR_EXECUTION',
      'MDAPPROVED'
    ].includes(normalizedStatus);
    if (!isAuthorized) {
      addToast({
        title: 'Payroll Not Authorized',
        description: `This payroll is currently ${String(activeRun.status || 'not ready').replace(/_/g, ' ')} and cannot be disbursed yet.`,
        variant: 'warning'
      });
      return;
    }

    const amount = Number(activeRun.net_amount_kobo || 0) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      addToast({
        title: 'Invalid Payroll Liability',
        description: 'The authorized payroll does not contain a positive net amount to disburse.',
        variant: 'danger'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Disburse authorized payroll?',
      message: `Proceed to disburse ₦${amount.toLocaleString()} for ${activeCycleName}? Reserved wallet funds will be submitted to the banking rail.`,
      confirmText: 'Disburse Payroll',
      variant: 'warning'
    });
    if (confirmed) {
      disburseMutation.mutate(activeRun.id);
    }
  };

  // Mutation to remit tax liability
  const remitTaxMutation = useMutation({
    mutationFn: ({ runId, agency, amount }: { runId: string; agency: string; amount: number }) =>
      markTaxRemittancePaid(runId, agency, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'remittances'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'ledger'] });
      addToast({
        title: 'Remittance Completed',
        description: 'Tax remittance has been successfully processed.',
        variant: 'success'
      });
    },
    onError: (err: any) => {
      addToast({
        title: 'Remittance Failed',
        description: err.message || 'Error occurred.',
        variant: 'danger'
      });
    }
  });

  // Remit tax liability
  const handleRemitNow = async (item: ComplianceItem) => {
    const confirmRemit = await confirm({
      title: 'Authorize remittance?',
      message: `Authorize electronic remittance of ₦${item.amount.toLocaleString()} to relevant authority?`,
      confirmText: 'Authorize',
      variant: 'warning'
    });
    if (confirmRemit) {
      remitTaxMutation.mutate({ runId: activeRun?.id || `run-${format(new Date(), 'yyyy-MM')}`, agency: item.name, amount: item.amount });
    }
  };

  const handleExportLedger = async () => {
    try {
      addToast({
        title: 'Export Started',
        description: `Exporting general ledger report (CSV format) for ${activeCycleName} cycle...`,
        variant: 'info'
      });
      const blob = await exportGLCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `General-Ledger-${activeCycleName.replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast({
        title: 'Export Complete',
        description: 'General ledger CSV downloaded successfully.',
        variant: 'success'
      });
    } catch (err: any) {
      addToast({
        title: 'Export Failed',
        description: err?.message || 'Could not download ledger report.',
        variant: 'danger'
      });
    }
  };

  const formatCurrency = (val: number) => {
    return '₦' + val.toLocaleString('en-NG');
  };

  return (
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start bg-[#F8FAFC] dark:bg-[#0B0F19]">
      
      {/* PHASE 1: Page Header & Treasury KPIs */}
      <PageHeader
        title="Finance & Payroll Hub"
        subtitle={`${format(new Date(), 'EEEE, MMMM d, yyyy')} • Manage payroll cycles, disbursements, and statutory compliance.`}
      />

      {/* Page Header Card Frame */}
      <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Left Side: Period selection */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            options={
              runs.length > 0
                ? runs.map((r: any) => ({ value: r.period || r.id, label: `${r.period || r.id} Cycle` }))
                : [
                    { value: currentPeriod, label: `${currentPeriod} Cycle` },
                    { value: format(subMonths(new Date(), 1), 'MMMM yyyy'), label: `${format(subMonths(new Date(), 1), 'MMMM yyyy')} Cycle` }
                  ]
            }
            containerClassName="w-48"
            className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-lg text-base"
          />
        </div>

        {/* Right Side: Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportLedger}
            className="h-11 px-5 text-sm font-bold text-slate-800 dark:text-[#F8FAFC] border-slate-300 dark:border-[#232D42] hover:bg-slate-50 dark:bg-[#0B0F19] shadow-sm"
          >
            Export Ledger
          </Button>
          <div data-tour="fin-payroll-cta">
            <Button
              type="button"
              leftIcon={WadOfMoneyRounded}
              onClick={handleRunPayroll}
              className="h-11 px-5 text-sm font-bold text-white bg-accent hover:bg-accent/90 shadow-sm"
            >
              Audit Payroll
            </Button>
          </div>
        </div>
      </div>

      {/* 4 MetricCard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Metric Card 1: Next Payroll Settlement */}
        <MetricCard
          label={`${activeCycleName} Payroll`}
          value={formatCurrency(totalNet)}
          change="Due Date Settlement"
          status={`DUE ${format(new Date(), 'MMM').toUpperCase()} 25`}
          positive={true}
          icon={BankRounded}
          iconClassName="text-blue-500"
          variant="neutral"
        />

        {/* Metric Card 2: Pending Disbursements */}
        <MetricCard
          label="Approved Expenses"
          value={formatCurrency(pendingDisbursements)}
          change="14 Claims awaiting funding"
          status="AWAITING FUNDS"
          positive={pendingDisbursements === 0}
          icon={TransferHorizontalRounded}
          iconClassName="text-orange-500"
          variant={pendingDisbursements > 0 ? 'warning' : 'success'}
        />

        {/* Metric Card 3: Statutory Liabilities */}
        <MetricCard
          label="Unremitted Taxes"
          value={formatCurrency(unremittedTaxes)}
          change="PAYE & Pension (Due Jul 05)"
          status="LIABILITIES"
          positive={unremittedTaxes === 0}
          icon={BillRounded}
          iconClassName="text-rose-500"
          variant={unremittedTaxes > 0 ? 'critical' : 'success'}
        />

        {/* Metric Card 4: EWA Settlements */}
        <div data-tour="fin-ewa-reconciliation">
          <MetricCard
            label="Salary Advances"
            value={formatCurrency(totalEwaDeductions)}
            change={`To be deducted from ${activeCycleName} run`}
            status="EWA SETTLED"
            positive={true}
            icon={WadOfMoneyRounded}
            iconClassName="text-emerald-500"
            variant="success"
          />
        </div>
      </div>

      {/* PHASE 1.5: Quick Actions Bar */}
      <QuickActionsSection
        dashboardKey="finance"
        title="Finance Quick Actions"
        subtitle="Direct financial operations, wallet funding, and statutory reporting"
        className="mb-8"
        maxVisible={8}
      />

      {/* PHASE 2: Dashboard Layout (Asymmetrical Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (col-span-8): Active Payroll & Disbursement Queue */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Card 1: Active Payroll Cycle Tracker */}
          <div data-tour="fin-ledger-table">
            <Card className="p-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm">
            <CardHeader className="p-0 border-0 flex flex-row items-center gap-2 mb-4 select-none">
              <ChartSquareRounded className="text-slate-800 dark:text-[#F8FAFC] shrink-0" size={24} />
              <CardTitle className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                {activeCycleName} Payroll Progress
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 flex flex-col">
              {/* Stepper Grid Container */}
              <div className="mt-6 flex flex-col md:flex-row items-center justify-between relative gap-6 select-none">
                
                {/* Horizontal Stepper Line (absolute) */}
                <div className="hidden md:block bg-slate-200 dark:bg-[#171E2E] h-1 absolute top-7 left-8 right-8 -z-10 w-[calc(100%-64px)] overflow-hidden rounded-full">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width:
                        stage4State === 'completed'
                          ? '100%'
                          : isDisbursingInProgress
                          ? '88%'
                          : stage3State === 'completed' || stage4State === 'active'
                          ? '75%'
                          : stage2State === 'completed' || stage3State === 'active'
                          ? '50%'
                          : stage1State === 'completed' || stage2State === 'active'
                          ? '25%'
                          : '0%'
                    }}
                  />
                </div>

                {/* Step 1: Data Collation */}
                {renderStep(
                  'Data Collation',
                  stage1State,
                  `${lineItems.length > 0 ? lineItems.length : activeRun?.employee_count || 0} Staff Synced`,
                  'In Progress',
                  'Pending'
                )}

                {/* Step 2: Draft & Review */}
                {renderStep(
                  'Draft & Review',
                  stage2State,
                  'Audit Locked',
                  anomalies.length > 0 ? `${anomalies.length} Flagged` : 'Active Phase',
                  'Pending'
                )}

                {/* Step 3: Executive Approval */}
                {renderStep(
                  'Executive Approval',
                  stage3State,
                  'Authorized',
                  'Awaiting Sign-off',
                  'Pending'
                )}

                {/* Step 4: Disbursement */}
                {renderStep(
                  'Disbursement',
                  stage4State,
                  'Disbursed & Reconciled',
                  isAwaitingLiquidity ? 'Awaiting Liquidity' : isDisbursingInProgress ? 'Disbursing...' : 'Ready to Fund',
                  'Pending'
                )}
              </div>

              {/* Stepper Action/Anomalies Area */}
              {stage4State === 'completed' ? (
                <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <p className="text-base text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                    Disbursement executed successfully for {activeCycleName}. General ledger reconciled and statutory tax liabilities scheduled.
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="success" className="h-9 px-3.5 flex items-center font-bold text-sm select-none">
                      DISBURSED & RECONCILED
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => navigate('/finance/payroll/compliance')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-4 text-sm shrink-0 border-0 cursor-pointer"
                    >
                      Compliance Ledger
                    </Button>
                  </div>
                </div>
              ) : isAwaitingLiquidity ? (
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <p className="text-base text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                    Disbursement for {activeCycleName} is awaiting Paystack transferable liquidity. Funds are reserved; employee payouts will dispatch once liquidity is confirmed.
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="warning" className="h-9 px-3.5 flex items-center font-bold text-sm select-none">
                      AWAITING LIQUIDITY
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => navigate('/hr/payroll/run')}
                      className="bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-10 px-4 text-sm shrink-0 border-0 cursor-pointer shadow-sm"
                    >
                      View Disbursement Run
                    </Button>
                  </div>
                </div>
              ) : isDisbursingInProgress ? (
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <p className="text-base text-blue-950 dark:text-blue-200 leading-relaxed font-medium">
                    Disbursement is in progress for {activeCycleName}. Banking rails are processing employee payouts.
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="info" className="h-9 px-3.5 flex items-center font-bold text-sm select-none">
                      DISBURSING IN PROGRESS
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => navigate('/hr/payroll/run')}
                      className="bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-10 px-4 text-sm shrink-0 border-0 cursor-pointer shadow-sm"
                    >
                      View Disbursement Run
                    </Button>
                  </div>
                </div>
              ) : stage4State === 'active' ? (
                <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-[#FF4F00]/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <p className="text-base text-orange-950 dark:text-orange-200 leading-relaxed font-medium">
                    Executive approval granted for {activeCycleName}. Payroll batch is authorized and ready for treasury disbursement.
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      type="button"
                      onClick={handleDisburseAuthorizedPayroll}
                      disabled={disburseMutation.isPending}
                      className="bg-[#FF4F00] hover:bg-[#E04500] text-white font-bold h-10 px-4 text-sm shrink-0 border-0 cursor-pointer shadow-sm"
                    >
                      {disburseMutation.isPending ? 'Starting Disbursement…' : 'Disburse Funds Now'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/finance/payroll/wallet')}
                      className="text-slate-700 dark:text-[#F8FAFC] border-slate-300 dark:border-[#232D42] font-bold h-10 px-4 text-sm shrink-0 cursor-pointer"
                    >
                      Corporate Wallet
                    </Button>
                  </div>
                </div>
              ) : stage3State === 'active' ? (
                <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <p className="text-base text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                    Finance audit complete. Payroll run is locked and awaiting CEO / Managing Director executive authorization.
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="purple" className="h-9 px-3.5 flex items-center font-bold text-sm select-none">
                      AWAITING EXECUTIVE SIGN-OFF
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => navigate('/finance/payroll/approvals')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 text-sm shrink-0 border-0 cursor-pointer"
                    >
                      Approvals Workspace
                    </Button>
                  </div>
                </div>
              ) : (
                /* Stage 2 (Draft & Review) or Stage 1 (Collation) */
                <div className={`mt-8 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  !isAnomaliesResolved
                    ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60'
                    : 'bg-blue-50 dark:bg-blue-950/30 border border-slate-200 dark:border-[#232D42] dark:border-blue-800/60'
                }`}>
                  <p className={`text-base leading-relaxed font-medium ${
                    !isAnomaliesResolved ? 'text-amber-900 dark:text-amber-200' : 'text-blue-900 dark:text-blue-200'
                  }`}>
                    {isAnomaliesResolved
                      ? `All timesheet logs verified with 0 anomalies. Payroll Draft for ${activeCycleName} is validated and ready for Finance Audit lock.`
                      : `Payroll is currently in the Draft & Review phase. ${anomalies.length} anomal${anomalies.length === 1 ? 'y' : 'ies'} detected in timesheet data.`}
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    {!isAnomaliesResolved ? (
                      <>
                        <Button
                          type="button"
                          onClick={() => setShowAnomaliesModal(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-4 text-sm shrink-0 border-0 cursor-pointer"
                        >
                          Review Anomalies ({anomalies.length})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/finance/payroll/run')}
                          className="text-slate-700 dark:text-[#F8FAFC] border-slate-300 dark:border-[#232D42] font-bold h-10 px-4 text-sm shrink-0 cursor-pointer"
                        >
                          Payroll Run
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant="success" className="h-9 px-3.5 flex items-center font-bold text-sm select-none">
                          NO ISSUES DETECTED
                        </Badge>
                        <Button
                          type="button"
                          onClick={handleRunPayroll}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 text-sm shrink-0 border-0 cursor-pointer"
                        >
                          Lock & Submit for Approval
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Card 2: Pending Disbursement Batch */}
          <div data-tour="fin-requisitions-queue">
            <TableWrapper className="p-0 border border-slate-200 dark:border-[#232D42] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-[#232D42] flex justify-between items-center bg-slate-50 dark:bg-[#0B0F19]/50 select-none">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wide">
                  Awaiting Funding
                </h3>
                <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
                  Consolidated expense and benefit batches queue
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleProcessBatch}
                className="text-slate-700 dark:text-[#F8FAFC] border-slate-350 font-bold h-10 px-4 text-sm"
              >
                Process Batch
              </Button>
            </div>

            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-sm">BATCH TYPE</TableHeaderCell>
                  <TableHeaderCell className="text-sm">ITEMS</TableHeaderCell>
                  <TableHeaderCell className="text-sm">TOTAL AMOUNT</TableHeaderCell>
                  <TableHeaderCell className="text-sm">STATUS</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disbursements.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                      {row.type}
                    </TableCell>
                    <TableCell className="text-base text-slate-700 dark:text-[#F8FAFC]">
                      {row.itemsCount}
                    </TableCell>
                    <TableCell className="text-base font-bold text-slate-950">
                      {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell className="text-base">
                      <Badge
                        variant={
                          row.status === 'READY TO FUND' ? 'warning' :
                          row.status === 'FUNDED' ? 'success' : 'danger'
                        }
                        className="font-bold text-sm"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
          </div>

        </div>

        {/* Right Column (col-span-4): Compliance & Recent Activity */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-[92px]">
          
          {/* Card 1: Statutory Compliance Radar */}
          <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] shadow-sm rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-rose-200/60 pb-3.5 select-none">
              <DangerTriangleRounded className="text-rose-500 w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-rose-955 uppercase tracking-wider leading-relaxed">
                Remittance Deadlines
              </h2>
            </div>

            {/* Compliance List */}
            <div className="flex flex-col gap-4">
              {complianceItems.map(item => (
                <div key={item.id} className="p-4 bg-white dark:bg-[#111625] border border-rose-200 rounded-lg flex flex-col">
                  <span className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] select-none">
                    {item.name}
                  </span>
                  <span className="text-base font-bold text-rose-600 block mt-1">
                    Due: {item.dueDate}
                  </span>
                  <span className="text-base text-slate-700 dark:text-[#F8FAFC] block mt-1">
                    Amount: {formatCurrency(item.amount)}
                  </span>
                  <Button
                    type="button"
                    onClick={() => handleRemitNow(item)}
                    className="w-full mt-3 bg-rose-600 hover:bg-rose-700 text-white font-bold h-10 text-sm border-0 shadow-sm"
                  >
                    Remit Now
                  </Button>
                </div>
              ))}

              {complianceItems.length === 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-lg text-center select-none">
                  <ShieldCheckRounded className="text-emerald-500 mx-auto mb-1 shrink-0" size={24} />
                  <span className="text-base font-bold text-emerald-800 block">All statutory payments cleared</span>
                </div>
              )}
            </div>
          </Card>

          {/* Card 2: Recent Ledger Activity */}
          <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-[#232D42]/60 pb-3.5 select-none">
              <BankRounded className="text-slate-800 dark:text-[#F8FAFC] w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-relaxed">
                Recent Outflows
              </h2>
            </div>

            {/* Transaction Feed */}
            <div className="flex flex-col gap-4">
              {outflows.map((tx) => (
                <div key={tx.id} className="p-3.5 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42]/80 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] leading-normal select-none">
                      {tx.name}
                    </span>
                    <span className="text-base font-bold text-slate-950">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <Badge className="mt-2 block w-fit font-bold text-sm" variant="success">
                    {tx.date}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Announcement Board & Milestones */}
          <AnnouncementBoard className="mt-2" />
        </div>
      </div>

      {/* Anomalies Modal Overlay */}
      {showAnomaliesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] rounded-xl w-full max-w-lg shadow-sm border border-slate-200 dark:border-[#232D42] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-[#232D42] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
              <div className="flex items-center gap-3 select-none">
                <DangerTriangleRounded className="text-orange-500 w-5 h-5 shrink-0" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Payroll Anomalies Identified
                </h3>
              </div>
              <button
                onClick={() => setShowAnomaliesModal(false)}
                className="text-slate-400 hover:text-slate-655 font-bold text-base bg-slate-100 dark:bg-[#171E2E] hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-base text-slate-750 leading-relaxed">
                The ERP validator detected {anomalies.length} record{anomalies.length === 1 ? '' : 's'} requiring reconciliation prior to closing the draft:
              </p>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                {anomalies.map((item, idx) => (
                  <div key={item.id} className="p-3.5 bg-orange-50/50 border border-orange-200 rounded-xl">
                    <span className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">{idx + 1}. {item.employee_name} ({item.department})</span>
                    <p className="text-sm text-slate-700 dark:text-[#F8FAFC] mt-1">
                      {item.anomaly_reason || 'Timesheet reports discrepancy requiring reconciliation.'}
                    </p>
                  </div>
                ))}
                {anomalies.length === 0 && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="text-sm font-semibold text-emerald-800">All anomalies cleared!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-[#232D42] bg-[#F8FAFC] dark:bg-[#0B0F19] flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAnomaliesModal(false)}
                className="text-slate-700 dark:text-[#F8FAFC] border-slate-300 dark:border-[#232D42] font-bold h-11 px-5 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleResolveAnomalies}
                className="bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white font-bold h-11 min-h-[44px] px-5 text-sm border-0 shadow-sm rounded-lg cursor-pointer"
              >
                Resolve & Acknowledge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Finance audit confirmation modal */}
      {showRunPayrollModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] rounded-xl w-full max-w-lg shadow-sm border border-slate-200 dark:border-[#232D42] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-[#232D42] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0F19]">
              <div className="flex items-center gap-3 select-none">
                <WadOfMoneyRounded className="text-blue-600 w-5 h-5 shrink-0" strokeWidth={2.5} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Approve Payroll Audit
                </h3>
              </div>
              <button
                onClick={() => setShowRunPayrollModal(false)}
                className="text-slate-400 hover:text-slate-655 font-bold text-base bg-slate-100 dark:bg-[#171E2E] hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-base text-slate-750 leading-relaxed">
                Confirm that Finance has verified this payroll ledger. Approval locks the run and forwards it to the CEO for payout authorization.
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-[#F8FAFC]">Scheduled bank payment date</label>
                <Input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={payrollPaymentDate}
                  onChange={(e) => setPayrollPaymentDate(e.target.value)}
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl select-none">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-[#232D42]/50">
                  <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Total Gross Payroll:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">₦{totalGross.toLocaleString()}</span>
                </div>
                {totalEwaDeductions > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-[#232D42]/50">
                    <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">EWA Deductions:</span>
                    <span className="text-base font-extrabold text-emerald-600">-₦{totalEwaDeductions.toLocaleString()}</span>
                  </div>
                )}
                {statutoryDeductions > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-[#232D42]/50">
                    <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Statutory Deductions:</span>
                    <span className="text-base font-extrabold text-orange-605">-₦{statutoryDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-base text-slate-500 dark:text-[#94A3B8] font-bold">Net Disbursements:</span>
                  <span className="text-base font-extrabold text-blue-700">₦{totalNet.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-[#232D42] bg-[#F8FAFC] dark:bg-[#0B0F19] flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRunPayrollModal(false)}
                className="text-slate-700 dark:text-[#F8FAFC] border-slate-300 dark:border-[#232D42] font-bold h-11 px-5 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmRunPayroll}
                disabled={!payrollPaymentDate || executePayrollMutation.isPending}
                className="bg-[#FF4F00] hover:bg-[#FF4F00]/95 text-white font-bold h-11 px-5 text-sm border-0 shadow-sm"
              >
                Approve Audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
