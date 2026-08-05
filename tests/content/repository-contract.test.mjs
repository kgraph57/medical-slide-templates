import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(path, 'utf8')

test('repository has a reproducible Node test harness', () => {
  assert.equal(existsSync('package.json'), true)
  assert.equal(existsSync('playwright.config.mjs'), true)
})

test('Skill instructions describe the shipped Clinical Blue system', () => {
  const skill = read('SKILL.md')
  assert.equal(skill.includes('Clay'), false, 'legacy Clay theme remains in SKILL.md')
})

test('CLAUDE.md is a thin entry point instead of a SKILL.md duplicate', () => {
  assert.notEqual(read('SKILL.md'), read('CLAUDE.md'))
})

test('catalog has no external runtime dependencies', () => {
  const html = read('decks/medical-template-catalog/index.html')
  assert.equal(html.includes('cdn.jsdelivr.net'), false, 'catalog loads Chart.js from a CDN')
  assert.equal(html.includes('fonts.googleapis.com'), false, 'catalog loads fonts from Google')
})

test('offline preview uses localhost instead of unsupported file URLs', () => {
  const readme = read('README.md')
  assert.match(readme, /npm run preview/)
  assert.match(readme, /127\.0\.0\.1:4173/)
  assert.match(readme, /file:\/\//)
  assert.doesNotMatch(readme, /open decks\/medical-template-catalog/)
  assert.equal(existsSync('scripts/serve.mjs'), true)
})

test('catalog ships original generic appraisal and study-flow components', () => {
  const html = read('decks/medical-template-catalog/index.html')
  for (const officialName of [
    'CONSORT', 'PRISMA', 'RoB 2', 'GRADE', 'CASP',
    'D1: ランダム化過程', 'D2: 割付からの逸脱', 'D3: アウトカムデータの欠測',
    '非一貫性', '非直接性', '不精確性',
    'rob-', 'grade-', 'consort-', 'prisma-',
  ]) {
    assert.equal(html.includes(officialName), false, `catalog embeds named official material: ${officialName}`)
  }
  for (const genericId of ['randomized-study-flow', 'systematic-review-flow', 'bias-domain-review', 'certainty-assessment', 'critical-appraisal-questions']) {
    assert.equal(html.includes(genericId), true, `missing original generic component: ${genericId}`)
  }
})
