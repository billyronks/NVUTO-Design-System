# NVUTO HR design-system extraction handover

**Implementation prepared; verification incomplete.** This is a private local candidate repository, not a production-wide Nvuto approval.

## Output and architecture

Repository: C:\Users\thobb\.codex\visualizations\2026\08\31\01a0577d-fe64-73c1-a24a-43f2211fe677\nvuto-design-system. Branch: codex/design-system-extraction; no remote, push, publication or deployment. Two packages: framework-neutral nvuto-hr-foundations and React18.3.1 nvuto-hr-ui, coordinated at 0.1.0-extraction.1. Source reference: NVUTO HR web at 0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09; current source HEAD 05cb85d2a855d672be85cfc1049b164dd7ac7d1d. The independent backend-only commits are reported separately; all 118 retained frontend evidence hashes match and the source tree is clean. No canonical external Nvuto package was found in the inspected HR manifests/lock. Desk/glass references remain unverified.

Repository map: audit (raw source, provenance, inventories, receipts), tokens (editable typed source/profile), packages (neutral assets/styles and React), docs (foundations/components/patterns/integration/governance/migration), registry, catalogue, examples, prompts, scripts/tests and .github/workflows. README/AGENTS/CONTRIBUTING/CHANGELOG/PROGRESS guide usage and maintenance.

## Measured scope

- 551 literal routes and 585 screen/composition files have dispositions; zero live product role journeys were visited.
- 68 source UI files accounted: 61 extracted (including two helpers), seven explicitly excluded/documented. All 59 renderable source families have live synthetic catalogue entries.
- 519 layout-bearing files / 6298 structural occurrences identified from 652 TSX files; 38 explicit layout sources mapped, 37 parallel-console boundaries documented. Fifteen portable layout families and five composition patterns supplied. Runtime samples are not acceptance of all 519 files.
- 242 unique token paths, 484 theme mappings; two implemented/tested modes, four brand SVG candidates, nine Latin font files and retained notices.
- 59 complete standalone public-import examples type-check. The independent consumer uses actual tarballs outside both repositories, without source aliases/backend.

## Verification

| Area | Result | Evidence |
| --- | --- | --- |
| locked clean dependency installation | PASS | audit/clean-results.json |
| unit, token, SSR and hydration checks | PASS | audit/unit-results.json |
| complete public-import examples | PASS | audit/snippet-results.json |
| browser functional, responsive and fidelity suite | PASS | audit/browser-results.json |
| source visual fidelity | PASS | audit/fidelity-results.json |
| packed independent consumer | PASS | audit/consumer-results.json |
| WCAG 2.2 AA automated gate | FAIL | audit/accessibility-gate.json |
| source evidence and workspace preservation | PASS | audit/source-unchanged.json |
| manual desktop visual review | SAMPLED | audit/manual-review.md |
| screen reader, physical device and exhaustive zoom/state acceptance | NOT_RUN | audit/manual-review.md |
| CI execution on hosted runner | NOT_RUN | Workflow prepared, not uploaded or executed; no remote configured. |

Six controlled source/package comparisons had zero changed pixels. Comparison fixtures preserve source markup/styles and font baseline, substituting only deterministic local font transport. Tolerances and sampled computed properties are explicit in coverage. Page reflow sampled nine widths; layout drawers/rails sampled five, with light/dark controls and 7 synthetic role labels. No real role/tenant authorization is implied by those labels.

## Commands

From this repository:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run generate
npm run build
npm run check
npm run build:catalogue
npx playwright install chromium
npm run test:browser
npm run audit:a11y
npm run pack
npm run test:consumer
npm run catalogue
```

The AA gate intentionally returns nonzero while source contrast failures remain. npm run verify:clean creates a fresh external locked verification environment. The catalogue runs at http://127.0.0.1:5187. npm run catalogue:dev is the optional development server; npm run catalogue previews the built site. Rebuild after edits. npm run examples:generate and npm run snippets:check maintain the complete examples. Generated dist/public/tarballs are reproducible; edit source tokens/components, not generated output.

## Minimal consumer

Install both tarballs in artifacts together with React/ReactDOM18.3.1; pin the lockfile.

```tsx
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
import {NvutoProvider, Input, Button} from 'nvuto-hr-ui';
export function Module(){
  return <NvutoProvider theme="light"><Input label="Workspace name"/>
    <Button variant="outline" onClick={()=>console.log('synthetic example')}>Continue</Button>
  </NvutoProvider>;
}
```

Full module/navigation examples are in examples/consumer; complete family modules are in examples/snippets. See docs/integration and docs/patterns/layouts.md before adopting navigation. Hosts supply authorized destinations, data, active states and callbacks; shared core contains no HR API/router/auth/session/store/business policy. Other stacks can read neutral outputs but require their own component adapters/acceptance.

## Differences and open decisions

Raw source remains in audit/as-is. Local extraction remediations include stable IDs, disabled-link activation, error association, switch naming, scoped portals/scrolling, keyboard scroll viewport, slider labels, touch targets, explicit form context and mobile drawer focus/reflow. See remediations and normalization-register for exact effects. Source values/radius/border conflicts remain preserved; no new brand palette or glass theme was invented. Domain-specific password policy, status inference, tenant/company fallbacks, query prefetch and auth/router wrappers are excluded.

White-on-orange small text remains 3.296:1 and the source teal-on-white focus pair is 1.951:1. Current automated findings and affected-node counts are recorded in the gate; do not substitute an earlier scan count. Source custom popup/overlay/AT combinations and full device/zoom acceptance require review. Recharts2 is preserved for source compatibility and carries an upstream maintenance deprecation warning. Do not treat candidate components as fully accessible or canonical.

Before broader adoption: resolve source contrast treatment and remaining acceptance, establish maintainers/approval authority, obtain source/brand licensing and namespace/registry decisions, review migration and pin coordinated packages. A later repository upload or publication needs separate authorization and final rights/release review. The current guards deliberately block publication.
