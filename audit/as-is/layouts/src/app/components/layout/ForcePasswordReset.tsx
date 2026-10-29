import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock as LockIcon, AltArrowRight } from '@solar-icons/react';
import { Button, Input, Form, PasswordStrengthInput } from '@/app/components/ui';
import { forceResetPassword } from '../../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/useToast';


// Strict Enterprise Password Validation Schema
const passwordResetSchema = z.object({
  currentPassword: z.string().min(1, 'Current (temporary) password is required.'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Must contain at least one digit.')
    .regex(/[@$!%*?&]/, 'Must contain at least one special character.')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&).'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password.'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match.',
  path: ['confirmNewPassword'],
});

type PasswordResetFormInput = z.infer<typeof passwordResetSchema>;

export const ForcePasswordReset: React.FC = () => {
  const { user, setTempToken, tempToken } = useAuth();
  const { addToast } = useToast();
  const [generalError, setGeneralError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const resetMutation = useMutation({
    mutationFn: forceResetPassword,
    onSuccess: (response) => {
      if (response.status >= 200 && response.status < 300) {
        addToast('success', 'Security Settings Verified', 'Password updated successfully. Loading workspace...');
        
        // 1. Clear temp session state to prevent the SESSION ISOLATION guard from
        //    calling logout() when it detects requiresPasswordChange on stale cache.
        sessionStorage.removeItem('nvuto_temp_email');
        sessionStorage.removeItem('nvuto_temp_token');
        setTempToken(null);

        // 2. Determine the user's role from the response (the backend returns full user info).
        //    Fall back to the pre-change user object or HR Admin as the last resort.
        const responseUser = (response as any)?.data?.user || (response as any)?.data;
        const role = responseUser?.role || user?.role || 'HR Admin';
        const defaultDashboardPath =
          role === 'Employee' || role === 'employee' ? '/employee/dashboard' :
          role === 'Manager' || role === 'manager' ? '/manager/dashboard' :
          role === 'Finance' || role === 'finance' ? '/finance/dashboard' :
          role === 'CEO' || role === 'ceo' ? '/ceo/dashboard' :
          '/hr/dashboard';

        // 3. Hard redirect: this forces a full page reload which clears the stale TanStack
        //    React Query cache (including the old requiresPasswordChange=true authProfile).
        //    AuthContext will re-fetch /auth/me with the new session cookies set by the backend
        //    and will find requiresPasswordChange=false, allowing normal dashboard access.
        setTimeout(() => {
          window.location.href = defaultDashboardPath;
        }, 1200);
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Password update failed.';
      setGeneralError(errMsg);
      addToast('error', 'Security Check Failed', errMsg);
    },
  });

  const onSubmit = (data: PasswordResetFormInput) => {
    setGeneralError('');

    const email = user?.email || sessionStorage.getItem('nvuto_temp_email') || '';
    if (!email) {
      setGeneralError('Corporate email not found in active session context. Please return to login.');
      return;
    }

    addToast('info', 'Updating Password', 'Enforcing workspace security credentials...');

    resetMutation.mutate({
      email,
      temporary_password: data.currentPassword,
      new_password: data.newPassword,
      token: tempToken || sessionStorage.getItem('nvuto_temp_token') || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19] p-6 relative overflow-hidden select-none">
      {/* Decorative Brand Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#FF4F00] opacity-5 dark:opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 opacity-5 dark:opacity-10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-8 shadow-xl z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {/* Logo Icon */}
          <div className="w-12 h-12 bg-[#FF4F00] rounded-xl flex items-center justify-center shadow-md mb-2">
            <LockIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Mandatory Password Reset
          </h1>
          <p className="nvuto-body-lg text-sm leading-relaxed">
            To guarantee your workspace security, you must update your temporary credentials before proceeding to setup.
          </p>
        </div>

        {generalError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-lg p-3 font-semibold select-none">
            {generalError}
          </div>
        )}

        <Form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Current (Temporary) Password */}
          <div className="flex flex-col gap-1.5">
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <Input
                  id="current-password"
                  label="Current (Temporary) Password"
                  type="password"
                  value={field.value}
                  onChange={field.onChange}
                  className=""
                  containerClassName="text-slate-700 dark:text-[#F8FAFC] font-bold"
                  error={errors.currentPassword?.message}
                />
              )}
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <PasswordStrengthInput
                  id="new-password"
                  label="New Password"
                  placeholder="Minimum 8 chars (A-Z, a-z, 0-9, symbol)"
                  value={field.value}
                  onChange={field.onChange}
                  className=""
                  containerClassName="text-slate-700 dark:text-[#F8FAFC] font-bold"
                  error={errors.newPassword?.message}
                />
              )}
            />
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1.5">
            <Controller
              name="confirmNewPassword"
              control={control}
              render={({ field }) => (
                <Input
                  id="confirm-new-password"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new secure password"
                  value={field.value}
                  onChange={field.onChange}
                  className=""
                  containerClassName="text-slate-700 dark:text-[#F8FAFC] font-bold"
                  error={errors.confirmNewPassword?.message}
                />
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={resetMutation.isPending}
            isLoading={resetMutation.isPending}
            className="w-full bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-11 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-2 border-0 cursor-pointer"
            rightIcon={AltArrowRight}
          >
            Update & Proceed
          </Button>
        </Form>
      </div>
    </div>
  );
};
