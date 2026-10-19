import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { cpus, platform, release } from 'node:os'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/** Metadata discovery must not prevent reports in source archives without Git. */
export function environment(options) {
  const root = fileURLToPath(new URL('../../../', import.meta.url))
  const git = (...args) => {
    try {
      return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    }
    catch { return 'unavailable' }
  }
  const workingTree = git('status', '--porcelain')
  const pkg = JSON.parse(readFileSync(new URL('../../vue-virtual-scroller/package.json', import.meta.url), 'utf8'))
  const vue = JSON.parse(readFileSync(new URL('../node_modules/vue/package.json', import.meta.url), 'utf8'))
  return { timestamp: new Date().toISOString(), sha: git('rev-parse', 'HEAD'), dirty: workingTree === 'unavailable' ? 'unavailable' : workingTree !== '', os: `${platform()} ${release()}`, cpu: cpus()[0]?.model ?? 'unavailable', cpuCount: cpus().length, node: process.version, vue: vue.version, library: pkg.version, profile: options.profile, seed: options.seed, counts: options.counts, trials: options.trials, headless: !options.headed, viewport: [1440, 1000], deviceScaleFactor: 1, caseViewport: [960, 640], warmup: 'one excluded pair per engine/workload/size', trialOrder: 'alternating virtual-first/plain-first; fresh context per trial', definitions: { timings: 'time to settled render: Vue update and two stable frame transitions; 10000ms settling limit', scroll: '3000ms scripted forward/back path, at most 12000px per supported axis; frame cadence, not compositor FPS or input latency', dom: 'untimed checkpoints; mounted roots include inactive recycled records', memory: 'not measured' } }
}
