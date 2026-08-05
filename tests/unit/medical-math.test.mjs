import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  diagnosticMetrics,
  nullValueFor,
  numberNeededToHarm,
  numberNeededToTreat,
  validateEstimate,
  validateFlow,
} from '../../engine/medical-math.js'

const fixtures = JSON.parse(readFileSync('tests/fixtures/medical-math-cases.json', 'utf8'))

test('calculates ARR and rounds NNT away from zero', () => {
  const result = numberNeededToTreat(fixtures.nnt)
  assert.deepEqual(result, { absoluteRiskReduction: 0.047, nnt: 22 })
})

test('does not label a benefit as NNH', () => {
  assert.throws(
    () => numberNeededToHarm({ controlRisk: 0.124, treatmentRisk: 0.077 }),
    /higher harmful-event risk/,
  )
})

test('calculates metrics from one 2x2 table', () => {
  assert.deepEqual(diagnosticMetrics(fixtures.diagnostic.input), fixtures.diagnostic.expected)
})

test('validates randomized-study and systematic-review flow totals', () => {
  assert.equal(validateFlow({ total: 120, excluded: 20, included: 100, groups: [52, 48] }), true)
  assert.throws(
    () => validateFlow({ total: 120, excluded: 20, included: 99, groups: [52, 48] }),
    /total minus excluded/,
  )
  assert.throws(
    () => validateFlow({ total: 120, excluded: 20, included: 100, groups: [51, 48] }),
    /group total/,
  )
})

test('validates estimates and measure-specific nulls', () => {
  assert.equal(validateEstimate({ measure: 'risk-ratio', estimate: 0.8, lower: 0.6, upper: 1.1 }), true)
  assert.equal(nullValueFor('risk-ratio'), 1)
  assert.equal(nullValueFor('odds-ratio'), 1)
  assert.equal(nullValueFor('hazard-ratio'), 1)
  assert.equal(nullValueFor('mean-difference'), 0)
})

test('rejects ambiguous percentages, invalid counts, and malformed intervals', () => {
  for (const input of fixtures.malformedRisks) {
    assert.throws(() => numberNeededToTreat(input))
  }
  for (const input of fixtures.malformedCounts) {
    assert.throws(() => diagnosticMetrics(input))
  }
  for (const input of fixtures.malformedEstimates) {
    assert.throws(() => validateEstimate(input))
  }
})

