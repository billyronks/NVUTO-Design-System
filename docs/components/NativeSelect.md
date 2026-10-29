# NativeSelect

Prefer native selection where platform keyboard/validation semantics suffice. Provide an accessible label and real option values. Native popup rendering differs by OS.

## Provenance and maturity

- src/app/components/ui/NativeSelect.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 349c0ac709de6112b55188123d2462a356a080071107ec21acd05f2418f77fb4.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/NativeSelect.tsx`.
- Public symbols: `NativeSelect`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

Public props are inherited from the native element or declared primitive. Read the extracted source and generated `.d.ts`; undocumented deep imports are unsupported.

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/NativeSelect.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [NativeSelect.tsx](../../examples/snippets/NativeSelect.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
