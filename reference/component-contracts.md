# Choice component contracts

These native HTML components adapt the selection clarity of ReUI's Radio Group to an offline medical-slide context. The implementation is original; no ReUI source code is included.

## `choice-card`

Use for one answer among two to five options. Build it as a `<fieldset>` with a visible `<legend>`, native radio inputs, and full-card labels. Each target must be at least 44 by 44 CSS pixels. Keyboard selection must not advance the deck.

Do not encode selected, correct, incorrect, supported, or unsupported states by color alone. Pair border or line style with explicit text. In print, selected state must remain visible without background color.

## `answer-reveal`

Use after a teaching question. Keep the original answer and the explanation visible together. Mark each row with explicit `Correct` or `Incorrect` text; border style is redundant reinforcement only.

## `differential-choice`

Use a semantic table for candidate diagnoses or interpretations. Give every supporting and opposing observation an explicit `Supports` or `Against` label. Never generate a diagnosis or recommendation from the component.

## `confidence-scale`

Use for learner self-report, not calibrated clinical probability. Label the selected level in text with `aria-current="true"`. Do not turn confidence into a diagnostic score.

## `decision-options`

Use to compare discussion options after verified evidence is shown. It is not a clinical decision-support control. If an option contains a drug, dose, threshold, or algorithm, the medical-safety source gate still applies.

## Provenance

Design reference: [ReUI Radio Group](https://reui.io/components/radio-group), consulted 2026-08-04. Inspiration is limited to large selectable surfaces, clear selected state, and native radio semantics. Styling, markup, behavior, and medical safeguards in this repository are independent.
