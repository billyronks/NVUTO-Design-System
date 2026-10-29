import React from 'react';
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react';
import { Button } from './button';
import { cn } from './utils';
import { EmptyState } from './EmptyState';

// 1. TableWrapper
export interface TableWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn("nvuto-table-wrapper min-w-0 max-w-full bg-white dark:bg-[#111625] rounded-xl border border-slate-200 dark:border-[#232D42] shadow-sm overflow-hidden w-full flex flex-col transition-colors duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// 2. TableToolbar
export interface TableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn("nvuto-table-toolbar min-w-0 px-4 sm:px-6 py-5 border-b border-slate-200/80 dark:border-[#232D42] flex flex-wrap flex-col sm:flex-row sm:items-center justify-between gap-4 select-none", className)}
      {...props}
    >
      {children}
    </div>
  );
};

// 3. Table
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  wrapperClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  return (
    <div className={cn("nvuto-scroll-region overflow-x-auto min-w-0 max-w-full w-full", wrapperClassName)} tabIndex={0} role="region" aria-label={typeof props['aria-label'] === 'string' ? props['aria-label'] : 'Data table — scroll horizontally for more columns'}>
      <table
        className={cn("w-full min-w-full border-collapse text-left text-sm text-slate-700 dark:text-[#E2E8F0]", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

// 4. TableHead
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead
      className={cn(className, "!border-b !border-slate-200 dark:!border-[#232D42] !bg-slate-50 dark:!bg-[#171E2E] select-none")}
      {...props}
    >
      {children}
    </thead>
  );
};

// 5. TableHeaderCell
export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      className={cn(
        "align-middle text-left",
        className,
        "!h-12 !px-6 !py-3 !text-xs !font-extrabold !uppercase !tracking-wider !text-slate-500 dark:!text-[#94A3B8]",
      )}
      {...props}
    >
      {children}
    </th>
  );
};

// 6. TableBody
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody
      className={cn("divide-y divide-slate-100 dark:divide-[#232D42]", className)}
      {...props}
    >
      {children}
    </tbody>
  );
};

// 7. TableRow
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={cn("bg-white hover:bg-slate-50/80 dark:bg-[#111625] dark:hover:bg-[#171E2E] transition-colors duration-150 group", className)}
      {...props}
    >
      {children}
    </tr>
  );
};

// 8. TableCell
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td
      className={cn(
        "align-middle text-slate-700 dark:text-[#E2E8F0]",
        className,
        "!px-6 !py-4 !text-sm",
      )}
      {...props}
    >
      {children}
    </td>
  );
};

