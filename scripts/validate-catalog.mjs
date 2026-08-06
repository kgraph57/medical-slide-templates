import { readFileSync } from 'node:fs'
import { auditCatalog } from './lib/catalog-audit.mjs'

const catalogPath = process.argv[2] ?? 'decks/medical-template-catalog/index.html'
const findings = auditCatalog(readFileSync(catalogPath, 'utf8'))

if (findings.length > 0) {
  console.error(JSON.stringify({ catalogPath, findings }, null, 2))
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ catalogPath, blockerCount: 0 }))
}

