import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { AltArrowRight, Lock } from '@solar-icons/react';
import { Button, Input, Form, InteractiveGridBackground } from '@/app/components/ui';
import { resetPassword } from '../../../services/authService';
import { useMutation } from '@tanstack/react-query';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-=_+\[\]{}|;:',.<>?/~]).{12,}$/;

const resetSchema = z.object({
  password: z.string().regex(passwordRegex, {
    message: 'Password must be at least 12 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || err?.message || 'Invalid or expired token. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }

    const validation = resetSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      setError(firstError.message);
      return;
    }

    resetPasswordMutation.mutate({
      token,
      new_password: password,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <InteractiveGridBackground theme="auto" />
      <div className="max-w-md w-full bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-xl p-8 md:p-10 flex flex-col gap-6 relative z-10">
        {/* NVUTO Logo SVG */}
        <div className="flex justify-center select-none">
          <svg width="48" height="48" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M23.2814 29.8005C26.8817 29.8005 29.8004 26.8819 29.8004 23.2816C29.8004 19.6813 26.8817 16.7627 23.2814 16.7627C19.6811 16.7627 16.7625 19.6813 16.7625 23.2816C16.7625 26.8819 19.6811 29.8005 23.2814 29.8005Z" fill="#111184" className="dark:fill-white" />
            <path d="M23.2819 8.38184C16.2974 8.38184 11.641 11.6413 9.31281 16.2977" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round" />
            <path d="M38.1821 23.2826C38.1821 16.298 34.9227 11.6417 30.2663 9.31348" stroke="#FF7033" strokeWidth="4.65637" strokeLinecap="round" />
            <path d="M23.2819 38.1824C30.2664 38.1824 34.9228 34.923 37.251 30.2666" stroke="#E64500" strokeWidth="4.65637" strokeLinecap="round" />
            <path d="M8.38129 23.2822C8.38129 30.2668 11.6407 34.9232 16.2971 37.2513" stroke="#FF4F00" strokeWidth="4.65637" strokeLinecap="round" />
          </svg>
        </div>

        {!isSuccess ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Set New Password
              </h2>
              <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-2 leading-relaxed">
                Please enter and confirm your new password below.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-[#BE123C] text-sm rounded-lg p-3 font-semibold select-none">
                {error}
              </div>
            )}

            <Form className="flex flex-col gap-5 mt-2" onSubmit={handleSubmit}>
              <Input
                id="new-password"
                label="NEW PASSWORD"
                type="password"
                placeholder="At least 12 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightIcon={Lock}
                className="!bg-white dark:!bg-[#111625] !text-slate-900 dark:!text-[#F8FAFC] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-slate-400"
              />

              <Input
                id="confirm-password"
                label="CONFIRM PASSWORD"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                rightIcon={Lock}
                className="!bg-white dark:!bg-[#111625] !text-slate-900 dark:!text-[#F8FAFC] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-slate-400"
              />

              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                isLoading={resetPasswordMutation.isPending}
                className="w-full bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-2 border-0"
                rightIcon={AltArrowRight}
              >
                Reset Password
              </Button>
            </Form>
          </>
        ) : (
          <div className="flex flex-col gap-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Password Reset Successfully
              </h2>
              <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-2 leading-relaxed">
                Your password has been successfully updated. You can now log in using your new credentials.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-[#111184] hover:bg-[#0a0a54] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center mt-2 border-0"
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
