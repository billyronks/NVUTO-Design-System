import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  AltArrowRight,
  AltArrowLeft,
  Letter,
  Lock,
  Eye,
  EyeClosed,
  CheckCircle,
  ShieldCheck,
  Refresh
} from '@solar-icons/react';
import { Button, Input, Form, InteractiveGridBackground } from '@/app/components/ui';
import { forgotPassword, verifyResetOTP, resetPassword } from '../../../services/authService';
import { useMutation } from '@tanstack/react-query';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-=_+\[\]{}|;:',.<>?/~]).{12,}$/;

type Step = 'email' | 'otp' | 'new-password' | 'success';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<Step>('email');

  // Form states
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // OTP states (6 digits)
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [resetToken, setResetToken] = useState('');

  // Password reset states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 60-second countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus the first OTP box when entering the 'otp' step
  useEffect(() => {
    if (step === 'otp') {
      const timeout = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // ── 1. Request OTP Mutation ──────────────────────────────────────────
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setStep('otp');
      setCountdown(60);
      setError('');
      setInfoMessage(`We've sent a 6-digit verification code to ${email}.`);
    },
    onError: () => {
      // Anti-enumeration protection: advance to OTP even if user doesn't exist
      setStep('otp');
      setCountdown(60);
      setError('');
      setInfoMessage(`We've sent a 6-digit verification code to ${email}.`);
    }
  });

  // ── 2. Verify OTP Mutation ───────────────────────────────────────────
  const verifyOtpMutation = useMutation({
    mutationFn: verifyResetOTP,
    onSuccess: (res: any) => {
      const token = res.data?.reset_token || res.reset_token || res.data?.token || '';
      if (!token) {
        setError('Invalid response from server. Please try again.');
        return;
      }
      setResetToken(token);
      setError('');
      setInfoMessage('');
      setStep('new-password');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Invalid or expired verification code.';
      setError(message);
      // Clear boxes on failure and refocus
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }
  });

  // ── 3. Reset Password Mutation ───────────────────────────────────────
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setError('');
      setStep('success');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Password reset failed. Please try again.';
      setError(message);
    }
  });

  // ── Step 1 Handler: Submit Email ─────────────────────────────────────
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = emailSchema.safeParse({ email: email.trim() });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    forgotPasswordMutation.mutate(email.trim());
  };

  // ── Step 2 Handlers: OTP Inputs & Resend ──────────────────────────────
  const handleDigitChange = (index: number, value: string) => {
    const numericVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = numericVal;
    setDigits(newDigits);
    setError('');

    if (numericVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newDigits = [...digits];
      pasteData.split('').forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setDigits(newDigits);
      const focusIndex = Math.min(pasteData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  // Auto-submit OTP when all 6 digits are populated
  useEffect(() => {
    if (step === 'otp') {
      const code = digits.join('');
      if (code.length === 6 && !verifyOtpMutation.isPending) {
        verifyOtpMutation.mutate({ email: email.trim(), otp: code });
      }
    }
  }, [digits, step]);

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }
    verifyOtpMutation.mutate({ email: email.trim(), otp: code });
  };

  const handleResendOtp = () => {
    if (countdown > 0 || forgotPasswordMutation.isPending) return;
    setError('');
    setInfoMessage('Sending a new verification code...');
    setDigits(Array(6).fill(''));
    forgotPasswordMutation.mutate(email.trim());
  };

  // ── Step 3 Handler: Submit New Password ──────────────────────────────
  const hasMinLength = newPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()\-=_+\[\]{}|;:',.<>?/~]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore <= 3) return 'Fair';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-rose-500';
    if (strengthScore <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordComplexityRegex.test(newPassword)) {
      setError('Password must be at least 12 characters and contain uppercase, lowercase, numbers, and special characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    resetPasswordMutation.mutate({
      reset_token: resetToken,
      new_password: newPassword,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4 selection:bg-[#FF4F00]/20 relative overflow-hidden">
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

        {/* ── STEP 1: ENTER WORK EMAIL ─────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Forgot Password
              </h2>
              <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-2 leading-relaxed">
                Enter your work email address and we'll send you a 6-digit verification code to reset your password.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-[#BE123C] text-sm rounded-lg p-3 font-semibold select-none">
                {error}
              </div>
            )}

            <Form className="flex flex-col gap-5 mt-1" onSubmit={handleEmailSubmit}>
              <Input
                id="email-input"
                label="WORK EMAIL ADDRESS"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightIcon={Letter}
                className="!bg-white dark:!bg-[#111625] !text-slate-900 dark:!text-[#F8FAFC] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-[#FF4F00]"
              />

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                isLoading={forgotPasswordMutation.isPending}
                className="w-full bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-2 border-0 cursor-pointer"
                rightIcon={AltArrowRight}
              >
                Send Verification Code
              </Button>
            </Form>
          </>
        )}

        {/* ── STEP 2: ENTER 6-DIGIT OTP ────────────────────────────────── */}
        {step === 'otp' && (
          <>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/40 text-[#FF4F00] rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Enter Verification Code
              </h2>
              <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-2 leading-relaxed">
                We sent a 6-digit code to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>. Enter the code below to reset your password.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-[#BE123C] text-sm rounded-lg p-3 font-semibold select-none">
                {error}
              </div>
            )}

            {infoMessage && !error && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg p-3 font-medium select-none text-center">
                {infoMessage}
              </div>
            )}

            <Form className="flex flex-col gap-5 mt-1" onSubmit={handleVerifyOtpSubmit}>
              <div className="flex justify-between items-center gap-2 sm:gap-2.5 py-2 select-none">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={verifyOtpMutation.isPending}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-11 h-13 sm:w-12 sm:h-14 bg-white dark:bg-[#111625] border border-slate-300 dark:border-[#232D42] rounded-xl text-center text-xl font-bold text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#FF4F00] focus:border-[#FF4F00] disabled:opacity-50 shadow-xs transition-all"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={digits.join('').length !== 6 || verifyOtpMutation.isPending}
                isLoading={verifyOtpMutation.isPending}
                className="w-full bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-1 border-0 cursor-pointer"
                rightIcon={AltArrowRight}
              >
                Verify Code
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setInfoMessage('');
                  }}
                  className="font-semibold text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center gap-1 p-0"
                >
                  <AltArrowLeft className="w-3.5 h-3.5" />
                  Change Email
                </button>

                {countdown > 0 ? (
                  <span className="font-medium text-slate-450 dark:text-slate-500 select-none">
                    Resend code in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={forgotPasswordMutation.isPending}
                    className="font-bold text-[#FF4F00] hover:underline transition-colors bg-transparent border-0 cursor-pointer flex items-center gap-1 p-0"
                  >
                    <Refresh className="w-3.5 h-3.5" />
                    Resend Code
                  </button>
                )}
              </div>
            </Form>
          </>
        )}

        {/* ── STEP 3: CREATE NEW PASSWORD ──────────────────────────────── */}
        {step === 'new-password' && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Create New Password
              </h2>
              <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-2 leading-relaxed">
                Enter your new password below. Make sure it meets all security requirements.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-[#BE123C] text-sm rounded-lg p-3 font-semibold select-none">
                {error}
              </div>
            )}

            <Form className="flex flex-col gap-4 mt-1" onSubmit={handlePasswordSubmit}>
              <div className="relative">
                <Input
                  id="new-password"
                  label="NEW PASSWORD"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  rightIcon={Lock}
                  className="!bg-white dark:!bg-[#111625] !text-slate-900 dark:!text-[#F8FAFC] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-[#FF4F00] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirm-password"
                  label="CONFIRM PASSWORD"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  rightIcon={Lock}
                  className="!bg-white dark:!bg-[#111625] !text-slate-900 dark:!text-[#F8FAFC] border-slate-300 dark:border-[#232D42] focus:!bg-white dark:focus:!bg-[#111625] focus:!ring-0 focus:!border-[#FF4F00] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-[#94A3B8] font-medium">Strength</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{getStrengthLabel()}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#171E2E] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${Math.max(15, (strengthScore / 4) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-1.5 text-xs pt-1 select-none">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-450'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  12+ Characters
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper && hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-450'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasUpper && hasLower ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  Upper & Lower Case
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-450'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  One Number
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-450'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  Special Character
                </div>
                <div className={`col-span-2 flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-semibold' : 'text-slate-450'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  Passwords Match
                </div>
              </div>

              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending || !hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial || !passwordsMatch}
                isLoading={resetPasswordMutation.isPending}
                className="w-full bg-[#FF4F00] hover:bg-[#e04500] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 mt-2 border-0 cursor-pointer"
                rightIcon={AltArrowRight}
              >
                Reset Password
              </Button>
            </Form>
          </>
        )}

        {/* ── STEP 4: SUCCESS CONFIRMATION ─────────────────────────────── */}
        {step === 'success' && (
          <div className="flex flex-col gap-6 text-center">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Password Reset Successfully
              </h2>
              <p className="text-slate-500 dark:text-[#94A3B8] text-sm mt-2 leading-relaxed">
                Your password has been updated. You can now sign in using your new credentials.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-[#111184] hover:bg-[#0a0a54] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center mt-2 border-0 cursor-pointer"
              rightIcon={AltArrowRight}
            >
              Sign In
            </Button>
          </div>
        )}

        {/* Global Back to Sign In Link */}
        {step !== 'success' && (
          <div className="text-center pt-2 border-t border-slate-100 dark:border-[#232D42] mt-1">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
