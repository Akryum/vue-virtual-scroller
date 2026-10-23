import type { TrialResult } from '../measurement/types'
import type { parseOptions } from './options.mjs'
/** Run real production cases; private diagnostic mode selection is validated before resources. */
export function runSuite(options: ReturnType<typeof parseOptions> & {
  /** Optional immutable app root. */
  appRoot?: string
  /** Diagnostic selection; runtime rejects invalid JavaScript caller values. */
  modes?: string[]
  /** Observe reconciled validity after diagnostics and context cleanup, before persistence. */
  onTrialComplete?: (trial: TrialResult) => void | Promise<void>
}): Promise<{ status: string }>
