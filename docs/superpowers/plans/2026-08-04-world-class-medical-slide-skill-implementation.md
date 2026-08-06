# World-Class Medical Slide Skill Implementation Plan

> **For Claude/Codex:** Execute this plan task-by-task. Use TDD for executable behavior, run the named verification after every task, and stop at each human checkpoint. In this AMPL repository, do not commit or push; report `git diff --stat`, `git status -s`, and verification results instead.

**Goal:** Turn `medical-slide-templates` into a bilingual, offline-first Claude Skill that generates safe, projector-readable 16:9 medical HTML decks from natural-language requests and source material.

**Architecture:** Keep the runtime as static HTML/CSS/vanilla JavaScript. Add a small Node test and validation layer, deterministic medical-math and SVG renderers, reusable choice/diagram components, and a directory-installable Skill package. The catalog remains the component showcase and regression fixture; generated decks use the same engine and tokens but contain only the selected slides.

**Tech Stack:** HTML5, CSS, vanilla ES modules, inline SVG, Node.js 22, `node:test`, Playwright, axe-core, npm scripts, GitHub Actions.

**Design source:** `docs/superpowers/specs/2026-08-04-world-class-medical-slide-skill-design.md`

**Baseline:** `main@0a05299`

---

## Global execution rules

- Never invent names, affiliations, COI, ethics approval, trial registration, funding, DOI, PMID, or clinical claims.
- All catalog data must carry a visible `SYNTHETIC EXAMPLE / NOT FOR CLINICAL OR ACADEMIC USE` marker.
- A failed safety, content, offline, overflow, or PDF-page test blocks completion.
- Preserve the restrained white / Clinical Blue / booktabs direction.
- ReUI is a design reference only unless code is intentionally copied; copied code requires its MIT notice in `THIRD_PARTY_NOTICES.md`.
- Use the shared SVG only as visual grammar. Create original medical SVG patterns with accessible titles and descriptions.
- Never read or write `01_社長室/04_個人管理/`.
- Do not commit, push, publish, or deploy.

## Planned file map

```text
medical-slide-templates/
  SKILL.md
  agents/openai.yaml
  assets/
    fonts/
    svg-patterns/
  decks/medical-template-catalog/index.html
  engine/
    medical-charts.js
    medical-math.js
    slide.css
    slide.js
  examples/
    en-case-conference/index.html
    ja-journal-club/index.html
  reference/
    bilingual-style.md
    component-contracts.md
    medical-safety.md
    presentation-patterns.md
    workflow-recipes.md
  scripts/
    install-skill.mjs
    lib/catalog-audit.mjs
    validate-catalog.mjs
    validate-offline.mjs
  tests/
    browser/catalog.spec.mjs
    browser/examples.spec.mjs
    content/catalog-content.test.mjs
    evals/cases.json
    fixtures/
    unit/medical-charts.test.mjs
    unit/medical-math.test.mjs
    unit/skill-install.test.mjs
  theme/
    components.css
    journal.css
  .github/workflows/ci.yml
  CONTRIBUTING.md
  SECURITY.md
  THIRD_PARTY_NOTICES.md
  package.json
  package-lock.json
```

---

### Task 1: Establish a reproducible baseline and test harness [S]

**Files:**

- Create: `package.json`
- Create: `playwright.config.mjs`
- Create: `tests/browser/catalog.spec.mjs`
- Create: `tests/content/repository-contract.test.mjs`
- Modify: `.gitignore` if generated artifacts are not already ignored

**Step 1: Write failing repository-contract tests**

Test these current defects with `node:test`:

```js
assert.equal(existsSync('package.json'), true)
assert.equal(skill.includes('Clay'), false)
assert.notEqual(skill, claude)
assert.equal(html.includes('cdn.jsdelivr.net'), false)
assert.equal(html.includes('fonts.googleapis.com'), false)
```

Run: `node --test tests/content/repository-contract.test.mjs`

Expected: FAIL on the legacy duplicate documentation and external runtime dependencies.

**Step 2: Add the package scripts and pinned browser tooling**

