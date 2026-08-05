import { existsSync, readFileSync } from 'node:fs'

const skill = readFileSync('SKILL.md', 'utf8')
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/)
if (!frontmatter) throw new Error('SKILL.md requires YAML frontmatter')

const entries = frontmatter[1]
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split(/:\s+/, 2))
const keys = entries.map(([key]) => key)
if (keys.join(',') !== 'name,description') throw new Error('frontmatter must contain only name and description')

const values = Object.fromEntries(entries)
if (!/^[a-z0-9-]{1,64}$/.test(values.name)) throw new Error('skill name must be lowercase hyphen-case and at most 64 characters')
if (!values.description || values.description.length > 1024) throw new Error('skill description must be 1-1024 characters')

for (const requiredPath of [
  'engine/slide.css',
  'engine/slide.js',
  'engine/medical-math.js',
  'theme/journal.css',
  'reference/medical-safety.md',
  'reference/presentation-patterns.md',
  'reference/workflow-recipes.md',
  'reference/component-contracts.md',
  'reference/bilingual-style.md',
  'assets/svg-patterns/sequence.svg',
]) {
  if (!existsSync(requiredPath)) throw new Error(`missing Skill dependency: ${requiredPath}`)
}

console.log(JSON.stringify({ skill: values.name, valid: true }))
