/** Nearest-rank percentile; null means no valid samples. */
export function percentile(values, percent) {
  if (!values.length)
    return null
  const sorted = values.toSorted((a, b) => a - b)
  return sorted[Math.max(0, Math.ceil(percent / 100 * sorted.length) - 1)]
}
/** Group by engine, workload, size, mode, and operation, preserving failures. */
export function aggregate(trials) {
  const groups = new Map()
  for (const trial of trials.filter(item => !item.warmup)) {
    for (const phase of Object.keys(trial.phases)) {
      const key = [trial.browser, trial.workload, trial.count, trial.mode, phase].join(':')
      if (!groups.has(key)) {
        groups.set(key, { browser: trial.browser, workload: trial.workload, count: trial.actualCount ?? trial.count, mode: trial.mode, phase, values: [], valid: 0, invalid: 0, pairedRatios: [] })
      }
      const group = groups.get(key)
      if (!trial.valid) {
        group.invalid++
        continue
      }
      group.valid++
      group.values.push(trial.phases[phase])
      if (trial.mode === 'virtual' && trial.phases[phase] > 0) {
        const peer = trials.find(other => !other.warmup && other.valid && other.mode === 'plain'
          && other.browser === trial.browser && other.workload === trial.workload
          && other.count === trial.count && other.pair === trial.pair && other.phases[phase] > 0)
        if (peer)
          group.pairedRatios.push(peer.phases[phase] / trial.phases[phase])
      }
    }
  }
  return Array.from(groups.values(), group => ({ ...group, median: percentile(group.values, 50), min: group.values.length ? Math.min(...group.values) : null, max: group.values.length ? Math.max(...group.values) : null }))
}
/** Frame distributions and DOM maxima stay separate for every workload/engine/size/mode. */
export function diagnostics(trials) {
  const groups = new Map()
  for (const trial of trials.filter(item => item.valid && !item.warmup)) {
    const key = [trial.browser, trial.workload, trial.count, trial.mode].join(':')
    if (!groups.has(key)) {
      groups.set(key, { browser: trial.browser, workload: trial.workload, count: trial.actualCount ?? trial.count, mode: trial.mode, frames: [], p95s: [], stalls: [], records: [], elements: [] })
    }
    const group = groups.get(key)
    group.frames.push(...(trial.frames ?? []))
    if (trial.scroll?.p95 != null)
      group.p95s.push(trial.scroll.p95)
    if (trial.scroll?.intervalsOver50ms != null)
      group.stalls.push(trial.scroll.intervalsOver50ms)
    for (const checkpoint of trial.checkpoints ?? []) {
      group.records.push(checkpoint.rendered)
      group.elements.push(checkpoint.elements)
    }
  }
  return Array.from(groups.values(), group => ({ ...group, p50: percentile(group.frames, 50), p95: percentile(group.frames, 95), medianTrialP95: percentile(group.p95s, 50), medianStalls: percentile(group.stalls, 50), maxRecords: group.records.length ? Math.max(...group.records) : null, maxElements: group.elements.length ? Math.max(...group.elements) : null }))
}
/** Plain JSON objects are required before inspecting nested report properties. */
function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
/** Reject nonnumeric samples rather than allowing formatters or statistics to crash. */
function sample(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}
/** Check every nested field consumed by either result renderer. */
function validTrial(trial) {
  if (!object(trial) || !['virtual', 'plain'].includes(trial.mode)
    || typeof trial.browser !== 'string' || typeof trial.workload !== 'string'
    || !sample(trial.count) || typeof trial.valid !== 'boolean' || !object(trial.phases)
    || Object.values(trial.phases).some(value => !sample(value))) {
    return false
  }
  if (trial.frames != null && (!Array.isArray(trial.frames) || trial.frames.some(value => !sample(value))))
    return false
  if (trial.checkpoints != null && (!Array.isArray(trial.checkpoints)
    || trial.checkpoints.some(point => !object(point) || !sample(point.rendered) || !sample(point.elements)))) {
    return false
  }
  if (trial.scroll != null && (!object(trial.scroll)
    || [trial.scroll.p95, trial.scroll.intervalsOver50ms].some(value => value != null && !sample(value)))) {
    return false
  }
  return true
}
/** Validate imported artifacts before using nested data in UI. */
export function validateReport(report) {
  if (!object(report) || report.schemaVersion !== 1 || !['complete', 'partial', 'cancelled'].includes(report.status)
    || !object(report.metadata) || !Array.isArray(report.trials) || report.trials.some(trial => !validTrial(trial))) {
    throw new Error('Invalid benchmark report (expected schemaVersion 1)')
  }
  return report
}
/** Render portable Markdown; no HTML or combined cross-engine score. */
export function markdown(report) {
  const lines = ['# Vue Virtual Scroller benchmark', '', `Status: ${report.status}`, '', `Trials: ${report.trials.filter(trial => !trial.warmup && trial.valid).length} valid, ${report.trials.filter(trial => !trial.warmup && !trial.valid).length} invalid; ${report.trials.filter(trial => trial.warmup).length} excluded warm-ups.`, '', 'Durations: time to settled render. Scroll: scripted requestAnimationFrame cadence, not input latency or compositor FPS.', '', '## Environment', '', '```json', JSON.stringify(report.metadata, null, 2), '```', '', '## Results', '', '| Browser | Workload | Count | Mode | Phase | Valid/invalid | Median ms | Range ms | Plain/virtual |', '| --- | --- | ---: | --- | --- | --- | ---: | --- | ---: |']
  for (const row of aggregate(report.trials)) {
    const format = value => value == null ? '—' : value.toFixed(2)
    lines.push(`| ${row.browser} | ${row.workload} | ${row.count} | ${row.mode} | ${row.phase} | ${row.valid}/${row.invalid} | ${format(row.median)} | ${format(row.min)}–${format(row.max)} | ${format(percentile(row.pairedRatios, 50))} |`)
  }
  lines.push('', '## Scripted scroll and DOM', '', '| Browser | Workload | Items/cells | Mode | P50 / P95 interval ms | Median trial P95 ms | Median stalls >50ms | Max mounted records | Max elements |', '| --- | --- | ---: | --- | --- | ---: | ---: | ---: | ---: |')
  const format = value => value == null ? '—' : value.toFixed(2)
  for (const row of diagnostics(report.trials)) {
    lines.push(`| ${row.browser} | ${row.workload} | ${row.count} | ${row.mode} | ${format(row.p50)} / ${format(row.p95)} | ${format(row.medianTrialP95)} | ${format(row.medianStalls)} | ${row.maxRecords ?? '—'} | ${row.maxElements ?? '—'} |`)
  }
  for (const trial of report.trials.filter(item => !item.valid)) lines.push('', `Failure: ${trial.browser}/${trial.workload}/${trial.mode}: ${trial.error}`)
  lines.push('', 'Raw per-trial frame intervals, frame summaries, DOM checkpoints, trial order, and correctness evidence: report.json.', '')
  return lines.join('\n')
}
