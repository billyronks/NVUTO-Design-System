# NVUTO HR design-system extraction

Local, private reference repository extracted from **NVUTO HR web**, revision **0d10fa1e5ebeab3c41882c5c7688dcfd38af3f09**. It establishes HR evidence and candidate portable APIs, not an approved standard for the entire Nvuto ecosystem.

**Readiness: implementation prepared; verification incomplete.** See [final verification](audit/final-verification.json) and [coverage](audit/coverage.json) for measured results. Source contrast/custom-popup defects and missing manual assistive-technology acceptance prevent a full accessibility/adoption claim. A [one-time private repository upload](audit/REPOSITORY_UPLOAD.md) was authorized to [billyronks/NVUTO-Design-System](https://github.com/billyronks/NVUTO-Design-System). Package publication and deployment remain disabled.

## Start here

Use Node 24.x, npm 11.9.0 and the committed lockfile. From this directory:

```sh
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
```

Catalogue: http://127.0.0.1:5187. All examples are synthetic and use actual package exports. The packed-artifact consumer is installed outside both repositories; its retained directory is recorded in audit/consumer-results.json. No registry publication is implied by local installation.

## Minimal module

Install both local tarballs from artifacts, pinned to the same extraction version. Complete instructions: [new module](docs/integration/new-module.md).

```tsx
import 'nvuto-hr-foundations/fonts.css';
import 'nvuto-hr-foundations/styles.css';
import 'nvuto-hr-ui/styles.css';
import {NvutoProvider, Button, Input} from 'nvuto-hr-ui';

export function Module() {
  return <NvutoProvider theme="light"><Input label="Workspace name" />
    <Button variant="outline" onClick={() => console.log('example')}>Continue</Button>
  </NvutoProvider>;
}
```

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

Full layouts: see [layout contracts](docs/patterns/layouts.md), registry/layouts.json and the catalogue Layouts view. Source discovery includes every layout-bearing TSX file found by the structural scan; role routes remain host-specific. Run npm run verify:clean for a fresh locked build/check/catalogue, and npm run audit:a11y for the separate failing/passing accessibility gate.

See the [complete handover](audit/HANDOVER.md) for exact counts, commands, minimal consumer, results and remaining decisions. The local catalogue is http://127.0.0.1:5187.
