const RATIO_MEASURES = new Set(['risk-ratio', 'odds-ratio', 'hazard-ratio', 'rate-ratio'])
const DIFFERENCE_MEASURES = new Set(['risk-difference', 'mean-difference', 'standardized-mean-difference'])

function round(value, digits = 12) {
  return Number(value.toFixed(digits))
}

function requireFinite(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`)
  }
  return value
}

function requireProbability(value, label) {
  requireFinite(value, label)
  if (value < 0 || value > 1) {
    throw new RangeError(`${label} must be a proportion from 0 to 1; percentages must be converted explicitly`)
  }
  return value
}

function requireCount(value, label) {
  requireFinite(value, label)
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative safe integer`)
  }
  return value
}

function safeRatio(numerator, denominator, label) {
  if (denominator === 0) throw new RangeError(`${label} is undefined because its denominator is zero`)
  return round(numerator / denominator)
}

export function numberNeededToTreat({ controlRisk, treatmentRisk }) {
  requireProbability(controlRisk, 'controlRisk')
  requireProbability(treatmentRisk, 'treatmentRisk')
  const absoluteRiskReduction = round(controlRisk - treatmentRisk)
  if (absoluteRiskReduction <= 0) {
    throw new RangeError('NNT requires a lower harmful-event risk in the treatment group')
  }
  return {
    absoluteRiskReduction,
    nnt: Math.ceil(1 / absoluteRiskReduction),
  }
}

export function numberNeededToHarm({ controlRisk, treatmentRisk }) {
  requireProbability(controlRisk, 'controlRisk')
  requireProbability(treatmentRisk, 'treatmentRisk')
  const absoluteRiskIncrease = round(treatmentRisk - controlRisk)
  if (absoluteRiskIncrease <= 0) {
    throw new RangeError('NNH requires a higher harmful-event risk in the treatment group')
  }
  return {
    absoluteRiskIncrease,
    nnh: Math.ceil(1 / absoluteRiskIncrease),
  }
}

export function diagnosticMetrics({ truePositive, falsePositive, trueNegative, falseNegative }) {
  const tp = requireCount(truePositive, 'truePositive')
  const fp = requireCount(falsePositive, 'falsePositive')
  const tn = requireCount(trueNegative, 'trueNegative')
  const fn = requireCount(falseNegative, 'falseNegative')
  return {
    sensitivity: safeRatio(tp, tp + fn, 'sensitivity'),
    specificity: safeRatio(tn, tn + fp, 'specificity'),
    positivePredictiveValue: safeRatio(tp, tp + fp, 'positivePredictiveValue'),
    negativePredictiveValue: safeRatio(tn, tn + fn, 'negativePredictiveValue'),
  }
}

export function validateFlow({ total, excluded, included, groups = [] }) {
  const start = requireCount(total, 'total')
  const removed = requireCount(excluded, 'excluded')
  const retained = requireCount(included, 'included')
  if (start - removed !== retained) {
    throw new RangeError('included must equal total minus excluded')
  }
  if (!Array.isArray(groups)) throw new TypeError('groups must be an array of counts')
  if (groups.length > 0) {
    const groupTotal = groups.reduce((sum, value, index) => sum + requireCount(value, `groups[${index}]`), 0)
    if (groupTotal !== retained) throw new RangeError('group total must equal included')
  }
  return true
}

export function nullValueFor(measure) {
  if (RATIO_MEASURES.has(measure)) return 1
  if (DIFFERENCE_MEASURES.has(measure)) return 0
  throw new RangeError(`unsupported effect measure: ${measure}`)
}

export function validateEstimate({ measure, estimate, lower, upper }) {
  const point = requireFinite(estimate, 'estimate')
  const low = requireFinite(lower, 'lower')
  const high = requireFinite(upper, 'upper')
  nullValueFor(measure)
  if (low > high) throw new RangeError('lower confidence limit must not exceed upper confidence limit')
  if (point < low || point > high) throw new RangeError('point estimate must lie within its confidence interval')
  if (RATIO_MEASURES.has(measure) && (point <= 0 || low <= 0 || high <= 0)) {
    throw new RangeError('ratio estimates and confidence limits must be positive')
  }
  return true
}
