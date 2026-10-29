# select

Custom high-level Select accepts caller options only. Radix compositional exports are also available. Legacy custom popup keyboard coverage is incomplete; use NativeSelect for acceptance-critical forms until reviewed.

## Provenance and maturity

- src/app/components/ui/select.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 eb19456e32fe9b2a257b04a4212f841e7b79470d0142e6b587901f6b76733696.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/select.tsx`.
- Public symbols: `SelectOption`, `CustomSelectProps`, `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
  id?: string;

  [key: string]: any;
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/select.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [select.tsx](../../examples/snippets/select.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
