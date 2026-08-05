# Medical safety and provenance gate

This reference governs every generated deck and every example shipped with the Skill.

## Hard stops

Stop before generation or export when patient identity, source validity, numerical consistency, or permission is unresolved. Never expose suspected identifiers in logs or error messages. Ask for a de-identified replacement.

Block final/export status when any required field remains unknown:

- presenter identity and affiliation;
- COI and funding;
- ethics category, review status, consent or opt-out, and trial registration when applicable;
- citation, identifier, guideline version, region, target population, and access date;
- medical image source, license, permission, modification, and de-identification status.

## Clinical claims

Do not turn a structural template into an implied recommendation. A diagnostic or treatment pathway needs a verified source appropriate to its population, age, region, care setting, and version. Show those metadata on the slide or in its source note.

Do not reuse an adult risk score in a pediatric example unless the supplied evidence explicitly validates that use. Do not encode a drug or dose as a reusable default.

## Statistics

Derive displayed values and chart geometry from one structured input. Recalculate effect measures and diagnostic metrics. Reject impossible or ambiguous inputs.

- NNT requires a defined harmful event, time horizon, direction, and absolute risk reduction.
- NNH requires a higher harmful-event risk in the intervention group; do not infer it from benefit data.
- Ratio measures use a null of 1 and positive log-axis values; difference measures use a null of 0.
- A point estimate must lie within its confidence interval.
- randomized-study and systematic-review flow child counts must reconcile with parent totals.
- Kaplan-Meier plots require Number at Risk and censoring information.
- A non-significant funnel-asymmetry test does not establish absence of publication bias.
- Do not add baseline significance tests to a randomized trial Table 1 by default.

## Synthetic examples

Synthetic material must be unmistakable before JavaScript executes and when a section is copied. Put the visible marker in each slide's source HTML. Use neutral labels rather than realistic people, institutions, registrations, grants, or references.

Synthetic clinical values demonstrate layout only. They are not evidence and must not be promoted into generated deck claims.

## Human review

Automated checks complement but do not replace clinician, statistician, privacy, accessibility, and rights review. Final academic or clinical use requires a human to confirm the source material and the presentation's claims.

