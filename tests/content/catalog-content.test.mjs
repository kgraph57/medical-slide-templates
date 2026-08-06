import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { auditCatalog, auditSafety } from '../../scripts/lib/catalog-audit.mjs'

test('catalog contains no clinically unsafe or falsely authoritative synthetic content', () => {
  const html = readFileSync('decks/medical-template-catalog/index.html', 'utf8')
  assert.deepEqual(auditCatalog(html), [])
})

test('systematic-review flow accounts for every synthetic record', () => {
  const html = readFileSync('decks/medical-template-catalog/index.html', 'utf8')
  for (const expectedText of ['n = 2,840', 'n = 45', '重複 n=1,265', '除外 n=1,336', 'n = 284', '除外 n=216', 'n = 68', '全文除外 n=44', 'n = 24']) {
    assert.match(html, new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.equal(2840 + 45 - 1265, 1620)
  assert.equal(1620 - 1336, 284)
  assert.equal(284 - 216, 68)
  assert.equal(68 - 44, 24)
})

test('auditor reports structured, non-empty findings', () => {
  const findings = auditCatalog('<body><section><span class="template-label">example</span>NNT 8</section></body>')
  assert.equal(findings[0].severity, 'blocker')
  assert.equal(findings[0].rule, 'incorrect-nnt-example')
  assert.equal(findings[0].slide, 'example')
  assert.ok(findings[0].excerpt.length > 0)
})

test('auditor rejects each high-risk content class and redacts sensitive excerpts', () => {
  const cases = [
    ['real-person-in-synthetic-example', '発表者名: 岡本 賢'],
    ['unverified-study-identifier', '承認番号 IRB-2024-0142'],
    ['adult-score-in-pediatric-example', '小児でMASCCを使用'],
    ['unversioned-infant-fever-pathway', '29日-3ヶ月はRochesterで層別化'],
    ['incorrect-nnt-example', 'NNT 8'],
    ['unsupported-nnh-example', 'NNH 38'],
    ['prefilled-ethics-or-consent', '患者・家族の同意を得て匿名化して報告する'],
    ['unverified-medication-dose', 'MEPM 120mg/kg'],
    ['unsupported-publication-bias-claim', '出版バイアスは示唆されない'],
  ]
  for (const [rule, content] of cases) {
    const finding = auditSafety(`<section class="slide"><span class="template-label">probe</span>${content}</section>`)
      .find((item) => item.rule === rule)
    assert.ok(finding, `missing finding for ${rule}`)
    if (['real-person-in-synthetic-example', 'unverified-study-identifier', 'prefilled-ethics-or-consent'].includes(rule)) {
      assert.equal(finding.excerpt, '[REDACTED]')
    }
  }
})

test('every slide needs its own source-level synthetic marker', () => {
  const html = '<body data-catalog-mode="synthetic"><section class="slide"><span class="template-label">probe</span></section></body>'
  assert.ok(auditCatalog(html).some((finding) => finding.rule === 'missing-slide-synthetic-marker'))
})

test('Skill entry points contain no legacy unsafe examples', () => {
  for (const path of ['SKILL.md', 'CLAUDE.md']) {
    assert.deepEqual(auditSafety(readFileSync(path, 'utf8')), [], path)
  }
})
