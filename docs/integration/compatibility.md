# Compatibility and troubleshooting

Target tested in this extraction: React/ReactDOM18.3.1, Vite6.3.5, TypeScript5.9.3, Chromium test runner on Windows. Exact dependencies are locked. Other React versions, Next.js/server components, Safari/WebKit, Firefox, React Native, Flutter and non-Latin/RTL flows are not certified. The neutral token/CSS/SVG outputs can be read by other stacks; those stacks need separate component adapters and acceptance.

SSR import/render tests cover representative controls, stable IDs and provider markup. Open overlays mount client-side after the root container exists. Bundle includes hooks and should be wrapped in a framework client boundary where required; no untested server-component claim. No source-product network requests are expected.

Unstyled controls: check all CSS imports/order, provider class and package versions. Wrong overlay theme: ensure provider surrounds trigger and no nested opposite scopes. Missing font: import fonts.css and allow packaged font URLs in CSP. Wrong popup focus: prefer Radix Dialog/NativeSelect while legacy custom APIs await full acceptance. Consumer install errors: install both local tarballs at once; do not point one package at an unpublished registry version. Do not fix package defects using source aliases/hoisting.
