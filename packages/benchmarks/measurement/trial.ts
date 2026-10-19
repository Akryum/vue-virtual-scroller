import type { CaseConfig } from '../workloads/registry'
import type { CaseController, TrialResult } from './types'
import { WORKLOADS } from '../workloads/registry'
import { scriptedScroll } from './scroll'

/** Complete shared lifecycle; partial timing evidence survives a failed correctness check. */
export async function runTrial(controller: CaseController, config: CaseConfig, signal: AbortSignal): Promise<TrialResult> {
  const result: TrialResult = { ...config, actualCount: config.count, phases: {}, frames: [], scroll: {}, checkpoints: [], valid: false }
  const timeout = setTimeout(() => controller.dispose(), 120_000)
  try {
    await controller.unmount()
    // First timed mount receives fresh data, without an earlier render warming Vue proxies.
    await controller.prepare(config)
    result.phases.mount = await controller.mount()
    controller.verify()
    const mounted = controller.inspect()
    result.actualCount = mounted.total
    result.checkpoints.push({ phase: 'mount', ...mounted })
    const scrolling = await scriptedScroll(config.workload, signal)
    result.frames = scrolling.frames
    result.scroll = scrolling.scroll
    controller.verify()
    result.checkpoints.push({ phase: 'scroll', ...controller.inspect() })
    for (const action of WORKLOADS.find(workload => workload.id === config.workload)!.actions) {
      await controller.reset()
      result.phases[action] = await controller.execute(action)
      controller.verify(action)
      result.checkpoints.push({ phase: action, ...controller.inspect() })
    }
    result.phases.unmount = await controller.unmount()
    if (document.querySelector('[data-record]'))
      throw new Error('Unmount left record elements attached')
    result.valid = true
  }
  catch (error) { result.error = error instanceof Error ? error.message : String(error) }
  finally { clearTimeout(timeout) }
  return result
}
