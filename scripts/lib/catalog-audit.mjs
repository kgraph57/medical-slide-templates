const BLOCKER_RULES = [
  ['real-institution-in-synthetic-example', /愛育病院|東京大学|大阪大学|Stanford University|Harvard Medical School/i],
  ['real-person-in-synthetic-example', /岡本\s*賢|田中花子|佐藤太郎|Smith JA|Tanaka H|Johnson M/i],
  ['unverified-study-identifier', /IRB-\d|UMIN\d|JP\d{2}[a-z]{2}\d+|10\.\d{4,9}\/[\w.()/:;-]+/i],
  ['adult-score-in-pediatric-example', /\bMASCC\b|\bCISNE\b/i],
  ['unversioned-infant-fever-pathway', /Rochester|29日\s*[-–]\s*3[ヶか]?月|29d\s*[-–]\s*3m/i],
  ['incorrect-nnt-example', /NNT\s*(?:=\s*)?8\b/i],
  ['unsupported-nnh-example', /NNH\s*(?:=\s*)?38\b/i],
  ['prefilled-no-coi', /開示すべき[\s\S]{0,40}ありません/i],
  ['prefilled-ethics-or-consent', /書面による説明と同意を取得|倫理委員会承認・研究開始|患者[・と]家族の同意を得て/i],
  ['unverified-medication-dose', /\b(?:AMPC|ABPC|CTX|CTRX|AZM|VCM|MEPM|KCL|rTM)\b|アセトアミノフェン|\d+(?:-\d+)?\s*mg\/kg/],
  ['unverified-reference', /小児AI診療支援ガイドライン|Lancet Digit Health<\/em>\. 2025/i],
  ['unsupported-publication-bias-claim', /出版バイアスは示唆されない/i],
  ['unsupported-coverage-claim', /100%\s*(?:coverage|網羅)|AHA\/ASCO\/ASH準拠/i],
]

function slideIdAt(html, index) {
  const start = html.lastIndexOf('<section', index)
  if (start < 0) return 'document'
  const end = html.indexOf('</section>', start)
  const section = html.slice(start, end < 0 ? index + 160 : end)
  return section.match(/class="template-label"[^>]*>([^<]+)/)?.[1]?.trim() ?? 'unlabelled-slide'
}

const REDACTED_RULES = new Set([
  'real-institution-in-synthetic-example',
  'real-person-in-synthetic-example',
  'unverified-study-identifier',
  'prefilled-ethics-or-consent',
])

export function auditSafety(html) {
  const findings = []
  for (const [rule, pattern] of BLOCKER_RULES) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
    for (const match of html.matchAll(new RegExp(pattern.source, flags))) {
      findings.push({
        severity: 'blocker',
        rule,
        slide: slideIdAt(html, match.index),
        offset: match.index,
        excerpt: REDACTED_RULES.has(rule)
          ? '[REDACTED]'
          : match[0].replace(/\s+/g, ' ').slice(0, 100),
      })
    }
  }
  return findings
}

export function auditCatalog(html) {
  const findings = auditSafety(html)
  if (!/<body\b[^>]*data-catalog-mode="synthetic"/i.test(html)) {
    findings.push({
      severity: 'blocker',
      rule: 'missing-synthetic-catalog-marker',
      slide: 'document',
      excerpt: 'body[data-catalog-mode="synthetic"] is required',
    })
  }
  const slides = [...html.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>[\s\S]*?<\/section>/gi)]
  for (const [index, match] of slides.entries()) {
    if (/class="synthetic-marker"[^>]*>[\s\S]*?SYNTHETIC EXAMPLE \/ NOT FOR CLINICAL OR ACADEMIC USE/i.test(match[0])) continue
    findings.push({
      severity: 'blocker',
      rule: 'missing-slide-synthetic-marker',
      slide: slideIdAt(html, match.index),
      offset: match.index,
      excerpt: `slide ${index + 1} lacks a static visible marker`,
    })
  }
  return findings
}
