# Bilingual slide style / 日英バイリンガル設計

## Language strategy

Choose one of three explicit patterns per deck:

1. Japanese deck with English technical terms where standard.
2. English deck with Japanese speaker notes or supporting labels.
3. Deliberately bilingual deck with a visible primary and secondary language hierarchy.

Do not duplicate every sentence line by line. Translate meaning, not word order, and shorten the secondary language when space is limited. Never translate established gene symbols, units, statistical notation, or validated instrument names.

## Typography

- Set `<html lang="ja">` or `<html lang="en">` to the primary language.
- Mark genuine language changes with `lang` on the nearest phrase or block.
- Japanese uses `text-wrap: pretty` and `word-break: auto-phrase` when supported.
- English headings use sentence case; avoid all-caps paragraphs.
- Keep numbers and units together and avoid breaking confidence intervals across lines.
- Use 24px or larger for narrative stage text. The 18px floor is reserved for dense tables, chart ticks, flow labels, citations, and compact metadata; split the slide instead of going smaller.

## Tables and charts

For bilingual charts, use a short shared label plus a bilingual legend or caption. Keep abbreviations defined in both languages at first use. Data values, denominators, units, and statistical symbols must be identical across languages.

## Review checklist

- Both languages make the same claim and uncertainty level.
- COI, ethics, consent, funding, and citation status are equally explicit in both languages.
- Japanese does not imply stronger causality than the English source.
- English does not erase population, setting, or age restrictions present in Japanese.
- Layout is checked with realistic long Japanese and English strings, not only placeholders.
