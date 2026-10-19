import type { Action, CaseConfig } from '../workloads/registry'
/** Publicly observable row geometry and content, captured outside timed regions. */
export interface VisibleRecord {
  /** Stable record identity. */
  id: number
  /** Viewport-relative bounding box. */
  left: number
  top: number
  width: number
  height: number
  /** Rendered user-visible content and accessible label. */
  text: string
  /** Identity-owned state. */
  selected: boolean
  expanded: boolean
}
/** Untimed checkpoint used for correctness and DOM cost reporting. */
export interface Checkpoint {
  /** Logical matching records. */
  total: number
  /** All mounted roots, including inactive recycled views. */
  rendered: number
  /** Elements under workload root. */
  elements: number
  /** Currently visible record roots. */
  visible: VisibleRecord[]
}
/** Portable browser result, enriched by CLI with engine/environment metadata. */
export interface TrialResult extends CaseConfig {
  /** Actual record/cell count. */
  actualCount: number
  /** Successful timings, keyed by operation. */
  phases: Record<string, number>
  /** Raw animation-frame intervals during scripted scrolling. */
  frames: number[]
  /** Frame percentiles and observed scroll path. */
  scroll: Record<string, unknown>
  /** Untimed checkpoints, labelled by phase. */
  checkpoints: Array<Checkpoint & { phase: string }>
  /** Correctness controls inclusion in aggregate statistics. */
  valid: boolean
  /** Failure evidence, never hidden by favorable timings. */
  error?: string
}
/** Shared browser controller used by CLI and interactive iframe host. */
export interface CaseController {
  /** Generate data and preload images outside timed mount. */
  prepare: (config: CaseConfig) => Promise<void>
  /** Mount and return time to settled render. */
  mount: () => Promise<number>
  /** Execute actual reactive operation and return settled duration. */
  execute: (action: Action) => Promise<number>
  /** Read and validate actual rendered content. */
  inspect: () => Checkpoint
  /** Verify action outcomes independently of timing collection. */
  verify: (action?: Action) => void
  /** Recreate original data and mount state between actions. */
  reset: () => Promise<void>
  /** Remove workload and measure settled teardown. */
  unmount: () => Promise<number>
  /** Abort measurement and unmount owned Vue subtree. */
  dispose: () => void
  /** Run complete case lifecycle. */
  run: () => Promise<TrialResult>
}
declare global {
  interface Window {
    /** Exposed exclusively by case.html. */
    benchmark?: CaseController
    /** Initialisation failures are observable by runner. */
    benchmarkError?: string
  }
}
