# Medical Slide

> **Site & live demo: https://kgraph57.github.io/medical-slide-templates/**

医師の自然な依頼から、学会・抄読会・症例カンファレンス・研究発表・教育講演のための16:9 HTMLスライドを組み立てる、日英バイリンガルのClaude Skillです。

テンプレートHTMLを選んでコピーする必要はありません。資料と目的を渡すと、Skillが発表形式を判断し、構成、医学図表、選択UI、SVG図解を選びます。

```text
このRCT論文を、15分の日本語抄読会スライドにして。PICO、バイアスリスク、適用可能性を重視。

Build a 10-minute English case-conference deck from these de-identified notes. Use a timeline and differential-choice slide, and keep every uncertainty explicit.
```

## What it produces

- browser presentation and one-slide-per-page PDF from the same local HTML deck;
- Japanese, English, or an explicit bilingual hierarchy;
- deterministic forest, Kaplan–Meier, ROC, line, waterfall, and funnel SVG charts;
- six ReUI-inspired native HTML choice-component contracts;
- eight original SVG patterns for sequence, branch, comparison, causal path, study flow, clinical timeline, anatomy callout, and evidence mapping;
- a 66-slide synthetic component catalog and two small gold-standard synthetic example decks.

The catalog has 66 demonstration slides, not 66 guaranteed unique template types. Repeated section and state examples are intentionally included.

## Safety boundary

This project creates clinician-facing academic and teaching presentations. It is not patient material, diagnosis, treatment selection, or clinical decision support.

The Skill stops for possible PHI, unverified citations or clinical claims, inconsistent statistics, unknown image rights, and unanswered COI/ethics/consent/funding fields. Catalog and example content is permanently marked synthetic and must not be reused as evidence.

## Install as a Skill

Clone the repository, then install the complete directory. Do not copy only `SKILL.md`; the Skill requires its engine, theme, references, diagrams, and catalog.

```bash
git clone https://github.com/kgraph57/medical-slide-templates.git
cd medical-slide-templates
node scripts/install-skill.mjs --dest "$HOME/.claude/skills/medical-slide"
```

For Codex/OpenAI-compatible Skill discovery, install the same complete directory under your configured skills root, for example:

```bash
node scripts/install-skill.mjs --dest "$HOME/.codex/skills/medical-slide"
```

`agents/openai.yaml` is included in both installations.

The installer refuses an existing destination. Review it, then add `--force` only when replacement is intentional.

You can also use the repository in place. Start the bundled localhost preview server; it needs no internet connection:

```bash
npm run preview
# then open http://127.0.0.1:4173/
```

Modern browsers block local ES modules under `file://`, so direct double-click/open is not supported. "Offline" here means localhost-only execution with zero external network requests.

Generated decks use a standalone folder contract. The Skill first runs `node scripts/scaffold-deck.mjs --dest <folder> --lang ja|en`, then writes the deck into that folder alongside its engine, theme, SVG patterns, and localhost server. A generated HTML file never depends on the original clone or a machine-specific absolute path.

## Examples

- [Japanese journal club](examples/ja-journal-club/index.html)
- [English case conference](examples/en-case-conference/index.html)

Both use synthetic fixtures and `SOURCE NOT PROVIDED` where real evidence is absent. They demonstrate structure and safety behavior, not medical recommendations.

## Architecture

```text
SKILL.md                 natural-language orchestration and safety gate
engine/                  slide runtime, medical calculations, SVG charts
theme/                   Clinical Blue theme and choice components
reference/               safety, workflows, bilingual and component contracts
assets/svg-patterns/     original reusable diagrams
decks/                   66-slide synthetic catalog
examples/                Japanese and English synthetic decks
tests/                   unit, content, browser, accessibility, PDF gates
```

There are no runtime CDNs, web fonts, React, Tailwind, Radix, or Chart.js. The bundled server binds only to `127.0.0.1`. Statistical geometry and displayed values derive from the same validated data objects. Each chart includes an accessible description and hidden data table.

## Development and verification

Node.js 22 is used in CI. Install the pinned dependencies and Chromium:

```bash
npm ci
npx playwright install chromium
npm run validate:skill
npm run validate:offline
npm run eval:skill
npm test
```

The browser suite checks external requests, JavaScript failures, chart readiness, keyboard behavior, color contrast and accessibility, four viewport sizes, overflow, and slide/PDF page parity. Browser HTML is the accessible artifact; the generated PDF is a visual handout and is not claimed to be tagged PDF. `npm audit --audit-level=high` can be used for a local dependency check.

Passing automated tests does not replace clinician, statistician, privacy, ethics, accessibility, or rights review of a real presentation.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) before adding a template, chart, medical example, or language. Report security, PHI exposure, fabricated citations, or unsafe defaults using [SECURITY.md](SECURITY.md); never put patient data in a public issue.

ReUI informed the interaction principles of the choice cards, but no ReUI source code is copied. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

MIT. Copyright 2026 Ken Okamoto.
