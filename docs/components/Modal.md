# Modal

Source custom motion dialog uses focus capture/return and Escape handling. It has not received the same keyboard acceptance as the Radix Dialog composition. Prefer Dialog for new work pending manual review.

## Provenance and maturity

- src/app/components/ui/Modal.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 34bd315d2469b2633b074bed8d50cce02572e4e6fdd074bdf12542d5a5477c79.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/Modal.tsx`.
- Public symbols: `ModalProps`, `Modal`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/Modal.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [Modal.tsx](../../examples/snippets/Modal.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
