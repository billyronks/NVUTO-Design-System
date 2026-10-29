# StatusBadge

Presentation only. variant is explicit; status text is not interpreted as business policy. Use text labels as well as color.

## Provenance and maturity

- src/app/components/ui/StatusBadge.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 d3ee1785fa9c14487179fba8025f69bcd6192bc6b651cea5aa01f15854cbb7f5.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/StatusBadge.tsx`.
- Public symbols: `StatusCategory`, `StatusBadgeProps`, `StatusBadge`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: StatusCategory;
  className?: string;
  children?: React.ReactNode;
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/StatusBadge.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [StatusBadge.tsx](../../examples/snippets/StatusBadge.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
