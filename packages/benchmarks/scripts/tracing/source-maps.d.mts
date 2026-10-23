/** Captured browser symbol coordinates. */
interface Frame {
  /** Generated module URL. */
  url: string
  /** Zero-based line. */
  lineNumber: number
  /** Zero-based column. */
  columnNumber: number
  /** CDP function name, retained when maps omit token name. */
  functionName: string
}
/** Captured map resolver; source location is authoritative and missing maps stay unmapped. */
export function sourceResolver(appRoot: string, libraryRoot: string): (frame: Frame) => {
  /** Canonical repository source path or unchanged native/generated source. */
  source: string
  /** One-based mapped line. */
  line: number
  /** Zero-based mapped column. */
  column: number
  /** Whether at least one source map resolved. */
  mapped: boolean
  /** Stable source/token aggregation identity. */
  key: string
}
