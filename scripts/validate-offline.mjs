import { readFileSync } from 'node:fs'

const input = process.argv[2]
if (!input) throw new Error('usage: node scripts/validate-offline.mjs <html>')
const html = readFileSync(input, 'utf8')
const withoutMetadata = html
  .replaceAll('http://www.w3.org/2000/svg', '')
  .replace(/<a\b[^>]*href=["']https?:\/\/[^>]+>/gi, '<a>')

const remoteRuntime = [...withoutMetadata.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)/gi)].map((match) => match[1])
if (remoteRuntime.length) throw new Error(`external runtime dependencies: ${remoteRuntime.join(', ')}`)
console.log(JSON.stringify({ input, offline: true, externalRuntimeDependencies: 0 }))
