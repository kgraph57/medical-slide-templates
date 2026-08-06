import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const destinationIndex = args.indexOf('--dest')
const destinationInput = destinationIndex >= 0 ? args[destinationIndex + 1] : ''
const force = args.includes('--force')

if (!destinationInput || destinationInput.startsWith('--')) {
  throw new Error('An explicit non-empty --dest path is required')
}

const destination = resolve(destinationInput)
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..')
if (!isAbsolute(destination) || destination === '/' || destination === source || source.startsWith(`${destination}/`)) {
  throw new Error('Refusing unsafe destination')
}
if (existsSync(destination) && !force) throw new Error(`Destination already exists: ${destination}. Use --force to replace it.`)
if (existsSync(destination)) rmSync(destination, { recursive: true, force: false })
mkdirSync(destination, { recursive: true })

for (const entry of ['SKILL.md', 'CLAUDE.md', 'LICENSE', 'agents', 'engine', 'theme', 'reference', 'assets/svg-patterns', 'decks/medical-template-catalog', 'scripts/serve.mjs', 'scripts/scaffold-deck.mjs']) {
  cpSync(resolve(source, entry), resolve(destination, entry), { recursive: true })
}

console.log(JSON.stringify({ installed: destination, skill: 'medical-slide' }))
