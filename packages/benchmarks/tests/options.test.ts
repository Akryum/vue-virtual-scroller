import { describe, expect, it } from 'vitest'
import { parseOptions } from '../scripts/options.mjs'

describe('benchmark CLI configuration', () => {
  it('provides agreed profiles and explicit overrides', () => {
    expect(parseOptions([], '/tmp')).toMatchObject({ counts: [1000], trials: 5, browser: 'all', seed: 2026 })
    expect(parseOptions(['--profile', 'full'], '/tmp')).toMatchObject({ counts: [1000, 10000], trials: 10 })
    expect(parseOptions(['--profile', 'stress', '--count', '60', '--trials', '1'], '/tmp')).toMatchObject({ counts: [60], trials: 1 })
  })
  for (const args of [['--browser', 'safari'], ['--count', 'NaN'], ['--count', '0'], ['--trials', '1.5'], ['--seed', '-1'], ['--workload', 'unknown'], ['--output'], ['--unknown']]) {
    it(`rejects ${args.join(' ')} before side effects`, () => expect(() => parseOptions(args, '/tmp')).toThrow())
  }
})
