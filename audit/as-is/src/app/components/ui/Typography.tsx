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