// 9. TablePagination
export interface TablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalItems?: number;
  totalCount?: number;
  itemsPerPage?: number;
  pageSize?: number;
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  totalItems,
  totalCount,
  itemsPerPage = 10,
  pageSize,
  currentPage,
  totalPages: propTotalPages,
  onPageChange,
  itemLabel = 'entries',
  className = '',
  ...props
}) => {
  const effectiveItemsPerPage = pageSize ?? itemsPerPage ?? 10;
  const effectiveTotalItems = totalCount ?? totalItems ?? 0;
  const calculatedTotalPages = Math.max(1, Math.ceil(effectiveTotalItems / effectiveItemsPerPage));
  const totalPages = effectiveTotalItems > 0 ? calculatedTotalPages : Math.max(1, propTotalPages ?? 1);
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = effectiveTotalItems > 0 ? (activePage - 1) * effectiveItemsPerPage + 1 : 0;
  const endIndex = Math.min(activePage * effectiveItemsPerPage, effectiveTotalItems);

  // Generate page numbers dynamically for 1, 2, ... totalPages
  const pageNumbers: number[] = [];
  const maxVisiblePages = 5;
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    let start = Math.max(1, activePage - 2);
    let end = Math.min(totalPages, activePage + 2);
    if (start === 1) {
      end = maxVisiblePages;
    } else if (end === totalPages) {
      start = totalPages - maxVisiblePages + 1;
    }
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div
      className={`nvuto-table-pagination min-w-0 px-4 sm:px-6 py-4 border-t border-slate-200/80 dark:border-[#232D42] flex flex-wrap flex-col sm:flex-row sm:items-center justify-between gap-4 select-none bg-white dark:bg-[#111625] ${className}`}
      {...props}
    >
      {/* Left side text info */}
      <div className="nvuto-caption text-slate-500 dark:text-slate-400 font-normal">
        Showing <span className="font-bold text-slate-700 dark:text-slate-200">{startIndex}</span> to{' '}
        <span className="font-bold text-slate-700 dark:text-slate-200">{endIndex}</span> of{' '}
        <span className="font-bold text-slate-700 dark:text-slate-200">{effectiveTotalItems}</span> {itemLabel}
      </div>

      {/* Right side page selectors using atomic Button */}
      <div className="flex flex-wrap items-center gap-1.5 max-w-full" role="group" aria-label="Pagination">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(activePage - 1, 1))}
          disabled={activePage <= 1}
          className="w-12 h-12 border border-slate-200 dark:border-[#232D42] text-slate-500 dark:text-[#94A3B8] hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] rounded-xl flex items-center justify-center transition-all !p-0 !min-w-0 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <AltArrowLeft size={24} />
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => {
          const isActive = pageNum === activePage;
          return (
            <Button
              key={pageNum}
              variant={isActive ? 'primary' : 'outline'}
              onClick={() => onPageChange(pageNum)}
              className={`w-12 h-12 flex items-center justify-center font-bold text-base transition-all rounded-xl !p-0 !min-w-0 min-h-[44px] ${
                isActive
                  ? 'bg-[#FF4F00] text-white shadow-sm'
                  : 'border border-slate-200 dark:border-[#232D42] text-slate-750 dark:text-[#F8FAFC] bg-white hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#232D42]'
              }`}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next Button */}
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(activePage + 1, totalPages))}
          disabled={activePage >= totalPages}
          className="w-12 h-12 border border-slate-200 dark:border-[#232D42] text-slate-500 dark:text-[#94A3B8] hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] rounded-xl flex items-center justify-center transition-all !p-0 !min-w-0 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Page"
          aria-label="Next Page"
        >
          <AltArrowRight size={24} />
        </Button>
      </div>
    </div>
  );
};

// 10. TableLoadingSkeleton
export interface TableLoadingSkeletonProps {
  columns?: number;
  colSpan?: number;
  rows?: number;
  className?: string;
}

export const TableLoadingSkeleton: React.FC<TableLoadingSkeletonProps> = ({
  columns,
  colSpan,
  rows = 5,
  className = '',
}) => {
  const columnCount = colSpan ?? columns ?? 5;
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr
          key={`skeleton-row-${rIdx}`}
          className={cn("animate-pulse border-b border-slate-100 dark:border-[#232D42]", className)}
        >
          {Array.from({ length: columnCount }).map((_, cIdx) => (
            <td key={`skeleton-cell-${rIdx}-${cIdx}`} className="px-6 py-4">
              <div
                className="h-4 bg-slate-200/80 dark:bg-[#1E293B] rounded"
                style={{ width: `${60 + ((rIdx + cIdx) % 4) * 10}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// 11. TableEmptyState
export interface TableEmptyStateProps {
  colSpan: number;
  variant?: 'default' | 'first_use' | 'no_results' | 'cleared' | 'not_configured' | 'not_entitled' | 'error';
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  colSpan,
  variant = 'no_results',
  title = 'No records found',
  description = 'There are no records matching your criteria.',
  action,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("p-8 lg:p-12 text-center", className)}>
        <EmptyState
          variant={variant}
          title={title}
          description={description}
          action={action}
          actionLabel={actionLabel}
          onAction={onAction}
          className="border-0 shadow-none bg-transparent"
        />
      </td>
    </tr>
  );
};

// 12. TableErrorState
export interface TableErrorStateProps {
  colSpan: number;
  title?: React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

export const TableErrorState: React.FC<TableErrorStateProps> = ({
  colSpan,
  title = 'Unable to load records',
  message,
  description,
  onRetry,
  className = '',
}) => {
  const displayDescription = description ?? message ?? 'An error occurred while loading table records. Please try again.';
  return (
    <tr>
      <td colSpan={colSpan} className={cn("p-8 lg:p-12 text-center", className)}>
        <EmptyState
          variant="error"
          title={title}
          description={displayDescription}
          onRetry={onRetry}
          className="border-0 shadow-none bg-transparent"
        />
      </td>
    </tr>
  );
};

