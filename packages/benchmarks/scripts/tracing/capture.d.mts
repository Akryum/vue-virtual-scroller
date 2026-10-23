import type { parseOptions } from '../options.mjs'
/** Validated tracing options share normal benchmark contract and explicit artifact provenance. */
export function traceOptions(args: string[]): ReturnType<typeof parseOptions> & {
  /** Captured production root. */
  appRoot: string
  /** Captured public library build. */
  libraryRoot: string
  /** Explicit diagnostic stage. */
  stage: string
  /** Table dependency policy label. */
  columnPolicy: string
}
