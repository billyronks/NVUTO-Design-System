// Extracted from src/app/components/ui/Modal.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import { NvutoPortal } from "./NvutoProvider";
import React, { useEffect, useRef } from 'react';
import { createNvutoPortal as createPortal } from "./NvutoProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCloseRef.current();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = Array.from(
            modalRef.current.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);

          if (focusableElements.length === 0) {
            e.preventDefault();
            modalRef.current.focus();
            return;
          }

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          const isInsideModal = modalRef.current.contains(document.activeElement);

          if (!isInsideModal) {
            e.preventDefault();
            if (e.shiftKey) {
              lastElement.focus();
            } else {
              firstElement.focus();
            }
            return;
          }

          if (e.shiftKey && (document.activeElement === firstElement || document.activeElement === modalRef.current)) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Focus first focusable element or modal container only on initial open
      const focusTimer = setTimeout(() => {
        if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
          const firstFocusable = modalRef.current.querySelector<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);

      return () => {
        clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title || "Dialog Window"}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            data-slot="modal-content"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              "relative z-10 w-full max-w-lg bg-white dark:bg-[#111625] text-slate-800 dark:text-[#F8FAFC] shadow-sm overflow-visible border border-slate-100 dark:border-[#232D42] outline-none rounded-xl",
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
export default Modal;

