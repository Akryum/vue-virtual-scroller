import { describe, expect, it } from 'vitest'
import { aggregate, diagnostics, markdown, percentile, validateReport } from '../reports/summary.mjs'

/** Minimal public report sample; each duration has an independently known value. */
function sample(mode: string, duration: number, overrides = {}) {
  return { browser: 'chromium', workload: 'issue-inbox', count: 1000, mode, pair: 0, valid: true, warmup: false, phases: { mount: duration }, frames: [], checkpoints: [], ...overrides }
}

describe('honest benchmark reports', () => {
  it('calculates nearest-rank percentiles from known samples', () => {
    expect(percentile([8, 2, 4, 6], 50)).toBe(4)
    expect(percentile([8, 2, 4, 6], 95)).toBe(8)
    expect(percentile([], 50)).toBeNull()
  })
  it('excludes failed trials and warmups and pairs only successful samples', () => {
    const rows = [sample('virtual', 2), sample('plain', 8), sample('virtual', 999, { valid: false, pair: 1 }), sample('plain', 10, { pair: 1 }), sample('virtual', 1000, { warmup: true }), sample('plain', 0, { pair: 2 })]
    const report = aggregate(rows)
    const virtual = report.find(row => row.mode === 'virtual')!
    expect(virtual.median).toBe(2)
    expect(virtual.valid).toBe(1)
    expect(virtual.invalid).toBe(1)
    expect(virtual.pairedRatios).toEqual([4])
    expect(markdown({ schemaVersion: 1, status: 'partial', metadata: {}, trials: rows })).toContain('partial')
  })
  it('keeps frame and DOM summaries separate and excludes failed evidence', () => {
    const rows = [sample('virtual', 2, { frames: [10, 20, 60], scroll: { p95: 60, intervalsOver50ms: 1 }, checkpoints: [{ rendered: 12, elements: 200 }, { rendered: 18, elements: 280 }] }), sample('virtual', 3, { valid: false, frames: [999], checkpoints: [{ rendered: 1000, elements: 9000 }] }), sample('plain', 8, { frames: [15, 25], checkpoints: [{ rendered: 1000, elements: 12000 }] })]
    const summary = diagnostics(rows)
    expect(summary.find(row => row.mode === 'virtual')).toMatchObject({ p50: 20, p95: 60, maxRecords: 18, maxElements: 280, medianStalls: 1 })
    expect(summary.find(row => row.mode === 'plain')).toMatchObject({ p95: 25, maxRecords: 1000 })
  })
  it('rejects malformed nested samples before results renderer consumes them', () => {
    const base = { schemaVersion: 1, status: 'complete', metadata: {}, trials: [sample('virtual', 2)] }
    for (const fields of [{ frames: 'invalid' }, { frames: [Number.NaN] }, { checkpoints: [null] }, { checkpoints: [{ rendered: 'many', elements: 20 }] }, { scroll: { p95: 'slow' } }]) {
      expect(() => validateReport({ ...base, trials: [{ ...base.trials[0], ...fields }] })).toThrow('Invalid benchmark report')
    }
  })
  it('rejects malformed imported reports', () => {
    expect(() => validateReport({ schemaVersion: 4, trials: [] })).toThrow()
    expect(() => validateReport({ schemaVersion: 1, trials: [{}] })).toThrow()
  })
})
