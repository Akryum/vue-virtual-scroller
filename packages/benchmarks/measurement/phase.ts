/** Exact private profiling span; observer runs after measured end, before correctness checks. */
export interface PhaseSpan {
  /** Existing operation name. */
  phase: string
  /** Document performance clock in milliseconds. */
  start: number
  /** End on same clock. */
  end: number
}
declare global {
  interface Window {
    /** Optional diagnostic observer installed only in isolated case documents. */
    benchmarkPhaseObserver?: (span: PhaseSpan) => void
  }
}
/** Observe completed timing without adding profiler work to reported duration. */
export function recordPhase(phase: string, start: number, end: number): number {
  window.benchmarkPhaseObserver?.({ phase, start, end })
  return end - start
}
