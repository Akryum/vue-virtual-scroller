/** Require phase marks on exactly one renderer thread; never guess from global event names. */
export function rendererEvents(trace) {
  const marks = trace.filter(event => event.name?.startsWith('benchmark:'))
  const owners = new Set(marks.map(event => `${event.pid}:${event.tid}`))
  if (owners.size !== 1)
    throw new Error(`Expected one marked renderer thread; found ${owners.size}`)
  const owner = marks[0]
  return trace.filter(event => event.pid === owner.pid && event.tid === owner.tid && event.ph === 'X' && Number.isFinite(event.dur))
}

/** Clip engine work to measured window; retain whole-task duration separately. */
export function timelineEvents(events, span) {
  return events.filter(event => event.ts < span.end && event.ts + event.dur > span.start).map(event => ({
    name: event.name,
    start: Math.max(event.ts, span.start),
    end: Math.min(event.ts + event.dur, span.end),
    wholeTaskDuration: event.dur,
  }))
}

/** Convert unique indexed User Timing marks into Chrome-clock phase windows. */
export function phaseSpans(events) {
  const starts = new Map()
  const spans = []
  for (const event of events.filter(event => event.name?.startsWith('benchmark:'))) {
    const [, index, phase, edge] = event.name.split(':')
    if (edge === 'start')
      starts.set(index, { phase, start: event.ts })
    else if (starts.has(index))
      spans.push({ ...starts.get(index), end: event.ts })
  }
  return spans
}
