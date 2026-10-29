// Extracted from src/app/components/ui/Typography.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09.
// See audit/components.json and audit/remediations.json for provenance/differences.
import React from 'react';

export interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ children, className = '', ...props }) => {
  return (
    <h1
      className={`page-title nvuto-display-lg ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
};

export interface PageSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const PageSubtitle: React.FC<PageSubtitleProps> = ({ children, className = '', ...props }) => {
  return (
    <p
      className={`page-subtitle nvuto-body-lg ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};
