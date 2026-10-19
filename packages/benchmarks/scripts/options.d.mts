/** Validate CLI arguments without launching processes or a server. */
export function parseOptions(args: string[], cwd?: string): {
  profile: string
  browser: string
  workload: string
  seed: number
  headed: boolean
  count?: number
  trials: number
  counts: number[]
  output: string
}
