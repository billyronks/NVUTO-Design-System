import React from 'react';
import { InteractiveGridBackground } from '@/app/components/ui';

export type MarketingTheme = 'dark' | 'light' | 'indigo' | 'slate';
export const MarketingThemeContext = React.createContext<MarketingTheme>('light');
export const useMarketingTheme = () => React.useContext(MarketingThemeContext);

interface MarketingSectionProps {
  id?: string;
  className?: string;
  theme?: MarketingTheme;
  containerSize?: 'default' | 'narrow' | 'wide' | 'full';
  children: React.ReactNode;
  withGlow?: 'indigo' | 'orange' | 'dual' | 'none';
  withGrid?: boolean;
}

export const MarketingSection: React.FC<MarketingSectionProps> = ({
  id,
  className = '',
  theme = 'light',
  containerSize = 'default',
  children,
  withGlow = 'none',
  withGrid = false,
}) => {
  const themeStyles = {
    dark: 'bg-[#0B0F19] text-[#F8FAFC]',
    light: 'bg-[#F8FAFC] text-slate-800 marketing-section-light',
    indigo: 'bg-[#111184] text-white',
    slate: 'bg-white text-slate-900 border-y border-slate-100 dark:bg-[#111625] dark:text-[#F8FAFC] dark:border-[#232D42]',
  }[theme];

  const containerMax = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1400px]',
    full: 'max-w-full',
  }[containerSize];

  return (
    <MarketingThemeContext.Provider value={theme}>
      <section
        id={id}
        data-marketing-theme={theme}
        className={`relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden ${themeStyles} ${className}`}
      >
      {/* Background Interactive Magnetic Grid */}
      {withGrid && (
        <InteractiveGridBackground
          theme={theme === 'dark' || theme === 'indigo' ? 'dark' : 'light'}
        />
      )}

      {/* Controlled Radial Ambient Glows */}
      {withGlow === 'indigo' && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#111184]/15 blur-[120px] rounded-full pointer-events-none select-none"
          aria-hidden="true"
        />
      )}
      {withGlow === 'orange' && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF4F00]/10 blur-[130px] rounded-full pointer-events-none select-none"
          aria-hidden="true"
        />
      )}
      {withGlow === 'dual' && (
        <>
          <div
            className="absolute top-1/4 left-1/3 w-[500px] h-[400px] bg-[#111184]/20 blur-[120px] rounded-full pointer-events-none select-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[450px] h-[350px] bg-[#FF4F00]/12 blur-[130px] rounded-full pointer-events-none select-none"
            aria-hidden="true"
          />
        </>
      )}

      <div className={`mx-auto w-full relative z-10 ${containerMax}`}>
        {children}
      </div>
    </section>
  </MarketingThemeContext.Provider>
);
};
