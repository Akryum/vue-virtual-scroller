/** Chrome event with renderer ownership and optional complete-event duration. */
interface Event {
  /** Chrome event/mark name. */
  name: string
  /** Renderer process ID. */
  pid: number
  /** Renderer thread ID. */
  tid: number
  /** Monotonic timestamp, microseconds. */
  ts?: number
  /** Complete-event duration, microseconds. */
  dur?: number
  /** Chrome phase; complete events use X. */
  ph?: string
}
/** Measured phase bounds on trace clock. */
interface Span {
  /** Existing operation identifier. */
  phase: string
  /** Inclusive measured start. */
  start: number
  /** Exclusive measured end. */
  end: number
}
/** Require one renderer owning phase marks. */
export function rendererEvents(events: Event[]): Event[]
/** Clip complete events to phase, retaining whole-task duration separately. */
export function timelineEvents(events: Event[], span: Span): { name: string, start: number, end: number, wholeTaskDuration: number }[]
/** Decode indexed User Timing marks. */
export function phaseSpans(events: Event[]): Span[]
