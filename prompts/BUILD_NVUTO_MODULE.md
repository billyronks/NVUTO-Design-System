# Build a module using the verified HR extraction

Inputs: MODULE_NAME=[…], DESIGN_SYSTEM_LOCATION=[…], PINNED_VERSION=[…], TARGET_STACK=[…], REQUIREMENTS=[…], ALLOWED_EXTENSIONS=[…].

Read this version's README.md, AGENTS.md, docs/integration/new-module.md, registry/index.json, registry/components.json and applicable contracts. Verify installed versions/lockfile and supported modes first. If stack differs from React18.3.1 web, identify the required adapter rather than claiming compatibility.

Search existing tokens/components/patterns before implementing alternatives. Install both packed public artifacts with the documented command; import fonts → foundations → UI styles. Start from examples/consumer/src/App.tsx; wrap content in NvutoProvider with host-resolved theme. Use named public imports and semantic variables. Keep domain entities/API/auth/router/policies out of the core. Provide loading/error/empty/forbidden/offline and meaningful keyboard/label behavior.

Do not copy shared component implementations or invent glass/palettes/status meanings. Propose a namespaced extension with evidence through docs/governance/releases.md. Validate actual consumer type/build, both themes, breakpoints, long copy, forms, overlays, keyboard/accessibility and artifact independence. Report limits honestly. Explicitly reference these instructions from the consuming project; do not assume automatic loading of external AGENTS.md.
