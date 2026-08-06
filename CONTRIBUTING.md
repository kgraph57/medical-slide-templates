# Contributing

Contributions should make medical presentations safer, clearer, or easier to verify. A visually attractive example without a source contract is not ready to merge.

## Before changing a medical pattern

1. State the presentation use case, audience, language, and failure risk.
2. Add a synthetic fixture with no real-looking identity, institution, registry, ethics ID, citation, or patient data.
3. Record required source metadata: title/issuer, population, setting, region, version/date, access date, and claim linkage where relevant.
4. Add a failing unit, content, browser, accessibility, or PDF test.
5. Implement the smallest reusable contract and run the full gate.

Charts must calculate geometry and labels from one validated data object. Never hand-position a visual value independently of its displayed number. New interactive components must use native semantics, visible focus, 44px targets, keyboard operation, print-safe state, and meaning beyond color.

## Language contributions

Review Japanese and English as independent clinical prose. Do not accept literal translation when it changes certainty, causality, population, age, region, or source status. Add difficult long-string fixtures and check all supported viewport sizes.

## Required local gate

```bash
npm ci
npm run validate:skill
npm run validate:offline
npm test
git diff --check
```

Accessibility tests inject axe-core into the browser as a file string (`tests/browser/axe-inject.mjs`). Do not reintroduce a Node-side axe import such as `@axe-core/playwright`: under this repository's `node_modules` symlink layout (`node_modules` -> `node_modules.nosync`), the Playwright transform resolves the real path outside a `node_modules` component, treats the axe UMD build as ESM, and crashes the worker before any test runs.

Report what passed and what remains a human review item. Do not include PHI, credentials, confidential material, or copyrighted figures in fixtures, screenshots, issues, or pull requests.
