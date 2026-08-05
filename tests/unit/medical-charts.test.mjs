import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  forestGeometry,
  funnelGeometry,
  linearScale,
  logScale,
  rocMetrics,
  validateFunnel,
  validateKaplanMeier,
  validateLineChart,
  validateRocCurve,
  validateWaterfall,
} from '../../engine/medical-charts.js'

const forest = JSON.parse(readFileSync('tests/fixtures/forest-plot.json', 'utf8'))
const km = JSON.parse(readFileSync('tests/fixtures/kaplan-meier.json', 'utf8'))

test('maps linear and logarithmic domains deterministically', () => {
  assert.equal(linearScale(5, [0, 10], [0, 100]), 50)
  assert.equal(logScale(1, [0.25, 4], [0, 100]), 50)
})

test('forest geometry derives labels and coordinates from one validated object', () => {
  const geometry = forestGeometry(forest, { x: 180, width: 600 })
  assert.equal(geometry.nullX, logScale(1, forest.domain, [180, 780]))
  for (const [index, row] of geometry.rows.entries()) {
    assert.equal(row.label, forest.rows[index].label)
    assert.ok(row.lowerX <= row.estimateX)
    assert.ok(row.estimateX <= row.upperX)
  }
})

test('Kaplan-Meier requires at-risk counts, non-increasing survival, and censor times', () => {
  assert.equal(validateKaplanMeier(km), true)
  assert.throws(() => validateKaplanMeier({ ...km, groups: [{ ...km.groups[0], atRisk: [] }] }), /at-risk/i)
  const risingSurvival = [...km.groups[0].survival]
  risingSurvival[2] = 0.99
  assert.throws(() => validateKaplanMeier({ ...km, groups: [{ ...km.groups[0], survival: risingSurvival }] }), /non-increasing/i)
  assert.throws(() => validateKaplanMeier({ ...km, groups: [{ ...km.groups[0], censors: [] }] }), /censor/i)
})

test('ROC metrics and selected operating point derive from the plotted points', () => {
  const data = {
    selectedThreshold: 0.65,
    points: [
      { threshold: 1, falsePositiveRate: 0, sensitivity: 0 },
      { threshold: 0.8, falsePositiveRate: 0.1, sensitivity: 0.6 },
      { threshold: 0.65, falsePositiveRate: 0.2, sensitivity: 0.8 },
      { threshold: 0, falsePositiveRate: 1, sensitivity: 1 },
    ],
  }
  assert.deepEqual(rocMetrics(data), { auc: 0.82, threshold: 0.65, sensitivity: 0.8, specificity: 0.8 })
})

test('rejects malformed ROC, line, waterfall, and funnel data', () => {
  assert.throws(() => validateRocCurve({ selectedThreshold: 0.5, points: [] }), /points/i)
  assert.throws(() => validateRocCurve({ selectedThreshold: 0.5, points: [
    { threshold: 1, falsePositiveRate: 0, sensitivity: 0.5 },
    { threshold: 0.5, falsePositiveRate: 0.2, sensitivity: 0.4 },
  ] }), /non-decreasing/i)
  assert.throws(() => validateRocCurve({ selectedThreshold: 0.5, points: [
    { threshold: 0.5, falsePositiveRate: 0.2, sensitivity: 0.4 },
    { threshold: 0, falsePositiveRate: 1, sensitivity: 1 },
  ] }), /start at/i)
  assert.throws(() => validateLineChart({ labels: ['A'], values: [1, 2], domain: [0, 3] }), /same length/i)
  assert.throws(() => validateLineChart({ labels: ['A', 'B'], values: [1, 4], domain: [0, 3] }), /domain/i)
  assert.throws(() => validateWaterfall({ values: [], domain: [-1, 1], threshold: 0 }), /values/i)
  assert.throws(() => validateWaterfall({ values: [2], domain: [-1, 1], threshold: 0 }), /domain/i)
  assert.throws(() => validateWaterfall({ values: [2], domain: [1, 3], threshold: 2 }), /include zero/i)
  assert.throws(() => validateFunnel({ center: 0, xDomain: [-2, 2], yDomain: [0, 1], points: [[0.1, -0.2], [0.2, 0.3]] }), /standard error/i)
  assert.throws(() => validateFunnel({ center: 0, xDomain: [-2, 2], yDomain: [0.1, 1], points: [[0.1, 0.2], [0.2, 0.3]] }), /start at zero/i)
})

test('forest plot requires rows and a visible null and interval domain', () => {
  assert.throws(() => forestGeometry({ measure: 'risk-ratio', domain: [0.2, 2], rows: [] }), /one row/i)
  assert.throws(() => forestGeometry({ measure: 'risk-ratio', domain: [0.2, 0.9], rows: [
    { label: 'Study', estimate: 0.6, lower: 0.4, upper: 0.8 },
  ] }), /null value/i)
  assert.throws(() => forestGeometry({ measure: 'risk-ratio', domain: [0.5, 2], rows: [
    { label: 'Study', estimate: 0.8, lower: 0.4, upper: 1.2 },
  ] }), /confidence interval/i)
})

test('funnel boundaries derive from center and standard error', () => {
  const data = { center: 0, xDomain: [-1, 1], yDomain: [0, 0.3], points: [[-0.1, 0.1], [0.2, 0.2]] }
  const geometry = funnelGeometry(data)
  assert.equal(geometry.left.at(-1)[0], -0.588)
  assert.equal(geometry.right.at(-1)[0], 0.588)
})
