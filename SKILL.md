---
name: medical-slide
description: Create or refine bilingual Japanese and English medical presentation slides as offline 16:9 HTML. Use for medical conference talks, journal clubs, case conferences, research presentations, teaching lectures, guideline summaries, clinical timelines, scientific charts, and requests such as 学会スライド, 抄読会, 症例カンファレンス, 医学教育スライド, medical slide, or journal club deck.
---

# Medical Slide

Generate a presentation-ready 16:9 HTML deck from the user's source material. The user describes the presentation in natural language; select and assemble internal patterns without asking them to copy template HTML.

## Product boundary

Use this Skill for clinician-facing academic, clinical, research, and teaching presentations. Do not use it for patient handouts, marketing, diagnosis, treatment selection, or autonomous clinical decision support.

The output is one local HTML deck that can be presented in a browser or printed to PDF. Serve it through the bundled localhost preview because modern browsers block ES modules under `file://`. The preview requires no internet and must make zero external requests. Do not create an editor app, PowerPoint compiler, or multiple viewing modes unless explicitly requested.

## Start from evidence, not from a template

1. Inspect the supplied paper, abstract, notes, table, CSV, images, or existing deck.
2. Infer presentation type, language, audience, duration, and desired output location.
3. Ask only for missing information that materially changes the result.
4. Treat title, presenter, affiliation, COI, ethics, consent, registration, funding, identifiers, citations, and image rights as unknown until supplied or verified.
5. Choose a workflow from `reference/presentation-patterns.md` and components from the catalog only after the evidence and stop conditions are understood.

Never default COI to none or ethics to approved. Never invent a person, institution, identifier, reference, guideline, result, or permission.

## Required safety gate

Read `reference/medical-safety.md` before generating any medical deck.

Stop and ask for corrected or de-identified input when:

- patient-identifying information may be present;
- DICOM metadata or burned-in image identifiers have not been checked;
- a citation, DOI, PMID, guideline version, or clinical claim cannot be verified;
- a denominator, percentage, unit, confidence interval, p value, or flow total conflicts;
- a drug, dose, diagnostic threshold, or clinical algorithm lacks a verified source appropriate to population, region, setting, and date;
- image provenance, license, consent, or permission is unknown;
- required COI, ethics, consent, registration, or funding information is unanswered.

Do not “complete” missing medical facts with plausible text. Use `未確認`, `未入力`, or `SOURCE NOT PROVIDED` in a review draft, and block final/export status until resolved.

## Build the narrative

Use one message per slide. For every proposed slide, define:

- the assertion the audience should retain;
- the evidence supporting it;
- the best form: text, table, deterministic chart, choice component, or SVG diagram;
- the source or input field behind each checkable claim;
- whether the slide is required, optional, or should be removed.

Prefer fewer legible slides to dense slides. Split content rather than shrinking type below the documented minimum.

## Choose the right visual form

- Numeric effect or distribution: use a data-driven statistical chart.
- Choice and state: use a ReUI-inspired choice component described in `reference/component-contracts.md` when available.
- Sequence, branch, comparison, mechanism, study flow, or clinical timeline: use an original inline SVG pattern.
- Simple assertion: use text and whitespace; do not add a diagram.

Do not hand-position a point separately from its displayed value. Forest plots, Kaplan-Meier plots, ROC curves, flow counts, and diagnostic metrics must derive visual geometry and labels from the same structured data.

Use `engine/medical-math.js` for supported calculations. Reject ambiguous percentages; inputs to risk functions are proportions from 0 to 1.

## HTML contract

Before generating outside the installed Skill directory, create a standalone output folder with `node scripts/scaffold-deck.mjs --dest <output-directory> --lang ja|en`. Replace the review-draft slide in that folder; keep its local `engine/`, `theme/`, SVG assets, and `scripts/serve.mjs` references. Never emit a lone HTML file whose relative dependencies point back to an installation-specific path.

Use:

- `engine/slide.css` for the 16:9 slide frame;
- `theme/journal.css` for the Clinical Blue visual system;
- `engine/slide.js` for navigation and presentation behavior;
- `scripts/serve.mjs` for localhost preview without internet access;
- `theme/components.css` and SVG patterns when those files are present;
- semantic HTML headings, tables, lists, figures, captions, labels, and form controls;
- inline SVG with `viewBox`, `<title>`, and `<desc>`;
- local assets only at presentation and PDF time.

Do not add Google Fonts, a CDN, React, Radix, Tailwind, or Chart.js runtime dependencies. Do not use a screenshot of a paper table when the important values can be reconstructed and checked.

## Bilingual rules

Read `reference/bilingual-style.md` when the source or requested output uses Japanese and English.

Set the document language correctly. Treat Japanese and English as equal source languages, not a primary language plus an afterthought.

- Japanese: use natural clinical Japanese, `text-wrap: pretty`, and `word-break: auto-phrase`.
- English: preserve accepted abbreviations, units, gene names, and drug names without awkward line breaks.
- Do not force literal line-by-line bilingual duplication; adapt phrasing to fit while preserving meaning.
- If both languages appear on one deck, make the language hierarchy explicit and keep charts/tables understandable in both.

## Synthetic examples

The template catalog is synthetic and must never be presented as real evidence. Every catalog slide contains a permanent visible marker. Do not carry catalog claims, numbers, names, clinical actions, or citations into a user deck.

When creating a new synthetic demonstration, mark every slide visibly:

`SYNTHETIC EXAMPLE / NOT FOR CLINICAL OR ACADEMIC USE`

Use obvious placeholders and neutral labels. Do not make fictional work resemble a real institution, registry, trial, grant, or publication.

## Preflight before preview

Check all of the following:

- placeholders and unknown required fields;
- internal arithmetic, denominators, units, confidence intervals, p values, and flow totals;
- NNT/NNH direction and event definition;
- forest plot measure, null line, scale, point, and confidence interval;
- Kaplan-Meier Number at Risk, censoring, time axis, and source data;
- citation existence and claim-to-source linkage;
- population, age, region, design, version, and access date for clinical material;
- COI, funding, ethics, consent, registration, PHI, and image provenance;
- headings, table semantics, text alternatives, focus visibility, color-independent meaning, and reduced motion;
- overflow at 1280×720, 1366×768, 1920×1080, and 1024×768 letterbox;
- zero external requests and slide-count/PDF-page parity.

If a check fails, do not hide it by reducing font size or inventing content. Fix the source, split the slide, or return a clear unresolved item.

## Review and delivery

Open the generated deck in a browser and inspect every slide. Validate keyboard navigation and print/PDF output. Report:

- output path;
- slide count and PDF page count;
- language, presentation type, audience, and duration;
- verification commands and results;
- unresolved medical, citation, privacy, permission, or layout items.

Do not publish, send, commit, push, or deploy without the user's explicit approval.
