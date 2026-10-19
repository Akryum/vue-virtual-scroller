import type { ShallowRef } from 'vue'
import type { Action, CaseConfig } from '../workloads/registry'
import type { WorkloadState } from '../workloads/state'
import type { CaseController } from './types'
import { nextTick } from 'vue'
import { generateRecords } from '../data/generate'
import { createWorkloadState } from '../workloads/state'
import { inspect, scrollElement, settle } from './layout'
import { runTrial } from './trial'
import { verifyAction, verifyContent } from './verify'

/** Own one isolated Vue subtree and its abortable measurement lifetime. */
export function createController(
  current: ShallowRef<WorkloadState | undefined>,
  show: (visible: boolean) => void,
  jump: (index: number) => void,
): CaseController {
  const owner = new AbortController()
  let config: CaseConfig
  let last: { action: Action, target: number, count: number } | undefined
  const model = () => {
    if (!current.value)
      throw new Error('Call prepare before mounting a case')
    return current.value
  }
  /** All assets are decoded before mounting; image download is not a render metric. */
  async function prepare(input: CaseConfig) {
    last = undefined
    config = { ...input }
    current.value = createWorkloadState(config)
    await Promise.all(Array.from({ length: 6 }, (_, index) => new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.onload = () => image.decode().then(resolve, reject)
      image.onerror = () => reject(new Error(`Cannot preload product-${index}.svg`))
      image.src = `/assets/product-${index}.svg`
    })))
  }
  /** Time only work submitted after prepared data is available. */
  async function mount() {
    model()
    const start = performance.now()
    show(true)
    await settle(owner.signal)
    return performance.now() - start
  }
  /** Actual unmount, including Vue cleanup and settled DOM removal. */
  async function unmount() {
    const start = performance.now()
    show(false)
    await settle(owner.signal, false)
    return performance.now() - start
  }
  /** Native/public package jump, repeatedly correcting estimates for unknown dynamic sizes. */
  async function jumpTo(index: number) {
    const id = model().rows.value[index].id
    for (let attempt = 0; attempt < 8; attempt++) {
      jump(index)
      await settle(owner.signal)
      const element = document.querySelector<HTMLElement>(`[data-record][data-id="${id}"]`)
      const box = element?.getBoundingClientRect()
      const viewport = document.querySelector('[data-viewport]')?.getBoundingClientRect()
        ?? { top: 0, left: 0, bottom: innerHeight, right: innerWidth }
      if (box && box.bottom > viewport.top && box.top < viewport.bottom && box.right > viewport.left && box.left < viewport.right)
        return
    }
    throw new Error(`Deep jump did not reveal record ${id}`)
  }
  /** Execute real application state change. Preparation for special starting states stays untimed. */
  async function execute(action: Action) {
    const active = model()
    const state = active.state
    if (action === 'prepend')
      await jumpTo(Math.min(20, active.rows.value.length - 1))
    const before = inspect(active)
    const target = before.visible.find(row => row.top >= 0)?.id ?? before.visible[0]?.id
    if (target == null)
      throw new Error('Action has no visible target')
    last = { action, target, count: state.records.length }
    const anchor = before.visible.find(row => row.top >= 0)
    if (action === 'collapse') {
      active.expand(target)
      await settle(owner.signal)
    }
    const start = performance.now()
    switch (action) {
      case 'filter': state.filtered = true
        scrollElement().scrollTo(0, 0)
        break
      case 'sort': state.sorted = true
        break
      case 'update': active.update()
        break
      case 'select': active.select(target)
        break
      case 'collapse':
      case 'expand': active.expand(target)
        break
      case 'append': case 'prepend': {
        const additions = generateRecords('activity-feed', 20, config.seed + 1, state.records.length + 1)
        state.records = action === 'append' ? [...state.records, ...additions] : [...additions, ...state.records]
        if (action === 'prepend' && config.mode === 'plain' && anchor) {
          await nextTick()
          const element = document.querySelector<HTMLElement>(`[data-record][data-id="${anchor.id}"]`)!
          const viewport = scrollElement().getBoundingClientRect()
          scrollElement().scrollTop += element.getBoundingClientRect().top - viewport.top - anchor.top
        }
        break
      }
      case 'resize': state.width = 720
        state.columns = 3
        break
      case 'intro': state.intro = true
        break
      case 'details': state.detail = target
        break
      case 'jump': await jumpTo(Math.floor(active.rows.value.length * 0.7))
        break
    }
    await settle(owner.signal)
    const duration = performance.now() - start
    // Anchor assertions are correctness work and deliberately outside the measured operation.
    if (action === 'prepend' && anchor) {
      const after = inspect(active).visible.find(row => row.id === anchor.id)
      if (!after || Math.abs(after.top - anchor.top) > 3)
        throw new Error('Prepend lost visible record anchor')
    }
    return duration
  }
  const controller: CaseController = {
    prepare,
    mount,
    execute,
    unmount,
    inspect: () => inspect(model()),
    verify(action) {
      verifyContent(model(), inspect(model()))
      if (action) {
        if (last?.action !== action)
          throw new Error(`Action ${action} did not execute`)
        verifyAction(model(), action, last.count, last.target)
      }
    },
    async reset() {
      await unmount()
      await prepare(config)
      await mount()
    },
    dispose() {
      owner.abort()
      show(false)
      current.value = undefined
    },
    run: () => runTrial(controller, config, owner.signal),
  }
  return controller
}
