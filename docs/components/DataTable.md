# DataTable

Use TableWrapper/Toolbar/Table/Head/Row/Cell and Pagination. Host owns rows, sort, selection and backend paging. Horizontal scroll region remains keyboard reachable. Provide caption/headers for meaning; avoid color-only statuses.

## Provenance and maturity

- src/app/components/ui/DataTable.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 2f8df6ecf3795da3108bda43eeed432af03e61993d65042ca96fc2f4473bb704.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/DataTable.tsx`.
- Public symbols: `TableWrapperProps`, `TableWrapper`, `TableToolbarProps`, `TableToolbar`, `TableProps`, `Table`, `TableHeadProps`, `TableHead`, `TableHeaderCellProps`, `TableHeaderCell`, `TableBodyProps`, `TableBody`, `TableRowProps`, `TableRow`, `TableCellProps`, `TableCell`, `TablePaginationProps`, `TablePagination`, `TableLoadingSkeletonProps`, `TableLoadingSkeleton`, `TableEmptyStateProps`, `TableEmptyState`, `TableErrorStateProps`, `TableErrorState`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface TableWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  wrapperClassName?: string;
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

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

export interface TableLoadingSkeletonProps {
  columns?: number;
  colSpan?: number;
  rows?: number;
  className?: string;
}

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

export interface TableErrorStateProps {
  colSpan: number;
  title?: React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/DataTable.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [DataTable.tsx](../../examples/snippets/DataTable.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
