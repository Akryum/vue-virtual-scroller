import type { CaseConfig } from './registry'
import { computed, reactive } from 'vue'
import { generateRecords } from '../data/generate'
import { filterRecords, sortRecords, updateRecords } from './operations'
import { matrixSide } from './registry'

/** Per-mount state; selection and expansion belong to identities, never pooled views. */
export function createWorkloadState(config: CaseConfig) {
  const state = reactive({
    records: generateRecords(config.workload, config.count, config.seed),
    selected: new Set<number>(),
    expanded: new Set<number>(),
    filtered: false,
    sorted: false,
    width: 960,
    columns: 4,
    intro: false,
    detail: null as number | null,
  })
  const rows = computed(() => {
    let result = state.filtered ? filterRecords(state.records, state.records[0].group) : state.records
    if (state.sorted) {
      if (config.workload === 'issue-inbox') {
        result = result.toSorted((a, b) => a.priority - b.priority || a.id - b.id)
      }
      else if (config.workload === 'inventory-matrix') {
        const side = matrixSide(config.count)
        const groups = Array.from({ length: side }, (_, index) => result.slice(index * side, (index + 1) * side))
        groups.sort((a, b) => b.reduce((sum, row) => sum + row.stock, 0) - a.reduce((sum, row) => sum + row.stock, 0) || a[0].row - b[0].row)
        result = groups.flat()
      }
      else {
        result = sortRecords(result)
      }
    }
    return result
  })
  /** Toggle selection through same handler for manual and automated actions. */
  function select(id: number) {
    if (state.selected.has(id))
      state.selected.delete(id)
    else state.selected.add(id)
  }
  /** Toggle expanded content using record identity. */
  function expand(id: number) {
    if (state.expanded.has(id))
      state.expanded.delete(id)
    else state.expanded.add(id)
  }
  /** Update real reactive records, preserving all unmodified objects. */
  function update() {
    state.records = updateRecords(state.records)
  }
  /** Open or dismiss details using stable record identity. */
  function details(id: number | null) {
    state.detail = id
  }
  return { state, rows, select, expand, update, details, config }
}
/** Controller state shared by content and renderer components. */
export type WorkloadState = ReturnType<typeof createWorkloadState>
