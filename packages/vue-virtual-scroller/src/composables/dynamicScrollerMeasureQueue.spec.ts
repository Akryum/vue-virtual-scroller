import { describe, expect, it, vi } from 'vitest'
import { createDynamicScrollerMeasureQueue } from './dynamicScrollerMeasureQueue'

describe('dynamicScrollerMeasureQueue', () => {
  it('batches all reads before writes and schedules one flush per tick', () => {
    const callbacks: Array<() => void> = []
    const queue = createDynamicScrollerMeasureQueue({
      queueFlush(flush) {
        callbacks.push(flush)
      },
    })
    const events: string[] = []

    queue.schedule('a', {
      read() {
        events.push('read:a')
        return 10
      },
      write(value) {
        events.push(`write:a:${value}`)
      },
      done() {
        events.push('done:a')
      },
    })

    queue.schedule('b', {
      read() {
        events.push('read:b')
        return 20
      },
      write(value) {
        events.push(`write:b:${value}`)
      },
      done() {
        events.push('done:b')
      },
    })

    expect(callbacks).toHaveLength(1)

    callbacks[0]()

    expect(events).toEqual([
      'read:a',
      'read:b',
      'write:a:10',
      'done:a',
      'write:b:20',
      'done:b',
    ])
  })

  it('replaces pending work for the same id before flush', () => {
    let flush: (() => void) | undefined
    const queue = createDynamicScrollerMeasureQueue({
      queueFlush(value) {
        flush = value
      },
    })
    const firstDone = vi.fn()
    const secondWrite = vi.fn()

    queue.schedule('row-1', {
      read() {
        return 10
      },
      write() {},
      done: firstDone,
    })

    queue.schedule('row-1', {
      read() {
        return 20
      },
      write: secondWrite,
      done() {},
    })

    flush?.()

    expect(firstDone).not.toHaveBeenCalled()
    expect(secondWrite).toHaveBeenCalledWith(20)
  })

  it('drains large queues across multiple scheduled flushes', () => {
    const callbacks: Array<() => void> = []
    const queue = createDynamicScrollerMeasureQueue({
      maxTasksPerFlush: 1,
      queueFlush(flush) {
        callbacks.push(flush)
      },
    })
    const events: string[] = []

    queue.schedule('a', {
      read() {
        events.push('read:a')
        return 'a'
      },
      write(value) {
        events.push(`write:${value}`)
      },
      done() {
        events.push('done:a')
      },
    })
    queue.schedule('b', {
      read() {
        events.push('read:b')
        return 'b'
      },
      write(value) {
        events.push(`write:${value}`)
      },
      done() {
        events.push('done:b')
      },
    })

    expect(callbacks).toHaveLength(1)

    callbacks.shift()?.()

    expect(events).toEqual([
      'read:a',
      'write:a',
      'done:a',
    ])
    expect(callbacks).toHaveLength(1)

    callbacks.shift()?.()

    expect(events).toEqual([
      'read:a',
      'write:a',
      'done:a',
      'read:b',
      'write:b',
      'done:b',
    ])
  })

  it('holds pending work while paused and flushes after resume', () => {
    const callbacks: Array<() => void> = []
    const queue = createDynamicScrollerMeasureQueue({
      queueFlush(flush) {
        callbacks.push(flush)
      },
    })
    const events: string[] = []

    queue.pause()
    queue.schedule('a', {
      read() {
        events.push('read:a')
        return 'a'
      },
      write(value) {
        events.push(`write:${value}`)
      },
      done() {
        events.push('done:a')
      },
    })

    expect(callbacks).toHaveLength(0)

    queue.resume()

    expect(callbacks).toHaveLength(1)

    callbacks[0]()

    expect(events).toEqual([
      'read:a',
      'write:a',
      'done:a',
    ])
  })
})
