import type { WorkloadId } from '../workloads/registry'
import { percentile } from '../reports/summary.mjs'
import { frame, scrollElement, settle } from './layout'
import { recordPhase } from './phase'

/** Three seconds of time-based forward/back scrolling; no DOM traversal during sampling. */
export async function scriptedScroll(workload: WorkloadId, signal: AbortSignal) {
  const owner = scrollElement()
  const horizontal = workload === 'horizontal-cards' || workload === 'inventory-matrix'
  const vertical = workload !== 'horizontal-cards'
  const distanceX = horizontal ? Math.min(12_000, owner.scrollWidth - owner.clientWidth) : 0
  const distanceY = vertical ? Math.min(12_000, owner.scrollHeight - owner.clientHeight) : 0
  const frames: number[] = []
  let maxX = 0
  let maxY = 0
  owner.scrollTo(0, 0)
  const start = await frame(signal)
  let previous = start
  let elapsed = 0
  while (elapsed < 3000) {
    const now = await frame(signal)
    frames.push(now - previous)
    previous = now
    elapsed = now - start
    const progress = Math.min(1, elapsed / 3000)
    const fraction = progress < 0.5 ? progress * 2 : (1 - progress) * 2
    owner.scrollTo(distanceX * fraction, distanceY * fraction)
    maxX = Math.max(maxX, owner.scrollLeft)
    maxY = Math.max(maxY, owner.scrollTop)
  }
  owner.scrollTo(0, 0)
  await settle(signal)
  recordPhase('scroll', start, performance.now())
  if ((distanceX > 0 && maxX === 0) || (distanceY > 0 && maxY === 0))
    throw new Error('Scripted scroll did not move its scroll owner')
  return { frames, scroll: { duration: elapsed, requested: { x: distanceX, y: distanceY }, actual: { x: maxX, y: maxY, endX: owner.scrollLeft, endY: owner.scrollTop }, samples: frames.length, p50: percentile(frames, 50), p95: percentile(frames, 95), maximum: Math.max(...frames), intervalsOver50ms: frames.filter(value => value > 50).length } }
}
