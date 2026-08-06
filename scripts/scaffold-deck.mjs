import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const valueFor = (flag) => {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : ''
}
const destinationInput = valueFor('--dest')
const language = valueFor('--lang') || 'ja'
const force = args.includes('--force')
if (!destinationInput || destinationInput.startsWith('--')) throw new Error('An explicit non-empty --dest path is required')
if (!['ja', 'en'].includes(language)) throw new Error('--lang must be ja or en')

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destination = resolve(destinationInput)
if (destination === '/' || destination === source || source.startsWith(`${destination}/`)) throw new Error('Refusing unsafe destination')
if (existsSync(destination) && !force) throw new Error(`Destination already exists: ${destination}. Use --force to replace it.`)
if (existsSync(destination)) rmSync(destination, { recursive: true, force: false })
mkdirSync(destination, { recursive: true })

for (const entry of ['engine', 'theme', 'assets/svg-patterns', 'scripts/serve.mjs', 'LICENSE']) {
  cpSync(resolve(source, entry), resolve(destination, entry), { recursive: true })
}

const title = language === 'ja' ? 'タイトル未入力' : 'Title not provided'
const unresolved = language === 'ja' ? '必須情報は未確認です。最終出力ではありません。' : 'Required information is unverified. This is not a final export.'
writeFileSync(resolve(destination, 'index.html'), `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="engine/slide.css">
  <link rel="stylesheet" href="theme/journal.css">
  <link rel="stylesheet" href="theme/components.css">
</head>
<body>
  <main class="deck">
    <section class="slide slide-title">
      <p class="label">REVIEW DRAFT</p>
      <h1>${title}</h1>
      <p class="sub">${unresolved}</p>
    </section>
  </main>
  <script src="engine/slide.js"></script>
</body>
</html>
`)
console.log(JSON.stringify({ created: destination, entry: resolve(destination, 'index.html'), language }))
