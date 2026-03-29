import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObserveVisibility } from './observeVisibility'

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  disconnect = vi.fn()
  observe = vi.fn()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }
}

function binding(value: unknown, oldValue?: unknown) {
  return {
    value,
    oldValue,
  } as any
}

describe('observeVisibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    FakeIntersectionObserver.instances = []
  })

  it('falls back to an immediate visible callback without IntersectionObserver', () => {
    const el = document.createElement('div')
    const callback = vi.fn()

    Object.defineProperty(el, 'getBoundingClientRect', {
      configurable: true,
      value: vi.fn(() => ({ top: 0, bottom: 10 })),
    })

    vi.stubGlobal('IntersectionObserver', undefined)
    ObserveVisibility.mounted?.(el, binding(callback))

    expect(callback).toHaveBeenCalledWith(true, expect.objectContaining({
      boundingClientRect: expect.objectContaining({ top: 0, bottom: 10 }),
    }))
  })

  it('observes visibility, ignores duplicate states, and disconnects on unmount', () => {
    const el = document.createElement('div')
    const callback = vi.fn()
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver as unknown as typeof IntersectionObserver)

    ObserveVisibility.mounted?.(el, binding(callback))

    const observer = FakeIntersectionObserver.instances[0]
    expect(observer.observe).toHaveBeenCalledWith(el)

    observer.callback([{ isIntersecting: true } as IntersectionObserverEntry], observer as unknown as IntersectionObserver)
    observer.callback([{ isIntersecting: true } as IntersectionObserverEntry], observer as unknown as IntersectionObserver)
    observer.callback([{ isIntersecting: false } as IntersectionObserverEntry], observer as unknown as IntersectionObserver)

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, true, expect.objectContaining({ isIntersecting: true }))
    expect(callback).toHaveBeenNthCalledWith(2, false, expect.objectContaining({ isIntersecting: false }))

    ObserveVisibility.unmounted?.(el)
    expect(observer.disconnect).toHaveBeenCalledTimes(1)
  })

  it('recreates the observer when the binding value changes', () => {
    const el = document.createElement('div')
    const first = vi.fn()
    const second = vi.fn()
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver as unknown as typeof IntersectionObserver)

    ObserveVisibility.mounted?.(el, binding({
      callback: first,
      intersection: { rootMargin: '10px' },
    }))

    const initialObserver = FakeIntersectionObserver.instances[0]

    ObserveVisibility.updated?.(el, binding({ callback: second }, { callback: first }))

    const nextObserver = FakeIntersectionObserver.instances[1]
    expect(initialObserver.disconnect).toHaveBeenCalledTimes(1)
    expect(nextObserver.observe).toHaveBeenCalledWith(el)
  })
})
