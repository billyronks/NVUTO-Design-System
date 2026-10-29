import React, { forwardRef, useState, useEffect } from 'react';
import { Label } from './label';
import { InfoCircle } from '@solar-icons/react';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

export interface PasswordStrengthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  leftIcon?: React.ComponentType<any>;
  containerClassName?: string;
  labelClassName?: string;
}

export const PasswordStrengthInput = forwardRef<HTMLInputElement, PasswordStrengthInputProps>(
  (
    {
      className = '',
      label,
      error,
      required,
      leftIcon: LeftIcon,
      id,
      containerClassName = '',
      labelClassName = '',
      value = '',
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || `password-strength-input-${Math.random().toString(36).substr(2, 9)}`;
    const [internalValue, setInternalValue] = useState(typeof value === 'string' ? value : '');
    const [showPassword, setShowPassword] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
      if (value !== undefined && typeof value === 'string') {
        setInternalValue(value);
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const getStrengthScore = (pw: string): number => {
      if (!pw) return 0;
      let checkCount = 0;
      
      const hasLength = pw.length >= 8;
      const hasUpper = /[A-Z]/.test(pw);
      const hasLower = /[a-z]/.test(pw);
      const hasDigit = /[0-9]/.test(pw);
      const hasSpecial = /[@$!%*?&]/.test(pw);

      if (hasLength) checkCount += 1;
      if (hasUpper) checkCount += 1;
      if (hasLower) checkCount += 1;
      if (hasDigit) checkCount += 1;
      if (hasSpecial) checkCount += 1;

      if (!hasLength) {
        return Math.min(checkCount, 2);
      }

      if (checkCount === 5) return 4;
      if (checkCount === 4) return 3;
      if (checkCount === 3) return 2;
      return 1;
    };

    useEffect(() => {
      const handler = setTimeout(() => {
        setScore(getStrengthScore(internalValue));
      }, 150);
      return () => clearTimeout(handler);
    }, [internalValue]);

    const getScoreText = (s: number) => {
      switch (s) {
        case 1: return 'Weak';
        case 2: return 'Fair';
        case 3: return 'Good';
        case 4: return 'Strong';
        default: return 'Empty';
      }
    };

    const getScoreColor = (s: number) => {
      switch (s) {
        case 1: return 'bg-red-500';
        case 2: return 'bg-orange-500';
        case 3: return 'bg-yellow-500';
        case 4: return 'bg-green-500';
        default: return 'bg-slate-200';
      }
    };

    return (
      <div className={`flex flex-col ${containerClassName || 'w-full'}`}>
        {label && (
          <div className="flex items-center gap-1.5 mb-1.5 select-none">
            <Label htmlFor={inputId} required={required} className={`mb-0 ${labelClassName}`}>
              {label}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-slate-400 hover:text-slate-655 cursor-pointer flex items-center justify-center p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#171E2E] transition-colors">
                  <InfoCircle size={14} />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border border-slate-800 rounded-lg shadow-xl px-3 py-2 max-w-xs leading-relaxed text-xs">
                Must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        <div className="relative w-full flex items-center">
          {LeftIcon && (
            <div className="absolute left-3.5 text-slate-400 dark:text-[#94A3B8] pointer-events-none select-none flex items-center justify-center">
              <LeftIcon size={18} />
            </div>
          )}
          
          <input
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            ref={ref}
            value={value !== undefined ? value : internalValue}
            onChange={handleInputChange}
            className={`w-full min-h-[44px] bg-[#F3F4F6] dark:bg-[#171E2E] border border-slate-300 dark:border-[#232D42] rounded-lg text-base text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-450 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00D1B2]/40 transition-all ${
              LeftIcon ? 'pl-11' : 'pl-4'
            } pr-11 ${
              error ? 'ring-2 ring-red-500/50 bg-red-50/20 dark:bg-red-950/30 border-red-500' : ''
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] select-none flex items-center justify-center cursor-pointer transition-colors bg-transparent border-0 p-0 focus:outline-none"
            title={showPassword ? 'Hide Password' : 'Show Password'}
          >
            {showPassword ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>

        {internalValue && (
          <div className="flex flex-col gap-1 mt-2">
            <div 
              className="flex gap-1.5 w-full items-center" 
              aria-valuenow={score} 
              aria-valuemin={0} 
              aria-valuemax={4} 
              aria-valuetext={`Password strength: ${getScoreText(score)}`} 
              role="progressbar"
            >
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    index <= score ? getScoreColor(score) : 'bg-slate-200 dark:bg-[#171E2E]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] self-end mt-0.5 select-none">
              Strength: <span className={
                score === 1 ? 'text-red-500' :
                score === 2 ? 'text-orange-500' :
                score === 3 ? 'text-yellow-600' :
                score === 4 ? 'text-green-600' :
                'text-slate-500 dark:text-[#94A3B8]'
              }>{getScoreText(score)}</span>
            </span>
          </div>
        )}

        {error && (
          <span className="text-sm text-[#BE123C] font-semibold mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

PasswordStrengthInput.displayName = 'PasswordStrengthInput';
export default PasswordStrengthInput;
