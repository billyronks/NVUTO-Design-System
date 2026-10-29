# Typography and fonts

Source loads Poppins 300/400/500/600/700/800 and JetBrains Mono 400/500/600 from Google Fonts; its global font rules and tailwind.config.js intent coexist with actual typography classes. The extraction packages Latin WOFF2 files from the locked Fontsource dependencies and retains OFL notices. Import foundations/fonts.css explicitly; no runtime Google Fonts request is required.

Observed classes include display-xl 36/44px 700, display-lg 28/36px 700, h1 20/28px 600, h2 16/24px 600, h3 11/16px 700 uppercase, body-lg 15/22px and body 13/20px. See generated typography token groups for exact declarations/tracking and source selectors. Do not silently merge the distinct scale definitions.

Use semantic headings independent of visual class. Test long text and missing values; font fallback is sans-serif/monospace as appropriate. Other scripts, full Unicode subsets, RTL layout and language-specific typography are not accepted by this extraction. Font swap/first-render metrics may differ from source network loading.
