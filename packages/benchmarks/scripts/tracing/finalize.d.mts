import type { TrialResult } from '../../measurement/types'

/** Authoritative state, including evidence that could not be reconciled after IO failure. */
export interface CaptureFinalState {
  /** Stable filename prefix. */
  id: string
  /** Final correctness outcome. */
  valid: boolean
  /** Retained failure reason. */
  error?: string
  /** Paths whose old contents must not be consumed as valid evidence. */
  unreconciledArtifacts?: Array<{
    /** Filename relative to capture output directory. */
    path: string
    /** Failed recovery operation. */
    error: string
  }>
}

/** Reconcile artifacts and publish manifest; reject on any finalization failure. */
export function finalizeCapture(output: string, capture: CaptureFinalState, trial: TrialResult, publishManifest?: () => Promise<void>): Promise<void>
