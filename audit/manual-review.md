# Manual review and limits

2026-10-29, Windows, Codex in-app Chromium browser, local synthetic catalogue only. Reviewed the catalogue's rendered controls and the Layouts workspace composition through browser accessibility state and screenshots. Confirmed the component examples and the dual-rail/header/module composition are actual exported UI. The first manual inspection exposed the missing React Hook Form provider in the catalogue; that integration was repaired and independently regression-tested.

Automated keyboard acceptance separately checks dialog entry/dismissal/focus return, mobile drawer return, disclosure visibility, disabled activation and controlled form state. Responsive screenshot and computed-width checks cover the documented sample widths. Source/package pixel comparisons use identical fixtures, fonts, viewport and disabled animation, with explicit computed-property comparison and pixel tolerance.

This is not manual screen-reader conformance acceptance. NVDA/VoiceOver/TalkBack, physical Android/iOS/touch devices, Safari/Firefox, 400% browser zoom, exhaustive nested overlays and every source role/route/variant/state combination were not tested. Legacy custom Select/combobox/Modal/custom-menu paths remain candidates needing complete manual review. Do not infer acceptance from a green build or a passing test that merely records axe findings. The separate AA gate fails while actual findings remain.

Additional local keyboard sample: activated the exported Dialog trigger with Enter, traversed from its labeled field with Tab and dismissed using Escape. Automated checks provide the awaited focus-return assertions. Latest layout preview was inspected in the local in-app browser after rebuilding.

Additional local keyboard sample: activated the exported Dialog trigger with Enter, traversed from its labeled field with Tab and dismissed using Escape. Automated checks provide the awaited focus-return assertions. Latest layout preview was inspected in the local in-app browser after rebuilding.
