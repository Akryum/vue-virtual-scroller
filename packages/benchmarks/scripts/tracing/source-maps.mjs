import { readFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, normalize, relative, resolve } from 'node:path'
import { SourceMapConsumer } from 'source-map-js'

/** Resolve only captured maps, never mutable checkout output. Source location outranks names. */
export function sourceResolver(appRoot, libraryRoot) {
  const consumers = new Map()
  const cache = new Map()
  const consumer = (file) => {
    if (!consumers.has(file)) {
      try {
        consumers.set(file, new SourceMapConsumer(JSON.parse(readFileSync(file, 'utf8'))))
      }
      catch { consumers.set(file, undefined) }
    }
    return consumers.get(file)
  }
  return (frame) => {
    const key = JSON.stringify(frame)
    if (cache.has(key))
      return cache.get(key)
    let source = frame.url || '(native)'
    let line = frame.lineNumber + 1
    let column = frame.columnNumber
    let name = frame.functionName || '(anonymous)'
    let mapped = false
    let logicalFile = `packages/benchmarks/dist/assets/${basename(source)}`
    let map = source.includes('/assets/') ? resolve(appRoot, 'assets', `${basename(source)}.map`) : undefined
    for (let depth = 0; map && depth < 3; depth++) {
      const position = consumer(map)?.originalPositionFor({ line, column })
      if (!position?.source)
        break
      source = normalize(`${dirname(logicalFile)}/${position.source}`)
      line = position.line
      column = position.column
      name = position.name || name
      mapped = true
      logicalFile = source
      const suffix = source.split('vue-virtual-scroller/dist/')[1]
      const next = suffix && libraryRoot ? resolve(libraryRoot, `${suffix}.map`) : undefined
      const path = next ? relative(libraryRoot, next) : undefined
      map = path && !path.startsWith('..') && !isAbsolute(path) ? next : undefined
    }
    const result = { name, source, line, column, mapped, nameOrigin: 'CDP or source-map token; not inferred declaration', key: `${name} @ ${source}:${line}:${column}` }
    cache.set(key, result)
    return result
  }
}
