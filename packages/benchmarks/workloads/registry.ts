/** Public workload IDs shared by browser controls, CLI, and report grouping. */
export const WORKLOADS = [
  { id: 'issue-inbox', name: 'Issue inbox', actions: ['filter', 'sort', 'update', 'select'] },
  { id: 'activity-feed', name: 'Activity feed', actions: ['expand', 'collapse', 'append', 'prepend', 'update', 'resize'] },
  { id: 'product-grid', name: 'Product catalogue', actions: ['filter', 'sort', 'update', 'select', 'resize'] },
  { id: 'customer-table', name: 'Customer table', actions: ['filter', 'sort', 'update', 'select', 'resize'] },
  { id: 'window-feed', name: 'Window news feed', actions: ['jump', 'filter', 'intro'] },
  { id: 'horizontal-cards', name: 'Horizontal projects', actions: ['jump', 'filter', 'expand', 'collapse', 'update'] },
  { id: 'inventory-matrix', name: 'Warehouse inventory', actions: ['jump', 'sort', 'update', 'details'] },
  { id: 'project-explorer', name: 'Project explorer tree', actions: ['expand', 'collapse', 'filter', 'update', 'select', 'jump'] },
  { id: 'code-review', name: 'Code review diff', actions: ['jump', 'filter', 'update', 'select'] },
] as const
/** Registered scenario identifier. */
export type WorkloadId = typeof WORKLOADS[number]['id']
/** Supported observable operations. */
export type Action = typeof WORKLOADS[number]['actions'][number]
/** Rendering strategy, with identical record components in each branch. */
export type Mode = 'virtual' | 'plain'
/** Inputs to an isolated case, independent of its browser host. */
export interface CaseConfig {
  /** Scenario to render. */
  workload: WorkloadId
  /** Virtual package or ordinary keyed Vue rendering. */
  mode: Mode
  /** Requested logical record count; matrices round up to square dimensions. */
  count: number
  /** Deterministic generator seed. */
  seed: number
}
/** Resolve square matrix dimensions, including custom CLI sizes. */
export function matrixSide(count: number) {
  return Math.ceil(Math.sqrt(count))
}
/** Reject unknown cases before allocating data or starting a server. */
export function validateConfig(input: CaseConfig) {
  if (!WORKLOADS.some(workload => workload.id === input.workload)
    || !['virtual', 'plain'].includes(input.mode)
    || !Number.isSafeInteger(input.count) || input.count < 1 || input.count > 100_000
    || !Number.isSafeInteger(input.seed) || input.seed < 0 || input.seed > 0xFFFFFFFF) {
    throw new Error('Invalid benchmark case configuration')
  }
  return input
}
