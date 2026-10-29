# KanbanBoard

Source-derived primitive/composition. Build/type coverage is separate from runtime interaction acceptance; see per-family coverage. Host must provide meaningful labels and domain content.

## Provenance and maturity

- src/app/components/ui/KanbanBoard.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 d11a2806c1d5cda38ef1f39c7b013ac6085b0fbed0a22f1e4342ff087e49a618.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/KanbanBoard.tsx`.
- Public symbols: `KanbanBoardProps`, `KanbanBoard`, `KanbanColumnProps`, `KanbanColumn`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface KanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface KanbanColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  count: number;
  badgeVariant?: 'success' | 'critical' | 'warning' | 'neutral' | 'draft' | 'slate' | 'info' | 'danger' | 'purple';
  children: React.ReactNode;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/KanbanBoard.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [KanbanBoard.tsx](../../examples/snippets/KanbanBoard.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
