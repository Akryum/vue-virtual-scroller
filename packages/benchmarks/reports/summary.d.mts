/** Nearest-rank percentile, or null for no samples. */
export function percentile(values: number[], percent: number): number | null
/** Aggregate serialized benchmark trials. */
export function aggregate(trials: any[]): any[]
/** Validate a user-supplied report. */
export function validateReport(report: unknown): any
/** Format a report as Markdown. */
export function markdown(report: any): string
/** Per-engine/workload DOM cost and scripted frame distributions. */
export function diagnostics(trials: any[]): any[]
