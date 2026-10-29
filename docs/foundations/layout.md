# Layout, responsive behavior and density

Source responsive.css contains the actual page gutter, action wrapping, table scroll and dialog viewport rules. Source use-mobile uses a 768px boundary; Tailwind utility breakpoints and arbitrary media expressions are indexed in audit/breakpoints-inventory.json. Lexical counts are not runtime branch acceptance.

Catalogue acceptance samples 320,375,640,767,768,900,1024,1280,1440 CSS px, including both sides of the mobile boundary. Tables/boards/step rails retain bounded keyboard-reachable horizontal scrolling. Long text must wrap without forcing the page width. Check 400% browser zoom/reflow and real touch devices separately; viewport emulation is not physical-device acceptance.

ContentPanel supports compact/default/spacious gap/padding density. There is no verified global density mode; do not promise one from a per-component prop. Proposed AppShell slots preserve HR hierarchy but are not a drop-in router shell. Global source hidden-scrollbar rules are removed in portable CSS; document host-level exceptions explicitly.
