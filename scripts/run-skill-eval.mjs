import { existsSync, readFileSync } from 'node:fs'

const cases = JSON.parse(readFileSync('tests/evals/cases.json', 'utf8'))
const skill = readFileSync('SKILL.md', 'utf8').toLowerCase()
if (!Array.isArray(cases) || cases.length < 6) throw new Error('at least six eval cases are required')

const ids = new Set()
for (const item of cases) {
  if (!item.id || ids.has(item.id)) throw new Error(`missing or duplicate eval id: ${item.id}`)
  ids.add(item.id)
  if (!item.prompt || !Array.isArray(item.must) || item.must.length < 3) throw new Error(`incomplete eval case: ${item.id}`)
}

for (const phrase of [
  'patient-identifying information',
  'citation',
  'drug, dose',
  'flow total',
  'bilingual',
  'offline',
  'do not publish',
  'do not carry catalog claims',
]) {
  if (!skill.includes(phrase)) throw new Error(`Skill does not cover eval guardrail: ${phrase}`)
}

const liveRecord = 'tests/evals/live-eval-2026-08-04.md'
if (!existsSync(liveRecord) || !/Total cases: 4\/4 passed/.test(readFileSync(liveRecord, 'utf8'))) {
  throw new Error('live Skill behavior-gate record is missing or incomplete')
}
const liveResult = JSON.parse(readFileSync('tests/evals/results/live-2026-08-04.json', 'utf8'))
for (const key of ['date', 'runtime', 'model', 'reviewer', 'command', 'schemaValidated', 'cases']) {
  if (!(key in liveResult)) throw new Error(`live eval missing ${key}`)
}
if (liveResult.schemaValidated !== true || liveResult.externalSearchRequests !== 0 || liveResult.cases.length !== 4) {
  throw new Error('live eval metadata is incomplete')
}
for (const result of liveResult.cases) {
  if (!result.rawPrompt || !result.expectedAction || !result.rawResponse?.action || result.rawResponse.action !== result.expectedAction) {
    throw new Error(`live eval action mismatch: ${result.id}`)
  }
  if (!result.passed || !Object.values(result.rubric ?? {}).every((score) => score === 2)) {
    throw new Error(`live eval rubric failed: ${result.id}`)
  }
}
console.log(JSON.stringify({ cases: cases.length, schema: 'valid', instructionCoverage: 'present', modelExecution: `recorded-${liveResult.cases.length}-cases` }))
