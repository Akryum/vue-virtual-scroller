import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  denormalizeOffset,
  getViewportSize,
  normalizeOffset,
  scrollElementTo,
} from './scroll'

describe('scroll helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps offsets unchanged for vertical scrolling, windows, and ltr elements', () => {
    const element = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'ltr' } as CSSStyleDeclaration)

    expect(normalizeOffset(40, 'vertical', element)).toBe(40)
    expect(normalizeOffset(40, 'horizontal', window)).toBe(40)
    expect(denormalizeOffset(40, 'horizontal', element)).toBe(40)
  })

  it('normalizes rtl horizontal offsets for elements', () => {
    const element = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration)

    expect(Math.abs(normalizeOffset(40, 'horizontal', element))).toBe(40)
    expect(denormalizeOffset(40, 'horizontal', element)).toBe(normalizeOffset(40, 'horizontal', element))
  })

  it('scrolls windows with the matching axis and smooth option', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)

    scrollElementTo(window, 'vertical', 120, { smooth: true })
    scrollElementTo(window, 'horizontal', 80)

    expect(scrollTo).toHaveBeenNthCalledWith(1, {
      top: 120,
      behavior: 'smooth',
    })
    expect(scrollTo).toHaveBeenNthCalledWith(2, {
      left: 80,
      behavior: 'auto',
    })
  })

  it('scrolls elements using scrollTo when available', () => {
    const element = document.createElement('div')
    const scrollTo = vi.fn()
    element.scrollTo = scrollTo
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'ltr' } as CSSStyleDeclaration)

    scrollElementTo(element, 'vertical', 75, { smooth: true })
    scrollElementTo(element, 'horizontal', 30)

    expect(scrollTo).toHaveBeenNthCalledWith(1, {
      top: 75,
      behavior: 'smooth',
    })
    expect(scrollTo).toHaveBeenNthCalledWith(2, {
      left: 30,
      behavior: 'auto',
    })
  })

  it('falls back to direct scrollTop and scrollLeft assignment', () => {
    const element = document.createElement('div')
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'ltr' } as CSSStyleDeclaration)
    element.scrollTo = undefined as unknown as typeof element.scrollTo

    scrollElementTo(element, 'vertical', 45)
    scrollElementTo(element, 'horizontal', 15)

    expect(element.scrollTop).toBe(45)
    expect(element.scrollLeft).toBe(15)
  })

  it('reads viewport size from the page or the element', () => {
    const element = document.createElement('div')
    Object.defineProperty(element, 'clientHeight', {
      configurable: true,
      get: () => 240,
    })
    Object.defineProperty(element, 'clientWidth', {
      configurable: true,
      get: () => 360,
    })
    vi.stubGlobal('innerHeight', 720)
    vi.stubGlobal('innerWidth', 1280)

    expect(getViewportSize(element, 'vertical', false)).toBe(240)
    expect(getViewportSize(element, 'horizontal', false)).toBe(360)
    expect(getViewportSize(element, 'vertical', true)).toBe(720)
    expect(getViewportSize(element, 'horizontal', true)).toBe(1280)
  })
})
