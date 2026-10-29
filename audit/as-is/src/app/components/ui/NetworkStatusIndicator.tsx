import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldWarning, Refresh } from '@solar-icons/react';

const WifiOffIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
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
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 0 5 9.04" />
    <path d="M23.99 7.94a16.96 16.96 0 0 0-8.99-3.92" />
    <path d="M8.53 16.11a6 6 0 0 1-.53-.11" />
    <path d="M11.64 16.87a6 6 0 0 0 3.36-1.87" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  saveData?: boolean;
  rtt?: number;
  downlink?: number;
  addEventListener(type: 'change', listener: EventListener): void;
  removeEventListener(type: 'change', listener: EventListener): void;
}

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSlow, setIsSlow] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [dismissedSlow, setDismissedSlow] = useState<boolean>(false);

  const checkConnectionQuality = useCallback(() => {
    if (typeof navigator === 'undefined') return;

    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    setIsOnline(true);

    const nav = navigator as unknown as { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation };
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (conn) {
      const slow =
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g' ||
        (conn.rtt !== undefined && conn.rtt > 1500) ||
        (conn.downlink !== undefined && conn.downlink > 0 && conn.downlink < 0.25);
      setIsSlow(slow);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      checkConnectionQuality();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const nav = navigator as unknown as { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation };
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (conn) {
      conn.addEventListener('change', checkConnectionQuality);
    }

    checkConnectionQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) {
        conn.removeEventListener('change', checkConnectionQuality);
      }
    };
  }, [checkConnectionQuality]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch('/favicon.svg?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
      if (res.ok) {
        setIsOnline(true);
        checkConnectionQuality();
      }
    } catch {
      // Still offline
      setIsOnline(false);
    } finally {
      setIsRetrying(false);
    }
  };

  const showOffline = !isOnline;
  const showSlow = isOnline && isSlow && !dismissedSlow;

  if (!showOffline && !showSlow) {
    return null;
  }

  return (
    <AnimatePresence>
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 pointer-events-auto flex justify-center sm:justify-end"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="max-w-md w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#0F141C]/95 backdrop-blur-xl border border-white/10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-xs sm:text-sm"
        >
          {showOffline ? (
            <>
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <WifiOffIcon size={18} />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Offline Mode</span>
                  <span className="text-slate-400 text-xs">Serving cached pages & data</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF4F00] hover:bg-[#E04500] text-white font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Refresh size={14} className={isRetrying ? 'animate-spin' : ''} />
                <span>{isRetrying ? 'Checking…' : 'Retry'}</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldWarning size={18} />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Slow Network</span>
                  <span className="text-slate-400 text-xs">Optimizing resource loading</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDismissedSlow(true)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Dismiss slow network notification"
              >
                Dismiss
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default NetworkStatusIndicator;
