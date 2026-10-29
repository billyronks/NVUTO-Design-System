import type { OnboardingLaunchError } from '../../../services/onboardingService';
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  setStep,
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  updateStep6,
  updateStep7,
  updateStep8,
  setIdempotencyKey,
  setEmailVerification,
  restoreDraft,
  resetOnboarding
} from '../../../store/slices/onboardingSlice';
import {
  Buildings as BuildingsRounded,
  MapPoint as MapPointRounded,
  Global as GlobalRounded,
  CheckCircle as CheckCircleRounded,
  WadOfMoney as WadOfMoneyRounded,
  MonitorSmartphone as MonitorSmartphoneRounded,
  Widget as WidgetRounded,
  Checklist as ChecklistRounded,
  Upload as UploadRounded,
  AltArrowLeft as AltArrowLeftRounded,
  UserPlus as UserPlusRounded,
  CloseCircle as CloseCircleRounded,
  LockKeyhole as LockKeyholeRounded,
  ShieldCheck as ShieldCheckRounded,
  Letter as LetterRounded,
  DangerCircle as DangerCircleIcon
} from '@solar-icons/react';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Button,
  Input,
  Select,
  Checkbox,
  PageHeader,
  ToggleSwitch as Toggle,
  SearchableCombobox
} from '@/app/components/ui';
import { useToast } from '../../context/useToast';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import {
  launchTenantWorkspace,
  sendOnboardingOTP,
  verifyOnboardingOTP,
  saveDraft,
  listDrafts,
} from '../../../services/onboardingService';
import { companyBasicsSchema } from '../../schemas/companyBasicsSchema';
import { operatingRegionsSchema } from '../../schemas/operatingRegionsSchema';
import { orgStructureSchema } from '../../schemas/orgStructureSchema';
import { Step3OrgStructure } from './Step3OrgStructure';
import { MultiSelectCombobox } from '@/app/components/ui/MultiSelectCombobox';
import { Step8DataMigration } from './Step8DataMigration';
import { Step9ReviewLaunch } from './Step9ReviewLaunch';
import { timeAttendanceSchema } from '../../schemas/timeAttendanceSchema';
import { Step4TimeAttendance } from './Step4TimeAttendance';
import { payrollSettingsSchema } from '../../schemas/payrollSettingsSchema';
import { Step5PayrollSettings } from './Step5PayrollSettings';
import { timeOffPoliciesSchema } from '../../schemas/timeOffPoliciesSchema';
import { Step6TimeOffPolicies } from './Step6TimeOffPolicies';
import { moduleActivationSchema } from '../../schemas/moduleActivationSchema';
import { Step7ModuleActivation } from './Step7ModuleActivation';
import { dataMigrationSchema } from '../../schemas/dataMigrationSchema';

