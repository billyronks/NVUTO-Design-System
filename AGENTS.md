# Instructions for agents and contributors

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
