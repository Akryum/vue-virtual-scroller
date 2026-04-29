import type { KeyValue } from '../types'
import { nextTick } from 'vue'

export interface DynamicScrollerMeasureTask {
  read: () => unknown
  write: (value: unknown) => void
  done: () => void
}

export interface DynamicScrollerMeasureQueue {
  schedule: (id: KeyValue, task: DynamicScrollerMeasureTask) => void
  cancel: (id: KeyValue) => void
}

export interface DynamicScrollerMeasureQueueOptions {
  queueFlush?: (flush: () => void) => void
  overflowQueueFlush?: (flush: () => void) => void
  maxTasksPerFlush?: number
}

/**
 * Batch DOM reads so dynamic measurements do not interleave read/write work per row.
 */
export function createDynamicScrollerMeasureQueue(
  options: DynamicScrollerMeasureQueueOptions = {},
): DynamicScrollerMeasureQueue {
  const queueFlush = options.queueFlush ?? (flush => nextTick(flush))
  const overflowQueueFlush = options.overflowQueueFlush ?? queueFlush
  const maxTasksPerFlush = Math.max(1, options.maxTasksPerFlush ?? Number.POSITIVE_INFINITY)
  let flushQueued = false
  const pending = new Map<KeyValue, DynamicScrollerMeasureTask>()

  /**
   * Queue one flush if pending measurements exist and queue is runnable.
   */
  function queueFlushIfNeeded() {
    if (flushQueued || !pending.size) {
      return
    }

    flushQueued = true
    queueFlush(flush)
  }

  function flush() {
    flushQueued = false
    if (!pending.size) {
      return
    }

    const tasks: DynamicScrollerMeasureTask[] = []
    for (const [id, task] of pending) {
      tasks.push(task)
      pending.delete(id)
      if (tasks.length >= maxTasksPerFlush) {
        break
      }
    }

    // Read everything first, then write. Mixing the two is what caused the
    // large forced-layout spikes in the dynamic table traces.
    const measurements = tasks.map(task => ({
      task,
      value: task.read(),
    }))

    for (const measurement of measurements) {
      if (measurement.value != null) {
        measurement.task.write(measurement.value)
      }
      measurement.task.done()
    }

    if (pending.size) {
      overflowQueueFlush(flush)
      flushQueued = true
    }
  }

  function schedule(id: KeyValue, task: DynamicScrollerMeasureTask) {
    pending.set(id, task)
    queueFlushIfNeeded()
  }

  function cancel(id: KeyValue) {
    pending.delete(id)
  }

  return {
    schedule,
    cancel,
  }
}
