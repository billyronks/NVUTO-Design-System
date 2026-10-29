import React from 'react';

interface PlatformLoaderProps {
  variant?: 'fixed' | 'absolute' | 'inline';
  size?: 'sm' | 'md' | 'lg' | number;
  message?: string;
  text?: string;
}

export default function PlatformLoader({ variant = 'fixed', size = 'md', message, text }: PlatformLoaderProps) {
  const finalMessage = message || text;
  const sizeMap = {
    sm: 40,
    md: 80,
    lg: 120,
  };
  const finalSize = typeof size === 'number' ? size : sizeMap[size] || 80;

  const containerClasses = {
    fixed: 'fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-md bg-[#F8FAFC]/50 dark:bg-[#0B0F19]/80',
    absolute: 'absolute inset-0 z-[50] flex flex-col items-center justify-center backdrop-blur-sm bg-white/40 dark:bg-[#0B0F19]/60',
    inline: 'relative flex flex-col items-center justify-center p-4',
  }[variant];

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center justify-center gap-3">
        <svg
          className="animate-spin"
          width={finalSize}
          height={finalSize}
          viewBox="0 0 628 628"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animationDuration: '2s' }}
        >
          <path d="M313.997 429.5C377.786 429.5 429.497 377.789 429.497 314C429.497 250.211 377.786 198.5 313.997 198.5C250.208 198.5 198.497 250.211 198.497 314C198.497 377.789 250.208 429.5 313.997 429.5Z" fill="#FF4F00" />
          <path d="M314 50C190.25 50 107.75 107.75 66.5 190.25" stroke="#FF4F00" strokeWidth="82.5" strokeLinecap="round" />
          <path d="M578 314C578 190.25 520.25 107.75 437.75 66.5" stroke="#FF7033" strokeWidth="82.5" strokeLinecap="round" />
          <path d="M314 578C437.75 578 520.25 520.25 561.5 437.75" stroke="#E64500" strokeWidth="82.5" strokeLinecap="round" />
          <path d="M50 314C50 437.75 107.75 520.25 190.25 561.5" stroke="#FF4F00" strokeWidth="82.5" strokeLinecap="round" />
        </svg>
        {finalMessage && (
          <span className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8] tracking-wide">
            {finalMessage}
          </span>
        )}
      </div>

      <style>{`
        /* Standardize the spin animation globally to ensure smooth continuous rotation */
        @keyframes spin-loader {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin-loader 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
