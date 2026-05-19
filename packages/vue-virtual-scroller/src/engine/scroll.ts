import type { ScrollDirection, ScrollToOptions } from '../types'

function isWindowTarget(target: HTMLElement | Window | null | undefined): target is Window {
  return typeof window !== 'undefined' && target === window
}

const rtlOffsetType = (() => {
  if (typeof document === 'undefined') {
    return 'negative'
  }

  const outer = document.createElement('div')
  const inner = document.createElement('div')

  outer.style.width = '4px'
  outer.style.height = '1px'
  outer.style.overflow = 'auto'
  outer.style.direction = 'rtl'
  inner.style.width = '8px'
  inner.style.height = '1px'

  outer.appendChild(inner)
  document.body.appendChild(outer)

  outer.scrollLeft = -1
  const negative = outer.scrollLeft < 0

  document.body.removeChild(outer)
  return negative ? 'negative' : 'default'
})()

export function normalizeOffset(
  offset: number,
  direction: ScrollDirection,
  target: HTMLElement | Window | null | undefined,
): number {
  if (direction !== 'horizontal' || !target || isWindowTarget(target)) {
    return offset
  }

  if (getComputedStyle(target).direction !== 'rtl') {
    return offset
  }

  return rtlOffsetType === 'negative' ? -offset : offset
}

export function denormalizeOffset(
  offset: number,
  direction: ScrollDirection,
  target: HTMLElement | Window | null | undefined,
): number {
  return normalizeOffset(offset, direction, target)
}

export function scrollElementTo(
  target: HTMLElement | Window,
  direction: ScrollDirection,
  position: number,
  options?: ScrollToOptions,
) {
  const normalized = denormalizeOffset(position, direction, target)
  const smooth = !!options?.smooth

  if (isWindowTarget(target)) {
    if (direction === 'vertical') {
      target.scrollTo({
        top: normalized,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
    else {
      target.scrollTo({
        left: normalized,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
    return
  }

  if (typeof target.scrollTo === 'function') {
    target.scrollTo(direction === 'vertical'
      ? { top: normalized, behavior: smooth ? 'smooth' : 'auto' }
      : { left: normalized, behavior: smooth ? 'smooth' : 'auto' })
    return
  }

  if (direction === 'vertical') {
    target.scrollTop = normalized
  }
  else {
    target.scrollLeft = normalized
  }
}

/**
 * Resolve the viewport size used to decide which items should be rendered.
 *
 * In page mode the viewport is the scroll parent (typically `window`, or a
 * scrollable ancestor element when supplied). Outside page mode it is the
 * scroller's own root element. The `scrollParent` argument lets callers opt
 * into a custom HTMLElement viewport (issue #928) — without it page mode
 * keeps its legacy `window.innerHeight/Width` reading.
 */
export function getViewportSize(
  el: HTMLElement,
  direction: ScrollDirection,
  pageMode: boolean,
  scrollParent?: HTMLElement | Window,
): number {
  if (pageMode) {
    if (scrollParent && scrollParent !== window) {
      const parentEl = scrollParent as HTMLElement
      return direction === 'vertical' ? parentEl.clientHeight : parentEl.clientWidth
    }
    return direction === 'vertical' ? window.innerHeight : window.innerWidth
  }

  return direction === 'vertical' ? el.clientHeight : el.clientWidth
}
