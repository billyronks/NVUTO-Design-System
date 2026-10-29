# Theme contract

Observed and implemented: light and dark. Not established from HR evidence: light-glass, dark-glass or the Desk pinned-package parity contract. A translucent toast/backdrop is not proof of a glass theme. No empty glass mode is advertised.

NvutoProvider theme is explicit, scoped and controlled. Default is light. It never reads localStorage, consults matchMedia, mutates html/body or chooses a tenant preference. The host resolves precedence (for example saved user choice then system preference) and persistence, and supplies the same resolved theme on server and first client render. No hydration flash guarantee is made for a host that changes theme after hydration.

Every provider renders .nvuto-root and data-nvuto-theme; dark also has a local .dark class for preserved source utilities. Do not nest opposite providers: ancestor .dark utility matching can affect descendants. Use sibling scopes for previews. Radix/custom portals are routed into that root; overlays require the provider and mount after its container exists. SSR does not render open overlay content; test hydration/focus when opening on first client render.

Import fonts → foundations styles → UI styles, then reviewed host extensions. CSS resets/aliases are scoped; Tailwind's --tw-* @property registrations and animation names remain bounded global identifiers. Host styles with matching specificity can still affect the scope. Verify integration with the actual host stylesheet ordering/CSP.
