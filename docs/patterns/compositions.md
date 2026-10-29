# Presentational compositions

## AppShell

Navigation/header/content slots; 264px candidate shell width, stacked under 768px. Source: src/app/components/layout/HRLayout.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09. INFERRED geometry / PROPOSED slot API; adoption candidate.

No data fetching, routing or authorization. Pass content/actions explicitly. At narrow widths preserve action order, wrap text and allow bounded table/step scrolling. Loading/error/empty/forbidden/offline are host-selected presentation, never inferred from an empty response.

## ListPage

Heading/actions → filters → bounded table/content. Source: src/app/modules/hr @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09. INFERRED geometry / PROPOSED slot API; adoption candidate.

No data fetching, routing or authorization. Pass content/actions explicitly. At narrow widths preserve action order, wrap text and allow bounded table/step scrolling. Loading/error/empty/forbidden/offline are host-selected presentation, never inferred from an empty response.

## SettingsSection

Description/fields two-column layout collapses to one column. Source: src/app/modules/hr @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09. INFERRED geometry / PROPOSED slot API; adoption candidate.

No data fetching, routing or authorization. Pass content/actions explicitly. At narrow widths preserve action order, wrap text and allow bounded table/step scrolling. Loading/error/empty/forbidden/offline are host-selected presentation, never inferred from an empty response.

## StatePanel

Explicit presentation kinds; retries are caller callbacks. Source: src/app/components/ui/EmptyState.tsx @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09. INFERRED geometry / PROPOSED slot API; adoption candidate.

No data fetching, routing or authorization. Pass content/actions explicitly. At narrow widths preserve action order, wrap text and allow bounded table/step scrolling. Loading/error/empty/forbidden/offline are host-selected presentation, never inferred from an empty response.

## StepFlow

Numbered horizontal progress and current-step semantics; caller owns transitions. Source: src/app/modules/hr @ 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09. INFERRED geometry / PROPOSED slot API; adoption candidate.

No data fetching, routing or authorization. Pass content/actions explicitly. At narrow widths preserve action order, wrap text and allow bounded table/step scrolling. Loading/error/empty/forbidden/offline are host-selected presentation, never inferred from an empty response.
