# BrandIcons

Source-derived primitive/composition. Build/type coverage is separate from runtime interaction acceptance; see per-family coverage. Host must provide meaningful labels and domain content.

## Provenance and maturity

- src/app/components/ui/BrandIcons.tsx at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; SHA-256 0b1b75500ca19801721bcfc151dc3bc1845bcd30493a2f038837006a51ac4d34.
- Evidence: OBSERVED source; adoption: candidate, not organization-wide approved.
- Disposition: documented only. Not packaged; see audit/extraction-decision.json for the exact exclusion.
- Public symbols: `SlackIcon`, `LinkedInIcon`, `GoogleIcon`, `GoogleCalendarIcon`, `MicrosoftIcon`, `XeroIcon`, `QuickBooksIcon`, `IndeedIcon`, `GlassdoorIcon`, `GreenhouseIcon`, `ZipRecruiterIcon`, `JobbermanIcon`, `JoobleIcon`, `MyJobMagIcon`, `GenericBrandMark`, `BrandKey`, `BRAND_ICON_GAPS`, `resolveBrandKeyFromName`, `IntegrationLogo`. Types are not counted as rendered components.
- Catalogue: documented boundary only. Validation: see [coverage](../../audit/coverage.json).

## API and composition

Public props are inherited from the native element or declared primitive. Read the extracted source and generated `.d.ts`; undocumented deep imports are unsupported.

## Visual and state contract

Source class variants, sizes, defaults and token literals remain in [implementation](../../audit/extraction-decision.json). Theme aliases are in [token source](../../tokens/light.tokens.json) and [dark mappings](../../tokens/dark.tokens.json). Do not replace literal conflicts without review. Density modes are not separately implemented.

Applicable hover/focus/pressed/selected/expanded/disabled/read-only/loading/invalid states depend on this control's native or primitive API. They are not all accepted by the extraction merely because source CSS contains selectors. See the coverage record before reuse.

## Accessibility and responsive use

Provide labels, proper heading hierarchy and non-color status text. Interactive controls must support keyboard focus; overlays need entry/return, Escape/dismissal and a scrollable viewport. Source custom popup families require additional manual review. Disabled controls are distinct from read-only values.

Use long translated labels and missing values in host acceptance. Preserve wrapping and keyboard-reachable horizontal table scrolling. Test 320/375/768/1024/1440 CSS px and reduced motion. Source locale/currency/timezone formatting remains host responsibility; this package does not claim global localization support.

## Changes and examples

Consult [remediations](../../audit/remediations.json) and [migration](../migration/source-to-shared.md). Runnable synthetic examples are in [catalogue](../../catalogue/App.tsx); import from `nvuto-hr-ui`, never HR source paths. No imitation replacement is supplied.
