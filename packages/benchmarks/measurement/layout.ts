import type { WorkloadState } from '../workloads/state'
import type { Checkpoint, VisibleRecord } from './types'
import { nextTick } from 'vue'

/** Correct scroll owner, including the isolated document for window cases. */
export function scrollElement() {
  return document.querySelector<HTMLElement>('[data-viewport]') ?? document.scrollingElement as HTMLElement
}
/** Abortable frame promise; background documents and cancelled owners cannot publish results. */
export function frame(signal: AbortSignal): Promise<number> {
  return new Promise((resolve, reject) => {
    if (signal.aborted)
      return reject(new Error('Benchmark cancelled'))
    if (document.hidden)
      return reject(new Error('Benchmark document is backgrounded'))
    let handle = 0
    const abort = () => {
      cancelAnimationFrame(handle)
      reject(new Error('Benchmark cancelled'))
    }
    handle = requestAnimationFrame((time) => {
      signal.removeEventListener('abort', abort)
      if (document.hidden)
        reject(new Error('Benchmark document is backgrounded'))
      else resolve(time)
    })
    signal.addEventListener('abort', abort, { once: true })
  })
}
/** Sample actual layout without walking thousands of plain-mode DOM nodes per frame. */
function layoutSignature() {
  const viewport = document.querySelector<HTMLElement>('[data-viewport]')
  const rect = viewport?.getBoundingClientRect() ?? { left: 0, top: 0, width: innerWidth, height: innerHeight }
  const width = Math.min(rect.width, innerWidth - rect.left)
  const height = Math.min(rect.height, innerHeight - rect.top)
  const rows = new Set<HTMLElement>()
  for (const x of [0.1, 0.5, 0.9]) {
    for (const y of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      const element = document.elementFromPoint(rect.left + width * x, rect.top + height * y)?.closest<HTMLElement>('[data-record]')
      if (element)
        rows.add(element)
    }
  }
  const owner = scrollElement()
  return { count: rows.size, key: JSON.stringify([owner.scrollTop, owner.scrollLeft, owner.scrollHeight, owner.scrollWidth, Array.from(rows, (row) => {
    const box = row.getBoundingClientRect()
    return [row.dataset.id, box.x.toFixed(1), box.y.toFixed(1), box.width.toFixed(1), box.height.toFixed(1)]
  })]) }
}
/** Wait for Vue and two consecutive stable frame transitions, bounded at ten seconds. */
export async function settle(signal: AbortSignal, mounted = true) {
  await nextTick()
  const start = performance.now()
  let previous = ''
  let stable = 0
  while (performance.now() - start < 10_000) {
    await frame(signal)
    const sample = layoutSignature()
    stable = sample.key === previous && (!mounted || sample.count > 0) ? stable + 1 : 0
    if (stable >= 2)
      return
    previous = sample.key
  }
  throw new Error('Visible records did not settle within 10000 ms')
}
/** Full DOM checkpoint; deliberately excluded from every timed operation. */
export function inspect(model: WorkloadState): Checkpoint {
  const owner = document.querySelector<HTMLElement>('[data-viewport]')
  const bounds = owner?.getBoundingClientRect() ?? { left: 0, top: 0, right: innerWidth, bottom: innerHeight }
  const elements = [...document.querySelectorAll<HTMLElement>('[data-record]')]
  const visible: VisibleRecord[] = []
  for (const element of elements) {
    const rect = element.getBoundingClientRect()
    if (getComputedStyle(element).visibility === 'hidden' || rect.width <= 0 || rect.height <= 0
      || rect.bottom <= bounds.top || rect.top >= bounds.bottom || rect.right <= bounds.left || rect.left >= bounds.right) {
      continue
    }
    visible.push({ id: Number(element.dataset.id), top: rect.top - bounds.top, left: rect.left - bounds.left, width: rect.width, height: rect.height, text: `${element.textContent} ${element.getAttribute('aria-label') ?? ''}`, selected: element.dataset.selected === 'true', expanded: element.dataset.expanded === 'true' })
  }
  visible.sort((a, b) => a.top - b.top || a.left - b.left)
  return { total: model.rows.value.length, rendered: elements.length, elements: document.querySelector('.case-root')?.querySelectorAll('*').length ?? 0, visible }
}
