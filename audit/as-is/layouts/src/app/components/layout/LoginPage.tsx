import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  Lock as LockIcon,
  AltArrowRight
} from '@solar-icons/react';
import {
  Button,
  Input,
  Checkbox,
  Form,
  Label,
  Avatar,
  InteractiveGridBackground
} from '@/app/components/ui';
import { login, verify2FA } from '../../../services/authService';
import { useToast } from '../../context/useToast';
import { TwoFactorChallenge } from './TwoFactorChallenge';
import { useAppSelector } from '../../../store';
import { useAuth, getSubdomain, isReservedSlug } from '../../context/AuthContext';
import { normalizeRole, SystemRole, getDefaultDashboardPath } from '../../../types/auth.types';
import { getApiBaseUrl } from '../../../lib/apiClient';
import { readBrowserPreference } from '../../../lib/browserPreferences';

// Custom Globe icon for language selector
const GlobeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Custom solid orange Shield icon for trust cards
const SolidShieldIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF4F00" className={className}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

// Custom solid orange Speedometer icon for trust cards
const SolidSpeedometerIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF4F00" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm4.3 7.3l-1.4-1.4 2.5-2.5 1.4 1.4-2.5 2.5z" />
  </svg>
);

// Custom footer security icons
const SmallShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-[#94A3B8]">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SmallKeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-[#94A3B8]">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const SmallCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-[#94A3B8]">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Custom trailing icon for Email (@ symbol)
const AtIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <span
    className="font-bold text-slate-450 select-none pointer-events-none"
    style={{ fontSize: size }}
  >
    @
  </span>
);

