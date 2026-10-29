# Initial audit and implementation plan

Evidence labels: **OBSERVED** means directly evidenced in the inspected source; **INFERRED** is a reasoned interpretation; **PROPOSED** is a local extraction decision; **UNVERIFIED** means accessible evidence is insufficient. Adoption approval is a separate field.

## Findings

1. **OBSERVED:** The selected product has an extensive local atomic UI barrel, CSS custom properties, canonical typography utilities, responsive overrides and Radix wrappers. React 18.3.1/Tailwind 4.1.12 are actual consumers. There is no resolved `@nvuto` design-system dependency in the selected manifests/lockfile inspected so far.
2. **OBSERVED:** The HR CSS provides `:root` light values and `.dark` overrides. Both semantic variables and component literal values exist; card surfaces and destructive/focus colors disagree in places. Raw observations must remain separate from proposed normalization.
3. **UNVERIFIED:** No HR implementation or accessible package establishes `light-glass`/`dark-glass`. Blur overlays are not evidence of complete glass themes. The earlier Desk handover is a discovery lead, not permission to invent modes.
4. **OBSERVED:** Some shared-library files contain application data access. In particular, the custom select imports requisition option loading. Authentication, API calls, business entities and route guards belong outside the portable core.
5. **OBSERVED:** Fonts use Google Fonts, icons use Solar, and the repository contains Nvuto logos plus third-party integration logos and product images. Only justified brand assets and declared dependency assets will be distributed; unknown rights remain documented.
6. **OBSERVED:** Global font/reset rules, hidden scrollbars and body portals have product-wide side effects. Scoping, portal containment and SSR boundaries require explicit extraction adapters and recorded differences.

## Scope and approach

- Inventory active source routes, screen/component files, role-dependent navigation, styles, literal values, public assets and dependencies. Archived snapshots, generated files, tests, backend implementation and vendor code receive explicit exclusion dispositions.
- Preserve as-is shared UI/styles and file hashes. Record origins for every public export and token. Inspect reachable implementations and distinguish source usage from policy approval.
- Generate DTCG-2025.10-compatible token subsets where represented faithfully; validate types, aliases, cycles, collisions and light/dark mapping. Keep raw CSS values and source names in provenance.
- Extract pure UI families and meaningful compositions into a React package, with a framework-neutral foundations package. Replace business option loading with caller-provided data and routing with callbacks/slots. Do not duplicate a hypothetical upstream authority.
- Build an indexed interactive catalogue from public exports and representative list/detail/settings/wizard compositions. Demonstrate supported states with synthetic fixtures.
- Add complete integration/migration/governance/agent documentation and an independent packed-artifact consumer. Use npm workspaces because npm/lockfiles and Vite are already established; do not add another monorepo manager or Storybook unnecessarily.
- Verify deterministic builds, exports, interactions, scoped themes/portals, SSR, controlled visual fidelity, responsive behavior and accessibility. Record source defects, remediation differences, samples and remaining manual/provider/device limits honestly.

## Completion boundary

This work can establish a traceable HR-web extraction and a usable local adoption candidate. It cannot establish design approval for every Nvuto product, ownership/publication rights, an unavailable Desk contract, or untested framework/device/assistive-technology conformance.
