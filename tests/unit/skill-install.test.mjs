import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('installer copies a complete Skill directory and protects existing destinations', (t) => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'medical-slide-install-'))
  t.after(() => rmSync(temporaryRoot, { recursive: true, force: true }))
  const destination = join(temporaryRoot, 'medical-slide')
  const command = ['scripts/install-skill.mjs', '--dest', destination]
  const first = spawnSync(process.execPath, command, { encoding: 'utf8' })
  assert.equal(first.status, 0, first.stderr)
  for (const path of [
    'SKILL.md',
    'engine/slide.js',
    'engine/medical-math.js',
    'theme/components.css',
    'reference/medical-safety.md',
    'reference/workflow-recipes.md',
    'assets/svg-patterns/sequence.svg',
    'decks/medical-template-catalog/index.html',
    'scripts/serve.mjs',
    'scripts/scaffold-deck.mjs',
    'agents/openai.yaml',
  ]) assert.equal(existsSync(join(destination, path)), true, path)
  assert.equal(existsSync(join(destination, 'node_modules')), false)
  assert.equal(existsSync(join(destination, 'tests')), false)

  const protectedRun = spawnSync(process.execPath, command, { encoding: 'utf8' })
  assert.notEqual(protectedRun.status, 0)
  assert.match(protectedRun.stderr, /already exists/i)
  const forced = spawnSync(process.execPath, [...command, '--force'], { encoding: 'utf8' })
  assert.equal(forced.status, 0, forced.stderr)
})

test('deck scaffold creates a standalone local output contract', (t) => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'medical-slide-deck-'))
  t.after(() => rmSync(temporaryRoot, { recursive: true, force: true }))
  const destination = join(temporaryRoot, 'deck')
  const result = spawnSync(process.execPath, ['scripts/scaffold-deck.mjs', '--dest', destination, '--lang', 'en'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  for (const path of ['index.html', 'engine/slide.js', 'engine/medical-charts.js', 'theme/journal.css', 'assets/svg-patterns/evidence-map.svg', 'scripts/serve.mjs']) {
    assert.equal(existsSync(join(destination, path)), true, path)
  }
  const html = readFileSync(join(destination, 'index.html'), 'utf8')
  assert.match(html, /<html lang="en">/)
  assert.match(html, /Required information is unverified/)
  assert.doesNotMatch(html, /https?:\/\//)
})

test('installer refuses an empty destination', () => {
  const result = spawnSync(process.execPath, ['scripts/install-skill.mjs', '--dest'], { encoding: 'utf8' })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /non-empty/i)
})

test('Skill includes bilingual natural-language triggers and no legacy theme', () => {
  const skill = readFileSync('SKILL.md', 'utf8')
  for (const phrase of ['medical slide', 'journal club', 'case conference', 'research presentations', 'teaching lectures', '学会スライド', '抄読会']) {
    assert.match(skill.toLowerCase(), new RegExp(phrase.toLowerCase()))
  }
  assert.doesNotMatch(skill, /Clay|Kraft|Oat/)
  assert.ok(readFileSync('CLAUDE.md', 'utf8').length < skill.length / 4)
})
