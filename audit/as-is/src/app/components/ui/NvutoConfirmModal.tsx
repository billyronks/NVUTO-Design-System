import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'destructive' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const NvutoConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel
}) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
        confirmButtonRef.current?.focus();
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

  let confirmButtonColor = 'bg-[#FF4F00] hover:bg-[#e04500] text-white border-0';
  if (variant === 'destructive') {
    confirmButtonColor = 'bg-rose-600 hover:bg-rose-700 text-white border-0';
  } else if (variant === 'warning') {
    confirmButtonColor = 'bg-amber-500 hover:bg-amber-600 text-slate-900 border-0';
  }

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
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden p-6 flex flex-col gap-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nvuto-confirm-title"
            aria-describedby="nvuto-confirm-description"
          >
            <div className="flex flex-col gap-1.5">
              <h3
                id="nvuto-confirm-title"
                className="text-lg font-bold text-slate-900 dark:text-white leading-snug"
              >
                {title}
              </h3>
              <p
                id="nvuto-confirm-description"
                className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed"
              >
                {message}
              </p>
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
                ref={confirmButtonRef}
                onClick={onConfirm}
                className={`h-11 min-h-[44px] px-5 text-sm font-bold rounded-lg shadow-sm cursor-pointer ${confirmButtonColor}`}
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

export default NvutoConfirmModal;