export const TenantOnboardingWizard: React.FC = () => {
  const { addToast } = useToast();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const [otpInput, setOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchError, setLaunchError] = useState<OnboardingLaunchError | null>(null);
  const [draftSaveError, setDraftSaveError] = useState<string | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [referenceDataError, setReferenceDataError] = useState<string | null>(null);

  const [referenceData, setReferenceData] = useState<{
    countries: Array<{ value: string; label: string; flag?: string }>;
    currencies: Array<{ value: string; label: string }>;
    timezones: Array<{ value: string; label: string }>;
    residencyRegions: Array<{ value: string; label: string }>;
  }>({ countries: [], currencies: [], timezones: [], residencyRegions: [] });

  useEffect(() => {
    apiClient.get('/system/reference-data')
      .then((res: any) => {
        const data = res?.data || res;
        if (!Array.isArray(data?.countries) || !data.countries.length ||
            !Array.isArray(data?.currencies) || !data.currencies.length ||
            !Array.isArray(data?.timezones) || !data.timezones.length ||
            !Array.isArray(data?.residencyRegions) || !data.residencyRegions.length) {
          throw new Error('The reference-data response is incomplete.');
        }
        setReferenceData(data);
        setReferenceDataError(null);
      })
      .catch((err: any) => {
        const message = err?.message || 'System reference data could not be loaded.';
        setReferenceDataError(message);
        addToast('critical', 'Reference Data Unavailable', 'Onboarding is paused until authoritative system reference data is available.');
      });
  }, [addToast]);

  // Read whole state from Redux
  const onboardingState = useAppSelector((state) => state.onboarding);
  const currentStep = onboardingState.currentStep;

  // Real Draft Resumption: Fetch active drafts on mount and restore safe onboarding progress
  useEffect(() => {
    if (user?.isFullyOnboarded || user?.onboardingCompleted) {
      return;
    }
    listDrafts()
      .then((res: any) => {
        const drafts = res?.data;
        if (Array.isArray(drafts) && drafts.length > 0) {
          const activeDraft = drafts[0];
          if (activeDraft?.id || activeDraft?.draftId || activeDraft?.draft_id) {
            setActiveDraftId(activeDraft.id || activeDraft.draftId || activeDraft.draft_id);
          }
          if (activeDraft?.draftData) {
            dispatch(restoreDraft({
              currentStep: activeDraft.currentStep,
              draftData: activeDraft.draftData,
            }));
            addToast('info', 'Draft Resumed', `Restored active onboarding draft from Step ${activeDraft.currentStep || 1}.`);
          }
        }
      })
      .catch(() => {
        // Silently continue if no remote draft exists or offline
      });
  }, [dispatch, user, addToast]);

  // Debounced auto-save draft to backend (PUT /core/onboarding/drafts/{draft_id}) on every step transition
  useEffect(() => {
    if (currentStep > 1 && !(user?.isFullyOnboarded || user?.onboardingCompleted)) {
      const tenantId = user?.tenantId;
      const userId = user?.id;
      if (!tenantId || !userId) return;
      const draftId = activeDraftId || `tenant-onboarding-${tenantId}-${userId}`;
      const timer = setTimeout(() => {
        saveDraft(draftId, currentStep, onboardingState)
          .then(() => setDraftSaveError(null))
          .catch((err: any) => {
            const msg = err?.message || 'Server unreachable. Draft changes could not be saved to backend.';
            setDraftSaveError(msg);
            console.warn('[Draft Auto-Save Notice]', msg);
          });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onboardingState, user, activeDraftId]);

  // Generate a unique client-side Idempotency Key when Step 9 loads
  useEffect(() => {
    if (currentStep === 9 && !onboardingState.idempotencyKey) {
      if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
        setLaunchError({ message: 'Secure browser randomness is unavailable.', code: 'SECURE_RANDOM_UNAVAILABLE', status: 0 });
        return;
      }
      const key = crypto.randomUUID
        ? crypto.randomUUID()
        : Array.from(crypto.getRandomValues(new Uint8Array(24)), (value) => value.toString(16).padStart(2, '0')).join('');
      dispatch(setIdempotencyKey(key));
    }
  }, [currentStep, onboardingState.idempotencyKey, dispatch]);

  const [pendingUntickType, setPendingUntickType] = useState<string | null>(null);

  const handleSendOTP = async () => {
    const email = step1Form.getValues('adminEmail');
    if (!email || step1Form.formState.errors.adminEmail) {
      addToast('critical', 'Invalid Email', 'Please enter a valid corporate email address first.');
      return;
    }
    setIsSendingOtp(true);
    try {
      const res: any = await sendOnboardingOTP(email.trim());
      const data = res?.data || res;
      const msg = data?.message || 'Verification code sent to your email.';
      setOtpSentMessage(msg);
      addToast('info', 'OTP Sent', msg);
    } catch (err: any) {
      addToast('critical', 'OTP Failed', err?.message || 'Failed to send verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    const email = step1Form.getValues('adminEmail');
    if (!otpInput || otpInput.trim().length < 4) {
      addToast('critical', 'Invalid Code', 'Please enter the 6-digit verification code.');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const res: any = await verifyOnboardingOTP(email.trim(), otpInput.trim());
      const data = res?.data || res;
      const token = data?.verification_token || data?.verificationToken;
      if (data?.verified === true && typeof token === 'string' && token.length > 0) {
        dispatch(setEmailVerification({ isVerified: true, token }));
        step1Form.setValue('isEmailVerified' as any, true);
        addToast('success', 'Email Verified', 'Admin email address has been verified successfully.');
      } else {
        addToast('critical', 'Verification Failed', data?.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      addToast('critical', 'Verification Failed', err?.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };



  // 1. Company Basics Form
  const step1Form = useForm<z.infer<typeof companyBasicsSchema>>({
    resolver: zodResolver(companyBasicsSchema),
    defaultValues: {
      ...onboardingState?.step1,
      adminEmail: onboardingState?.step1?.adminEmail || user?.email || sessionStorage.getItem('nvuto_temp_email') || localStorage.getItem('nvuto_remember_email') || '',
      adminFirstName: onboardingState?.step1?.adminFirstName || (user as any)?.firstName || (user as any)?.profile?.first_name || '',
      adminLastName: onboardingState?.step1?.adminLastName || (user as any)?.lastName || (user as any)?.profile?.last_name || '',
      secondaryAdminFirstName: onboardingState?.step1?.secondaryAdminFirstName || '',
      secondaryAdminLastName: onboardingState?.step1?.secondaryAdminLastName || '',
      secondaryAdminEmail: onboardingState?.step1?.secondaryAdminEmail || '',
    }
  });

  // Automatically pre-fill provisioned admin email and name from logged-in auth session if available
  useEffect(() => {
    const authEmail = user?.email || sessionStorage.getItem('nvuto_temp_email') || localStorage.getItem('nvuto_remember_email');
    const authFirstName = (user as any)?.firstName || (user as any)?.profile?.first_name || '';
    const authLastName = (user as any)?.lastName || (user as any)?.profile?.last_name || '';

    const currentEmail = step1Form.getValues('adminEmail');
    const currentFirstName = step1Form.getValues('adminFirstName');
    const currentLastName = step1Form.getValues('adminLastName');

    if (authEmail && currentEmail !== authEmail) {
      step1Form.setValue('adminEmail', authEmail, { shouldValidate: true });
    }
    if (!currentFirstName && authFirstName) {
      step1Form.setValue('adminFirstName', authFirstName, { shouldValidate: true });
    }
    if (!currentLastName && authLastName) {
      step1Form.setValue('adminLastName', authLastName, { shouldValidate: true });
    }
  }, [user, step1Form]);

  // 2. Operating Regions Form
  const step2Form = useForm<z.infer<typeof operatingRegionsSchema>>({
    resolver: zodResolver(operatingRegionsSchema),
    defaultValues: onboardingState?.step2 || {}
  });

  // 3. Org Structure Form
  const step3Form = useForm<z.input<typeof orgStructureSchema>, unknown, z.output<typeof orgStructureSchema>>({
    resolver: zodResolver(orgStructureSchema),
    defaultValues: {
      departments: onboardingState?.step3?.departments || [],
      locations: onboardingState?.step3?.locations || [],
      enableStandardJobLevels: onboardingState?.step3?.enableJobLevels || false
    }
  });

  // Keep step3Form departments in sync when onboardingState hydrates or restores from draft
  const reduxDepartments = onboardingState?.step3?.departments;
  useEffect(() => {
    if (reduxDepartments && reduxDepartments.length > 0) {
      const currentDepts = step3Form.getValues('departments') || [];
      if (JSON.stringify(currentDepts) !== JSON.stringify(reduxDepartments)) {
        step3Form.setValue('departments', reduxDepartments, { shouldValidate: true });
      }
    }
  }, [reduxDepartments, step3Form]);

  // Helper to convert 24-hour HH:MM time into 12-hour HH:MM AM/PM format
  const convert24to12 = (timeStr: string): string => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    if (isNaN(hour) || isNaN(min)) return '';
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const padHour = displayHour.toString().padStart(2, '0');
    const padMin = min.toString().padStart(2, '0');
    return `${padHour}:${padMin} ${ampm}`;
  };

  // Check if locations have completed geofencing coordinates
  const step3LocationsList = onboardingState?.step3?.locations || [];
  const hasGeocodedLocation = step3LocationsList.some((loc: any) => {
    const lat = Number(loc?.latitude);
    const lon = Number(loc?.longitude);
    return !isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0);
  });

  // 4. Time & Attendance Form
  const step4Form = useForm<z.infer<typeof timeAttendanceSchema>>({
    resolver: zodResolver(timeAttendanceSchema),
    defaultValues: {
      workweekStart: (onboardingState?.step4?.workweekStart as any) || undefined,
      workweekEnd: (onboardingState?.step4?.workweekEnd as any) || undefined,
      dailyWorkHoursStart: convert24to12(onboardingState?.step4?.workHoursStart || ''),
      dailyWorkHoursEnd: convert24to12(onboardingState?.step4?.workHoursEnd || ''),
      trackingMethodology: (onboardingState?.step4?.trackingMethod as any) || undefined,
      enforceGeofencing: hasGeocodedLocation ? (onboardingState?.step4?.enableGeofencing || false) : false,
      enableOvertime: onboardingState?.step4?.enableOvertimePay || false
    }
  });

  // 5. Payroll Settings Form
  const step5Form = useForm<z.infer<typeof payrollSettingsSchema>>({
    resolver: zodResolver(payrollSettingsSchema),
    defaultValues: {
      payCycleFrequency: onboardingState?.step5?.payCycleFrequency || onboardingState?.step5?.payFrequency || '',
      standardPayDay: onboardingState?.step5?.standardPayDay || (onboardingState?.step5?.payDay?.startsWith('Specific Date') ? 'Specific Date' : onboardingState?.step5?.payDay) || '',
      specificPayDay: onboardingState?.step5?.specificPayDay || (onboardingState?.step5?.payDay?.startsWith('Specific Date') ? parseInt(onboardingState?.step5?.payDay?.split(': ')[1] || '', 10) : undefined),
      corporateFundingSource: 'corporate_wallet',
      billingCurrency: onboardingState?.step5?.billingCurrency || onboardingState?.step1?.baseCurrency || '',
      enableStatutoryDeductions: onboardingState?.step5?.enableStatutoryDeductions ?? false,
      isPrimaryAdminFinance: onboardingState?.step5?.isPrimaryAdminFinance ?? false,
      disbursementControllerFirstName: onboardingState?.step5?.disbursementControllerFirstName || '',
      disbursementControllerLastName: onboardingState?.step5?.disbursementControllerLastName || '',
      disbursementControllerEmail: onboardingState?.step5?.disbursementControllerEmail || '',
    }
  });

  // 6. Time Off Policies Form
  const step6Form = useForm<z.infer<typeof timeOffPoliciesSchema>>({
    resolver: zodResolver(timeOffPoliciesSchema),
    defaultValues: {
		publicHolidayCountries: onboardingState?.step6?.publicHolidayCountries || [],
      annualLeaveDays: onboardingState?.step6?.annualLeaveDays ?? 0,
      sickLeaveDays: onboardingState?.step6?.sickLeaveDays ?? 0,
      maternityLeaveDays: onboardingState?.step6?.maternityLeaveDays ?? 0,
      paternityLeaveDays: onboardingState?.step6?.paternityLeaveDays ?? 0,
      accrualFrequency: (onboardingState?.step6?.accrualMethod as any) || undefined,
      restrictProbation: onboardingState?.step6?.restrictProbation ?? onboardingState?.step6?.probationLeaveRestricted ?? false,
      allowRollover: onboardingState?.step6?.allowRollover ?? false,
      maxRolloverDays: onboardingState?.step6?.maxRolloverDays ?? null
    }
  });

  // 7. Module Activation Form
  const step7Form = useForm<z.infer<typeof moduleActivationSchema>>({
    resolver: zodResolver(moduleActivationSchema),
    defaultValues: {
      payroll: onboardingState?.step7?.payroll ?? !!(onboardingState?.step5?.payFrequency || onboardingState?.step5?.payCycleFrequency),
      timeAttendance: onboardingState?.step7?.timeAttendance ?? !!(onboardingState?.step4?.trackingMethod),
      itAssets: onboardingState?.step7?.itAssets ?? false,
      learning: onboardingState?.step7?.learning ?? false,
      engage: onboardingState?.step7?.engage ?? false,
      recruiting: onboardingState?.step7?.recruiting ?? false,
      performance: onboardingState?.step7?.performance ?? false
    }
  });

  // 8. Data Migration Form
  const step8Form = useForm<z.input<typeof dataMigrationSchema>, unknown, z.output<typeof dataMigrationSchema>>({
    resolver: zodResolver(dataMigrationSchema),
    defaultValues: {
      migrationSource: 'Standard CSV File Template',
      skipMigration: onboardingState?.step8?.skipImport ?? onboardingState?.step8?.skipMigration ?? false,
      csvData: onboardingState?.step8?.employees || onboardingState?.step8?.csvData || [],
      fileKey: onboardingState?.step8?.fileKey || '',
      s3Uri: onboardingState?.step8?.s3Uri || ''
    }
  });

  const steps = [
    { number: 1, label: 'Company Basics', icon: BuildingsRounded },
    { number: 2, label: 'Operating Regions', icon: GlobalRounded },
    { number: 3, label: 'Org Structure', icon: MapPointRounded },
    { number: 4, label: 'Time & Attendance', icon: MonitorSmartphoneRounded },
    { number: 5, label: 'Payroll Settings', icon: WadOfMoneyRounded },
    { number: 6, label: 'Time Off Policies', icon: ChecklistRounded },
    { number: 7, label: 'Module Activation', icon: WidgetRounded },
    { number: 8, label: 'Data Migration', icon: UploadRounded },
    { number: 9, label: 'Review & Launch', icon: CheckCircleRounded }
  ];

  // TanStack useMutation for onboarding launch finalizing (POST /api/v1/tenant/onboarding/launch)
  const launchMutation = useMutation({
    mutationFn: () => launchTenantWorkspace(onboardingState),
    onSuccess: async (res: any) => {
      setLaunchError(null);
      const data = res?.data || res;

      // Extract active tenant ID and response metadata from launch API response
      if (data?.tenant_id) {
        try {
          localStorage.setItem('nvuto_tenant_id', data.tenant_id);
        } catch (e) {}
      }

      // Note: CSV-imported employees (step8) are already inserted and invited
      // server-side inside the /tenant/onboarding/launch transaction itself —
      // no separate client-side invite dispatch is needed (a prior version of
      // this code re-invited the same rows per-row via POST /employees/invite,
      // which always 409'd against the rows launch already created and
      // reported those guaranteed conflicts to the admin as bogus SMTP errors).

      // Sync admin first name, last name, and email from onboarding step1 to active user profile
      const adminFirstName = onboardingState.step1?.adminFirstName || '';
      const adminLastName = onboardingState.step1?.adminLastName || '';
      const adminEmail = onboardingState.step1?.adminEmail;
      const activeTenantId = data?.tenant_id || user?.tenantId;

      const nameToSet = `${adminFirstName} ${adminLastName}`.trim() || user?.fullName || '';
      const emailToSet = adminEmail || user?.email || '';

      try {
        if (nameToSet) localStorage.setItem('nvuto_admin_name', nameToSet);
        if (emailToSet) localStorage.setItem('nvuto_admin_email', emailToSet);
        if (activeTenantId) localStorage.setItem('nvuto_tenant_id', activeTenantId);
      } catch (e) {}

      // Purge queryClient cache as required
      queryClient.clear();

      // Re-read the committed identity and onboarding state from the server;
      // never synthesize privileged role or completion state in the browser.
      try {
        await refreshUser();
      } catch {
        // The launch transaction is already committed. The hard redirect below
        // will establish a fresh server-backed session state.
        addToast('warning', 'Refreshing Session', 'Workspace launched successfully; reloading your authenticated workspace state.');
      }

      addToast('success', 'Workspace Provisioned', 'Onboarding completed successfully! Next: Assign official job titles & departments on the dashboard.');

      // Clear Redux state
      dispatch(resetOnboarding());
      
      // Hard redirect to the main HR Admin dashboard to force schema re-fetch
      setTimeout(() => {
        const redirectPath = data?.redirect_to || '/hr/dashboard';
        window.location.href = redirectPath;
      }, 1500);
    },
    onError: (err: any) => {
      const errorPayload: OnboardingLaunchError = {
        message: err?.message || 'Tenant workspace provisioning failed due to a backend infrastructure error.',
        code: err?.code || 'WORKSPACE_PROVISION_FAILED',
        status: err?.status || 500,
        details: err?.details || err,
      };

      setLaunchError(errorPayload);
      addToast('critical', 'Launch Failed', errorPayload.message);
    }
  });

  const handleNext = () => {
    if (currentStep === 1) {
      step1Form.handleSubmit((values) => {
        const adminFullName = `${values.adminFirstName || ''} ${values.adminLastName || ''}`.trim();
        if (adminFullName) {
          try {
            localStorage.setItem('nvuto_admin_name', adminFullName);
          } catch (e) {}
        }
        if (values.adminEmail) {
          try {
            localStorage.setItem('nvuto_admin_email', values.adminEmail);
          } catch (e) {}
        }
        dispatch(updateStep1({
          ...values,
          isEmailVerified: !!(onboardingState.step1?.isEmailVerified || step1Form.getValues('isEmailVerified' as any)),
          verificationToken: onboardingState.step1?.verificationToken || step1Form.getValues('verificationToken' as any) || '',
        }));
        dispatch(setStep(2));
      })();
    } else if (currentStep === 2) {
      step2Form.handleSubmit((values) => {
        dispatch(updateStep2(values));
        dispatch(setStep(3));
      })();
    } else if (currentStep === 3) {
      step3Form.handleSubmit((values) => {
        dispatch(updateStep3({
          departments: values.departments,
          locations: values.locations.map((loc) => ({
            name: loc.name,
            type: loc.type,
            address: loc.address || '',
            city: loc.city || '',
            state: loc.state || '',
            postalCode: loc.postalCode || '',
            countryCode: loc.countryCode || '',
            latitude: loc.latitude !== undefined ? loc.latitude : null,
            longitude: loc.longitude !== undefined ? loc.longitude : null,
            isGeocoded: !!loc.isGeocoded
          })),
          enableJobLevels: values.enableStandardJobLevels
        }));
        dispatch(setStep(4));
      })();
    } else if (currentStep === 4) {
      step4Form.handleSubmit((values) => {
        dispatch(updateStep4({
          workweekStart: values.workweekStart,
          workweekEnd: values.workweekEnd,
          workHoursStart: values.dailyWorkHoursStart,
          workHoursEnd: values.dailyWorkHoursEnd,
          trackingMethod: values.trackingMethodology,
          enableGeofencing: values.enforceGeofencing,
          locationGeofencing: (values.locationGeofencing || []).map((item: any) => ({
            locationName: item.locationName,
            workweekStart: item.workweekStart || values.workweekStart,
            workweekEnd: item.workweekEnd || values.workweekEnd,
            workHoursStart: item.dailyWorkHoursStart || values.dailyWorkHoursStart,
            workHoursEnd: item.dailyWorkHoursEnd || values.dailyWorkHoursEnd,
            trackingMethod: item.trackingMethodology || values.trackingMethodology,
            enableGeofencing: item.enableGeofencing ?? values.enforceGeofencing,
            geofenceRadiusMeters: item.geofenceRadiusMeters ?? 0
          })),
          enableOvertimePay: values.enableOvertime
        }));
        dispatch(setStep(5));
      })();
    } else if (currentStep === 5) {
      step5Form.handleSubmit((values) => {
        dispatch(updateStep5({
          payFrequency: values.payCycleFrequency,
          payDay: values.standardPayDay === 'Specific Date' ? `Specific Date: ${values.specificPayDay}` : values.standardPayDay,
          fundingSource: values.corporateFundingSource,
          billingCurrency: values.billingCurrency,
          enableStatutoryDeductions: values.enableStatutoryDeductions,
          taxRegion: onboardingState?.step1?.hqCountry || '',
          currency: onboardingState?.step1?.baseCurrency || '',
          
          isPrimaryAdminFinance: values.isPrimaryAdminFinance ?? false,
          disbursementControllerFirstName: values.disbursementControllerFirstName || '',
          disbursementControllerLastName: values.disbursementControllerLastName || '',
          disbursementControllerEmail: values.disbursementControllerEmail || '',

          payCycleFrequency: values.payCycleFrequency,
          standardPayDay: values.standardPayDay,
          specificPayDay: values.specificPayDay,
          corporateFundingSource: values.corporateFundingSource,

          statutoryDeductionPreferences: onboardingState?.step5?.statutoryDeductionPreferences || {},
          disabledMandatoryDeductions: onboardingState?.step5?.disabledMandatoryDeductions || [],
          warningAcknowledgedBy: onboardingState?.step5?.warningAcknowledgedBy || '',
          acknowledgedAt: onboardingState?.step5?.acknowledgedAt || '',
        }));
        dispatch(setStep(6));
      })();
    } else if (currentStep === 6) {
      step6Form.handleSubmit((values) => {
        dispatch(updateStep6({
			publicHolidayCountries: values.publicHolidayCountries,
          defaultLeaveDays: values.annualLeaveDays,
          default_days: values.annualLeaveDays,
          annualLeaveDays: values.annualLeaveDays,
          sickLeaveDays: values.sickLeaveDays,
          maternityLeaveDays: values.maternityLeaveDays,
          paternityLeaveDays: values.paternityLeaveDays,
          accrualMethod: values.accrualFrequency,
          accrual_method: values.accrualFrequency,
          allowRollover: values.allowRollover,
          maxRolloverDays: values.allowRollover ? (values.maxRolloverDays ?? 0) : 0,
          carryover_days: values.allowRollover ? (values.maxRolloverDays ?? 0) : 0,
          probationLeaveRestricted: values.restrictProbation,
          restrictProbation: values.restrictProbation
        }));
        dispatch(setStep(7));
      })();
    } else if (currentStep === 7) {
      step7Form.handleSubmit((values) => {
        dispatch(updateStep7(values));
        dispatch(setStep(8));
      })();
    } else if (currentStep === 8) {
      step8Form.handleSubmit((values) => {
        dispatch(updateStep8({
          importSource: 'Standard CSV File Template',
          migrationSource: 'Standard CSV File Template',
          skipImport: values.skipMigration,
          skipMigration: values.skipMigration,
          employees: values.skipMigration ? [] : values.csvData || [],
          csvData: values.skipMigration ? [] : values.csvData || [],
          fileKey: values.skipMigration ? '' : (step8Form.getValues('fileKey') || ''),
          s3Uri: values.skipMigration ? '' : (step8Form.getValues('s3Uri') || '')
        }));
        dispatch(setStep(9));
      })();
    } else if (currentStep === 9) {
      if (!onboardingState.step1?.isEmailVerified) {
        addToast('critical', 'Verification Required', 'Admin email verification is required before launching the workspace.');
        dispatch(setStep(1));
        return;
      }
      setShowLaunchModal(true);
    }
  };

  const handleBack = () => {
    dispatch(setStep(Math.max(currentStep - 1, 1)));
  };

  const isStepValid = () => {
    if (referenceDataError) return false;
    if (currentStep === 1) return step1Form.formState.isValid;
    if (currentStep === 2) return step2Form.formState.isValid;
    if (currentStep === 3) return step3Form.formState.isValid;
    if (currentStep === 4) return step4Form.formState.isValid;
    if (currentStep === 5) return step5Form.formState.isValid;
    if (currentStep === 6) return step6Form.formState.isValid;
    if (currentStep === 7) return step7Form.formState.isValid;
    if (currentStep === 8) return step8Form.formState.isValid;
    if (currentStep === 9) return !!onboardingState.step1?.isEmailVerified;
    return true;
  };

  const isSubmitting = launchMutation.isPending;

  if (user?.isFullyOnboarded || user?.onboardingCompleted) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] items-center justify-center p-6">
        <Card className="max-w-xl w-full bg-white dark:bg-[#111625] border border-emerald-500/30 p-8 rounded-xl shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <CheckCircleRounded size={36} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Workspace Fully Onboarded
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            This tenant workspace has already completed the initial launch setup and is fully provisioned in production. Subsequent re-onboarding is prohibited to preserve organization data integrity.
          </p>
          <Button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            className="bg-[#FF4F00] hover:bg-[#E04600] text-white font-bold px-6 py-2.5 rounded-lg cursor-pointer"
          >
            Go to HR Workspace Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <div className="nvuto-page-canvas w-full min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
        <PageHeader
          title="Company Onboarding Workspace Setup"
          subtitle="Configure default organization profile, regional compliance, geofencing parameters, and payroll cycles."
        />

        {referenceDataError && (
          <Card className="w-full mb-6 border border-red-300 bg-red-50 p-5 text-red-800">
            <h3 className="font-extrabold">Authoritative reference data is unavailable</h3>
            <p className="mt-1 text-sm">{referenceDataError} Reload the page after the service is restored. Onboarding cannot safely continue with guessed country, currency, timezone, or residency values.</p>
          </Card>
        )}

        {/* Multi-Step Tracker */}
        <div className="w-full mb-8 select-none">
          <div className="flex flex-wrap items-center justify-start gap-3 p-4 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm">
            {steps.map((step) => {
              const isCompleted = step.number < currentStep;
              const isActive = step.number === currentStep;
              const StepIcon = isCompleted ? CheckCircleRounded : step.icon;

              let pillClass = '';
              if (isCompleted) {
                pillClass = 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/80 cursor-pointer';
              } else if (isActive) {
                pillClass = 'bg-[#FF4F00] border-[#FF4F00] text-white shadow-sm font-extrabold scale-102';
              } else {
                pillClass = 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100';
              }

              return (
                <div
                  key={step.number}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-all duration-200 ${pillClass}`}
                  onClick={() => {
                    if (step.number < currentStep) {
                      dispatch(setStep(step.number));
                    }
                  }}
                >
                  <StepIcon className="w-4 h-4 shrink-0" />
                  <span className="font-bold whitespace-nowrap">
                    {step.number}. {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Localized Draft Save Error UI (Obsidian Surface Architecture) */}
        {draftSaveError && (
          <Card className="w-full mb-6 bg-[#111625] border border-amber-500/30 text-amber-400 p-6 rounded-xl shadow-sm flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <DangerCircleIcon size={24} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-amber-400 tracking-wide uppercase">
                    Draft Persistence Failed
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    Network/Server Error
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed mt-1">
                  {draftSaveError}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraftSaveError(null)}
                className="text-xs font-bold text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
              >
                Dismiss Warning
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const tenantId = user?.tenantId;
                  const userId = user?.id;
                  if (!tenantId || !userId) {
                    setDraftSaveError('Authenticated tenant and user identity are required to save this draft.');
                    return;
                  }
                  const draftId = activeDraftId || `tenant-onboarding-${tenantId}-${userId}`;
                  saveDraft(draftId, currentStep, onboardingState)
                    .then(() => {
                      setDraftSaveError(null);
                      addToast('success', 'Draft Saved', 'Onboarding draft successfully persisted.');
                    })
                    .catch((err: any) => {
                      const msg = err?.message || 'Server unreachable. Failed to save draft.';
                      setDraftSaveError(msg);
                      addToast('critical', 'Retry Failed', msg);
                    });
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm border-0 cursor-pointer"
              >
                Retry Save Draft
              </Button>
            </div>
          </Card>
        )}

        {/* Localized Error UI (Obsidian Surface Architecture) */}
        {launchError && (
          <Card className="w-full mb-6 bg-[#111625] border border-red-500/20 text-red-400 p-6 rounded-xl shadow-sm flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <CloseCircleRounded size={24} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-red-400 tracking-wide uppercase">
                    Workspace Provisioning Failed
                  </h4>
                  {launchError.status && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                      HTTP {launchError.status}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed mt-1">
                  {launchError.message}
                </p>
                {launchError.code && (
                  <span className="text-xs font-mono text-slate-400 mt-1">
                    Error Code: <code className="text-red-300 font-bold">{launchError.code}</code>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-500/20">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLaunchError(null)}
                className="text-xs font-bold text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
              >
                Dismiss Error
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setLaunchError(null);
                  launchMutation.mutate();
                }}
                isLoading={launchMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm border-0 cursor-pointer"
              >
                Retry Launch
              </Button>
            </div>
          </Card>
        )}

        {/* Form Wizard Container */}
        <Card className="w-full border border-slate-200 dark:border-[#232D42] shadow-sm bg-white dark:bg-[#111625] p-6 md:p-8 rounded-xl flex flex-col gap-6">
          <CardContent className="p-0">
            {/* Step 1: Company Basics */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div className="pb-4 border-b border-slate-100 dark:border-[#232D42] flex items-center gap-2 select-none">
                  <BuildingsRounded className="w-5 h-5 text-[#FF4F00]" />
                  <h3 className="text-sm font-black tracking-wider text-[#FF4F00] uppercase">
                    1. Company Basics & Identity
                  </h3>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Legal Company Name"
                    placeholder="e.g., NVUTO Technologies Limited"
                    {...step1Form.register('legalName')}
                    error={step1Form.formState.errors.legalName?.message}
                    required
                  />
                  <Input
                    label="Registration CAC / RC Number"
                    placeholder="e.g., RC-12345678"
                    {...step1Form.register('regNumber')}
                    onChange={(e) => {
                      step1Form.setValue('regNumber', e.target.value.toUpperCase(), { shouldValidate: true });
                    }}
                    error={step1Form.formState.errors.regNumber?.message}
                    required
                  />
                  <SearchableCombobox
                    label="HQ Country"
                    value={step1Form.watch('hqCountry')}
                    onChange={(eOrVal: any) => {
                      const rawVal = typeof eOrVal === 'string' ? eOrVal : eOrVal?.target?.value || '';
                      if (!rawVal) return;
                      const upperCode = rawVal.toUpperCase();
                      step1Form.setValue('hqCountry', upperCode, { shouldValidate: true });
                    }}
                    options={referenceData.countries}
                    error={step1Form.formState.errors.hqCountry?.message}
                    required
                  />
                  <Select
                    label="Base Currency"
                    value={step1Form.watch('baseCurrency')}
                    onChange={(e) => step1Form.setValue('baseCurrency', e.target.value.toUpperCase(), { shouldValidate: true })}
                    options={referenceData.currencies}
                    error={step1Form.formState.errors.baseCurrency?.message}
                    required
                  />
                  <Select
                    label="Company Size"
                    value={step1Form.watch('companySize')}
                    onChange={(e) => step1Form.setValue('companySize', e.target.value, { shouldValidate: true })}
                    options={[
                      { value: '1-10', label: '1 - 10 Employees' },
                      { value: '10-50', label: '10 - 50 Employees' },
                      { value: '50-250', label: '50 - 250 Employees' },
                      { value: '250+', label: '250+ Enterprise' }
                    ]}
                    error={step1Form.formState.errors.companySize?.message}
                    required
                  />
                  <Select
                    label="Timezone"
                    value={step1Form.watch('hqTimezone')}
                    onChange={(e) => step1Form.setValue('hqTimezone', e.target.value, { shouldValidate: true })}
                    options={referenceData.timezones}
                    error={step1Form.formState.errors.hqTimezone?.message}
                    required
                  />
                  <Select
                    label="Data Residency Region"
                    value={step1Form.watch('dataResidency')}
                    onChange={(e) => step1Form.setValue('dataResidency', e.target.value, { shouldValidate: true })}
                    options={referenceData.residencyRegions}
                    error={step1Form.formState.errors.dataResidency?.message}
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <Input
                      label="Tax Identification Number (TIN)"
                      placeholder="e.g., 12345678-0001"
                      {...step1Form.register('tin')}
                      error={step1Form.formState.errors.tin?.message}
                      required
                    />
                    <span className="text-xs text-slate-500 dark:text-[#94A3B8] ml-1">
                      Required for local tax authority filings, PAYE tax calculation, and statutory compliance (Step 5).
                    </span>
                  </div>
                  <Select
                    label="Legal Entity Type"
                    value={step1Form.watch('entityType')}
                    onChange={(e) => step1Form.setValue('entityType', e.target.value, { shouldValidate: true })}
                    options={[
                      { value: 'private_limited', label: 'Private Limited Company' },
                      { value: 'llc', label: 'Limited Liability Company (LLC)' },
                      { value: 'public_ltd', label: 'Public Limited Company (PLC)' }
                    ]}
                    error={step1Form.formState.errors.entityType?.message}
                    required
                  />

                  <div className="col-span-2 pb-4 mt-6 border-b border-slate-100 dark:border-[#232D42] flex items-center gap-2 select-none">
                    <UserPlusRounded className="w-5 h-5 text-[#FF4F00]" />
                    <h3 className="text-sm font-black tracking-wider text-[#FF4F00] uppercase">
                      Initial Admin Credentials & Ownership Setup
                    </h3>
                  </div>

                  <div className="col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 select-none">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-amber-800 text-base font-black">!</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-extrabold text-amber-900 leading-none">Primary Admin & Ownership Transfer Notice</span>
                      <span className="text-xs text-amber-800 font-semibold leading-relaxed mt-1">
                        The tenant administrator account configured here will act as the initial primary workspace admin and owner. Ownership can be safely transferred to another admin at any time, allowing the previous owner to be demoted or offboarded through the ownership-transfer model.
                      </span>
                    </div>
                  </div>

                  <Input
                    label="Admin First Name"
                    placeholder="e.g., Amara"
                    {...step1Form.register('adminFirstName')}
                    error={step1Form.formState.errors.adminFirstName?.message}
                    required
                  />
                  <Input
                    label="Admin Last Name"
                    placeholder="e.g., Okonkwo"
                    {...step1Form.register('adminLastName')}
                    error={step1Form.formState.errors.adminLastName?.message}
                    required
                  />
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Input
                      label="Admin Corporate Email"
                      type="email"
                      placeholder="e.g., admin@company.com"
                      {...step1Form.register('adminEmail')}
                      error={step1Form.formState.errors.adminEmail?.message}
                      required
                      readOnly
                      tabIndex={-1}
                      rightIcon={LockKeyholeRounded}
                      className="bg-slate-100/90 dark:bg-[#151C2C]/80 cursor-not-allowed text-slate-600 dark:text-slate-300 font-medium select-all border-slate-300 dark:border-[#2A364F] focus:ring-0 focus:border-slate-300 dark:focus:border-[#2A364F]"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium select-none ml-0.5">
                      <LockKeyholeRounded size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      Locked to your authenticated corporate account. To delegate another administrator, use the Secondary Admin field below.
                    </p>
                  </div>

                  {/* Mandatory Admin Email Verification Block */}
                  <div className="col-span-2 p-4 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LetterRounded className="w-5 h-5 text-[#FF4F00]" />
                        <span className="text-xs font-bold text-slate-700 dark:text-[#F8FAFC] uppercase tracking-wider">
                          Admin Corporate Email Verification
                        </span>
                      </div>
                      {onboardingState.step1?.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-extrabold">
                          <ShieldCheckRounded className="w-4 h-4" />
                          Email Verified ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                          Pending OTP Verification
                        </span>
                      )}
                    </div>

                    {!onboardingState.step1?.isEmailVerified && (
                      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 mt-1">
                        <div className="flex-1">
                          <Input
                            label="Verification Code (OTP)"
                            placeholder="Enter 6-digit OTP code"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendOTP}
                          isLoading={isSendingOtp}
                          className="h-10 text-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          Send OTP Code
                        </Button>
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          isLoading={isVerifyingOtp}
                          disabled={!otpInput.trim()}
                          className="h-11 min-h-[44px] bg-[#FF4F00] hover:bg-[#e04500] text-white text-xs font-bold cursor-pointer border-0 whitespace-nowrap"
                        >
                          Verify Code
                        </Button>
                      </div>
                    )}
                    {otpSentMessage && !onboardingState.step1?.isEmailVerified && (
                      <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold">{otpSentMessage}</span>
                    )}
                  </div>

                  {/* Optional Secondary / Backup Admin Fields */}
                  <div className="col-span-2 pb-2 mt-4 border-b border-slate-100 dark:border-[#232D42] flex items-center gap-2 select-none">
                    <UserPlusRounded className="w-4 h-4 text-slate-400" />
                    <h4 className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-[#94A3B8] uppercase">
                      Secondary / Backup Workspace Admin (Optional)
                    </h4>
                  </div>

                  <Input
                    label="Secondary Admin First Name (Optional)"
                    placeholder="e.g., Tunde"
                    {...step1Form.register('secondaryAdminFirstName')}
                    error={step1Form.formState.errors.secondaryAdminFirstName?.message}
                  />
                  <Input
                    label="Secondary Admin Last Name (Optional)"
                    placeholder="e.g., Bakare"
                    {...step1Form.register('secondaryAdminLastName')}
                    error={step1Form.formState.errors.secondaryAdminLastName?.message}
                  />
                  <Input
                    label="Secondary Admin Corporate Email (Optional)"
                    type="email"
                    placeholder="e.g., backup-admin@company.com"
                    containerClassName="col-span-2"
                    {...step1Form.register('secondaryAdminEmail')}
                    error={step1Form.formState.errors.secondaryAdminEmail?.message}
                  />
                </form>
              </div>
            )}

            {/* Step 2: Operating Regions */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="pb-4 border-b border-slate-100 dark:border-[#232D42] flex items-center gap-2 select-none">
                  <GlobalRounded className="w-5 h-5 text-[#FF4F00]" />
                  <h3 className="text-sm font-black tracking-wider text-[#FF4F00] uppercase">
                    2. Operating Regions & Footprint
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wide select-none">
                    Workforce Types Deployment
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['direct', 'contractors', 'eor'].map((type) => (
                      <div key={type} className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-lg">
                        <Checkbox
                          id={`wf-${type}`}
                          checked={step2Form.watch('workforceTypes').includes(type)}
                          onCheckedChange={(checked) => {
                            const current = step2Form.getValues('workforceTypes') || [];
                            const isChecked = checked === true;
                            if (!isChecked && current.includes(type)) {
                              // Trigger confirmation prompt before unticking
                              setPendingUntickType(type);
                              return;
                            }
                            const next = isChecked
                              ? current.includes(type) ? current : [...current, type]
                              : current.filter((t) => t !== type);
                            step2Form.setValue('workforceTypes', next, { shouldValidate: true });
                          }}
                          label={
                            type === 'direct'
                              ? 'Direct Employees'
                              : type === 'eor'
                              ? 'EOR Partners (Global)'
                              : 'Contractors'
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* Confirmation Modal when unticking a workforce type */}
                  {pendingUntickType && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                      <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 shrink-0">
                            <DangerCircleIcon size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC]">
                            Disable {pendingUntickType === 'direct' ? 'Direct Employees' : pendingUntickType === 'eor' ? 'EOR Partners' : 'Contractors'} Module?
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                          Unticking this workforce type will hide the associated management module from your workspace. <strong>Existing records (employees/contractors) will be preserved in the database and will not be deleted or modified.</strong>
                        </p>
                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-[#232D42]">
                          <Button
                            variant="outline"
                            onClick={() => setPendingUntickType(null)}
                            className="px-4 py-2 text-sm font-semibold"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              const current = step2Form.getValues('workforceTypes') || [];
                              const next = current.filter((t) => t !== pendingUntickType);
                              step2Form.setValue('workforceTypes', next, { shouldValidate: true });
                              setPendingUntickType(null);
                            }}
                            className="px-4 py-2 text-sm font-semibold !bg-[#BE123C] hover:!bg-[#9F1239] text-white border-0"
                          >
                            Confirm & Hide Module
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <Controller
                    control={step2Form.control}
                    name="operatingCountries"
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-3 mt-4">
                        <MultiSelectCombobox
                          label="Active Operating Countries"
                          options={referenceData.countries}
                          selectedValues={field.value || []}
                          onChange={(vals) => field.onChange(vals)}
                          placeholder="Search and select operating countries..."
                          error={fieldState.error?.message}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Org Structure */}
            {currentStep === 3 && (
              <Step3OrgStructure form={step3Form} />
            )}

            {/* Step 4: Time & Attendance */}
            {currentStep === 4 && (
              <Step4TimeAttendance form={step4Form} />
            )}

            {/* Step 5: Payroll Settings */}
            {currentStep === 5 && (
              <Step5PayrollSettings form={step5Form} />
            )}

            {/* Step 6: Time Off Policies */}
            {currentStep === 6 && (
              <Step6TimeOffPolicies form={step6Form} />
            )}

            {/* Step 7: Module Activation */}
            {currentStep === 7 && (
              <Step7ModuleActivation form={step7Form} />
            )}

            {/* Step 8: Data Migration */}
            {currentStep === 8 && (
              <Step8DataMigration form={step8Form} />
            )}

            {/* Step 9: Review & Launch */}
            {currentStep === 9 && (
              <Step9ReviewLaunch />
            )}
          </CardContent>
        </Card>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center gap-4 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2 text-slate-500 dark:text-[#94A3B8] hover:bg-slate-100 dark:bg-[#171E2E] cursor-pointer"
            leftIcon={AltArrowLeftRounded}
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
            isLoading={isSubmitting}
            className={currentStep === 9
              ? "bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold shadow-sm hover:shadow-lg transition-all rounded-lg cursor-pointer border-0"
              : "bg-[#111184] hover:bg-[#0a0a54] text-white font-bold shadow-sm hover:shadow-lg transition-all rounded-lg cursor-pointer border-0"
            }
          >
            {currentStep === 9 ? 'Finish & Enter NVUTO' : 'Save & Continue'}
          </Button>
        </div>

        {/* Launch Confirmation Modal */}
        {showLaunchModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#232D42] pb-4">
                <div className="w-10 h-10 rounded-full bg-[#FF4F00]/10 flex items-center justify-center text-[#FF4F00] shrink-0">
                  <ShieldCheckRounded size={24} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC]">
                    Confirm Workspace Provisioning
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold">
                    Final step to activate tenant workspace
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-[#94A3B8]">
                <p className="leading-relaxed">
                  You are about to finalize onboarding and launch the workspace for <strong>{onboardingState.step1?.legalName || 'your organization'}</strong>.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl flex flex-col gap-1.5 text-xs font-semibold">
                  <div>• HQ Country: <strong>{onboardingState.step1?.hqCountry}</strong> ({onboardingState.step1?.baseCurrency})</div>
                  <div>• Admin Account: <strong>{onboardingState.step1?.adminEmail}</strong></div>
                  <div>• Departments Configured: <strong>{(onboardingState.step3?.departments || []).length}</strong></div>
                  <div>• Office Locations: <strong>{(onboardingState.step3?.locations || []).length}</strong></div>
                  <div>• Employees to Invite: <strong>{(onboardingState.step8?.employees || onboardingState.step8?.csvData || []).length}</strong></div>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Launching will commit database configurations, enforce geofence parameters, and trigger employee invitations.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#232D42]">
                <Button
                  variant="outline"
                  onClick={() => setShowLaunchModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  Back to Review
                </Button>
                <Button
                  onClick={() => {
                    setShowLaunchModal(false);
                    launchMutation.mutate();
                  }}
                  isLoading={isSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 shadow-sm"
                >
                  Confirm & Launch Workspace
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
