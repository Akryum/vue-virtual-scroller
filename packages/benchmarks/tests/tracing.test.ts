import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SourceMapGenerator } from 'source-map-js'
import { describe, expect, it } from 'vitest'
import { intersectSamples, profileSamples } from '../scripts/tracing/profile-samples.mjs'
import { sourceResolver } from '../scripts/tracing/source-maps.mjs'
import { phaseSpans, rendererEvents, timelineEvents } from '../scripts/tracing/timeline-events.mjs'

// Preflight: parser receives authored CDP algorithms inputs; negative deltas, phase clipping,
// wrong renderer and omitted map chaining must change independently known results.
describe('diagnostic trace attribution', () => {
  it('sorts signed timestamps and partitions CPU time without negative or overlapping weights', () => {
    const profile = { startTime: 1000, endTime: 2000, nodes: [
      { id: 1, callFrame: { functionName: '(root)' }, children: [2, 3, 4] },
      { id: 2, callFrame: { functionName: 'A' } },
      { id: 3, callFrame: { functionName: '(idle)' } },
      { id: 4, callFrame: { functionName: 'C' } },
    ], samples: [2, 3, 4], timeDeltas: [300, -200, 500] }
    const samples = profileSamples(profile)
    expect(samples.map(sample => sample.timestamp)).toEqual([1100, 1300, 1600])
    expect(samples.map(sample => [sample.start, sample.end])).toEqual([[1000, 1200], [1200, 1450], [1450, 2000]])
    const clipped = intersectSamples(samples, { start: 1100, end: 1700 })
    expect(clipped.map(sample => sample.end - sample.start)).toEqual([100, 250, 250])
    expect(clipped.reduce((total, sample) => total + sample.end - sample.start, 0)).toBe(600)
  })

  it('rejects empty or incomplete CPU evidence rather than reporting an empty valid capture', () => {
    const profile = { startTime: 1000, endTime: 2000, nodes: [], samples: [], timeDeltas: [] }
    expect(() => profileSamples(profile)).toThrow('CPU profile contains no samples')
    expect(() => profileSamples({ ...profile, samples: [1] })).toThrow('CPU profile sample/delta lengths differ')
  })

  it('uses marked renderer and clips whole tasks crossing phase edges', () => {
    const trace = [
      { name: 'benchmark:0:resize:start', pid: 2, tid: 3, ts: 499000 },
      { name: 'benchmark:0:resize:end', pid: 2, tid: 3, ts: 504000 },
      { name: 'RunTask', ph: 'X', pid: 2, tid: 3, ts: 0, dur: 500000 },
      { name: 'Layout', ph: 'X', pid: 2, tid: 3, ts: 499500, dur: 600 },
      { name: 'RunTask', ph: 'X', pid: 99, tid: 99, ts: 499000, dur: 5000 },
    ]
    const spans = phaseSpans(trace)
    expect(spans).toEqual([{ phase: 'resize', start: 499000, end: 504000 }])
    expect(timelineEvents(rendererEvents(trace), spans[0])).toEqual([
      { name: 'RunTask', start: 499000, end: 500000, wholeTaskDuration: 500000 },
      { name: 'Layout', start: 499500, end: 500100, wholeTaskDuration: 600 },
    ])
    expect(() => rendererEvents([...trace, { name: 'benchmark:1:mount:start', pid: 9, tid: 9 }])).toThrow('Expected one marked renderer thread')
  })

  it('chains two distinct minified sites through captured library maps, keeping missing maps unmapped', () => {
    const directory = mkdtempSync(join(tmpdir(), 'vvs-trace-maps-'))
    try {
      mkdirSync(join(directory, 'app/assets'), { recursive: true })
      mkdirSync(join(directory, 'library/composables'), { recursive: true })
      const app = new SourceMapGenerator({ file: 'case.js' })
      const library = new SourceMapGenerator({ file: 'engine.js' })
      for (const [column, intermediate, original] of [[0, 2, 11], [8, 3, 29]]) {
        app.addMapping({ generated: { line: 1, column }, original: { line: intermediate, column: 0 }, source: '../../../vue-virtual-scroller/dist/composables/engine.js' })
        library.addMapping({ generated: { line: intermediate, column: 0 }, original: { line: original, column: 2 }, source: '../../src/composables/engine.ts' })
      }
      writeFileSync(join(directory, 'app/assets/case.js.map'), app.toString())
      writeFileSync(join(directory, 'library/composables/engine.js.map'), library.toString())
      const resolve = sourceResolver(join(directory, 'app'), join(directory, 'library'))
      const frame = { url: 'http://127.0.0.1/assets/case.js', lineNumber: 0, columnNumber: 0, functionName: 'a' }
      expect(resolve(frame)).toMatchObject({ source: 'packages/vue-virtual-scroller/src/composables/engine.ts', line: 11, column: 2, mapped: true })
      expect(resolve({ ...frame, columnNumber: 8 })).toMatchObject({ source: 'packages/vue-virtual-scroller/src/composables/engine.ts', line: 29, column: 2, mapped: true })
      expect(resolve({ ...frame, url: 'http://127.0.0.1/assets/missing.js' })).toMatchObject({ mapped: false, line: 1, source: 'http://127.0.0.1/assets/missing.js' })
    }
    finally { rmSync(directory, { recursive: true, force: true }) }
  })
})
