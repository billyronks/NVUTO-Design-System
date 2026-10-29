# dropdown-menu

Prefer compositional Radix menu exports. The legacy custom items API remains a compatibility candidate and needs complete keyboard acceptance.

## Provenance and maturity

- src/app/components/ui/dropdown-menu.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 d34d072bf54c555432d5bf5168a62944ed20eb31accb0f41479e67daad6a80c6.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: extracted. Portable implementation: `packages/react/src/dropdown-menu.tsx`.
- Public symbols: `DropdownItem`, `CustomDropdownMenuProps`, `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`. Types are not counted as rendered components.
- Catalogue: [family entry](../../catalogue/App.tsx). Validation: see [coverage](../../audit/coverage.json).

## API and composition

```tsx
export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}

export interface CustomDropdownMenuProps {
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement>; ref?: React.Ref<HTMLElement> }>;
  items: DropdownItem[];
  align?: "left" | "right";
}
```

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../packages/react/src/dropdown-menu.tsx). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. The implementation source is the definitive detailed anatomy/default/variant record; generated declarations are the public type contract.

Complete standalone example: [dropdown-menu.tsx](../../examples/snippets/dropdown-menu.tsx). Includes source-derived JSX, synthetic state, public imports/styles and provider.
