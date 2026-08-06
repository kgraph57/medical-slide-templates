# Third-party notices

## Runtime

The shipped presentation runtime uses browser-native HTML, CSS, JavaScript, and SVG. It bundles no third-party runtime library, web font, or raster asset.

## ReUI

The public [ReUI Radio Group](https://reui.io/components/radio-group) informed high-level interaction ideas: large selectable surfaces, descriptions, and explicit state. No ReUI source code, markup, CSS, or assets are copied into this repository. The implementation in `theme/components.css` is original.

## Development dependencies

Playwright and axe-core are development-only test dependencies. Their versions and transitive licenses are recorded by `package-lock.json`; they are not copied into generated decks or installed Skill runtime files. Tests load axe-core as an inert string and evaluate it only inside the browser page (`tests/browser/axe-inject.mjs`); axe code never runs in the Node test process.

## Standards and named methods

The catalog ships original, generic components named `randomized-study-flow`, `systematic-review-flow`, `bias-domain-review`, `certainty-assessment`, and `critical-appraisal-questions`. They are not reproductions of CONSORT, PRISMA, RoB 2, GRADE, CASP, or another official form, checklist, signaling-question set, or decision rule.

Names such as PICO and Kaplan–Meier identify broadly used methods. This project does not claim endorsement by any standards body. If a user requests an official checklist or diagram, verify its current version, source, permission, attribution, and license before use; do not silently substitute the generic catalog component.

The repository's MIT license applies only to original project code and original catalog content. It does not relicense third-party standards, papers, instruments, figures, or user-supplied source material.
