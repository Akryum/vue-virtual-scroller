import type { TrialResult } from '../measurement/types'
/** Serialized report shared by interactive UI, CLI, and imports. */
export interface Report {
  /** Versioned consumer contract. */
  schemaVersion: 1
  /** Incomplete or cancelled runs cannot masquerade as completed results. */
  status: 'complete' | 'partial' | 'cancelled'
  /** Runtime/build/environment metadata and measurement policy. */
  metadata: Record<string, unknown>
  /** Raw timings including failed and excluded warm-up trials. */
  trials: Array<TrialResult & { browser: string, pair: number, warmup: boolean }>
}
