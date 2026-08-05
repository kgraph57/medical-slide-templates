# Medical Slide design guidelines

This document summarizes the implemented 2026 visual contract. Enforceable details live in `theme/`, `reference/`, and the browser tests.

## Visual direction

Use a white field, near-black type, neutral rules, and one restrained Clinical Blue accent. Hierarchy comes from type, whitespace, alignment, and thin boundaries. Avoid gradients, ornamental backgrounds, 3D charts, decorative icons, and color that carries meaning alone.

## Projector typography

- Narrative stage text: 24px or larger.
- Dense table cells, chart ticks, flow labels, citations, and compact metadata: never below 18px.
- Slide headings: 40px or larger; title slides may be larger.
- Use the offline system-font stack in `theme/journal.css`; do not load Google Fonts or other web fonts.
- Split content when it does not fit. Do not solve overflow by shrinking type.

Japanese uses `text-wrap: pretty` and `word-break: auto-phrase`. English protects scientific notation, gene names, units, and confidence intervals. See `reference/bilingual-style.md`.

## Contrast and redundant meaning

Normal text meets WCAG AA. Important rules, axes, connectors, controls, and focus indicators meet at least 3:1 against their background. Selected, correct, incorrect, supported, unresolved, and concern states combine explicit words with borders, shapes, symbols, or line styles.

## Data and diagrams

- Draw statistical geometry and displayed values from one validated data object.
- Ratio forest plots use a logarithmic scale and the correct null value.
- Kaplan–Meier plots include Number at Risk, censor marks, direct labels, and non-color line styles.
- Charts include `<title>`, `<desc>`, and an equivalent HTML data table.
- SVG patterns use a 1440×810 viewBox, responsive root sizing, unique IDs, semantic color variables, and a 16:9 safe area.
- Directional relationships use drawn connectors and arrowheads, not arrow characters.

The catalog's study-flow, appraisal, bias-factor, and certainty components are original generic patterns. They are not official forms or copied signaling-question taxonomies. Official standards require current source, version, permission, attribution, and license review.

## Interaction and navigation

Use native controls. Targets are at least 44×44px, focus is visible, radio groups support arrow keys, and interacting with a control does not advance the deck. Current slide semantics, Home/End, stable hashes, live status, and reduced-motion behavior come from `engine/slide.js` and `engine/slide.css`.

## Output

Use the bundled localhost server; no internet or external requests are required. Browser HTML is the accessible artifact. PDF is a visually matched handout with one page per slide and is not claimed to be tagged PDF. Validate 1280×720, 1366×768, 1920×1080, and 1024×768 letterbox layouts.
