import type { Action } from '../workloads/registry'
import type { WorkloadState } from '../workloads/state'
import type { Checkpoint } from './types'
import { scrollElement } from './layout'

/** Validate actual user content against current data, independent of layout/timing code. */
export function verifyContent(model: WorkloadState, checkpoint: Checkpoint) {
  if (!checkpoint.visible.length)
    throw new Error('No visible records after completed render')
  const expected = new Map(model.rows.value.map(row => [row.id, row]))
  for (const visible of checkpoint.visible) {
    const row = expected.get(visible.id)
    if (!row || !visible.text.includes(row.title))
      throw new Error(`Stale or incorrect rendered content for record ${visible.id}`)
    if (visible.selected !== model.state.selected.has(row.id) || visible.expanded !== model.state.expanded.has(row.id)) {
      throw new Error(`Recycled state belongs to wrong record ${visible.id}`)
    }
    if ((model.config.workload === 'product-grid' || model.config.workload === 'inventory-matrix') && !visible.text.includes(String(row.stock))) {
      throw new Error(`Stale inventory for record ${row.id}`)
    }
  }
  if (new Set(checkpoint.visible.map(row => row.id)).size !== checkpoint.visible.length)
    throw new Error('Duplicate visible record identities')
  const order = new Map(model.rows.value.map((row, index) => [row.id, index]))
  for (let index = 1; index < checkpoint.visible.length; index++) {
    const previous = checkpoint.visible[index - 1]
    const current = checkpoint.visible[index]
    if (order.get(current.id)! <= order.get(previous.id)!)
      throw new Error('Visible records do not follow expected data order')
    if (['activity-feed', 'customer-table', 'window-feed', 'issue-inbox'].includes(model.config.workload)
      && current.top < previous.top + previous.height - 3) {
      throw new Error('Visible rows overlap after settling')
    }
    if (model.config.workload === 'horizontal-cards' && current.left < previous.left + previous.width - 3)
      throw new Error('Visible cards overlap after settling')
  }
  if (model.config.mode === 'plain' && checkpoint.rendered !== checkpoint.total)
    throw new Error('Plain Vue did not mount complete matching dataset')
  if (model.config.mode === 'virtual' && checkpoint.rendered >= checkpoint.total && checkpoint.total > 200) {
    throw new Error('Virtual renderer mounted entire dataset')
  }
}
/** Meaningful state transition oracles reject no-op benchmark actions. */
export function verifyAction(model: WorkloadState, action: Action, originalCount: number, target: number) {
  const state = model.state
  const fail = () => {
    throw new Error(`Action ${action} did not produce expected result`)
  }
  switch (action) {
    case 'filter':
      if (model.rows.value.length >= originalCount || model.rows.value.some(row => row.group !== state.records[0].group))
        fail()
      break
    case 'sort':
      if (!state.sorted)
        fail()
      if (model.config.workload === 'inventory-matrix') {
        const totals: number[] = []
        let currentRow = -1
        for (const row of model.rows.value) {
          if (row.row !== currentRow) {
            currentRow = row.row
            totals.push(0)
          }
          totals[totals.length - 1] += row.stock
        }
        if (totals.some((value, index) => index > 0 && value > totals[index - 1]))
          fail()
      }
      if (model.config.workload !== 'inventory-matrix') {
        const values = model.rows.value.map(row => model.config.workload === 'issue-inbox' ? -row.priority : row.amount)
        if (values.some((value, index) => index > 0 && value > values[index - 1]))
          fail()
      }
      break
    case 'update':
      if (state.records.slice(0, Math.min(100, originalCount)).some(row => row.version !== 1)
        || state.records.slice(100).some(row => row.version !== 0)) {
        fail()
      }
      break
    case 'select': if (!state.selected.has(target) || state.selected.size !== 1)
      fail()
      break
    case 'expand': if (!state.expanded.has(target) || state.expanded.size !== 1)
      fail()
      break
    case 'collapse':
      if (state.expanded.size !== 0)
        fail()
      break
    case 'append': case 'prepend':
      if (state.records.length !== originalCount + 20 || new Set(state.records.map(row => row.id)).size !== originalCount + 20)
        fail()
      if (action === 'prepend' && state.records[0].id !== originalCount + 1)
        fail()
      if (action === 'append' && state.records.at(-1)?.id !== originalCount + 20)
        fail()
      break
    case 'resize':
      if (Math.abs(scrollElement().getBoundingClientRect().width - 720) > 1)
        fail()
      if (state.width !== 720 || (model.config.workload === 'product-grid' && state.columns !== 3))
        fail()
      break
    case 'intro': if (!state.intro)
      fail()
      break
    case 'details': if (state.detail !== target || !document.querySelector('[aria-label="Inventory details"]')?.textContent?.includes(state.records.find(row => row.id === target)!.title))
      fail()
      break
    case 'jump': break // Target visibility is checked by the jump owner after convergence.
  }
}
