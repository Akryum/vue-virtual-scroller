import { describe, expect, it } from 'vitest'
import { getScrollParent } from './scrollparent'

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

  it('returns undefined for non-element nodes', () => {
    expect(getScrollParent(document.createTextNode('x'))).toBeUndefined()
  })
})
