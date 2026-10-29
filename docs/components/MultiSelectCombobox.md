# MultiSelectCombobox

Caller supplies options and selected values. Do not use labels as IDs. Chip overflow, keyboard deletion and full assistive-technology acceptance need additional review.

## Provenance and maturity

- src/app/components/ui/MultiSelectCombobox.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 082d70c7076ed19fd147b692238dbbfbec263a325340e359baefffe4ef878c62.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/MultiSelectCombobox.tsx`.
- Public symbols: `MultiSelectOption`, `MultiSelectComboboxProps`, `MultiSelectCombobox`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectComboboxProps {
  label?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  emptyText?: string;
  renderSelectedChips?: boolean;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  id?: string;
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/MultiSelectCombobox.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [MultiSelectCombobox.tsx](../../examples/snippets/MultiSelectCombobox.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
