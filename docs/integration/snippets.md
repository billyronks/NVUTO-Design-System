# Complete runnable examples

The catalogue's “Runnable example” disclosures and `examples/snippets/*.tsx` contain 59 complete synthetic component modules, generated from the JSX that is actually rendered. They include stylesheet order, local fonts, state, options and a theme provider. Import `Example` into a React 18.3.1/Vite consumer and render it. Use `theme="dark"` to exercise the second implemented mode.

For embedding beneath an existing NvutoProvider, remove the example's extra provider/imported global asset baseline as appropriate; do not nest opposite theme scopes. Examples do not fetch, authenticate, authorize, route to customer workspaces or persist business records.

The form example additionally imports `react-hook-form@7.81.0`; the chart example imports `recharts@2.15.2`. Declare those as direct consumer dependencies when using those examples, alongside the pinned UI/foundations/React packages. Other generated examples require only the core public packages and React.

`npm run examples:generate` refreshes modules and catalogue strings after reviewing changes in `catalogue/App.tsx`; `npm run snippets:check` checks all modules against the built public declarations. This proves type-valid examples, not exhaustive interaction or accessibility acceptance. Source defects/maturity remain in component contracts and the accessibility gate. Source-to-package fidelity fixtures are independent of these generated demonstrations.
