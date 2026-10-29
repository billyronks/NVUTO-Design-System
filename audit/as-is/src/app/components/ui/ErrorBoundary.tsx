import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  DangerCircle as DangerCircleIcon,
  RefreshCircle as RefreshCircleIcon,
  AltArrowLeft as AltArrowLeftIcon,
  BugMinimalistic as BugIcon,
  Code as CodeIcon
} from '@solar-icons/react';
import { Button } from './button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackLevel?: 'root' | 'shell' | 'section';
  title?: string;
  description?: string;
  onReset?: () => void;
  showDetails?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStackTrace: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showStackTrace: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    // Centralized logging for uncaught render exceptions
    console.error('[ErrorBoundary caught uncaught render error]:', error, errorInfo);

    const errorMessage = error?.message || '';
    const isChunkError =
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Importing a module script failed') ||
      errorMessage.includes('error loading dynamically imported module') ||
      errorMessage.includes('Outdated chunk');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadKey = 'chunk_reload_attempted';
      const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
      if (Date.now() - lastReload > 10_000) {
        sessionStorage.setItem(reloadKey, Date.now().toString());
        window.location.reload();
      }
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showStackTrace: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleClearCacheAndRestart = (): void => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
        localStorage.removeItem('chunk_reload_attempted');
      } catch (e) {
        /* ignore storage access errors */
      }
      window.location.href = '/';
    }
  };

  private handleNavigateToSafety = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private toggleStackTrace = (): void => {
    this.setState((prev) => ({ showStackTrace: !prev.showStackTrace }));
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallbackLevel = 'section', title, description, showDetails = true } = this.props;
    const errorMessage = this.state.error?.message || 'An unexpected JavaScript error occurred during render.';
    const isChunkError =
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Importing a module script failed') ||
      errorMessage.includes('error loading dynamically imported module') ||
      errorMessage.includes('Outdated chunk');

    // ── 1. ROOT FALLBACK (Full-Page Canvas) ──────────────────────────────────
    if (fallbackLevel === 'root') {
      return (
        <div className="min-h-screen min-w-0 w-full bg-[#F8FAFC] dark:bg-[#0B0F19] flex items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-[#F8FAFC]">
          <div className="w-full max-w-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#BE123C]/10 text-[#BE123C] flex items-center justify-center shrink-0">
                <DangerCircleIcon size={32} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#FF4F00] uppercase tracking-wider">
                  {isChunkError ? 'Platform Update Available' : 'System Recovery'}
                </span>
                <h1 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">
                  {title || (isChunkError ? 'Update Required' : 'Application Render Error')}
                </h1>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              {description || (isChunkError
                ? 'A new version of the platform was deployed. Reloading the application will fetch the latest modules.'
                : 'The application encountered an uncaught runtime error while rendering this page view. You can reload the application or reset your session cache.')}
            </p>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 flex flex-col gap-2">
              <span className="text-xs font-bold text-[#BE123C] uppercase tracking-wider flex items-center gap-1.5">
                <BugIcon size={14} /> Exception Details
              </span>
              <code className="text-xs font-mono text-rose-800 dark:text-rose-300 break-words leading-relaxed">
                {errorMessage}
              </code>
            </div>

            {showDetails && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={this.toggleStackTrace}
                  className="text-xs font-bold text-slate-500 hover:text-[#FF4F00] dark:text-[#94A3B8] dark:hover:text-[#FF4F00] flex items-center gap-1.5 transition-colors self-start cursor-pointer min-h-[44px]"
                >
                  <CodeIcon size={14} />
                  {this.state.showStackTrace ? 'Hide Stack Trace' : 'Show Stack Trace'}
                </button>
                {this.state.showStackTrace && (
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 nvuto-mono overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {this.state.error?.stack}
                    {'\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReload}
                leftIcon={RefreshCircleIcon}
              >
                Reload Application
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={this.handleClearCacheAndRestart}
                leftIcon={AltArrowLeftIcon}
              >
                Clear Cache & Restart
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // ── 2. SHELL FALLBACK (Main Canvas inside AppLayout) ────────────────────
    if (fallbackLevel === 'shell') {
      return (
        <div className="flex-1 p-8 bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-8 shadow-xl flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF4F00]/10 text-[#FF4F00] flex items-center justify-center shrink-0">
                <DangerCircleIcon size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#FF4F00] uppercase tracking-wider">
                  {isChunkError ? 'Platform Update Available' : 'Workspace Error'}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-[#F8FAFC]">
                  {title || (isChunkError ? 'Update Required' : 'Dashboard Temporarily Unavailable')}
                </h2>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8]">
              {description || (isChunkError
                ? 'A new version of the platform was recently deployed. Reloading the page will update your session to the latest version.'
                : 'An error occurred while loading this workspace module. Your navigation shell remains active.')}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#171E2E] border border-slate-200 dark:border-[#232D42]">
              <code className="text-xs font-mono text-slate-700 dark:text-[#94A3B8] break-words">
                {errorMessage}
              </code>
            </div>

            {showDetails && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={this.toggleStackTrace}
                  className="text-xs font-bold text-slate-500 hover:text-[#FF4F00] dark:text-[#94A3B8] dark:hover:text-[#FF4F00] flex items-center gap-1.5 transition-colors self-start cursor-pointer min-h-[44px]"
                >
                  <CodeIcon size={14} />
                  {this.state.showStackTrace ? 'Hide Stack Details' : 'View Stack Details'}
                </button>
                {this.state.showStackTrace && (
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 nvuto-mono overflow-x-auto max-h-40 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {this.state.error?.stack}
                    {'\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={isChunkError ? this.handleReload : this.handleReset}
                leftIcon={RefreshCircleIcon}
              >
                {isChunkError ? 'Reload Platform' : 'Try Again'}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={this.handleNavigateToSafety}
                leftIcon={AltArrowLeftIcon}
              >
                Go to Main Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // ── 3. SECTION FALLBACK (Inline Component/Widget Level) ────────────────
    return (
      <div className="w-full p-6 rounded-xl bg-white dark:bg-[#111625] border border-rose-200 dark:border-rose-950/40 shadow-sm flex flex-col gap-4 my-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-[#BE123C] flex items-center justify-center shrink-0">
              <DangerCircleIcon size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                {title || (isChunkError ? 'Update Required' : 'Section Unavailable')}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
                {description || (isChunkError
                  ? 'A newer version of this module is available. Click reload to refresh.'
                  : 'This component encountered a render failure.')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={isChunkError ? this.handleReload : this.handleReset}
            leftIcon={RefreshCircleIcon}
          >
            {isChunkError ? 'Reload' : 'Retry'}
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/10 border border-slate-200 dark:border-[#232D42] dark:border-rose-950/20">
          <code className="text-xs font-mono text-rose-700 dark:text-rose-400 break-words">
            {errorMessage}
          </code>
        </div>
      </div>
    );
  }
}
