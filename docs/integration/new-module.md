# Build a new module

Prerequisites: Node24/npm11.9, React/ReactDOM18.3.1, a Vite6-compatible TypeScript consumer. Pin both packages to 0.1.0-extraction.1. No public registry location is configured.

Run npm run build then npm run pack in this repository. In the consuming project install BOTH produced tarballs together:

```sh
npm install /absolute/path/artifacts/nvuto-hr-foundations-0.1.0-extraction.1.tgz /absolute/path/artifacts/nvuto-hr-ui-0.1.0-extraction.1.tgz react@18.3.1 react-dom@18.3.1
```

Keep the lockfile. Public entry points: nvuto-hr-foundations (tokens/supportedThemes), /tokens.json, /styles.css, /fonts.css, /assets/*; nvuto-hr-ui (components/types), /styles.css. No deep source imports. CSS order is fonts, foundations, UI, host extensions. UI utilities are compiled; consumers need no Tailwind config or product backend. A host-auth/router/query provider is neither required nor imported by the core.

Use NvutoProvider with explicit light/dark theme around content and overlays. Copy the runnable module composition from examples/consumer/src/App.tsx, which demonstrates shell slots, table, form state, switch, dialog and success feedback using public exports. Do not copy the shared components themselves. The independent installer places that example in a fresh temporary directory outside both workspaces; audit/consumer-results.json records resolution paths and commands.

Host adapters own data fetching, validation rules, currency/date/timezone formatting, permissions, notifications and navigation. Empty data and unavailable data must remain different states. Pass options/variants explicitly. See theme and component contracts before using legacy custom popup APIs. Add instructions in the consuming project pointing agents to this version's AGENTS.md and registry; tools do not automatically read another repository's instructions.
