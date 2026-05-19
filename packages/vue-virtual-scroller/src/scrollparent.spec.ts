import { describe, expect, it } from 'vitest'
import { getScrollParent, resolveScrollParent } from './scrollparent'

describe('getScrollParent', () => {
  it('returns the nearest scrollable parent', () => {
    const outer = document.createElement('div')
    outer.style.overflowY = 'auto'
    const middle = document.createElement('div')
    const inner = document.createElement('div')

    middle.appendChild(inner)
    outer.appendChild(middle)
    document.body.appendChild(outer)

    expect(getScrollParent(inner)).toBe(outer)

    outer.remove()
  })

  it('falls back to scrollingElement when no scrollable parent exists', () => {
    const inner = document.createElement('div')
    document.body.appendChild(inner)

    expect(getScrollParent(inner)).toBe(document.scrollingElement || document.documentElement)

    inner.remove()
  })

  it('falls back to the document scrolling element for detached nodes', () => {
    // Regression for issue #928: a detached element has no parent chain to
    // walk; returning the fallback rather than crashing in `parents(null)`
    // keeps the scrollParent computed safe during transient unmounts.
    const detached = document.createElement('div')
    expect(getScrollParent(detached)).toBe(document.scrollingElement || document.documentElement)
  })

  it('returns undefined for non-element nodes', () => {
    expect(getScrollParent(document.createTextNode('x'))).toBeUndefined()
  })
})

describe('resolveScrollParent', () => {
  it('returns the explicit override without walking the DOM', () => {
    const explicit = document.createElement('div')
    const child = document.createElement('div')
    // Even if `child` is not attached, the explicit override wins.
    expect(resolveScrollParent(child, explicit)).toBe(explicit)
  })

  it('accepts window as an explicit override', () => {
    const child = document.createElement('div')
    expect(resolveScrollParent(child, window)).toBe(window)
  })

  it('falls back to auto-detection when no override is provided', () => {
    const outer = document.createElement('div')
    outer.style.overflowY = 'auto'
    const inner = document.createElement('div')
    outer.appendChild(inner)
    document.body.appendChild(outer)

    expect(resolveScrollParent(inner)).toBe(outer)

    outer.remove()
  })

  it('normalizes html/body auto-detection to window', () => {
    const inner = document.createElement('div')
    document.body.appendChild(inner)
    // Auto-detect resolves to documentElement/body, which must normalize to
    // `window` so listener/measurement code paths see one target type.
    expect(resolveScrollParent(inner)).toBe(window)
    inner.remove()
  })

  it('returns undefined when node is missing and no override is set', () => {
    expect(resolveScrollParent(undefined)).toBeUndefined()
  })
})
