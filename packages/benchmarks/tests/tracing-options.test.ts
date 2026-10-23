import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { runSuite } from '../scripts/runner.mjs'
import { traceOptions } from '../scripts/tracing/capture.mjs'

// Preflight: real options and runner entry reject unsupported tracing/mode selections before
// any output/server/browser acquisition; a typo must never yield an empty successful run.
describe('safe diagnostic selection', () => {
  it('defaults CDP tracing to Chromium and rejects Firefox explicitly', () => {
    expect(traceOptions(['--count', '30', '--trials', '1']).browser).toBe('chromium')
    expect(() => traceOptions(['--browser', 'firefox'])).toThrow('CDP tracing supports chromium only')
    expect(() => traceOptions(['--browser', 'all'])).toThrow('CDP tracing supports chromium only')
  })

  it('requires paired immutable artifact roots and rejects incomplete arguments', () => {
    expect(() => traceOptions(['--app-root', '/tmp/app'])).toThrow('Provide both --app-root and --library-root')
    expect(() => traceOptions(['--library-sha'])).toThrow('Incomplete option: --library-sha')
    expect(() => traceOptions(['--trials', '0'])).toThrow('Trials must be an integer')
  })

  it.each(['mystage', 'myapp-root'])('preserves common option value %s among tracing metadata', (output) => {
    const options = traceOptions([
      '--stage',
      'candidate',
      '--output',
      output,
      '--count',
      '30',
      '--app-root',
      'fixtures/app',
      '--library-sha',
      'library-revision',
      '--trials',
      '1',
      '--library-root',
      'fixtures/library',
      '--headed',
      '--harness-sha',
      'harness-revision',
    ])
    const root = resolve(import.meta.dirname, '../../..')
    expect(options).toMatchObject({
      output: resolve(root, output),
      appRoot: resolve(root, 'fixtures/app'),
      libraryRoot: resolve(root, 'fixtures/library'),
      stage: 'candidate',
      librarySha: 'library-revision',
      harnessSha: 'harness-revision',
      counts: [30],
      trials: 1,
      headed: true,
    })
  })

  it.each(['--constructor', '--toString', '--__proto__', 'xxstage'])('rejects unregistered option %s', (argument) => {
    expect(() => traceOptions([argument, 'ignored'])).toThrow(`Unknown or incomplete option: ${argument}`)
  })

  it.each([['--count', '30'], ['--output', 'output']])('does not borrow a later value for %s', (argument, value) => {
    expect(() => traceOptions([argument, '--stage', 'candidate', value])).toThrow(`Unknown or incomplete option: ${argument}`)
  })

  it('preserves valueless common flags, separators and single-dash operands', () => {
    expect(traceOptions(['--', '--headed', '--stage', 'candidate', '--count', '30', '--output', '-output'])).toMatchObject({
      headed: true,
      stage: 'candidate',
      counts: [30],
      output: resolve(import.meta.dirname, '../../../-output'),
    })
    expect(() => traceOptions(['--count', '-1', '--stage', 'candidate'])).toThrow('Count must be an integer from 30 to 100000')
  })

  it('rejects invalid CLI input before builds or artifact allocation', () => {
    const directory = mkdtempSync(join(tmpdir(), 'vvs-invalid-trace-cli-'))
    const output = join(directory, 'unallocated')
    try {
      // Firefox is an additional safety guard: even a broken unknown-option parser
      // must fail before builds, rather than start a default trace during this test.
      const command = spawnSync(process.execPath, [
        resolve(import.meta.dirname, '../scripts/tracing/entry.mjs'),
        '--constructor',
        'ignored',
        '--browser',
        'firefox',
        '--output',
        output,
      ], { encoding: 'utf8', timeout: 10000 })
      expect(command.error).toBeUndefined()
      expect(command.status).toBe(1)
      expect(command.stderr.trim()).toBe('Unknown or incomplete option: --constructor')
      expect(command.stdout).toBe('')
      expect(existsSync(output)).toBe(false)
    }
    finally { rmSync(directory, { recursive: true, force: true }) }
  })

  it('rejects empty, duplicate or unknown modes without producing artifacts', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'vvs-invalid-modes-'))
    const output = join(directory, 'unallocated')
    try {
      for (const modes of [[], ['virtual', 'virtual'], ['virutal']]) {
        await expect(runSuite({ ...traceOptions(['--output', output]), modes })).rejects.toThrow('Diagnostic modes must be a nonempty unique subset of virtual/plain')
        expect(existsSync(output)).toBe(false)
      }
    }
    finally { rmSync(directory, { recursive: true, force: true }) }
  })
})
