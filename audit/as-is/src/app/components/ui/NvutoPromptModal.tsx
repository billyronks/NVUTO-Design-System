import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';

export interface PromptModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
  multiline?: boolean;
  minLength?: number;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export const NvutoPromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  title,
  message,
  label,
  placeholder,
  defaultValue = '',
  confirmText = 'Submit',
  cancelText = 'Cancel',
  required = false,
  multiline = false,
  minLength,
  onSubmit,
  onCancel
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
    // Reset to the caller-provided default each time the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      window.addEventListener('keydown', handleKeyDown);

      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onCancel]);

  if (typeof document === 'undefined') return null;

  const trimmed = value.trim();
  const meetsMinLength = !minLength || trimmed.length >= minLength;
  const canSubmit = (!required || trimmed.length > 0) && meetsMinLength;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(value);
  };

  const inputClassName =
    'w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#FF4F00]/60 focus:border-[#FF4F00]/60';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/65 backdrop-blur-md"
            onClick={onCancel}
          />

          <motion.div data-responsive-dialog="true"
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden p-6 flex flex-col gap-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nvuto-prompt-title"
            aria-describedby={message ? 'nvuto-prompt-description' : undefined}
          >
            <div className="flex flex-col gap-1.5">
              <h3
                id="nvuto-prompt-title"
                className="text-lg font-bold text-slate-900 dark:text-white leading-snug"
              >
                {title}
              </h3>
              {message && (
                <p
                  id="nvuto-prompt-description"
                  className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed"
                >
                  {message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {label && (
                <label htmlFor="nvuto-prompt-input" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {label}
                </label>
              )}
              {multiline ? (
                <textarea
                  id="nvuto-prompt-input"
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className={inputClassName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              ) : (
                <input
                  id="nvuto-prompt-input"
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className={inputClassName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              )}
              {typeof minLength === 'number' && minLength > 0 && (
                <div className="flex justify-between items-center nvuto-caption px-0.5 mt-1">
                  <span
                    className={
                      trimmed.length >= minLength
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {trimmed.length >= minLength
                      ? '✓ Minimum length satisfied'
                      : `Minimum ${minLength} characters required for audit log`}
                  </span>
                  <span
                    className={
                      trimmed.length >= minLength
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold font-mono'
                        : 'text-slate-400 dark:text-slate-500 font-mono'
                    }
                  >
                    {trimmed.length}/{minLength}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <Button
                onClick={onCancel}
                variant="ghost"
                className="h-11 min-h-[44px] px-5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer"
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="h-11 min-h-[44px] px-5 text-xs font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default NvutoPromptModal;