// Verified demo personas for apex-tech matching DEMO_CREDENTIALS_LOCAL.md
const DEMO_PERSONAS = [
  {
    roleName: 'CEO',
    name: 'Dr. Arthur Vance',
    email: 'ceo@apex.io',
    password: 'ApexDemo!Arthur2026',
    badge: 'PIN: 9482',
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  },
  {
    roleName: 'HR Admin',
    name: 'Marcus Balogun',
    email: 'hr@apex.io',
    password: 'ApexDemo!Marcus2026',
    badge: 'HR Director',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  {
    roleName: 'Finance',
    name: 'Sarah Jenkins',
    email: 'finance@apex.io',
    password: 'ApexDemo!Sarah2026',
    badge: 'Controller',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  {
    roleName: 'Manager',
    name: 'David Okafor',
    email: 'david@apex.io',
    password: 'ApexDemo!David2026',
    badge: 'Eng Lead',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  {
    roleName: 'Employee',
    name: 'Amina Bello',
    email: 'amina@apex.io',
    password: 'ApexDemo!Amina2026',
    badge: 'ESS / EWA',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  },
  {
    roleName: 'IT Admin',
    name: 'Tunde Lawal',
    email: 'it@apex.io',
    password: 'ApexDemo!Tunde2026',
    badge: 'Systems',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  },
  {
    roleName: 'Candidate',
    name: 'Kevin Vance',
    email: 'kevin.vance@gmail.com',
    password: 'ApexDemo!Kevin2026',
    badge: 'ATS Pipeline',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setTempToken: setAuthTempToken, setUser } = useAuth();

  // Login Form States (managed via react-hook-form)
  const { register, handleSubmit: handleFormSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Enforce pristine light mode theme on Login Page without overwriting user's saved preference
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    // Purge any stale active-role or legacy dev-role assumptions when visiting login page
    try {
      sessionStorage.removeItem('nvuto_active_role');
      localStorage.removeItem('nvuto_active_role');
      localStorage.removeItem('nvuto_dev_role');
    } catch (_) {}

    return () => {
      const storedTheme = readBrowserPreference('nvuto_theme');
      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Auto pre-fill saved email if Remember Me was previously checked
  useEffect(() => {
    const savedRemember = readBrowserPreference('nvuto_remember_me') === 'true';
    const savedEmail = readBrowserPreference('nvuto_remember_email');
    if (savedRemember && savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  // Workspace Discovery States
  const [isRootDomain, setIsRootDomain] = useState(() => !getSubdomain());
  const [workspaceInput, setWorkspaceInput] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');
  const [isValidatingWorkspace, setIsValidatingWorkspace] = useState(false);
  const [currentSubdomain, setCurrentSubdomain] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  useEffect(() => {
    const sub = getSubdomain();
    setCurrentSubdomain(sub || '');
    // If there is NO tenant subdomain, this is the root domain (workspace discovery page)
    // If there IS a tenant subdomain, this is the tenant login page
    setIsRootDomain(!sub);
  }, []);

  const isApexDemoTenant =
    currentSubdomain === 'apex-tech' ||
    (typeof window !== 'undefined' && (
      window.location.hostname.startsWith('apex-tech') ||
      new URLSearchParams(window.location.search).get('demo') === 'true' ||
      readBrowserPreference('nvuto_workspace_slug') === 'apex-tech'
    ));

  const handleSelectPersona = (p: typeof DEMO_PERSONAS[0]) => {
    setSelectedPersona(p.email);
    setValue('email', p.email);
    setValue('password', p.password);
    setError('');
  };

  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceInput.trim()) {
      setWorkspaceError('Please enter a workspace URL name.');
      return;
    }
    
    // Aggressive sanitization: trim, lowercase, replace spaces with hyphens
    const slug = workspaceInput.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (isReservedSlug(slug)) {
      setWorkspaceError(`"${slug}" is a reserved system service and cannot be used as a company workspace.`);
      return;
    }

    setIsValidatingWorkspace(true);
    setWorkspaceError('');
    
    try {
      // Fire pre-flight verify request
      const response = await fetch(`${getApiBaseUrl()}/tenants/verify?slug=${slug}`);
      if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        if (data.code === 'RESERVED_SLUG') {
          setWorkspaceError(`"${slug}" is a reserved system service and cannot be used as a company workspace.`);
        } else {
          setWorkspaceError(data.error || 'Invalid workspace name.');
        }
      } else if (response.status === 404 || response.status === 403) {
        setWorkspaceError("We couldn't find a workspace with that name. Please check your spelling.");
      } else if (response.ok) {
        // Successful verification -> redirect to tenant subdomain
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
          window.location.href = `${window.location.protocol}//${slug}.localhost:${window.location.port}/login`;
        } else {
          window.location.href = `https://${slug}.nvuto.com/login`;
        }
      } else {
        setWorkspaceError('An error occurred while verifying the workspace. Please try again.');
      }
    } catch (err) {
      setWorkspaceError('Failed to connect to the verification service. Please check your internet connection.');
    } finally {
      setIsValidatingWorkspace(false);
    }
  };

  const handleChangeWorkspace = () => {
    try {
      localStorage.removeItem('nvuto_workspace_slug');
      localStorage.removeItem('nvuto_tenant_id');
      sessionStorage.removeItem('nvuto_active_role');
    } catch (_) {}

    const hostname = window.location.hostname;
    if (hostname.endsWith('.localhost')) {
      window.location.href = `${window.location.protocol}//localhost:${window.location.port}/login`;
    } else if (hostname.endsWith('.nvuto.com')) {
      window.location.href = 'https://nvuto.com/login';
    } else {
      window.location.href = '/login';
    }
  };

  // Workflow Gates States
  const [requires2FA, setRequires2FA] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [mobileActivationRequired, setMobileActivationRequired] = useState(false);

  const profile = useAppSelector((state) => state.auth.profile);
  // AuthProvider owns existing-session redirects after server validation.
  // Persisted Redux display data must not race that decision during login.

  const getStartupRoute = (startupModule?: string, role?: string) => {
    const normRole = normalizeRole(role);
    const isAdminRole = normRole === SystemRole.HR_ADMIN || normRole === SystemRole.HR || normRole === SystemRole.ADMIN;

    const moduleRouteMap: Record<string, string> = {
      'Home / Dashboard': '/hr/dashboard',
      'Home': '/hr/dashboard',
      'Payroll Center': '/hr/payroll',
      'Payroll': '/hr/payroll',
      'IT Assets Registry': '/hr/it-assets/registry',
      'IT Assets': '/hr/it-assets/registry',
      'Employee Directory': '/hr/directory',
      'Directory': '/hr/directory',
      'Leave Management': '/hr/leave',
      'Leave': '/hr/leave',
      'Recruitment': '/hr/recruitment/pipeline',
      'Analytics': '/hr/analytics',
    };

    if (isAdminRole && startupModule && moduleRouteMap[startupModule]) {
      return moduleRouteMap[startupModule];
    }

    return getDefaultDashboardPath(normRole);
  };

  const handleLoginSuccess = (loginResponseData: any, submittedEmail?: string) => {
    const emailToSave = submittedEmail || loginResponseData?.user?.email || loginResponseData?.email || '';
    try {
      if (rememberMe && emailToSave) {
        localStorage.setItem('nvuto_remember_me', 'true');
        localStorage.setItem('nvuto_remember_email', emailToSave);
      } else if (!rememberMe) {
        localStorage.removeItem('nvuto_remember_me');
        localStorage.removeItem('nvuto_remember_email');
      }
    } catch { /* Remember-me is optional; server-managed login still succeeds. */ }

    try {
      sessionStorage.removeItem('nvuto_active_role');
      localStorage.removeItem('nvuto_dev_role');
    } catch (_) {}

    const resolvedTenantId = loginResponseData?.tenant_id || loginResponseData?.tenantId || loginResponseData?.user?.tenant_id || loginResponseData?.user?.tenantId;
    const normalizedUserData = {
      ...loginResponseData,
      tenantId: resolvedTenantId || loginResponseData?.tenantId,
      tenant_id: resolvedTenantId || loginResponseData?.tenant_id,
    };

    setUser(normalizedUserData);
    const rawRole = loginResponseData?.role || loginResponseData?.user?.role || 'employee';
    const normRole = normalizeRole(rawRole);
    const isAdminRole = normRole === SystemRole.HR_ADMIN || normRole === SystemRole.HR || normRole === SystemRole.ADMIN;
    const needsOnboarding = !loginResponseData?.isFullyOnboarded && !loginResponseData?.onboardingCompleted && isAdminRole;

    const userPrefs = loginResponseData?.user?.preferences || loginResponseData?.preferences || {};
    const startupModule = userPrefs.startup_default_module || userPrefs.startupDefaultModule || readBrowserPreference('startup_default_module') || readBrowserPreference('nvuto_startup_module') || '';

    const redirectPath = needsOnboarding
      ? '/onboarding/setup'
      : getStartupRoute(startupModule, rawRole);

    navigate(redirectPath);
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response, variables) => {
      // Intercept mfa_required gate
      if (response.data?.mfa_required) {
        setTempToken(response.data.exchange_token || '');
        setRequires2FA(true);
        return;
      }

      // Intercept password change gate / temporary password flags
      const userData = response.data;
      const isDemoPersona = window.location.hostname.includes('apex-tech') ||
                            variables.email.endsWith('@apex.io') ||
                            variables.email === 'kevin.vance@gmail.com';
      const requiresReset = userData?.requiresPasswordChange && !isDemoPersona;

      if (requiresReset) {
        const token = response.data?.accessToken;
        setAuthTempToken(token || 'temp-token');
        sessionStorage.setItem('nvuto_temp_email', variables.email);
        sessionStorage.setItem('nvuto_temp_token', token || 'temp-token');
        navigate('/auth/setup-password');
        return;
      }

      // Successful login redirection
      handleLoginSuccess(response.data, variables.email);
    },
    onError: (err: any, variables) => {
      const errStatus = err?.response?.status || err?.status || err?.response?.data?.status;
      const errData = err?.response?.data || err?.data || {};
      const errCode = errData.error || '';
      const errMsg = errData.message || err?.message || '';

      const isDemoPersona = window.location.hostname.includes('apex-tech') ||
                            variables.email.endsWith('@apex.io') ||
                            variables.email === 'kevin.vance@gmail.com';

      if (errStatus === 403 && errCode === 'PASSWORD_CHANGE_REQUIRED') {
        if (isDemoPersona) {
          const token = errData?.accessToken || errData?.access_token || errData?.token;
          handleLoginSuccess({ ...errData, accessToken: token }, variables.email);
          return;
        }
        const token = errData?.accessToken || errData?.access_token || errData?.token;
        setAuthTempToken(token || 'temp-token');
        sessionStorage.setItem('nvuto_temp_email', variables.email);
        sessionStorage.setItem('nvuto_temp_token', token || 'temp-token');
        navigate('/auth/setup-password');
        return;
      }

      // Intercept Mobile Activation Required
      if (errStatus === 403 && (errMsg.includes('MOBILE_ACTIVATION_REQUIRED') || errCode === 'MOBILE_ACTIVATION_REQUIRED')) {
        setMobileActivationRequired(true);
      } else if (err?.requires_2fa || errMsg.includes('2fa') || errMsg.includes('OTP')) {
        setRequires2FA(true);
      } else {
        let displayTitle = 'Authentication Failed';
        let finalMsg = errMsg || 'Invalid credentials';

        // Distinguish network/CORS/connectivity failures from credential rejection
        if (
          errMsg.includes('Failed to fetch') ||
          errMsg.includes('NetworkError') ||
          errMsg.includes('Load failed') ||
          err?.name === 'TypeError'
        ) {
          displayTitle = 'Connection Error';
          finalMsg = 'Unable to reach the authentication service. Please verify your network connection, proxy settings, or server availability.';
        } else if (errStatus === 401) {
          displayTitle = 'Invalid Credentials';
          finalMsg = 'Incorrect email or password. Please verify your credentials and try again.';
        } else if (errStatus === 502 || errStatus === 503 || errStatus === 504) {
          displayTitle = 'Service Temporarily Unavailable';
          finalMsg = 'The authentication gateway or upstream service is temporarily unreachable. Please try again shortly.';
        }

        setError(finalMsg);
        addToast('error', displayTitle, finalMsg);
      }
    }
  });

  // Primary Login Submission Handler
  const handleLoginSubmit = (data: any) => {
    setError('');
    try {
      sessionStorage.removeItem('nvuto_active_role');
      localStorage.removeItem('nvuto_active_role');
      localStorage.removeItem('nvuto_dev_role');
      localStorage.removeItem('nvuto_access_token');
    } catch (_) {}
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  // Password Change Handler
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 12) {
      setError('New password must be at least 12 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Simulated password change resolution for demo integration
      addToast('success', 'Success', 'Password updated successfully! Welcome to NVUTO.');
      const role = profile?.role || 'HR Admin';
      const defaultDashboardPath =
        role === 'Employee' ? '/employee/dashboard' :
        role === 'Manager' ? '/manager/dashboard' :
        role === 'Finance' ? '/finance/dashboard' :
        role === 'CEO' ? '/ceo/dashboard' :
        '/hr/dashboard';

      navigate(defaultDashboardPath);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#F8FAFC] dark:bg-[#0B0F19]">
      {/* ───────────────────────────────────────────────────────────────────────
          PHASE 2: The Left Panel (Brand Identity)
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#06062b] via-[#0b0b47] to-[#111184] text-white relative overflow-hidden">
        <InteractiveGridBackground theme="dark" />
        {/* Abstract decorative blobs for premium glassmorphic depth */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#FF4F00] opacity-15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400 opacity-20 blur-3xl pointer-events-none"></div>

        {/* Brand Logo & Wordmark (NVUTO Wordmark.svg) */}
        <div className="flex items-center select-none z-10">
          <svg width="150" height="47" viewBox="0 0 182 57" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <g clipPath="url(#clip0_login_wordmark)">
              <path d="M29.9273 49V31.0545C29.9273 29.5807 29.4939 28.432 28.6269 27.6085C27.76 26.7415 26.6547 26.3081 25.3109 26.3081C24.4006 26.3081 23.577 26.5031 22.8402 26.8932C22.1466 27.2834 21.6048 27.8252 21.2147 28.5187C20.8245 29.2123 20.6295 30.0575 20.6295 31.0545L16.2081 28.9739C16.2081 26.4164 16.7716 24.2274 17.8986 22.4069C19.0257 20.543 20.5645 19.1125 22.5151 18.1156C24.509 17.0752 26.763 16.5551 29.2771 16.5551C31.5745 16.5551 33.6118 17.0969 35.389 18.1806C37.2095 19.2209 38.64 20.6297 39.6803 22.4069C40.7206 24.1841 41.2408 26.1997 41.2408 28.4537V49H29.9273ZM9.31602 49V17.2053H20.6295V49H9.31602ZM54.1802 49L41.2413 17.2053H53.335L61.5925 43.9935H56.9761L65.1686 17.2053H77.1322L64.1933 49H54.1802ZM92.3342 49.7152C89.3433 49.7152 86.6775 49.13 84.3368 47.9597C82.0394 46.746 80.2188 45.0771 78.8751 42.9532C77.5747 40.7858 76.9245 38.3367 76.9245 35.6059V17.2053H88.2379V35.6059C88.2379 36.4728 88.4113 37.2314 88.7581 37.8816C89.1049 38.5318 89.5817 39.0303 90.1885 39.3771C90.7954 39.7238 91.5106 39.8972 92.3342 39.8972C93.5479 39.8972 94.5232 39.5071 95.2601 38.7269C96.0403 37.9466 96.4305 36.9063 96.4305 35.6059V17.2053H107.744V35.6059C107.744 38.3801 107.094 40.8292 105.793 42.9532C104.493 45.0771 102.672 46.746 100.332 47.9597C98.0343 49.13 95.3685 49.7152 92.3342 49.7152ZM115.274 49V4.07127H126.587V49H115.274ZM108.251 26.6332V17.2053H133.609V26.6332H108.251Z" fill="white"/>
              <path d="M152.718 39.4519C156.318 39.4519 159.237 36.5333 159.237 32.933C159.237 29.3327 156.318 26.4141 152.718 26.4141C149.117 26.4141 146.199 29.3327 146.199 32.933C146.199 36.5333 149.117 39.4519 152.718 39.4519Z" fill="white"/>
              <path d="M152.718 18.0332C145.734 18.0332 141.077 21.2927 138.749 25.949" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round"/>
              <path d="M167.618 32.934C167.618 25.9494 164.359 21.293 159.703 18.9648" stroke="#FF7033" strokeWidth="4.65637" strokeLinecap="round"/>
              <path d="M152.718 47.8338C159.703 47.8338 164.359 44.5743 166.687 39.918" stroke="#E64500" strokeWidth="4.65637" strokeLinecap="round"/>
              <path d="M137.818 32.9336C137.818 39.9182 141.077 44.5745 145.733 46.9027" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round"/>
            </g>
            <defs>
              <clipPath id="clip0_login_wordmark">
                <rect width="182" height="56.2151" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Central Brand Messaging */}
        <div className="my-auto max-w-xl z-10">
          <h1 className="font-light text-4xl lg:text-5xl leading-tight text-white mb-6">
            The intelligence layer for <em className="italic font-light">modern enterprise</em>.
          </h1>
          <p className="font-medium text-base text-slate-300 leading-relaxed max-w-md">
            Streamline global operations, automate payroll, and empower your workforce with a single, high-fidelity ERP platform.
          </p>

          {/* Glassmorphic Trust Badges */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 flex flex-col justify-between h-32 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
              <SolidShieldIcon className="transition-transform duration-300 group-hover:scale-110" />
              <div>
                <span className="font-black tracking-wider text-xs uppercase text-white block">
                  SOC2 CERTIFIED
                </span>
                <span className="text-xs text-slate-350 mt-1 block">
                  Enterprise-grade isolation
                </span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 flex flex-col justify-between h-32 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
              <SolidSpeedometerIcon className="transition-transform duration-300 group-hover:scale-110" />
              <div>
                <span className="font-black tracking-wider text-xs uppercase text-white block">
                  99.9% UPTIME
                </span>
                <span className="text-xs text-slate-350 mt-1 block">
                  High-availability SLA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trust Section with Avatar Stack */}
        <div className="flex items-center justify-between border-t border-white/10 pt-8 z-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar
                name="S"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
                size="sm"
                className="ring-2 ring-[#06062b] w-8 h-8 animate-fade-in"
              />
              <Avatar
                name="M"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
                size="sm"
                className="ring-2 ring-[#06062b] w-8 h-8 animate-fade-in"
              />
              <Avatar
                name="A"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                size="sm"
                className="ring-2 ring-[#06062b] w-8 h-8 animate-fade-in"
              />
            </div>
            <span className="font-extrabold tracking-wider nvuto-h3 text-slate-400 uppercase select-none">
              TRUSTED BY 2,400+ LEADING ORGANIZATIONS
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          PHASE 3: The Right Panel (Auth Engine)
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between py-12 px-8 md:px-16 w-full max-w-xl mx-auto h-full relative">
        {/* Global/EN Selector Header */}
        <div className="flex justify-end select-none">
          <div className="flex items-center gap-2 border border-slate-200 dark:border-[#232D42] bg-white dark:bg-[#111625] hover:bg-slate-50 transition-colors rounded-full px-3.5 py-1.5 text-xs font-bold text-slate-650 cursor-pointer shadow-sm">
            <GlobeIcon size={14} className="text-slate-400" />
            <span>GLOBAL / EN</span>
          </div>
        </div>

        {/* Central Authorization Container */}
        <div className="my-auto py-8">
          {/* STATE 4: Mobile Activation Required Screen */}
          {mobileActivationRequired ? (
            <div className="flex flex-col gap-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <SmallShieldIcon />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                  Mobile Activation Required
                </h2>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-2 leading-relaxed">
                  First-time employee profiles must be activated using the official mobile application. Please download the NVUTO app to authenticate and set up your security credentials.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-[#232D42] flex flex-col gap-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-[#F8FAFC]">App Download Steps:</span>
                  <span className="text-slate-500 dark:text-[#94A3B8]">1. Scan or search NVUTO in App Store / Google Play</span>
                  <span className="text-slate-500 dark:text-[#94A3B8]">2. Enter your work email and tap "First time activation"</span>
                  <span className="text-slate-500 dark:text-[#94A3B8]">3. Complete biometrics setup to unlock Web Gateway access</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMobileActivationRequired(false)}
                  className="w-full h-11 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:bg-[#0B0F19] mt-2"
                >
                  Return to Login
                </Button>
              </div>
            </div>
          ) : requiresPasswordChange ? (
            /* STATE 3: Mandatory Password Reset Form */
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                  Mandatory Password Change
                </h2>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-1 leading-relaxed">
                  Your administrator requires you to update your password before signing in.
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-[#BE123C] text-sm rounded-lg p-3 font-semibold select-none">
                  {error}
                </div>
              )}

              <Form className="flex flex-col gap-5 mt-2" onSubmit={handlePasswordChangeSubmit}>
                <Input
                  id="new-password"
                  label="New Password"
                  type="password"
                  placeholder="Minimum 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  rightIcon={LockIcon}
                  className="!bg-white dark:bg-[#111625] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-slate-400"
                />

                <Input
                  id="confirm-new-password"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  rightIcon={LockIcon}
                  className="!bg-white dark:bg-[#111625] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-slate-400"
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full bg-[#111184] hover:bg-[#0a0a54] text-white font-bold h-11 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-2 border-0"
                  rightIcon={AltArrowRight}
                >
                  Sign in to Dashboard
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setRequiresPasswordChange(false);
                    setError('');
                  }}
                  className="w-full text-slate-500 dark:text-[#94A3B8] hover:bg-slate-50 dark:bg-[#0B0F19] h-10 text-xs font-semibold"
                >
                  Cancel
                </Button>
              </Form>
            </div>
          ) : requires2FA ? (
            /* STATE 2: 2FA OTP Authentication Form */
            <TwoFactorChallenge
              exchangeToken={tempToken}
              onSuccess={handleLoginSuccess}
              onCancel={() => {
                setRequires2FA(false);
                setError('');
              }}
            />
          ) : isRootDomain ? (
            /* STATE 4: Workspace Discovery Flow (Root domain) */
            <div className="flex flex-col gap-6">
              {/* Inject the NVUTO Logo directly above the header (NVUTO Logo.svg) */}
              <svg width="48" height="48" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 shrink-0 select-none">
                <path d="M23.2814 29.8005C26.8817 29.8005 29.8004 26.8819 29.8004 23.2816C29.8004 19.6813 26.8817 16.7627 23.2814 16.7627C19.6811 16.7627 16.7625 19.6813 16.7625 23.2816C16.7625 26.8819 19.6811 29.8005 23.2814 29.8005Z" fill="#111184" className="dark:fill-white" />
                <path d="M23.2819 8.38184C16.2974 8.38184 11.641 11.6413 9.31281 16.2977" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round" />
                <path d="M38.1821 23.2826C38.1821 16.298 34.9227 11.6417 30.2663 9.31348" stroke="#FF7033" strokeWidth="4.65637" strokeLinecap="round" />
                <path d="M23.2819 38.1824C30.2664 38.1824 34.9228 34.923 37.251 30.2666" stroke="#E64500" strokeWidth="4.65637" strokeLinecap="round" />
                <path d="M8.38129 23.2822C8.38129 30.2668 11.6407 34.9232 16.2971 37.2513" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round" />
              </svg>

              <div>
                <h2 className="text-3xl font-light text-slate-900 dark:text-[#F8FAFC] leading-tight">
                  Sign in to your workspace
                </h2>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-1.5 leading-relaxed">
                  Enter your company's NVUTO workspace URL.
                </p>
              </div>

              <Form className="flex flex-col gap-5 mt-2" onSubmit={handleWorkspaceSubmit}>
                <div className="flex flex-col w-full">
                  <Label htmlFor="workspace-input" required className="mb-2">
                    Workspace URL
                  </Label>
                  <div className="relative w-full flex items-center bg-[#F3F4F6] border border-slate-300 dark:border-[#232D42] rounded-lg focus-within:ring-2 focus-within:ring-[#111184]/20 transition-all overflow-hidden h-11">
                    <input
                      id="workspace-input"
                      type="text"
                      autoFocus
                      value={workspaceInput}
                      onChange={(e) => {
                        setWorkspaceInput(e.target.value);
                        setWorkspaceError('');
                      }}
                      placeholder="your-company"
                      className="w-full h-full bg-transparent border-0 focus:outline-none px-4 text-base text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-450"
                    />
                    <div className="h-full flex items-center bg-slate-200 dark:bg-[#171E2E]/60 px-4 text-slate-500 dark:text-[#94A3B8] text-sm font-semibold border-l border-slate-300 dark:border-[#232D42]/80 select-none">
                      .nvuto.com
                    </div>
                  </div>
                  {workspaceError && (
                    <span className="text-sm text-[#d4183d] font-semibold mt-1">
                      {workspaceError}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isValidatingWorkspace}
                  isLoading={isValidatingWorkspace}
                  className="w-full bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-4 border-0"
                  rightIcon={AltArrowRight}
                >
                  Continue
                </Button>

                <div className="mt-3 p-3 bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/50 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">
                    Evaluating or demoing NVUTO?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceInput('apex-tech');
                      setWorkspaceError('');
                    }}
                    className="text-[#FF4F00] font-bold hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Load apex-tech
                  </button>
                </div>
              </Form>
            </div>
          ) : (
            /* STATE 1: Standard Login Form */
            <div className="flex flex-col gap-6">
              {/* Inject the NVUTO Logo directly above the "Sign in" header (NVUTO Logo.svg) */}
              <svg width="48" height="48" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 shrink-0 select-none">
                <path d="M23.2814 29.8005C26.8817 29.8005 29.8004 26.8819 29.8004 23.2816C29.8004 19.6813 26.8817 16.7627 23.2814 16.7627C19.6811 16.7627 16.7625 19.6813 16.7625 23.2816C16.7625 26.8819 19.6811 29.8005 23.2814 29.8005Z" fill="#111184" className="dark:fill-white" />
                <path d="M23.2819 8.38184C16.2974 8.38184 11.641 11.6413 9.31281 16.2977" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round" />
                <path d="M38.1821 23.2826C38.1821 16.298 34.9227 11.6417 30.2663 9.31348" stroke="#FF7033" strokeWidth="4.65637" strokeLinecap="round" />
                <path d="M23.2819 38.1824C30.2664 38.1824 34.9228 34.923 37.251 30.2666" stroke="#E64500" strokeWidth="4.65637" strokeLinecap="round" />
                <path d="M8.38129 23.2822C8.38129 30.2668 11.6407 34.9232 16.2971 37.2513" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round" />
              </svg>

              <div>
                <h2 className="text-3xl font-light text-slate-900 dark:text-[#F8FAFC] leading-tight">
                  Sign in
                </h2>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-1.5 leading-relaxed">
                  Enter your credentials to access the ERP suite.
                </p>
              </div>

              {/* DEMO PERSONAS QUICK-LOADER PANEL */}
              {isApexDemoTenant && (
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-[#1a140f] dark:via-[#1f1912] dark:to-[#1a140f] border border-orange-200 dark:border-orange-900/50 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FF4F00] text-white text-[10px] font-bold">
                        ★
                      </span>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-orange-300">
                        Demo Account · Apex Technologies
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800/40">
                      apex-tech
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2 leading-snug">
                    Select a persona to load credentials from <code className="text-orange-600 dark:text-orange-400 font-semibold font-mono text-[10px]">DEMO_CREDENTIALS_LOCAL</code>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
                    {DEMO_PERSONAS.map((p) => {
                      const isSelected = selectedPersona === p.email;
                      return (
                        <button
                          key={p.email}
                          type="button"
                          onClick={() => handleSelectPersona(p)}
                          className={`text-left p-2 rounded-lg border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#FF4F00] ring-2 ring-[#FF4F00]/25 bg-white dark:bg-slate-800 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/60 hover:bg-white hover:border-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                              {p.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${p.color}`}>
                              {p.roleName}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center justify-between">
                            <span className="truncate">{p.email}</span>
                            {p.badge && (
                              <span className="text-[9px] font-semibold text-orange-600 dark:text-orange-400 shrink-0 ml-1">
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>CEO Sign-Off PIN: <strong className="text-slate-800 dark:text-white font-mono font-bold">9482</strong></span>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">Tap to pre-fill</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-[#BE123C] text-sm rounded-lg p-3 font-semibold select-none">
                  {error}
                </div>
              )}

              <Form className="flex flex-col gap-5 mt-2" onSubmit={handleFormSubmit(handleLoginSubmit)}>
                <Input
                  id="email-input"
                  label="Email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', { required: 'Work email is required' })}
                  error={errors.email?.message}
                  rightIcon={AtIcon}
                  className="!bg-white dark:bg-[#111625] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-slate-400"
                />

                <div className="flex flex-col">
                  <Input
                    id="password-input"
                    label="Password"
                    type="password"
                    placeholder=""
                    {...register('password', { required: 'Password is required' })}
                    error={errors.password?.message}
                    rightIcon={LockIcon}
                    className="!bg-white dark:bg-[#111625] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-slate-400"
                  />
                </div>

                <div className="flex items-center justify-between text-sm font-semibold select-none">
                  <Checkbox
                    id="remember-me"
                    label="Remember me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <a
                    href="/forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/forgot-password');
                    }}
                    className="text-[#B83500] dark:text-[#FF4F00] hover:underline transition-colors font-semibold"
                  >
                    Forgot Password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  isLoading={loginMutation.isPending}
                  className="w-full bg-[#111184] hover:bg-[#0a0a54] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-4 border-0"
                  rightIcon={AltArrowRight}
                >
                  Sign in to Dashboard
                </Button>

                {/* Change Workspace CTA */}
                <div className="mt-2 text-center select-none">
                  <button
                    type="button"
                    onClick={handleChangeWorkspace}
                    className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] hover:text-[#FF4F00] dark:hover:text-[#FF4F00] transition-colors cursor-pointer bg-transparent border-0"
                  >
                    Change Workspace
                  </button>
                </div>
              </Form>
            </div>
          )}
        </div>

        {/* Footer Security Badges & System Status */}
        <div className="flex flex-col items-center justify-center gap-3 select-none pt-6 border-t border-slate-100 dark:border-[#232D42] w-full text-xs">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ALL SYSTEMS OPERATIONAL
          </div>

          <div className="flex items-center justify-center gap-5 mt-0.5">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8] font-semibold">
              <SmallShieldIcon />
              <span>SSL SECURE</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8] font-semibold">
              <SmallKeyIcon />
              <span>SSO READY</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#94A3B8] font-semibold">
              <SmallCheckIcon />
              <span>SOC2 COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
