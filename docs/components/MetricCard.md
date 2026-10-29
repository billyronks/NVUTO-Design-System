# MetricCard

Source-derived primitive/composition. Build/type coverage is separate from runtime interaction acceptance; see per-family coverage. Host must provide meaningful labels and domain content.

## Provenance and maturity

- src/app/components/ui/MetricCard.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 30ffc5d5775c555e0db888f6d5298dcc2646f3e6b8ac566619cad5bd80c04a9e.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/MetricCard.tsx`.
- Public symbols: `MetricCardProps`, `MetricCard`, `KPICard`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface MetricCardProps {
  label?: string;
  title?: string;
  value: React.ReactNode;
  change?: string;
  status?: string;
  positive?: boolean;
  icon?: React.ComponentType<any>;
  subtext?: string;
  iconClassName?: string;
  iconColorClass?: string;
  variant?: 'success' | 'warning' | 'critical' | 'neutral';
  valueClassName?: string;
  valueColorClass?: string;
  /** Optional extra content (e.g. a progress bar) rendered below the value/subtext, above the footer divider. */
  extra?: React.ReactNode;
  children?: React.ReactNode;
  changeClassName?: string;
  className?: string;
  onClick?: () => void;
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/MetricCard.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [MetricCard.tsx](../../examples/snippets/MetricCard.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
