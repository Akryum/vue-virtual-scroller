import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', svg: 'image/svg+xml', json: 'application/json', png: 'image/png' }

/** Serve production artifacts without libraries installing competing process-exit handlers. */
export async function startServer(appRoot) {
  const root = resolve(appRoot ?? fileURLToPath(new URL('../dist/', import.meta.url)))
  const server = createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }
    let pathname
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname)
    }
    catch {
      response.writeHead(400).end()
      return
    }
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`)
    const path = relative(root, file)
    if (path.startsWith('..') || isAbsolute(path)) {
      response.writeHead(403).end()
      return
    }
    try {
      const body = await readFile(file)
      response.writeHead(200, { 'Content-Type': TYPES[file.split('.').at(-1)] ?? 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' })
      response.end(request.method === 'HEAD' ? undefined : body)
    }
    catch { response.writeHead(404).end('Not found') }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Benchmark server has no TCP address')
  return { url: `http://127.0.0.1:${address.port}`, close: () => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
    server.closeAllConnections()
  }) }
}
