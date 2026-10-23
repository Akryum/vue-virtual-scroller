import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { intersectSamples, profileSamples } from './profile-samples.mjs'
import { sourceResolver } from './source-maps.mjs'
import { phaseSpans, rendererEvents, timelineEvents } from './timeline-events.mjs'

/** Attribute sample weights and engine intervals independently; inclusive rows overlap. */
export function summarizePhase(samples, events, span) {
  const self = new Map()
  const inclusive = new Map()
  const symbols = []
  const indices = new Map()
  const flame = intersectSamples(samples, span).map((sample) => {
    const duration = (sample.end - sample.start) / 1000
    const leaf = sample.stack.at(-1)
    if (leaf)
      self.set(leaf.key, (self.get(leaf.key) ?? 0) + duration)
    for (const key of new Set(sample.stack.map(frame => frame.key)))
      inclusive.set(key, (inclusive.get(key) ?? 0) + duration)
    const stack = sample.stack.map((frame) => {
      if (!indices.has(frame.key)) {
        indices.set(frame.key, symbols.length)
        symbols.push(frame)
      }
      return indices.get(frame.key)
    })
    return { start: (sample.start - span.start) / 1000, end: (sample.end - span.start) / 1000, stack }
  })
  const top = values => Array.from(values, ([symbol, ms]) => ({ symbol, ms })).sort((a, b) => b.ms - a.ms)
  const timeline = timelineEvents(events, span).map(event => ({ ...event, start: (event.start - span.start) / 1000, end: (event.end - span.start) / 1000, wholeTaskDuration: event.wholeTaskDuration / 1000 }))
  return { phase: span.phase, duration: (span.end - span.start) / 1000, symbols, flame, topSelf: top(self), topInclusive: top(inclusive), timeline }
}

/** Analyze only captured assets and raw evidence; no reads from mutable dist. */
export async function summarizeCapture(output, id) {
  const profile = JSON.parse(await readFile(join(output, `${id}.cpuprofile`), 'utf8'))
  const trace = JSON.parse(await readFile(join(output, `${id}.trace.json`), 'utf8')).traceEvents
  const result = JSON.parse(await readFile(join(output, `${id}.result.json`), 'utf8'))
  const samples = profileSamples(profile, sourceResolver(join(output, 'app'), join(output, 'library')))
  const events = rendererEvents(trace)
  const summary = { id, valid: result.valid, config: { workload: result.workload, mode: result.mode, count: result.count }, reorderedDeltas: profile.timeDeltas.filter(delta => delta < 0).length, phases: phaseSpans(trace).map(span => summarizePhase(samples, events, span)) }
  await writeFile(join(output, `${id}.analysis.json`), JSON.stringify(summary))
  return summary
}
