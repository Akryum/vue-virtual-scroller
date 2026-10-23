/** CDP symbol fields; algorithm fixtures may omit unused source coordinates. */
interface Frame {
  /** Engine function name. */
  functionName: string
  /** Generated module URL, absent for native symbols. */
  url?: string
  /** Zero-based generated line. */
  lineNumber?: number
  /** Zero-based generated column. */
  columnNumber?: number
}
/** Minimal CDP profile contract; all clocks/deltas use microseconds. */
interface Profile {
  /** Monotonic profile start. */
  startTime: number
  /** Monotonic profile end. */
  endTime: number
  /** CPU call tree. */
  nodes: { id: number, children?: number[], callFrame: Frame }[]
  /** Leaf node IDs in delivery order. */
  samples: number[]
  /** Signed differences; delivery order need not be chronological. */
  timeDeltas: number[]
}
/** Non-overlapping sampled interval after chronological normalization. */
interface Sample<T> {
  /** Inclusive left boundary. */
  start: number
  /** Exclusive right boundary. */
  end: number
  /** Reconstructed original sample timestamp. */
  timestamp: number
  /** Root-to-leaf resolved symbols. */
  stack: T[]
}
/** Reconstruct signed timestamps and midpoint weights, optionally resolving sources. */
export function profileSamples<T = Frame>(profile: Profile, resolveFrame?: (frame: Frame) => T): Sample<T>[]
/** Clip normalized samples to measured phase bounds. */
export function intersectSamples<T>(samples: Sample<T>[], span: { start: number, end: number }): Sample<T>[]