Use this script contract:

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "test": "npm run test:unit && npm run test:content && npm run test:browser",
    "test:unit": "node --test tests/unit/*.test.mjs",
    "test:content": "node --test tests/content/*.test.mjs && node scripts/validate-catalog.mjs",
    "test:browser": "playwright test",
    "validate:skill": "python3 /Users/kenokamoto/.codex/skills/.system/skill-creator/scripts/quick_validate.py ."
  },
  "devDependencies": {
    "@axe-core/playwright": "4.10.2",
    "@playwright/test": "1.54.2"
  }
}
```

Pin exact dependency versions and generate `package-lock.json` with `npm install`.

**Step 3: Capture browser baseline without asserting the desired fixes yet**

The browser test must record:

- detected slide count;
- console errors;
- failed network requests;
- overflow counts at 1280×720;
- PDF page count.

Store screenshots and PDFs only in ignored `test-results/`.

**Step 4: Run the baseline suite**

Run:

```bash
npm run test:unit
npm run test:content
npx playwright test tests/browser/catalog.spec.mjs
```

Expected: the intentional repository-contract assertions still identify the P0 defects; the browser baseline itself runs deterministically.

**Step 5: Report checkpoint**

Report baseline counts and the exact failing assertions. Do not fix unrelated issues in this task.

---

### Task 2: Make medical arithmetic deterministic [M]

**Files:**

- Create: `engine/medical-math.js`
- Create: `tests/unit/medical-math.test.mjs`
- Create: `tests/fixtures/medical-math-cases.json`

**Step 1: Write failing tests**

Cover at minimum:

- ARR `0.124 - 0.077 = 0.047`;
- NNT `ceil(1 / 0.047) = 22`;
- NNH rejects a non-harm outcome or missing direction;
- sensitivity, specificity, PPV, NPV from a 2×2 table;
- CONSORT/PRISMA flow totals;
- point estimate must lie within CI;
- ratio CI values must be positive;
- null value is 1 for ratios and 0 for differences.

Example contract:

```js
const result = numberNeededToTreat({ controlRisk: 0.124, treatmentRisk: 0.077 })
assert.deepEqual(result, { absoluteRiskReduction: 0.047, nnt: 22 })
```

Run: `node --test tests/unit/medical-math.test.mjs`

Expected: FAIL because the module does not exist.

**Step 2: Implement the smallest pure module**

Export pure functions only:

```js
export function numberNeededToTreat(input) {}
export function diagnosticMetrics(input) {}
export function validateFlow(input) {}
export function validateEstimate(input) {}
export function nullValueFor(measure) {}
```

Reject missing, non-finite, or impossible inputs with human-readable errors. Never silently coerce percentages and proportions.

**Step 3: Make the tests pass**

Run: `node --test tests/unit/medical-math.test.mjs`

Expected: PASS.

**Step 4: Add malformed fixtures**

Include broken denominators, percentages over 100%, negative counts, reversed CI bounds, and a point estimate outside its CI.

Run: `npm run test:unit`

Expected: PASS with every malformed fixture rejected.

---

### Task 3: Remove clinically unsafe and falsely authoritative catalog content [M]

**Files:**

- Create: `scripts/lib/catalog-audit.mjs`
- Create: `scripts/validate-catalog.mjs`
- Create: `tests/content/catalog-content.test.mjs`
- Modify: `decks/medical-template-catalog/index.html`

**Step 1: Encode the safety failures as tests**

Test that the catalog rejects:

- named real hospitals or realistic researcher identities in synthetic examples;
- IRB, UMIN, AMED, DOI, PMID, and guideline identifiers unless explicitly verified fixture data;
- `NNT 8` paired with ARR 4.7%;
- MASCC/CISNE in a pediatric febrile-neutropenia example;
- unversioned infant-fever algorithms;
- prefilled COI, ethics, consent, or funding answers;
- claims such as `100% coverage` or blanket society compliance;
- any synthetic slide without the visible synthetic marker.

Run: `node --test tests/content/catalog-content.test.mjs`

Expected: FAIL and list each known defect.

**Step 2: Add the catalog auditor**

The auditor should parse slide sections, derive a stable slide identifier, and return structured findings:

```js
{ severity: 'blocker', rule: 'unverified-identifier', slide: '...', excerpt: '...' }
```

Do not log patient-like full text; keep excerpts short and synthetic.

**Step 3: Replace unsafe examples**

- Change named organizations and people to obvious neutral labels such as `Example Institution` / `発表者名（未入力）`.
- Remove fake identifiers and citations rather than inventing replacements.
- Change COI, ethics, consent, registration, and funding to explicit unanswered fields.
- Replace clinically actionable algorithms with structural wireframes that require source, population, region, version, and access date.
- Correct the ARR/NNT example using `medical-math.js` output.
- Add the synthetic-use marker to every catalog slide, including print.

**Step 4: Verify content safety**

Run:

```bash
npm run test:unit
node --test tests/content/catalog-content.test.mjs
node scripts/validate-catalog.mjs
```

Expected: PASS; zero blocker findings.

**Human checkpoint 1**

Ask a clinician to inspect only the changed examples and safety wording. Do not continue to visual expansion until P0 clinical findings are accepted.

---

### Task 4: Replace manually positioned scientific charts with data-driven SVG [L]

**Files:**

- Create: `engine/medical-charts.js`
- Create: `tests/unit/medical-charts.test.mjs`
- Create: `tests/fixtures/forest-plot.json`
- Create: `tests/fixtures/kaplan-meier.json`
- Modify: `decks/medical-template-catalog/index.html`
- Modify: `engine/slide.js`

**Step 1: Write geometry tests**

Test:

- log-axis mapping for ratio measures;
- linear mapping for difference measures;
- every point lies between its CI endpoints;
- null line is generated from measure type;
- SVG IDs are unique across multiple charts;
- Kaplan-Meier time and survival values are monotonic;
- Number at Risk rows match the requested time points;
- censor marks are represented in both SVG and the text alternative.

Run: `node --test tests/unit/medical-charts.test.mjs`

Expected: FAIL because the renderer does not exist.

**Step 2: Implement accessible SVG primitives**

Use a DOM-in/DOM-out API:

```js
renderForestPlot(element, data, options)
renderKaplanMeier(element, data, options)
renderRocCurve(element, data, options)
renderWaterfall(element, data, options)
```

Each renderer must emit:

- `viewBox`, `role="img"`, `<title>`, and `<desc>`;
- a same-data HTML table or concise text alternative;
- shapes, line styles, and direct labels so meaning is not color-only;
- `data-chart-ready="true"` only after successful rendering.

**Step 3: Replace the catalog forest plot and Kaplan-Meier examples**

Delete manual pixel positioning and canvas use for these slides. Bind printed numbers and SVG geometry to the same object.

**Step 4: Replace remaining CDN chart examples**

Move ROC and waterfall to the same SVG module. A funnel plot may remain only if its limitations are stated and no non-significant asymmetry test is described as proof of no bias.

**Step 5: Verify charts**

Run:

```bash
npm run test:unit
npx playwright test tests/browser/catalog.spec.mjs --grep "scientific charts"
```

Expected: PASS; no canvas, no Chart.js, correct at-risk table, no chart console errors.

---

### Task 5: Build the ReUI-inspired medical choice system [M]

**Files:**

- Create: `theme/components.css`
- Create: `reference/component-contracts.md`
- Modify: `decks/medical-template-catalog/index.html`
- Modify: `engine/slide.js`
- Create: `tests/browser/components.spec.mjs`

**Step 1: Write interaction and static-print tests**

Cover:

- one labelled `radiogroup` with keyboard arrow navigation;
- visible focus;
- selected, unselected, disabled, correct, and incorrect states distinguishable without color;
- 44px minimum interactive target;
- selected state remains visible in print/PDF;
- answer explanation is not revealed by default unless the slide is an answer slide.

Run: `npx playwright test tests/browser/components.spec.mjs`

Expected: FAIL.

**Step 2: Implement six component contracts**

Create CSS/markup contracts for:

- `choice-list`;
- `choice-card`;
- `differential-choice`;
- `confidence-scale`;
- `answer-reveal`;
- `decision-options`.

Use native inputs where interaction exists. Use `aria-describedby` and explicit visible state labels. Do not add React, Radix, or Tailwind.

**Step 3: Add bilingual catalog examples**

Add one Japanese and one English example that demonstrate equal-quality typesetting, not word-for-word mirroring.

**Step 4: Record provenance**

In `reference/component-contracts.md`, state that ReUI Radio Group informed card, description, separator, and state design. If any source code is copied, add the precise MIT attribution now; otherwise state that no ReUI code was copied.

**Step 5: Verify**

Run: `npx playwright test tests/browser/components.spec.mjs`

Expected: PASS.

---

### Task 6: Create the original medical SVG pattern library [M]

**Files:**

- Create: `assets/svg-patterns/sequence.svg`
- Create: `assets/svg-patterns/branch.svg`
- Create: `assets/svg-patterns/comparison-rows.svg`
- Create: `assets/svg-patterns/causal-path.svg`
- Create: `assets/svg-patterns/study-flow.svg`
- Create: `assets/svg-patterns/clinical-timeline.svg`
- Create: `assets/svg-patterns/anatomy-callout.svg`
- Create: `assets/svg-patterns/evidence-map.svg`
- Create: `tests/content/svg-patterns.test.mjs`
- Modify: `decks/medical-template-catalog/index.html`

**Step 1: Write SVG contract tests**

Require every asset to have:

- `viewBox`;
- non-empty `<title>` and `<desc>`;
- no embedded raster image;
- no text arrows such as `→`, `⇒`, or `↔`;
- CSS variables for semantic colors;
- unique IDs after insertion;
- no clinical recommendation text or unverified citations.

Run: `node --test tests/content/svg-patterns.test.mjs`

Expected: FAIL because the assets do not exist.

**Step 2: Draw original patterns**

Use the shared `03b-control-ownership-map.svg` only for these principles: strong title, short lead, thin baseline, row rhythm, simple geometry, restrained blue. Do not copy its text or application-specific content.

**Step 3: Add safe catalog demonstrations**

Demonstrations must explain structure, not treatment advice. Algorithm-like slides must show empty metadata fields for source, population, region, version, and access date.

**Step 4: Verify SVG and PDF output**

Run:

```bash
node --test tests/content/svg-patterns.test.mjs
npx playwright test tests/browser/catalog.spec.mjs --grep "SVG patterns"
```

Expected: PASS at screen and print scale.

**Human checkpoint 2**

Review the choice components and eight SVG patterns at 1280×720 and in a PDF sample. Confirm the visual vocabulary before applying it across all templates.

---

### Task 7: Rebuild the theme for projector readability, accessibility, and Japanese/English parity [L]

**Files:**

- Modify: `theme/journal.css`
- Modify: `engine/slide.css`
- Modify: `engine/slide.js`
- Create: `reference/bilingual-style.md`
- Create: `tests/browser/accessibility.spec.mjs`
- Create: `tests/browser/overflow.spec.mjs`

**Step 1: Write failing visual-contract tests**

Assert:

- stage body text is at least 24px, with explicitly documented smaller footnote/table exceptions;
- important borders, axes, focus rings, and connectors meet 3:1 contrast;
- headings and normal text meet WCAG AA contrast;
- every slide has a unique accessible heading and slide semantics;
- tables include caption, `thead`, `tbody`, and `scope`;
- keyboard navigation supports arrows, Home, End, and visible focus;
- `prefers-reduced-motion` disables nonessential transitions;
- no overflow at 1280×720, 1366×768, 1920×1080, and 1024×768 letterbox.

Run: `npx playwright test tests/browser/accessibility.spec.mjs tests/browser/overflow.spec.mjs`

Expected: FAIL on legacy small text, low-contrast rules, and semantics.

**Step 2: Consolidate tokens and remove inline styling**

Introduce one token source for type scale, spacing, color, rules, focus, and chart semantics. Replace repeated hard-coded inline styles with named component classes in batches.

**Step 3: Implement bilingual typography**

Use `:lang(ja)` and `:lang(en)` rules. Japanese must use `text-wrap: pretty` and `word-break: auto-phrase`; English must handle long scientific words, genes, drugs, and units. Add fixtures with deliberately difficult text.

**Step 4: Fix slide navigation and semantics**

Use `aria-current` for the active slide, meaningful live-region updates, and stable URL hashes without interfering with form controls.

**Step 5: Run accessibility and overflow checks**

Run:

```bash
npx playwright test tests/browser/accessibility.spec.mjs
npx playwright test tests/browser/overflow.spec.mjs
```

Expected: PASS with zero serious/critical axe violations and zero overflow findings.

---

### Task 8: Guarantee offline and one-slide-per-page output [M]

**Files:**

- Create: `scripts/validate-offline.mjs`
- Modify: `decks/medical-template-catalog/index.html`
- Modify: `theme/journal.css`
- Modify: `engine/slide.js`
- Modify: `tests/browser/catalog.spec.mjs`
- Add local font assets and licenses under `assets/fonts/` only if redistribution terms are recorded

**Step 1: Make offline and PDF assertions strict**

The test must fail if:

- any `http:` or `https:` request is attempted;
- a chart lacks `data-chart-ready="true"`;
- a font or script fails to load;
- PDF pages differ from slide count;
- the final PDF page is blank.

**Step 2: Remove external dependencies**

Delete Google Fonts and CDN scripts. Prefer a robust system-font stack. If local Noto fonts are added, include the exact OFL license and test fallback behavior without them.

**Step 3: Fix print lifecycle**

Wait for `document.fonts.ready` and all chart promises before exposing a print-ready flag. Ensure page breaks occur once per `.slide` and no trailing page is emitted.

**Step 4: Verify under network denial**

Run:

```bash
node scripts/validate-offline.mjs decks/medical-template-catalog/index.html
npx playwright test tests/browser/catalog.spec.mjs --grep "offline|PDF"
```

Expected: PASS; zero external requests and exact slide/PDF parity.

---

### Task 9: Rewrite the product as a concise, directory-installable Skill [L]

**Files:**

- Rewrite: `SKILL.md`
- Rewrite: `CLAUDE.md`
- Create: `agents/openai.yaml`
- Create: `reference/medical-safety.md`
- Create: `reference/workflow-recipes.md`
- Modify: `reference/presentation-patterns.md`
- Create: `scripts/install-skill.mjs`
- Create: `tests/unit/skill-install.test.mjs`

**Step 1: Write installation and instruction tests**

Test that installation into a temporary directory includes all runtime dependencies and excludes development-only output. Test that:

- frontmatter contains only `name` and `description`;
- `name` is lowercase hyphen-case;
- `description` contains trigger phrases for medical slides, journal club, case conference, research presentation, and lecture;
- `CLAUDE.md` is a short pointer, not a copy of `SKILL.md`;
- every referenced relative path exists;
- legacy Clay/Kraft/Oat wording is absent.

Run: `node --test tests/unit/skill-install.test.mjs`

Expected: FAIL.

**Step 2: Rewrite `SKILL.md` as an orchestration layer**

Keep the main file concise. It must define:

1. when the Skill triggers;
2. minimum-input inference and questions;
3. workflow selection;
4. evidence and PHI stop conditions;
5. component/chart selection;
6. generation and preflight commands;
7. preview and user-approval boundary;
8. pointers to reference files.

Do not duplicate full template catalogs or long CSS guidance.

**Step 3: Separate references by purpose**

- `medical-safety.md`: PHI, claims, citations, images, ethics, COI, funding, clinical-algorithm metadata.
- `workflow-recipes.md`: conference, case, journal club, teaching, research-progress, and guideline workflows.
- `presentation-patterns.md`: verified slide sequence and time/slide guidance.
- `component-contracts.md`: component selection and accessible markup.
- `bilingual-style.md`: Japanese/English writing and typography.

**Step 4: Add the installer**

The installer accepts an explicit destination and copies the entire required directory set. It must refuse an empty destination and must not delete or overwrite an existing skill without `--force`.

Example:

```bash
node scripts/install-skill.mjs --dest /tmp/claude-skills/medical-slide
```

**Step 5: Generate and validate `agents/openai.yaml`**

Use skill-creator conventions for `display_name`, `short_description`, and `default_prompt`. Generate through the provided script if available, then run:

```bash
python3 /Users/kenokamoto/.codex/skills/.system/skill-creator/scripts/quick_validate.py .
node --test tests/unit/skill-install.test.mjs
```

Expected: PASS.

**Human checkpoint 3**

Show the new `SKILL.md` and two natural-language invocation examples. Confirm that users never need to select or copy HTML templates manually.

---

### Task 10: Add gold-standard Japanese and English example decks [L]

**Files:**

- Create: `examples/ja-journal-club/index.html`
- Create: `examples/en-case-conference/index.html`
- Create: `tests/browser/examples.spec.mjs`
- Create: `tests/fixtures/examples/ja-journal-club.json`
- Create: `tests/fixtures/examples/en-case-conference.json`

**Step 1: Write example-deck acceptance tests**

For both decks assert:

- correct `lang`;
- no unfilled required metadata;
- visible synthetic marker;
- no external requests;
- exact slide/PDF parity;
- zero overflow at all target resolutions;
- zero serious/critical axe findings;
- citations or `SOURCE NOT PROVIDED` for every externally checkable claim;
- all computed values originate from fixture data.

**Step 2: Build the Japanese journal-club deck**

Demonstrate PICO, study flow, Table 1, effect estimate, forest-style result, bias assessment, applicability, and take-home message. Keep all data unmistakably synthetic.

**Step 3: Build the English case-conference deck**

Demonstrate case framing, de-identified timeline, differential-choice component, investigation summary, decision point, answer/reasoning, and learning points. Do not encode treatment advice as a reusable default.

**Step 4: Verify both decks**

Run: `npx playwright test tests/browser/examples.spec.mjs`

Expected: PASS.

---

### Task 11: Make quality gates automatic and the OSS surface credible [M]

**Files:**

- Create: `.github/workflows/ci.yml`
- Rewrite: `README.md`
- Update: `design-guidelines.md`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `THIRD_PARTY_NOTICES.md`

**Step 1: Add CI**

CI must:

- use a pinned Node major;
- run `npm ci`;
- install the pinned Playwright browser;
- run unit, content, Skill validation, and browser suites;
- upload Playwright reports only on failure;
- never require secrets.

**Step 2: Rewrite README around the real product**

Lead with natural-language Skill usage, supported deck types, safety boundaries, offline HTML output, bilingual support, install-by-directory, examples, tests, and license. Distinguish slide count from unique template/component count. Remove unverified claims such as “100% coverage.”

**Step 3: Add contributor and security guidance**

Document how to add a template, fixture, chart, or language example; require clinical source metadata and tests. `SECURITY.md` must explain how to report PHI exposure, citation fabrication, unsafe clinical defaults, and dependency vulnerabilities without posting sensitive data publicly.

**Step 4: Audit third-party provenance**

Record only assets/code actually shipped. Include ReUI attribution only if code was copied; otherwise identify it as design inspiration in documentation without implying code reuse. Record font licenses if fonts are bundled.

**Step 5: Run the full local gate**

Run:

```bash
npm ci
npm run validate:skill
npm test
git diff --check
```

Expected: PASS.

---

### Task 12: Forward-test the Skill as a doctor would use it [L]

**Files:**

- Create: `tests/evals/cases.json`
- Create: `tests/evals/rubric.md`
- Create: `scripts/run-skill-eval.mjs`
- Modify implementation files only for failures reproduced by the evals

**Step 1: Define raw-prompt cases**

Include at least:

1. Japanese 20-minute journal club from an abstract and table;
2. English 10-minute case conference from de-identified notes;
3. Japanese resident teaching deck with a four-option question;
4. bilingual research-progress deck from CSV summary;
5. missing citation and inconsistent denominator case;
6. PHI-suspected input case;
7. unverified guideline-algorithm request;
8. offline venue request.

**Step 2: Define a blinded rubric**

Score:

- task completion;
- medical and statistical integrity;
- citation/provenance behavior;
- privacy and consent behavior;
- information architecture;
- projector readability;
- accessibility;
- Japanese/English quality;
- offline/PDF correctness;
- appropriate use of choice, SVG, and chart components.

Hard fail any fabricated source, leaked identifier, silent numerical inconsistency, or blank chart.

**Step 3: Run forward tests with fresh agents or clean contexts**

Provide raw prompts and source fixtures only. Do not coach with the desired implementation. Capture outputs in ignored temporary directories, then run the normal validators against each output.

**Step 4: Fix only evidenced failures**

For every failure, add or tighten a test before changing the Skill or engine. Re-run the specific eval, then the full suite.

**Step 5: Final multidisciplinary review**

Review the final samples with:

- a clinician for clinical misuse and factual framing;
- a medical statistician for computation and chart integrity;
- a presentation designer for hierarchy and projector legibility;
- an accessibility reviewer for keyboard, contrast, semantics, and alternatives;
- an OSS maintainer for installation, versioning, and contribution workflow.

**Step 6: Final verification and handoff**

Run:

```bash
npm ci
npm run validate:skill
npm test
git diff --check
git status -s
git diff --stat
```

Report:

- changed files and why;
- exact test counts and results;
- reviewed example decks;
- any remaining `要確認` items;
- local-only status;
- explicit confirmation that no commit, push, publish, or deploy occurred.

---

## Definition of done

- A doctor can invoke the Skill naturally without choosing or copying a template.
- Japanese and English example decks pass the same quality gates.
- No external network is needed at presentation or PDF time.
- Slide count equals PDF page count.
- Medical arithmetic and chart geometry come from shared structured data.
- Synthetic examples cannot plausibly be mistaken for real research or guidance.
- COI, ethics, consent, registration, funding, names, affiliations, and citations are never fabricated.
- ReUI-inspired choice components and original SVG patterns are accessible and print-stable.
- The Skill installs as a complete directory and passes `quick_validate.py`.
- Full unit, content, browser, accessibility, offline, PDF, and forward-eval gates pass.
- A human has reviewed final clinical, design, accessibility, and OSS outputs before any release.

