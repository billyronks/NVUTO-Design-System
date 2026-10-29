import fs from 'node:fs';import path from 'node:path';
const pages={
'README.md':`# NVUTO HR design-system extraction

Local, private reference repository extracted from **NVUTO HR web**, revision **0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09**. It establishes HR evidence and candidate portable APIs, not an approved standard for the entire Nvuto ecosystem.

**Readiness: implementation prepared; verification incomplete.** See [final verification](audit/final-verification.json) and [coverage](audit/coverage.json) for measured results. Source contrast/custom-popup defects and missing manual assistive-technology acceptance prevent a full accessibility/adoption claim. No deployment, upload or publication is authorized.

## Start here

Use Node 24.x, npm 11.9.0 and the committed lockfile. From this directory:

\x60\x60\x60sh
npm ci --ignore-scripts --no-audit --no-fund
npm run generate
npm run build
npm run check
npm run build:catalogue
npx playwright install chromium
npm run test:browser
npm run pack
npm run test:consumer
npm run catalogue
\x60\x60\x60

Catalogue: http://127.0.0.1:5187. All examples are synthetic and use actual package exports. The packed-artifact consumer is installed outside both repositories; its retained directory is recorded in audit/consumer-results.json. No registry publication is implied by local installation.

## Minimal module

Install both local tarballs from artifacts, pinned to the same extraction version. Complete instructions: [new module](docs/integration/new-module.md).

\x60\x60\x60tsx
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
import {NvutoProvider, Button, Input} from 'nvuto-hr-ui';

export function Module() {
  return <NvutoProvider theme="light"><Input label="Workspace name" />
    <Button variant="outline" onClick={() => console.log('example')}>Continue</Button>
  </NvutoProvider>;
}
\x60\x60\x60

Core package identities are **proposed local names**: nvuto-hr-foundations and nvuto-hr-ui, version 0.1.0-extraction.1. React 18.3.1 is the tested target; Tailwind is compiled into the CSS and is not required in consumers. The optional self-hosted fonts contain Latin subsets only. Brand redistribution, source-code licensing, maintainers and registry ownership require approval; packages remain private/UNLICENSED with publication blocked.

## Repository map

- [Audit/plan](audit/INITIAL_AUDIT_AND_PLAN.md), inventories and preserved source UI/styles in audit/as-is; never use that archive as the consumer API.
- [Token source/profile](tokens/profile.json), generated neutral exports in packages/foundations/dist; edit token documents, then generate.
- [React source](packages/react/src/index.ts), scoped compiled CSS and declarations in packages/react/dist.
- [Foundations](docs/foundations/overview.md), [component contracts](registry/components.json), [patterns](docs/patterns/compositions.md).
- [Integration](docs/integration/new-module.md), [migration](docs/migration/source-to-shared.md), [governance](docs/governance/releases.md).
- [AI agent rules](AGENTS.md), [module prompt](prompts/BUILD_NVUTO_MODULE.md), [contribution prompt](prompts/CONTRIBUTE_TO_DESIGN_SYSTEM.md).
- catalogue, examples/consumer, tests, scripts, .github/workflows and [progress](PROGRESS.md).

Observed: two HR themes, shared React library, Solar icons, Poppins/JetBrains Mono. No pinned Nvuto design-system dependency was found in the inspected product manifests/lock. Nvuto Desk package and glass parity remain **UNVERIFIED**, not absent everywhere. Flutter/mobile and the parallel superadmin app need separate adapters/acceptance.
`,
'AGENTS.md':`# Instructions for agents and contributors

Read README.md, audit/final-verification.json, docs/integration/new-module.md, registry/index.json and the applicable docs/components contract before changing UI. Read the installed/pinned version's documentation, not an unrelated branch. Instructions here are not automatically loaded by consumers: explicitly reference this file in the consuming project's instructions.

1. Search registry/tokens before adding alternatives. Public imports only: nvuto-hr-ui and documented foundations exports; no deep paths, HR imports or source aliases.
2. Use semantic tokens where provided. Preserve exact source conflicts until reviewed; do not invent colors, spacing, glass, statuses or framework compatibility.
3. Keep auth, API clients, router, tenant identity, payroll/policy and domain workflows in the host. Core only accepts explicit props/callbacks/slots.
4. NvutoProvider owns local light/dark scope, not document classes or persistence. Follow docs/foundations/themes.md for server rendering/portals.
5. Examples and tests use synthetic records. Never copy customer data, credentials or production dumps into this repository.
6. Preserve audit/as-is; changes require source evidence and separate remediation records. Do not run prepare-extraction.mjs over reviewed changes: it is a one-time bootstrap, not routine generation.
7. Update tokens/docs/registry/changelog/tests together. Run npm run build, npm run check, npm run build:catalogue, npm run test:browser, npm run pack and npm run test:consumer. A green build is not accessibility acceptance.
8. Report actual failed/blocked/not-run checks. Never call a component validated based only on source selectors. Follow the exception path in docs/governance/releases.md.
9. Keep source product tracked files unchanged. Do not push, publish, deploy, choose a license or assign canonical ownership without explicit approval.

Editable: token documents, package source, docs/guides, registry metadata, tests and maintained scripts. Generated: package dist, artefacts, coverage receipts and generated inventories/contracts (generator commands documented). Do not erase retained evidence to make checks green.
`,
'CONTRIBUTING.md':`# Contribution and review

This is a candidate extraction. No maintainers or organization-wide approvers have been assigned. Propose review to the repository owner; do not invent approval.

For each change: record source revision/path/symbol/usage and OBSERVED/INFERRED/PROPOSED/UNVERIFIED evidence, then separately record adoption/maturity. Explain why reuse belongs in the core. Preserve raw source evidence, and list visual/behavioral/API differences in audit/remediations.json. Include tokens, modes, long content, keyboard/focus, error/empty/loading states, responsive and reduced-motion checks.

Run the README command sequence. Add a regression test before repairing confirmed defects when practical. Review generated diffs; no silent token renaming or broad normalization. Update CHANGELOG.md and migration notes for visible/interaction changes. Before approval, inspect packed exports, declarations, fonts/assets/notices and the external consumer. Document unsupported combinations and manual acceptance gaps.

Product-only domain behavior stays in modules. A missing shared capability uses the exception process in docs/governance/releases.md; routine copying into product folders is not an upgrade strategy.
`,
'CHANGELOG.md':`# Changelog

## 0.1.0-extraction.1 — 2026-10-29 (local, unpublished)

- Extracted the observed NVUTO HR shared React presentation library and raw source evidence at 0d10fa1e.
- Added typed neutral tokens, light/dark CSS, local OFL fonts, brand asset candidates, public declarations and scoped provider/portal adapter.
- Removed business Select data loading and inferred domain status mapping. Added presentational slot compositions.
- Added disabled-link, switch-label, input-error and stable-ID extraction remediations with baseline evidence.
- Added interactive catalogue, source comparison fixture, packed-artifact consumer, registries, migration/agent guidance and verification tooling.
- Source contrast, legacy custom-overlay acceptance, unsupported glass/other stacks and ownership/licensing remain review items. Consult current verification receipts rather than treating this changelog as a pass report.
`,
'docs/foundations/overview.md':`# Foundation evidence

The authoritative reusable token inputs are tokens/core.tokens.json and the separate light/dark documents. Raw CSS declarations, raw literal values and exact utility occurrences are retained in audit. They answer different questions: observations retain conflicts; reusable tokens provide relationships; normalization-register.json contains proposals that have not been adopted.

Evidence labels never imply approval. All extracted design decisions are candidates until an owner establishes authority. Typography and source colors are preserved; global host resets and business logic are not portable defaults. Namespaced variables use --nvuto-<dot-path-with-hyphens>. Legacy source CSS variable aliases exist only inside .nvuto-root to support unchanged source utilities.

The [DTCG Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) is a Final Community Group Report, not a W3C Recommendation. This generator implements a documented typed subset and whole-token aliases. See tokens/profile.json for deviations; no claim of complete DTCG tool conformance. Unsupported group inheritance/JSON-pointer references are rejected. CSS string tokens preserve expressions where a structured type has not been implemented.
`,
'docs/foundations/color.md':`# Color and contrast

Observed light page #F8FAFC, foreground #1e293b, surfaces white/#F1F5F9, brand action #FF4F00; dark page #0B0F19, foreground #F8FAFC, surfaces #111625/#171E2E, border #232D42. Theme border and source component border literals differ; both remain evidence. Semantic aliases express existing CSS names, not inferred payroll or employment meanings.

White-on-orange small action text is a source contrast defect. Exact measured ratios are in audit/contrast-results.json. Do not present automated scans as WCAG conformance. Existing active #CC3F00 is a possible remediation, pending owner visual approval. No new palette is silently substituted. Focus #00D1B2/orange and low-contrast borders require composed-surface review, including disabled and read-only states.

StatusBadge is presentational: pass variant and readable text. Never infer an approved business state from a badge color. Chart series require a text/table equivalent; colors alone do not communicate values.
`,
'docs/foundations/typography.md':`# Typography and fonts

Source loads Poppins 300/400/500/600/700/800 and JetBrains Mono 400/500/600 from Google Fonts; its global font rules and tailwind.config.js intent coexist with actual typography classes. The extraction packages Latin WOFF2 files from the locked Fontsource dependencies and retains OFL notices. Import foundations/fonts.css explicitly; no runtime Google Fonts request is required.

Observed classes include display-xl 36/44px 700, display-lg 28/36px 700, h1 20/28px 600, h2 16/24px 600, h3 11/16px 700 uppercase, body-lg 15/22px and body 13/20px. See generated typography token groups for exact declarations/tracking and source selectors. Do not silently merge the distinct scale definitions.

Use semantic headings independent of visual class. Test long text and missing values; font fallback is sans-serif/monospace as appropriate. Other scripts, full Unicode subsets, RTL layout and language-specific typography are not accepted by this extraction. Font swap/first-render metrics may differ from source network loading.
`,
'docs/foundations/spacing-shape-depth.md':`# Spacing, sizes, shape and depth

Raw literal values, utility occurrences and CSS declarations preserve exact units/locations. Quarter-rem spacing relationships are INFERRED Tailwind framework interpretation, not organization approval. Shared buttons use 44px medium, 36px compact and 48px large; touch/responsive overrides may change effective height. Test the rendered result.

Theme radius .625rem coexists with rounded-lg/xl and 18px FAB. Card/panel borders and shadows are source utilities; depth and color differences are intentionally retained. Overlays use source dim/backdrop blur treatments, not a separate glass theme. Opacity, focus ring and stacking behavior are recorded in the component source and raw utility index. Do not normalize similar values without a reviewed visual change.
`,
'docs/foundations/layout.md':`# Layout, responsive behavior and density

Source responsive.css contains the actual page gutter, action wrapping, table scroll and dialog viewport rules. Source use-mobile uses a 768px boundary; Tailwind utility breakpoints and arbitrary media expressions are indexed in audit/breakpoints-inventory.json. Lexical counts are not runtime branch acceptance.

Catalogue acceptance samples 320,375,640,767,768,900,1024,1280,1440 CSS px, including both sides of the mobile boundary. Tables/boards/step rails retain bounded keyboard-reachable horizontal scrolling. Long text must wrap without forcing the page width. Check 400% browser zoom/reflow and real touch devices separately; viewport emulation is not physical-device acceptance.

ContentPanel supports compact/default/spacious gap/padding density. There is no verified global density mode; do not promise one from a per-component prop. Proposed AppShell slots preserve HR hierarchy but are not a drop-in router shell. Global source hidden-scrollbar rules are removed in portable CSS; document host-level exceptions explicitly.
`,
'docs/foundations/motion.md':`# Motion and reduced motion

Source Modal uses 200ms backdrop and 180ms content scale/opacity with easeOut. Utility transitions contain 150/200/300ms and other values retained in the raw utility inventory. Framework-derived duration tokens are labeled INFERRED where no exact component binding is established. Never infer a new motion language from a loading spinner.

Extraction override reduces animation/transition duration under prefers-reduced-motion. Controlled fidelity fixtures disable transitions/animations on both renderers. Native popup animation, third-party chart interaction and real device motion preferences require host acceptance. Loading must also have semantic status/busy text; motion alone is insufficient.
`,
'docs/foundations/assets.md':`# Assets, icons and rights

Four brand SVG candidates are privately packaged: NVUTO-Logo.svg, NVUTO-Wordmark.svg, NVUTO-HR.svg, NVUTO-HR-White.svg. Import via nvuto-hr-foundations/assets/<file>. Ownership/brand redistribution permission has not been established; private local packaging is not public redistribution approval. Respect logo variants and intrinsic proportions; do not recolor SVG paths without approval.

Solar icons are the source family; components use source sizes and styles. Accessible labels belong to the control; decorative icons should not create duplicate names. Third-party service marks in BrandIcons and integration images remain excluded with permission gaps. Unsplash content is not copied. See audit/assets.json for all 19 discovered assets and dispositions, and package notices for fonts/dependencies. Root UNLICENSED reserves the unresolved source decision; it does not remove third-party licenses.
`,
'docs/foundations/themes.md':`# Theme contract

Observed and implemented: light and dark. Not established from HR evidence: light-glass, dark-glass or the Desk pinned-package parity contract. A translucent toast/backdrop is not proof of a glass theme. No empty glass mode is advertised.

NvutoProvider theme is explicit, scoped and controlled. Default is light. It never reads localStorage, consults matchMedia, mutates html/body or chooses a tenant preference. The host resolves precedence (for example saved user choice then system preference) and persistence, and supplies the same resolved theme on server and first client render. No hydration flash guarantee is made for a host that changes theme after hydration.

Every provider renders .nvuto-root and data-nvuto-theme; dark also has a local .dark class for preserved source utilities. Do not nest opposite providers: ancestor .dark utility matching can affect descendants. Use sibling scopes for previews. Radix/custom portals are routed into that root; overlays require the provider and mount after its container exists. SSR does not render open overlay content; test hydration/focus when opening on first client render.

Import fonts → foundations styles → UI styles, then reviewed host extensions. CSS resets/aliases are scoped; Tailwind's --tw-* @property registrations and animation names remain bounded global identifiers. Host styles with matching specificity can still affect the scope. Verify integration with the actual host stylesheet ordering/CSP.
`,
'docs/integration/new-module.md':`# Build a new module

Prerequisites: Node24/npm11.9, React/ReactDOM18.3.1, a Vite6-compatible TypeScript consumer. Pin both packages to 0.1.0-extraction.1. No public registry location is configured.

Run npm run build then npm run pack in this repository. In the consuming project install BOTH produced tarballs together:

\x60\x60\x60sh
npm install /absolute/path/artifacts/nvuto-hr-foundations-0.1.0-extraction.1.tgz /absolute/path/artifacts/nvuto-hr-ui-0.1.0-extraction.1.tgz react@18.3.1 react-dom@18.3.1
\x60\x60\x60

Keep the lockfile. Public entry points: nvuto-hr-foundations (tokens/supportedThemes), /tokens.json, /styles.css, /fonts.css, /assets/*; nvuto-hr-ui (components/types), /styles.css. No deep source imports. CSS order is fonts, foundations, UI, host extensions. UI utilities are compiled; consumers need no Tailwind config or product backend. A host-auth/router/query provider is neither required nor imported by the core.

Use NvutoProvider with explicit light/dark theme around content and overlays. Copy the runnable module composition from examples/consumer/src/App.tsx, which demonstrates shell slots, table, form state, switch, dialog and success feedback using public exports. Do not copy the shared components themselves. The independent installer places that example in a fresh temporary directory outside both workspaces; audit/consumer-results.json records resolution paths and commands.

Host adapters own data fetching, validation rules, currency/date/timezone formatting, permissions, notifications and navigation. Empty data and unavailable data must remain different states. Pass options/variants explicitly. See theme and component contracts before using legacy custom popup APIs. Add instructions in the consuming project pointing agents to this version's AGENTS.md and registry; tools do not automatically read another repository's instructions.
`,
'docs/integration/compatibility.md':`# Compatibility and troubleshooting

Target tested in this extraction: React/ReactDOM18.3.1, Vite6.3.5, TypeScript5.9.3, Chromium test runner on Windows. Exact dependencies are locked. Other React versions, Next.js/server components, Safari/WebKit, Firefox, React Native, Flutter and non-Latin/RTL flows are not certified. The neutral token/CSS/SVG outputs can be read by other stacks; those stacks need separate component adapters and acceptance.

SSR import/render tests cover representative controls, stable IDs and provider markup. Open overlays mount client-side after the root container exists. Bundle includes hooks and should be wrapped in a framework client boundary where required; no untested server-component claim. No source-product network requests are expected.

Unstyled controls: check all CSS imports/order, provider class and package versions. Wrong overlay theme: ensure provider surrounds trigger and no nested opposite scopes. Missing font: import fonts.css and allow packaged font URLs in CSP. Wrong popup focus: prefer Radix Dialog/NativeSelect while legacy custom APIs await full acceptance. Consumer install errors: install both local tarballs at once; do not point one package at an unpublished registry version. Do not fix package defects using source aliases/hoisting.
`,
'docs/migration/source-to-shared.md':`# Incremental migration and rollback

Source baseline is unchanged. Old src/app/components/ui/<family> imports map to named public nvuto-hr-ui exports; preserved names and interfaces appear in registry/components.json and docs/components. Theme --primary maps to --nvuto-semantic-primary, --background to --nvuto-semantic-background, and each existing theme name maps to the corresponding semantic path. Exact mappings/provenance are in token documents and registry/tokens.json.

Start with a bounded feature branch/route and explicit provider scope. Remove source global theme/font/reset side effects only after visual comparison. Import fonts/foundations/UI styles in that order. Replace Select's organization-inference adapter with host-supplied options; replace automatic business status colors with explicit StatusBadge variant. Router/store/auth/workflow remain in the host. Do not run the bootstrap extraction script over reviewed changes.

Behavior differences: local fonts replace Google network loading; IDs are stable; portals stay in scoped roots; disabled slotted links cannot activate; switch labels/input errors are associated; source global hidden scrollbars/date listeners are removed; reduced motion is respected; buttons default to type=button. Forms must use explicit type=submit. See audit/remediations.json for detailed effects. No silent source contrast fix is claimed.

Sequence: foundations in an isolated scope → low-risk primitives → forms → Radix overlays → table/page compositions → connected host workflows and all roles. Compare both themes/long text/keyboard before broad rollout. Preserve old imports/styles on the migration branch until acceptance; rollback restores the previous pinned package/import/CSS bundle together. Never mix incompatible theme/UI versions or migrate financial rules into core.
`,
'docs/governance/releases.md':`# Governance and releases

No existing canonical Nvuto package/owner was verified. Package names are local extraction proposals; root/source licensing, maintainers, approval authority, registry/namespace and brand asset redistribution are pending owner decisions. Keep private:true, UNLICENSED and publication guard. Do not create a remote, upload or publish as part of this task.

Coordinated version pair: foundations/UI0.1.0-extraction.1 with UI's exact foundations dependency and React18.3.1 peers. Consumers pin and commit lockfiles. Token names/values, visual changes, keyboard/focus changes and API changes all affect compatibility; visible or interaction changes can be breaking even if TypeScript compiles. Propose semver after ownership is resolved; document prerelease candidate changes now. Deprecations need replacement, migration notice and an owner-approved removal window—none is invented here.

Release review: source evidence/provenance; reuse rationale; full mode/state/responsive and accessibility results; packed exports/assets/notices; independent consumer; docs links/snippets; changes/migration; unresolved rights/compatibility. Retain receipts. Any failed/blocked/not-run required check means partial handover, not validated adoption.

Exception path: module records missing capability, source examples, scope, accessibility risks and proposed namespaced local extension. Owner/review authority must approve duration and upstream proposal before standardization. Pending review, label the extension local/candidate and do not fork common primitives routinely. Compare future source-product changes against both raw archive and reviewed shared decisions; never overwrite reviewed fixes automatically.
`,
'docs/patterns/role-state-boundaries.md':`# Roles, permissions, locale and states

Source routes and lexical role/permission occurrences are indexed separately from runtime authorization. HR/finance/manager/employee/executive/platform variations are product contracts, not design-system permission checks. AppShell navigation is passed by the host. Forbidden/disabled/loading/empty/offline/degraded are explicit presentation states, not inferred authorization or successful empty responses.

The state inventory records exact source occurrences and locations; counts are not unique visible states and do not prove every route/role combination works. Locale inventory preserves Intl/currency/timeZone usage without moving financial/date rules into core. Source uses a mixture of locale-aware formatting and literal display strings; no universal locale/RTL support is invented.
`,
'prompts/BUILD_NVUTO_MODULE.md':`# Build a module using the verified HR extraction

Inputs: MODULE_NAME=[…], DESIGN_SYSTEM_LOCATION=[…], PINNED_VERSION=[…], TARGET_STACK=[…], REQUIREMENTS=[…], ALLOWED_EXTENSIONS=[…].

Read this version's README.md, AGENTS.md, docs/integration/new-module.md, registry/index.json, registry/components.json and applicable contracts. Verify installed versions/lockfile and supported modes first. If stack differs from React18.3.1 web, identify the required adapter rather than claiming compatibility.

Search existing tokens/components/patterns before implementing alternatives. Install both packed public artifacts with the documented command; import fonts → foundations → UI styles. Start from examples/consumer/src/App.tsx; wrap content in NvutoProvider with host-resolved theme. Use named public imports and semantic variables. Keep domain entities/API/auth/router/policies out of the core. Provide loading/error/empty/forbidden/offline and meaningful keyboard/label behavior.

Do not copy shared component implementations or invent glass/palettes/status meanings. Propose a namespaced extension with evidence through docs/governance/releases.md. Validate actual consumer type/build, both themes, breakpoints, long copy, forms, overlays, keyboard/accessibility and artifact independence. Report limits honestly. Explicitly reference these instructions from the consuming project; do not assume automatic loading of external AGENTS.md.
`,
'prompts/CONTRIBUTE_TO_DESIGN_SYSTEM.md':`# Contribute a shared change

Inputs: CHANGE=[…], SOURCE_REVISION=[…], EVIDENCE_PATHS_AND_USAGES=[…], CONSUMERS=[…], COMPATIBILITY_IMPACT=[…].

Read README/AGENTS/governance and registry. Search for existing capability; justify broad reuse. Preserve as-is evidence and label evidence/adoption separately. For tokens use the declared typed profile, provenance and deterministic generator. For UI use explicit inputs/callbacks/slots; no source APIs/auth/router/policies. Document anatomy/props/defaults/variants/states, themes, responsive/long-content behavior and keyboard/focus contract. Record remediation effects and migration/rollback.

Add meaningful regression and controlled fidelity checks, update catalogue/public-import example/docs/registry/changelog, then run the README verification sequence including packed external consumer. Report failed/blocked/not-run acceptance and unresolved owner decisions. Do not publish or assign canonical ownership without approval.
`,
'packages/foundations/README.md':`# nvuto-hr-foundations

Private candidate extraction, 0.1.0-extraction.1. Neutral typed token maps, scoped light/dark variables, optional locally packaged Latin fonts and four brand SVG candidates. Import /fonts.css, then /styles.css. Token inputs and exact provenance live in repository tokens/. Fonts carry OFL notices; brand/source redistribution approval remains open. No framework component compatibility is implied. Do not publish.
`,
'packages/react/README.md':`# nvuto-hr-ui

Private React18.3.1 candidate extraction from NVUTO HR0d10fa1e. Public named exports plus /styles.css. Install the exact matching foundations package; import foundations fonts/styles before UI styles. NvutoProvider is required for scoped themes/portals. APIs accept presentation props/callbacks; no HR backend/router/auth provider is needed. Source contrast and legacy custom-popup acceptance remain open; see repository audit and contracts before adoption. No publication approval.
`
};
for(const [p,text]of Object.entries(pages)){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text.replaceAll('\x60','`'));}
console.log(`Wrote ${Object.keys(pages).length} substantive guides.`);
