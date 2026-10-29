import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Star, AltArrowLeft, Bell, CheckCircle } from '@solar-icons/react';
import { Button, Badge } from '@/app/components/ui';
import { useToast } from '../../context/useToast';

export interface ComingSoonModuleWrapperProps {
  moduleName: string;
  moduleCategory?: string;
  description: string;
  features?: string[];
  expectedRelease?: string;
  icon?: React.ComponentType<{ className?: string; size?: number | string }>;
  returnPath?: string;
  children: React.ReactNode;
}

export const ComingSoonModuleWrapper: React.FC<ComingSoonModuleWrapperProps> = ({
  moduleName,
  moduleCategory = 'Platform Module',
  description,
  features = [
    'Automated Compliance & WHT Verification',
    'Localized Digital Contracts',
    'Multi-Currency Invoice Processing',
    'Executive Reporting & Audit Logs'
  ],
  expectedRelease = 'Q3 2026',
  icon: IconComponent = LockKeyhole,
  returnPath,
  children
}) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    addToast(
      'info',
      'Notification Preference Saved',
      `You will be notified immediately when ${moduleName} is ready for early access.`
    );
  };

  const handleReturnDashboard = () => {
    navigate(returnPath || '/hr/dashboard');
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F19]">
      {/* Blurred background view of the module layout */}
      <div 
        aria-hidden="true" 
        className="w-full h-full filter blur-[12px] opacity-40 dark:opacity-20 pointer-events-none select-none overflow-hidden transition-all duration-700"
      >
        {children}
      </div>

      {/* Glassmorphic Ambient Backdrop Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/45 dark:bg-black/75 backdrop-blur-md select-none">
        
        {/* Glowing Decorative Backdrop Aura */}
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/10 to-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

        {/* Central Frosted Glass Card */}
        <div data-responsive-dialog="true" className="relative max-w-2xl w-full bg-white/90 dark:bg-[#0F172A]/90 border border-white/60 dark:border-slate-800 shadow-sm backdrop-blur-xl rounded-xl p-8 sm:p-10 flex flex-col items-center text-center overflow-hidden">
          
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-600 to-violet-600" />

          {/* Module Icon Container */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#111184] to-[#4338CA] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 border border-white/20">
              <IconComponent size={38} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Star size={16} />
            </div>
          </div>

          {/* Pill Category & Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="px-3 py-1 rounded-full nvuto-btn-text-compact font-bold tracking-widest uppercase border-indigo-200 bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
              {moduleCategory}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 rounded-full nvuto-btn-text-compact font-bold tracking-widest uppercase border-amber-300 bg-amber-50/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
              Coming Soon
            </Badge>
          </div>

          {/* Module Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            {moduleName}
          </h1>

          {/* Module Description */}
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mb-6">
            {description}
          </p>

          {/* Upcoming Features Grid */}
          {features && features.length > 0 && (
            <div className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 flex flex-col gap-2.5 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                What to expect:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Release Tag */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
            Expected Rollout: <span className="font-bold text-indigo-600 dark:text-indigo-400">{expectedRelease}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full">
            <Button
              variant="default"
              size="lg"
              onClick={handleReturnDashboard}
              className="shrink-0 whitespace-nowrap h-11 px-6 font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#FF4F00] hover:bg-[#e04500] active:bg-[#CC3F00] text-white shadow-sm border-0 rounded-lg"
            >
              <AltArrowLeft size={18} className="shrink-0" />
              Return to Dashboard
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleNotifyMe}
              disabled={notified}
              className="shrink-0 whitespace-nowrap h-11 px-6 font-bold flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Bell size={18} className={`shrink-0 ${notified ? 'text-emerald-500' : 'text-amber-500'}`} />
              {notified ? 'Subscribed' : 'Notify Me On Launch'}
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};
