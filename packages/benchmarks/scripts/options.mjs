import { resolve } from 'node:path'
import process from 'node:process'
import { WORKLOADS } from '../workloads/registry.ts'

/** Parse user intent once, before builds, browser launch, or server allocation. */
export function parseOptions(args, cwd = process.cwd()) {
  const options = { profile: 'quick', browser: 'all', workload: 'all', seed: 2026, headed: false, count: undefined, trials: undefined, output: undefined }
  const numbers = new Set(['count', 'trials', 'seed'])
  for (let index = 0; index < args.length; index++) {
    const argument = args[index]
    if (argument === '--')
      continue
    if (argument === '--headed') {
      options.headed = true
      continue
    }
    const name = argument.slice(2)
    if (!argument.startsWith('--') || !['profile', 'browser', 'workload', 'count', 'trials', 'seed', 'output'].includes(name)
      || !args[index + 1] || args[index + 1].startsWith('--')) {
      throw new Error(`Unknown or incomplete option: ${argument}`)
    }
    options[name] = numbers.has(name) ? Number(args[++index]) : args[++index]
  }
  if (!['quick', 'full', 'stress'].includes(options.profile))
    throw new Error('Profile must be quick, full, or stress')
  if (!['all', 'chromium', 'firefox'].includes(options.browser))
    throw new Error('Browser must be chromium, firefox, or all')
  if (options.workload !== 'all' && !WORKLOADS.some(workload => workload.id === options.workload))
    throw new Error('Unknown workload')
  if (options.count !== undefined && (!Number.isSafeInteger(options.count) || options.count < 30 || options.count > 100_000))
    throw new Error('Count must be an integer from 30 to 100000')
  if (options.trials !== undefined && (!Number.isSafeInteger(options.trials) || options.trials < 1 || options.trials > 100))
    throw new Error('Trials must be an integer from 1 to 100')
  if (!Number.isSafeInteger(options.seed) || options.seed < 0 || options.seed > 0xFFFFFFFF)
    throw new Error('Seed must be an unsigned 32-bit integer')
  const runId = new Date().toISOString().replaceAll(':', '-')
  return { ...options, trials: options.trials ?? (options.profile === 'quick' ? 5 : 10), counts: options.count ? [options.count] : options.profile === 'quick' ? [1000] : options.profile === 'full' ? [1000, 10000] : [50000], output: resolve(cwd, options.output ?? `benchmark-results/${runId}`) }
}
