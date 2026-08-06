import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const args = process.argv.slice(2)
const rootIndex = args.indexOf('--root')
const portIndex = args.indexOf('--port')
const root = resolve(rootIndex >= 0 ? args[rootIndex + 1] : '.')
const port = Number(portIndex >= 0 ? args[portIndex + 1] : 4173)
if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`Invalid --root directory: ${root}`)
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Port must be an integer from 1024 to 65535')

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
  const requested = resolve(root, `.${pathname === '/' ? '/decks/medical-template-catalog/index.html' : pathname}`)
  if (requested !== root && !requested.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end('Forbidden')
    return
  }
  if (!existsSync(requested) || !statSync(requested).isFile()) {
    response.writeHead(404).end('Not found')
    return
  }
  response.writeHead(200, { 'Content-Type': types[extname(requested)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
  createReadStream(requested).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Medical Slide preview: http://127.0.0.1:${port}/`)
})
